import z from "zod";
const searchEventSchema = z.object({
    query: z.object({
        page: z.coerce.number().
        int({message: "page must be an integer"}).
        min(1, {message: "minimum value of page is 1"}),

        limit: z.coerce.number().
        int({message: "limit must be an integer"}).
        min(1, {message: "minimum value of limit is 1"}),

        category: z.enum(['CONFERENCE', 'WORKSHOP', 'MEETUP', 'CONCERT', 'EXHIBITION', 'RELIGIOUS', 'ONLINE', 'COMMUNITY', 'CEREMONY'], {message: "Category must be: CONFERENCE, WORKSHOP, MEETUP, CONCERT, EXHIBITION, RELIGIOUS, ONLINE, COMMUNITY or CEREMONY"}),
        upcoming: z.coerce.boolean(),
        organizer: z.string(),
        name: z.string(),
        date: z.coerce().date({message: "Please select a valid date"})
    }).strict().partial(),

    params: z.object({}).optional(),
    body: z.object({}).optional()
});

export {searchEventSchema};

