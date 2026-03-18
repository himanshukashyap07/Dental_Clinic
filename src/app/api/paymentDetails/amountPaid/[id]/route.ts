import dbConnect from "@/lib/dbConnect";
import PaymentDetails from "@/models/PaymentsDetails";
import { amountPaidUpdateSchema, validateUserBeforeUpdateSchema } from "@/schemas/PaymentDetailSchema";
import ApiError from "@/utils/ErrorResponse";
import ApiResponse from "@/utils/SuccessResponse";
import { isAdmin } from "@/utils/UserRole";
import { NextRequest } from "next/server";
import z from "zod";

const amountPaidActionSchema = z.object({
    action: z.enum(["add", "update", "delete"]).optional().default("add"),
    paymentId: z.string().optional(),
    amount: z.number().positive().min(0.01, "Amount must be greater than 0").optional(),
    paymentMethod: z.enum(["Online", "Cash"]).optional(),
});

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const admin = await isAdmin();
    if (!admin) {
        return new ApiError(403, null, "unauthorized request").toError();
    }

    const { id } = await context.params;
    const body = await req.json();
    const username = id.split("+")[0];
    const mobile = id.split("+")[1];
    const mobileNumber = Number(mobile);
    try {
        const validateCredentials = validateUserBeforeUpdateSchema.safeParse({ username, mobileNumber });
        if (!validateCredentials.success) {
            console.log("mobile number and username getting error",validateCredentials.error);
            
            return new ApiError(400, validateCredentials.error, "Invalid username or mobile number").toError();
        }

        const { username: name, mobileNumber: mobile } = validateCredentials.data;
        const validateAction = amountPaidActionSchema.safeParse(body);

        if (!validateAction.success) {
            return new ApiError(400, validateAction.error, "Invalid request payload").toError();
        }

        const { action, paymentId, amount, paymentMethod } = validateAction.data;

        await dbConnect();

        let payment;
        if (action === "add") {
            const validateAmount = amountPaidUpdateSchema.safeParse({ amount, paymentMethod });
            if (!validateAmount.success) {
                console.log("amount or payment method getting error",validateAmount.error);
                return new ApiError(400, validateAmount.error, "Invalid amount or payment method").toError();
            }

            payment = await PaymentDetails.findOneAndUpdate(
                { username: name, mobileNumber: mobile },
                { $push: { amountPaid: { amount, paymentMethod, date: new Date() } } },
                { returnDocument: "after" }
            );
        } else if (action === "update") {
            if (!paymentId || amount === undefined || !paymentMethod) {
                console.log("paymentId, amount and paymentMethod are required for update");
                return new ApiError(400, null, "paymentId, amount and paymentMethod are required for update").toError();
            }

            payment = await PaymentDetails.findOneAndUpdate(
                { username: name, mobileNumber: mobile, "amountPaid._id": paymentId },
                {
                    $set: {
                        "amountPaid.$.amount": amount,
                        "amountPaid.$.paymentMethod": paymentMethod,
                    },
                },
                { returnDocument: "after" }
            );
        } else {
            // delete
            if (!paymentId) {
                console.log("paymentId is required for delete");
                return new ApiError(400, null, "paymentId is required for delete").toError();
            }

            payment = await PaymentDetails.findOneAndUpdate(
                { username: name, mobileNumber: mobile },
                { $pull: { amountPaid: { _id: paymentId } } },
                { returnDocument: "after" }
            );
        }

        if (!payment) {
            return new ApiError(404, null, "User not found").toError();
        }

        return new ApiResponse(200, payment, "Payment updated successfully").toResponse();
    } catch (error) {
        return new ApiError(500, error, "Internal server error").toError();
    }
}