import express from 'express';
import { authMiddleware } from "../middleware/authMiddleware.js";
import { bookReservation, payment, confirmPayment } from '../controllers/paymentController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { bookReservationSchema, paymentSchema, confirmPaymentSchema } from '../validators/paymentValidators.js';
import { paymentLimiter } from '../middlewares/userRateLimiter.js';
const router = express.Router();

router.use(authMiddleware);

router.post("/:event_id", validateRequest(bookReservationSchema), paymentLimiter, bookReservation);
router.post("/", validateRequest(paymentSchema), paymentLimiter, payment);
router.patch("/confirmpayment", validateRequest(confirmPaymentSchema), paymentLimiter, confirmPayment);
//
export default router;