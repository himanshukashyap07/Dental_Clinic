import z from 'zod';

export const PaymentDetailSchema = z.object({
    username: z.string().nonempty().max(50),
    mobileNumber: z.number().positive().min(10000000, "Mobile number must be a valid number").max(999999999999999, "Mobile number must be a valid number"),
    amountPaid: z.array(z.object({
        amount: z.number().positive().min(0.01, "Amount must be greater than 0"),
        paymentMethod: z.enum(["Online", "Cash"]),
        date:z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid date format"
        })
    })).optional(),
    totalAmount: z.number().positive().min(0.01, "Total amount must be greater than 0"),
    treatements: z.array(z.object({
        treatmentName: z.string().nonempty(),
        description: z.string().nonempty(),
        date: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid date format"
        })
    })).optional(),
    paymentMethod: z.enum(["Online", "Cash"]),
    paymentStatus: z.enum(['Pending', 'Completed', 'Failed'])
});

export const validateUserBeforeUpdateSchema = z.object({
    username: z.string().nonempty().max(50).optional(),
    mobileNumber: z.number().positive().min(10000000, "Mobile number must be a valid number").max(999999999999999, "Mobile number must be a valid number"),

})

export const treatmentUpdateSchema = z.object({
    treatmentName: z.string().nonempty(),
    description: z.string().nonempty().optional(),
    date: z.date().optional()
})

export const amountPaidUpdateSchema = z.object({
    amount: z.number().positive().min(0.01, "Amount must be greater than 0"),
    paymentMethod: z.enum(["Online", "Cash"]),
    date: z.date().optional()
})




