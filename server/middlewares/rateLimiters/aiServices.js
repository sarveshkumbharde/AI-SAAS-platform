import rateLimit from 'express-rate-limit';

// Strict limits for expensive AI text generation
export const aiTextLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute per user
  message: {
    success: false,
    error: 'Too many AI text generation requests. Please wait a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Slightly more generous for resume review
export const resumeReviewLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 3, // 3 resume reviews per 2 minutes per user
  message: {
    success: false,
    error: 'Too many resume review requests. Please wait 2 minutes.'
  }
});