import express from 'express';
import { authMiddleware } from "../middleware/authMiddleware.js";
import { changeProfile, viewReservation } from '../controllers/profileController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { changeProfileSchema, viewReservationSchema} from '../validators/profileValidators.js';
import { cache } from '../middlewares/cache.js';

const router = express.Router();

router.use(authMiddleware);

router.patch("/changeProfile", validateRequest(changeProfileSchema), changeProfile);
router.get("/reservations", validateRequest(viewReservationSchema), cache(120, "profile"), viewReservation);

export default router;