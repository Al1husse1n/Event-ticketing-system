import {z} from "zod";

const bookReservationSchema = z.object({
    params: z.object({
        event_id: z.string({message: "The id must be a string"}).uuid()
    }).strict(),

    query: z.object({}).optional(),
    body: z.object({}).optional()
});

const paymentSchema = z.object({
    body: z.object({
        idempotencyKey: z.string({message: "Idempotency key must be a string"}),
        reservationId: z.string({message: "Reservation id must be a string"}).uuid(),
    }).strict(),
    params: z.object({}).optional(),
    query: z.object({}).optional()
});

const confirmPaymentSchema = z.object({
    body: z.object({
        paymentId: z.string({message: "Payment id must be a string"}),
        reservationId: z.string({message: "Reservation id must be a string"}).uuid(),
    }).strict(),
    params: z.object({}).optional(),
    query: z.object({}).optional()
});

export {bookReservationSchema, paymentSchema, confirmPaymentSchema};