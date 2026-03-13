import express from 'express';
import { authMiddleware } from "../middleware/authMiddleware.js";
import {createEvent, updateEvent, deleteEvent, viewEvents, viewEventReservation} from "../controllers/eventController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/createEvent", createEvent);
router.patch("/updateEvent", updateEvent);
router.delete("/deleteEvent", deleteEvent);
router.get("/", viewEvents);                
router.get("/:event_id/eventReservation", viewEventReservation);

export default router;


