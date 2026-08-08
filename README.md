# EduStream — MERN Stack Learning Management System

A full-stack Learning Management System where instructors create and sell video courses, and students enroll, watch content with real video streaming, and track their progress — built end-to-end with MongoDB, Express, React, and Node.js.

**Live demo:** https://lms-mern-hdg3.vercel.app
**Backend API:** https://lms-mern-b83r.onrender.com

> Note: the backend is hosted on Render's free tier, which spins down after inactivity — the first request after a while may take 30–60 seconds to respond.

## Features

- **Authentication** — JWT-based signup/login with bcrypt password hashing and role-based access control (instructor / student)
- **Course management** — instructors create courses with thumbnails, pricing, and multiple video lessons
- **Video streaming** — a custom-built HTTP range-request streaming endpoint (built from scratch with `fs.createReadStream` and `206 Partial Content` responses) gates access by enrollment/ownership before serving video from Cloudinary
- **Cloud file storage** — course thumbnails and lesson videos are uploaded directly to Cloudinary, so content persists reliably across deploys instead of relying on local server disk
- **Payments** — Razorpay integration with server-side order creation and HMAC-SHA256 signature verification before granting access (never trusts the client alone)
- **Free & paid enrollment** — separate, guarded paths so a paid course can't be accessed via the free-enrollment route and vice versa
- **Progress tracking** — per-lesson completion tracking with live-calculated course completion percentage
- **Dashboards** — role-specific views: students see enrolled courses with progress bars, instructors manage their courses and lessons
- **Dark / light mode** — persisted theme preference

## Tech stack

**Frontend:** React (Vite), Tailwind CSS, React Router, Axios, Context API
**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, Multer
**File storage:** Cloudinary
**Payments:** Razorpay
**Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (database)

## Architecture notes

- **Video streaming**: lesson videos are stored on Cloudinary, but the `<video>` element always requests them through this app's own `/api/lessons/stream/:lessonId` endpoint first, not Cloudinary's URL directly. That endpoint checks the requester is either the course's instructor or an enrolled student before redirecting to the actual video — so access control is enforced by the backend even though the file itself lives on a public CDN.
- **Payment security**: Razorpay's checkout only returns payment details to the client; the backend independently recomputes the HMAC-SHA256 signature using the secret key and only creates an enrollment record if it matches, so a forged client-side request can't grant access.
- **Schema design**: Course→Lessons uses references (`ObjectId` + `populate`) since lessons are managed independently; Enrollment→Progress is embedded, since progress entries are only ever read/written together with their parent enrollment.

## Known limitations

- **Payment sandbox**: order creation and signature verification are implemented and tested (via API), but full end-to-end checkout testing was limited by a Razorpay test-account activation restriction in the sandbox environment, unrelated to the integration code itself.

## Running locally

**Backend:**
```bash
cd backend
npm install
# create a .env file with: MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN, PORT, CLIENT_URL,
# RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
# create a .env file with: VITE_API_URL, VITE_API_BASE
npm run dev
```

## API overview

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/courses` | Public |
| POST | `/api/courses` | Instructor |
| GET | `/api/courses/my-courses` | Instructor |
| POST | `/api/lessons/:courseId` | Instructor (owns course) |
| GET | `/api/lessons/stream/:lessonId` | Enrolled student or course owner |
| POST | `/api/payments/create-order` | Student |
| POST | `/api/payments/verify` | Student |
| POST | `/api/enrollments/free/:courseId` | Student |
| GET | `/api/enrollments/:courseId/lessons` | Enrolled student or course owner |
| PATCH | `/api/enrollments/:courseId/progress/:lessonId` | Enrolled student |
| GET | `/api/enrollments/my-courses` | Student |