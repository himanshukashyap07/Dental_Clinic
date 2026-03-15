import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOption } from "../auth/[...nextauth]/option";



export async function POST(req: NextRequest) {
    const session = await getServerSession(authOption);
    const UserId = session?.user._id;
    const { firstName, lastName, phone, service, date, notes } = await req.json();
    
    const infoArr = [firstName, lastName, phone, service, date]
    infoArr.forEach((e, i) => {
        if (e === "") {
            return NextResponse.json({ error: `${infoArr[i]} is required`, success: false }, { status: 400 })
        }
    })
    await dbConnect();
    try {
        const newBooking = await Booking.create({
            UserId,
            firstName,
            lastName,
            phone,
            service,
            date,
            notes
        })
        
        if (!newBooking) {
            return NextResponse.json({ error: "Errro occure in creating booking", success: false }, { status: 400 })
        }
        // send notification or email to admin
        // await notifyAdminByEmail()
        // await notifyAdminByNotification()

        return NextResponse.json({ message: "Booking created successfully", newBooking, success: true }, { status: 201 })

    } catch (error) {
        
        return NextResponse.json({ error: "Internal server error occure while creating booking", success: false }, { status: 500 })
    }

}

export async function GET() {
    const session = await getServerSession(authOption);
    if (session?.user.role !== "Admin") {
        return NextResponse.json({ error: "unauthorized Request", success: false }, { status: 400 })
    }
    dbConnect();
    try {
        const Bookings = await Booking.find({ status: { $ne: "Deleted" } }).sort({ date: -1 });
        
        if (!Booking) {
            return NextResponse.json({ message: "No Booking found", success: false }, { status: 404 })
        }
        return NextResponse.json({ message: "Booking fetched successfully", Bookings, success: true }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Internal server error occure while fetch booking", success: false }, { status: 500 })
    }
}