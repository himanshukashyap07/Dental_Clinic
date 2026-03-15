import dbConnect from "@/lib/dbConnect";
import Details from "@/models/Details";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOption } from "../auth/[...nextauth]/option";

export async function GET() {

    await dbConnect();
    try {
        const details = await Details.findOne() || { services: [], team: [] };
        return NextResponse.json({ details, success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch details", success: false }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOption);
    if (session?.user.role !== "Admin") {
        return NextResponse.json({ error: "Unauthorized", success: false }, { status: 403 });
    }

    const { services, team } = await req.json();
    await dbConnect();
    try {
        const details = await Details.findOneAndUpdate(
            {},
            { services, team },
            { upsert: true, new: true }
        );
        return NextResponse.json({ details, success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update details", success: false }, { status: 500 });
    }
}

