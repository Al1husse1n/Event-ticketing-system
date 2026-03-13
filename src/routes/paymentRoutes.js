import express from 'express';
import { authMiddleware } from "../middleware/authMiddleware.js";
import { bookReservation, payment, confirmPayment } from '../controllers/paymentController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { bookReservationSchema, paymentSchema, confirmPaymentSchema } from '../validators/paymentValidators.js';

const router = express.Router();

router.use(authMiddleware);

router.post("/:event_id", validateRequest(bookReservationSchema),bookReservation);
router.post("/", validateRequest(paymentSchema), payment);
router.patch("/confirmpayment", validateRequest(confirmPaymentSchema), confirmPayment);

export default router;