import express from 'express';
import { auth } from '../middlewares/auth.js';
import { generateArticle, generateBlogTitle, generateImage, removeImageBackground, resumeReview } from '../controllers/aiController.js';
import { upload } from '../middlewares/multer.js';
import { 
  aiTextLimiter, 
  imageProcessingLimiter, 
  resumeReviewLimiter 
} from '../middlewares/rateLimiters/index.js';

const aiRouter = express.Router();

// AI Text Generation - Strict limits
aiRouter.post('/generate-article', auth, aiTextLimiter, generateArticle);
aiRouter.post('/generate-blog-title', auth, aiTextLimiter, generateBlogTitle);

// Image Generation - Strict limits
aiRouter.post('/generate-image', auth, imageProcessingLimiter, generateImage);

// Image Processing - Strict limits
aiRouter.post('/remove-image-background', upload.single('image'), auth, imageProcessingLimiter, removeImageBackground);
aiRouter.post('/remove-image-object', upload.single('image'), auth, imageProcessingLimiter, removeImageBackground);

// Resume Review - Moderate limits
aiRouter.post('/resume-review', upload.single('resume'), auth, resumeReviewLimiter, resumeReview);

export default aiRouter;