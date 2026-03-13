import express from 'express';
import { authMiddleware } from "../middleware/authMiddleware.js";
import { searchEvent } from '../controllers/searchEventController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { searchEventSchema } from '../validators/searchEventValidator.js';

const router = express.Router();

router.use(authMiddleware);

router.get("/", validateRequest(searchEventSchema), searchEvent);

export default router;