import rateLimit from 'express-rate-limit';

// Very strict limits for expensive image processing APIs
export const imageProcessingLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 3, // Only 3 image processing requests per 2 minutes per user
  message: {
    success: false,
    error: 'Too many image processing requests. Please wait 2 minutes before processing more images.'
  },
  standardHeaders: true,
  legacyHeaders: false
});