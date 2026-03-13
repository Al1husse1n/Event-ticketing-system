import {z} from "zod";


const createEventSchema = z.object({
    body: z.object({
        name: z.string().min(3, {message: "Name must be at least 3 characters"}),
        totalSeats: z.coerce.number().int({message: "Total seats must be an integer"}).positive(),
        eventDate: z.coerce.date({message: "Please select a valid date"}),
        category: z.enum(['CONFERENCE', 'WORKSHOP', 'MEETUP', 'CONCERT', 'EXHIBITION', 'RELIGIOUS', 'ONLINE', 'COMMUNITY', 'CEREMONY'], {message: "Category must be: CONFERENCE, WORKSHOP, MEETUP, CONCERT, EXHIBITION, RELIGIOUS, ONLINE, COMMUNITY or CEREMONY"})
    }).strict(),
    params: z.object({}).optional(),
    query: z.object({}).optional()
})


const updateEventSchema = z.object({
    body: z.object({
        name: z.string().min(3, {message: "Name must be at least 3 characters"}),
        totalSeats: z.coerce.number().int({message: "Total seats must be an integer"}).positive(),
        eventDate: z.coerce.date({message: "Please select a valid date"}),
        category: z.enum(['CONFERENCE', 'WORKSHOP', 'MEETUP', 'CONCERT', 'EXHIBITION', 'RELIGIOUS', 'ONLINE', 'COMMUNITY', 'CEREMONY'], {message: "Category must be: CONFERENCE, WORKSHOP, MEETUP, CONCERT, EXHIBITION, RELIGIOUS, ONLINE, COMMUNITY or CEREMONY"})
    }).partial().strict(),

    params: z.object({
        event_id: z.string({message: "The id must be a string"}).uuid()
    }),

    query: z.object({}).optional()
})

const deleteEventSchema = z.object({
    params: z.object({
        event_id: z.string({message: "The id must be a string"}).uuid()
    }).strict(),

    query: z.object({}).optional(),
    body: z.object({}).optional()
});


const viewEventReservationSchema = z.object({
    query: z.object({
        cursor: z.string({message: "The cursor/id must be a string"}).uuid(),
        limit: z.coerce.number().
        int({message: "limit must be an integer"}).
        min(1, {message: "minimum value of limit is 1"}),
    }).strict().partial(),

    params: z.object({
        event_id: z.string({message: "The id must be a string"}).uuid()
    }).strict(),

    body: z.object({}).optional()
});

export {createEventSchema, updateEventSchema, deleteEventSchema, viewEventReservationSchema};
