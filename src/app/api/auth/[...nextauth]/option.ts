import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";


export const authOption: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                username: { label: "Enter username", type: "text" },
                email: { label: "Enter Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect();
                try {
                    if (!credentials?.email || !credentials?.password) {
                        return;
                    }

                    const user = await User.findOne({ email: credentials.email })

                    if(user){
                        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)
                        if (isPasswordCorrect) {
                            return user
                        }
                        return;
                    }
                    if (!credentials.username) {
                        return;
                    }
                    const hashedPassword = await bcrypt.hash(credentials.password,10);
                    const isAdmin = (credentials.email === process.env.ADMINEMAIL)
                    const newUser = await User.create({
                        username:credentials.username,
                        email:credentials.email,
                        password:hashedPassword,
                        role:isAdmin?"Admin":"User"
                    })
                    if (!newUser) {
                        return;
                    }
                    return newUser;
                } catch (error: any) {
                    return;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            // give data to token form user
            if (user) {
                token._id = user._id?.toString() || "" // user will not give us data esily so we created a file in types folder next-auth.d.ts
                token.username = user.username || ""
                token.email = user.email || ""
                token.role = user.role || "";
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    _id: token._id,
                    username: token.username,
                    email:token.email,
                    role: token.role,
                };
            }
            return session;
        }


    },
    pages: {
        signIn: "/signin",
        error: "/signin"
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET

}














