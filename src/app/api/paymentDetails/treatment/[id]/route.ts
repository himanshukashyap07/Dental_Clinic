import dbConnect from "@/lib/dbConnect";
import PaymentDetails from "@/models/PaymentsDetails";
import { validateUserBeforeUpdateSchema, treatmentUpdateSchema } from "@/schemas/PaymentDetailSchema";
import ApiError from "@/utils/ErrorResponse";
import ApiResponse from "@/utils/SuccessResponse";
import { isAdmin } from "@/utils/UserRole";
import { NextRequest } from "next/server";
import z from "zod";

const treatmentActionSchema = z.object({
    action: z.enum(["add", "update", "delete"]).optional().default("add"),
    treatmentId: z.string().optional(),
    treatmentName: z.string().optional(),
    description: z.string().optional(),
});

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const admin = await isAdmin();
    if (!admin) {
        return new ApiError(403, null, "unauthorized request").toError();
    }
    const { id } = await context.params;
    const username = id.split("+")[0];
    const mobile = id.split("+")[1];
    const mobileNumber = Number(mobile);
    try {
        const validateCredentials = validateUserBeforeUpdateSchema.safeParse({ username, mobileNumber });
        if (!validateCredentials.success) {
            console.log("mobile number and username getting error",validateCredentials.error);
            return new ApiError(400, validateCredentials.error, "Invalid username or mobile number").toError();
        }
        const body = await req.json();
        const validateAction = treatmentActionSchema.safeParse(body);
        if (!validateAction.success) {
            console.log("treatment action getting error",validateAction.error);
            return new ApiError(400, validateAction.error, "Invalid request payload").toError();
        }

        const { action, treatmentId, treatmentName, description } = validateAction.data;
        const { username: name, mobileNumber: mobile } = validateCredentials.data;

        await dbConnect();

        let payment;
        if (action === "add") {
            
            const validateTreatmentCredentials = treatmentUpdateSchema.safeParse({ treatmentName, description });
            console.log([treatmentName,description]);
            
            if (!validateTreatmentCredentials.success) {
                console.log("treatmentName or description getting error",validateTreatmentCredentials.error);
                return new ApiError(400, validateTreatmentCredentials.error, "Invalid treatment details").toError();
            }

            payment = await PaymentDetails.findOneAndUpdate(
                { username: name, mobileNumber: mobile },
                {
                    $push: {
                        treatements: {
                            treatmentName: validateTreatmentCredentials.data.treatmentName,
                            description: validateTreatmentCredentials.data.description,
                            date: new Date(),
                        },
                    },
                },
                { returnDocument: "after" }
            );
        } else if (action === "update") {
            if (!treatmentId || !treatmentName || !description) {
                return new ApiError(400, null, "treatmentId, treatmentName, and description are required for update").toError();
            }

            payment = await PaymentDetails.findOneAndUpdate(
                { username: name, mobileNumber: mobile, "treatements._id": treatmentId },
                {
                    $set: {
                        "treatements.$.treatmentName": treatmentName,
                        "treatements.$.description": description,
                    },
                },
                { returnDocument: "after" }
            );
        } else {
            // delete
            if (!treatmentId) {
                console.log("treatmentId is required for delete");
                return new ApiError(400, null, "treatmentId is required for delete").toError();
            }

            payment = await PaymentDetails.findOneAndUpdate(
                { username: name, mobileNumber: mobile },
                { $pull: { treatements: { _id: treatmentId } } },
                { returnDocument: "after" }
            );
        }

        if (!payment) {
            return new ApiError(404, null, "User not found").toError();
        }
        return new ApiResponse(200, payment, "Treatment updated successfully").toResponse();

    } catch (error) {
        return new ApiError(500, error, "Internal server error").toError();
    }
}
