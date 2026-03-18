import dbConnect from "@/lib/dbConnect";
import PaymentDetails from "@/models/PaymentsDetails";
import { validateUserBeforeUpdateSchema } from "@/schemas/PaymentDetailSchema";
import ApiError from "@/utils/ErrorResponse";
import ApiResponse from "@/utils/SuccessResponse";
import { isAdmin } from "@/utils/UserRole";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const admin = await isAdmin();
    if (!admin) {
        return new ApiError(403, null, "unauthorized request").toError();
    }

    const { id } = await context.params;
    const name = id.split("+")[0];
    const mobile = Number(id.split("+")[1]);

    try {
        const validateCredentials = validateUserBeforeUpdateSchema.safeParse({ username: name, mobileNumber: mobile });
        if (!validateCredentials.success) {
            return new ApiError(400, validateCredentials.error, "Invalid username or mobile number").toError();
        }
        const { username, mobileNumber } = validateCredentials.data;
        await dbConnect();
        const deleted = await PaymentDetails.findOneAndDelete({ username, mobileNumber });
        if (!deleted) {
            return new ApiError(404, null, "User not found").toError();
        }
        return new ApiResponse(200, null, "User payment record deleted").toResponse();
    } catch (error) {
        return new ApiError(500, error, "Internal server error").toError();
    }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const admin = await isAdmin();
    if (!admin) {
        return new ApiError(403, null, "unauthorized request").toError();
    }

    const {status} = await req.json()
    if (!status) {
        return new ApiError(400, null, "status is required").toError();
    }

    const { id } = await context.params;
    const name = id.split("+")[0];
    const mobile = Number(id.split("+")[1]);

    try {
        const validateCredentials = validateUserBeforeUpdateSchema.safeParse({ username: name, mobileNumber: mobile });
        if (!validateCredentials.success) {
            return new ApiError(400, validateCredentials.error, "Invalid username or mobile number").toError();
        }
        const { username, mobileNumber } = validateCredentials.data;
        await dbConnect();
        const updateStatus = await PaymentDetails.findOneAndUpdate({ username, mobileNumber }, 
            { 
                $set:{
                    paymentStatus:status
                } 
            },
            { returnDocument: "after" });
        if (!updateStatus) {
            return new ApiError(404, null, "User not found").toError();
        }
        return new ApiResponse(200, null, "User payment record payment status update").toResponse();
    } catch (error) {
        return new ApiError(500, error, "Internal server error").toError();
    }
}
