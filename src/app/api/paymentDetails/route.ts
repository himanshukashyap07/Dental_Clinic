import { NextRequest } from "next/server";
import ApiError from "@/utils/ErrorResponse";
import { PaymentDetailSchema } from "@/schemas/PaymentDetailSchema";
import PaymentDetails from "@/models/PaymentsDetails";
import ApiResponse from "@/utils/SuccessResponse";
import dbConnect from "@/lib/dbConnect";
import { isAdmin } from "@/utils/UserRole";


export async function POST(req: NextRequest) {
    const admin = await isAdmin();
    if (!admin) {
        return new ApiError(403, null, "unauthorized request").toError();
    }
    try {
        const data = await req.json();
        const validateData = PaymentDetailSchema.safeParse(data);
        console.log(data.mobileNumber);
        
        if (!validateData.success) {
            console.log(validateData);
            
            console.log(validateData.error);
            
            return new ApiError(400, validateData.error, "Invalid data").toError();
        }
        const { username, mobileNumber, amountPaid, totalAmount, treatements, paymentMethod, paymentStatus } = validateData.data;
        await dbConnect();
        const newPaymentDetail = await PaymentDetails.create({
            username,
            mobileNumber,
            amountPaid: amountPaid ?? [],
            totalAmount,
            treatements: treatements ?? [],
            paymentMethod,
            paymentStatus
        })

        if (!newPaymentDetail) {
            return new ApiError(500, null, "Failed to create payment detail").toError();
        }
        return new ApiResponse(201, newPaymentDetail, "Payment detail created successfully").toResponse();
    } catch (error: any) {
        return new ApiError(500, error, "An error occurred while creating the payment detail").toError();
    }
}


export async function GET(req: NextRequest) {
    const admin = await isAdmin();
    if (!admin) {
        return new ApiError(403, null, "unauthorized request").toError();
    }

    try {
        const url = new URL(req.url);
        const params = url.searchParams;

        const username = params.get("username")?.trim();
        const mobileNumber = params.get("mobileNumber")?.trim();
        const paymentStatus = params.get("paymentStatus")?.trim();

        const page = Math.max(parseInt(params.get("page") || "1", 10), 1);
        const limit = Math.min(Math.max(parseInt(params.get("limit") || "10", 10), 1), 100);
        const sortBy = params.get("sortBy") || "createdAt";
        const sortOrder = params.get("sortOrder") === "asc" ? 1 : -1;

        const allowedSortFields = new Set(["createdAt", "username", "totalAmount", "paymentStatus"]);
        const sortField = allowedSortFields.has(sortBy) ? sortBy : "createdAt";

        const filter: any = {};
        if (username) {
            filter.username = { $regex: username, $options: "i" };
        }
        if (mobileNumber) {
            filter.mobileNumber = { $regex: mobileNumber, $options: "i" };
        }
        if (paymentStatus) {
            filter.paymentStatus = paymentStatus;
        }

        await dbConnect();

        const total = await PaymentDetails.countDocuments(filter);
        const payments = await PaymentDetails.find(filter)
            .sort({ [sortField]: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit);

        const totalPages = Math.max(1, Math.ceil(total / limit));

        return new ApiResponse(
            200,
            { payments, page, limit, total, totalPages },
            "Payment details retrieved successfully"
        ).toResponse();
    } catch (error) {
        return new ApiError(500, error, "An error occurred while retrieving payment details").toError();
    }
}