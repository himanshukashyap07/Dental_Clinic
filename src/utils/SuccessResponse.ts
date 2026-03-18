"use server";
import { NextResponse } from "next/server";

class ApiResponse {
    statusCode: number;
    message: string;
    success: boolean;
    responseObj: any;

    constructor(statusCode: number, responseObj?: any, message: string = "success") {
        this.statusCode = statusCode;
        this.responseObj = responseObj;
        this.message = message;
        this.success = true;
    }

    toResponse() {
        return NextResponse.json(
            { message: this.message, success: this.success, responseObj: this.responseObj },
            { status: this.statusCode }
        );
    }
}

export default ApiResponse;