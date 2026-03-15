import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOption } from "../../auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";



export async function GET(){
    const session = await getServerSession(authOption);
    if (session?.user.role !== "User") {
        return NextResponse.json({ error: "unauthorized Request", success: false }, { status: 400 })
    }
    await dbConnect();
    try {
        const Bookings = await Booking.find({ UserId: session.user._id}).sort({ date: -1 });
        if (!Booking) {
            return NextResponse.json({ message: "No Booking found", success: false }, { status: 404 })
        }
        return NextResponse.json({ message: "Booking fetched successfully", Bookings, success: true }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error", success: false }, { status: 500 })
    }
}