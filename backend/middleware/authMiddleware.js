const jwt = require('jsonwebtoken');

// Checks if a valid JWT was sent — blocks the request if not
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role } — attached for use in later routes
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Only allows instructors through — must run AFTER verifyToken
const requireInstructor = (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Access denied: instructors only' });
  }
  next();
};

module.exports = { verifyToken, requireInstructor };