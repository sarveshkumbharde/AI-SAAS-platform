import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { generateArticle, generateImage, removeImageBackground, resumeReview } from '../controllers/aiController.js';
import { upload } from '../middlewares/multer.js';
import { 
  aiTextLimiter, 
  imageProcessingLimiter, 
  resumeReviewLimiter             
} from '../middlewares/rateLimiters/index.js';
    
const aiRouter = express.Router();                      

// AI Text Generation - Strict limits
aiRouter.post('/generate-article', requireAuth, aiTextLimiter, generateArticle);              

  
// Image Generation - Strict limits              
aiRouter.post('/generate-image', requireAuth, imageProcessingLimiter, generateImage);      

// Image Processing - Strict limits             
aiRouter.post('/remove-image-background', requireAuth, imageProcessingLimiter, upload.single('image'), removeImageBackground);


// Resume Review - Moderate limits
aiRouter.post('/resume-review', requireAuth, resumeReviewLimiter, upload.single('resume'), resumeReview);

export default aiRouter;