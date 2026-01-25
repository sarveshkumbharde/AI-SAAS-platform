import express from 'express';
import { getPublishedCreations, getUserCreations, toggleLikeCreation, startGoogleOAuth, handleGoogleOAuthCallback, getUser  } from '../controllers/userController.js';
import { requireAuth } from '../middlewares/auth.js';
import { userRoutesLimiter, generalLimiter } from '../middlewares/rateLimiters/index.js';

const router = express.Router();
router.get("/google", startGoogleOAuth);

router.get('/google/callback', handleGoogleOAuthCallback )
router.get("/me", requireAuth, getUser)
router.get('/get-user-creations', requireAuth, generalLimiter, userRoutesLimiter, getUserCreations);
router.get('/get-published-creations', requireAuth, generalLimiter, userRoutesLimiter, getPublishedCreations);
router.post('/toggle-like-creations', requireAuth, generalLimiter, userRoutesLimiter, toggleLikeCreation);

export default router;