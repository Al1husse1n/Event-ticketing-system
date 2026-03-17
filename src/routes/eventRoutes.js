import express from 'express';
import { authMiddleware } from "../middleware/authMiddleware.js";
import {createEvent, updateEvent, deleteEvent, viewEvents, viewEventReservation} from "../controllers/eventController.js";
import { createEventSchema, updateEventSchema, deleteEventSchema, viewEventReservationSchema } from '../validators/eventValidators.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { cache } from '../middlewares/cache.js';
import { userLimiter } from '../middlewares/userRateLimiter.js';

const router = express.Router();

router.use(authMiddleware);

router.post("/createEvent", validateRequest(createEventSchema), userLimiter, createEvent);
router.patch("/updateEvent", validateRequest(updateEventSchema),userLimiter, updateEvent);
router.delete("/deleteEvent", validateRequest(deleteEventSchema), userLimiter, deleteEvent);
router.get("/", cache(120, "event"), userLimiter, viewEvents);                
router.get("/:event_id/eventReservation", cache(120), userLimiter, validateRequest(viewEventReservationSchema), viewEventReservation); //no resource name for cache. to delete per item

export default router;


