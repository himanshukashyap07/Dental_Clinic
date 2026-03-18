
import dbConnect from "@/lib/dbConnect";
import PaymentDetails from "@/models/PaymentsDetails";
import { searchUserSchema } from "@/schemas/UserSchema";
import ApiError from "@/utils/ErrorResponse";
import ApiResponse from "@/utils/SuccessResponse";
import { isAdmin } from "@/utils/UserRole";
import { NextRequest } from "next/server";

export async function GET(req:NextRequest){
    try {
        const admin = await isAdmin();
        if (!admin) {
            return new ApiError(403, null, "unauthorized request").toError();
        }
        const { searchParams } = new URL(req.url);
        const name = searchParams.get("username")?.trim();
        const mobileParam = searchParams.get("mobileNumber")?.trim();
        const mobileNumber = mobileParam ? parseInt(mobileParam) : undefined;

        if (!name && !mobileNumber) {
            return new ApiError(400, null, "Username or mobile number is required").toError();
        }

        const validateCredentials = searchUserSchema.safeParse({ username: name, mobileNumber });
        if (!validateCredentials.success) {
            return new ApiError(400, validateCredentials.error, "Invalid username or mobile number").toError();
        }

        await dbConnect();

        const query: any = {};
        if (name) {
            query.username = { $regex: name, $options: "i" };
        }
        if (mobileNumber) {
            query.mobileNumber = mobileNumber;
        }

        const users = await PaymentDetails.find(query);
        if (!users || users.length === 0) {
            return new ApiError(404, null, "No users found").toError();
        }
        return new ApiResponse(200, users, "Users retrieved successfully").toResponse();
    } catch (error) {
        return new ApiError(500,error,"Internal server error while searching user").toError();
    }

}