"use server"

import { authOption } from "@/app/api/auth/[...nextauth]/option"
import { getServerSession } from "next-auth"

export async function isAdmin(){
    const session = await getServerSession(authOption)
    return session?.user?.role === "Admin"
}

export async function isUser(){
    const session = await getServerSession(authOption)
    return session?.user?.role === "User"
}