import express from 'express';
import { authMiddleware } from "../middleware/authMiddleware.js";
import {createEvent, updateEvent, deleteEvent, viewEvents, viewEventReservation} from "../controllers/eventController.js";
import { createEventSchema, updateEventSchema, deleteEventSchema, viewEventReservationSchema } from '../validators/eventValidators.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { cache } from '../middlewares/cache.js';

const router = express.Router();

router.use(authMiddleware);

router.post("/createEvent", validateRequest(createEventSchema), createEvent);
router.patch("/updateEvent", validateRequest(updateEventSchema), updateEvent);
router.delete("/deleteEvent", validateRequest(deleteEventSchema), deleteEvent);
router.get("/", cache(120, "event"), viewEvents);                
router.get("/:event_id/eventReservation", cache(120), validateRequest(viewEventReservationSchema), viewEventReservation); //no resource name for cache. to delete per item

export default router;


