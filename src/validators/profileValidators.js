import z from "zod";

const changeProfileSchema = z.object({
    body: z.object({
        name: z.string().min(3, {message: "Name must be atleast 3 characters"}),
        currentPassword: z.string(),
        newPassword: z.string().min(8, {message: "Password must atleast be 8 characters"})
    }).strict().partial(),
    params: z.object({}).optional(),
    query: z.object({}).optional()
});

const viewReservationSchema = z.object({
    query: z.object({
        cursor: z.string({message: "The cursor/id must be a string"}).uuid(),
        limit: z.coerce.number().
        int({message: "limit must be an integer"}).
        min(1, {message: "minimum value of limit is 1"}),
    }).strict().partial(),

    params: z.object({}).optional(),
    body: z.object({}).optional()
});

export {changeProfileSchema, viewReservationSchema};