"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const session = useSession()
    if (session.data?.user) {
        router.push("/")
        return null;
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await signIn("credentials", {
            username,
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            toast({
                title: "Registration Failed",
                variant: "destructive",
            });
        } else {
            toast({
                title: "Registration Successful",
                description: "Welcome!",
            });
            router.replace("/");
        }
        setEmail("");
        setPassword("");
        setIsLoading(false);
    };

    return (
        <div className="py-20 min-h-screen bg-primary/5 flex items-center justify-center">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-headline font-bold text-primary">
                        Sign Up
                    </CardTitle>

                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Name</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Enter your name"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Signing up..." : "Sign up"}
                        </Button>
                    </form>
                    <Button variant="link" onClick={() => router.push("/login")}>
                        Already have an account? <em>Log in</em>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
