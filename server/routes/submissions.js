import express from 'express';
import {submitProject,leaderboard} from "../controller/submissions.js"
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();


router.post('/', authenticateToken, submitProject);
router.get('/leaderboard', leaderboard);

export default router;
