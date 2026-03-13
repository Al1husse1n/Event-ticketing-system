import express from 'express';
import { authMiddleware } from "../middleware/authMiddleware.js";
import { bookReservation, payment, confirmPayment } from '../controllers/paymentController.js';

const router = express.Router();

router.use(authMiddleware);

router.post("/:event_id", bookReservation);
router.post("/", payment);
router.patch("/confirmpayment", confirmPayment);

export default router;