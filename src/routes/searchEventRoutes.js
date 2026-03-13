import express from 'express';
import { authMiddleware } from "../middleware/authMiddleware.js";
import { searchEvent } from '../controllers/searchEventController.js';

const router = express.Router();

router.use(authMiddleware);

router.get("/", searchEvent);

export default router;