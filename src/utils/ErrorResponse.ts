"use server";
import { NextResponse } from "next/server";

class ApiError {
    statusCode: number;
    message: string;
    success: boolean;
    error: any;

    constructor(statusCode: number, error?: any, message: string = "An error occurred") {
        this.statusCode = statusCode;
        this.error = error;
        this.message = message;
        this.success = false;
    }

    toError() {
        return NextResponse.json(
            { message: this.message, success: this.success, error: this.error },
            { status: this.statusCode }
        );
    }
}

export default ApiError;