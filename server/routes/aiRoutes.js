import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { generateArticle, generateBlogTitle, generateImage, removeImageBackground, resumeReview } from '../controllers/aiController.js';
import { upload } from '../middlewares/multer.js';
import { 
  aiTextLimiter, 
  imageProcessingLimiter, 
  resumeReviewLimiter 
} from '../middlewares/rateLimiters/index.js';

const aiRouter = express.Router();

// AI Text Generation - Strict limits
aiRouter.post('/generate-article', requireAuth, aiTextLimiter, generateArticle);
aiRouter.post('/generate-blog-title', requireAuth, aiTextLimiter, generateBlogTitle);

// Image Generation - Strict limits
aiRouter.post('/generate-image', requireAuth, imageProcessingLimiter, generateImage);

// Image Processing - Strict limits
aiRouter.post('/remove-image-background', upload.single('image'), requireAuth, imageProcessingLimiter, removeImageBackground);
aiRouter.post('/remove-image-object', upload.single('image'), requireAuth, imageProcessingLimiter, removeImageBackground);

// Resume Review - Moderate limits
aiRouter.post('/resume-review', upload.single('resume'), requireAuth, resumeReviewLimiter, resumeReview);

export default aiRouter;