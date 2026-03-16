import express from 'express';
import { authMiddleware } from "../middleware/authMiddleware.js";
import { searchEvent } from '../controllers/searchEventController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { searchEventSchema } from '../validators/searchEventValidator.js';
import { cache } from '../middlewares/cache.js';

const router = express.Router();

router.use(authMiddleware);

router.get("/", validateRequest(searchEventSchema), cache(120, "searchevent"), searchEvent);

export default router;