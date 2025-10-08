import express from 'express';
import { getPublishedCreations, getUserCreations, toggleLikeCreation } from '../controllers/userController.js';
import {auth} from '../middlewares/auth.js'

const router = express.Router();

router.get('/get-user-creations', auth, getUserCreations);
router.get('/get-published-creations', auth, getPublishedCreations);
router.post('/toggle-like-creations', auth, toggleLikeCreation);

export default router;

