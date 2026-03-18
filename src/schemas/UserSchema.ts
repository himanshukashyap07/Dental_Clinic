import z from 'zod';
export const searchUserSchema = z.object({
    username:z.string().max(50).optional(),
    mobileNumber: z.string().regex(/^\d{8,15}$/, "Mobile number must be 8-15 digits").optional(),
})