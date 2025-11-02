import express from 'express';
import { getPublishedCreations, getUserCreations, toggleLikeCreation } from '../controllers/userController.js';
import { auth } from '../middlewares/auth.js';
import { userRoutesLimiter } from '../middlewares/rateLimiters/index.js';

const router = express.Router();

router.get('/get-user-creations', auth, userRoutesLimiter, getUserCreations);
router.get('/get-published-creations', auth, userRoutesLimiter, getPublishedCreations);
router.post('/toggle-like-creations', auth, userRoutesLimiter, toggleLikeCreation);

export default router;