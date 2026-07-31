const Razorpay = require('razorpay');
const crypto = require('crypto');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route  POST /api/payments/create-order
// @access Any logged-in student
const createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId,
    });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Free course — skip payment entirely
    if (course.price === 0) {
      return res.status(400).json({ message: 'This course is free, use the direct enroll endpoint' });
    }

    // Razorpay expects amount in paise (smallest currency unit), not rupees
    const options = {
        amount: course.price,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
      };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // frontend needs this to open checkout
    });
} catch (err) {
    console.error('Payment error:', err); // logs the FULL error object to terminal
    res.status(500).json({
      message: 'Server error',
      error: err.error?.description || err.message || 'Unknown error',
    });
  }
};

// @route  POST /api/payments/verify
// @access Any logged-in student
const verifyPayment = async (req, res) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        courseId,
      } = req.body;
  
      // Recreate the expected signature using our secret key
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
  
      // Compare it to what Razorpay actually sent back
      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Payment verification failed' });
      }
  
      // Signature matches — payment is genuinely confirmed. Now create the enrollment.
      const enrollment = await Enrollment.create({
        student: req.user.id,
        course: courseId,
        paymentStatus: 'success',
        progress: [],
      });
  
      res.status(201).json({ message: 'Payment verified, enrollment created', enrollment });
    } catch (err) {
        console.error('Payment error:', err); // logs the FULL error object to terminal
        res.status(500).json({
          message: 'Server error',
          error: err.error?.description || err.message || 'Unknown error',
        });
    }
}
module.exports = { createOrder, verifyPayment };