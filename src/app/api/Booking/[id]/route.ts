import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOption } from "../../auth/[...nextauth]/option";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOption);
    if (session?.user.role !== "Admin") {
        return NextResponse.json({error:"unauthorized Request",success:false},{status:400})
    }
    const { status } = await req.json();
    const { id } = await context.params;
    if (!status) {
        return NextResponse.json({ error: "status is required", success: false }, { status: 400 })
    }
    dbConnect()
    try {

        const book = await Booking.findByIdAndUpdate(id, {
            $set: {
                status
            }
        }, { returnDocument: 'after' })
        if (!book) {
            return NextResponse.json({ error: "Booking not updated", success: false }, { status: 400 })

        }
        return NextResponse.json({ message: "Booking updated successfully", book, success: true }, { status: 200 })

    } catch (error) {

        return NextResponse.json({ error: "Internal server Error Occure", success: false }, { status: 500 })

    }
}