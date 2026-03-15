"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Appointment {
    _id: string;
    firstName: string;
    lastName: string;
    date: any;
    notes?: string;
    service: string;
}

export default function MyAppointmentsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            router.push("/login");
            return;
        }

        async function fetchAppointments() {
            setIsLoading(true);
            try {
                const response = await axios.get("/api/Booking/myAppointment");
                setAppointments(response.data.Bookings || []);
            } catch (error) {
                toast({
                    title: "Error occure",
                    description: "Error occure in fetching Appointments",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        }
        fetchAppointments();
    }, [session, status, router]);

    if (status === "loading" || isLoading) {
        return (
            <div className="py-10 bg-background min-h-screen flex items-center justify-center">
                <p>Loading your appointments...</p>
            </div>
        );
    }

    if (!session) {
        return null; 
    }

    return (
        <div className="py-10 bg-background min-h-screen">
            <div className="container mx-auto px-4">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-headline font-bold text-primary mb-2">My Appointments</h1>
                        <p className="text-muted-foreground">View your upcoming and past appointments.</p>
                    </div>
                </header>

                <Card className="shadow-xl border-none">
                    <CardHeader>
                        <CardTitle>Your Appointments</CardTitle>
                        <CardDescription>A list of your appointment requests.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {appointments.length === 0 ? (
                            <div className="text-center py-10 bg-muted/20 rounded-lg">
                                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                                <p className="text-lg text-muted-foreground font-medium">No appointments yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>First Name</TableHead>
                                            <TableHead>Last Name</TableHead>
                                            <TableHead>Service</TableHead>
                                            <TableHead>notes</TableHead>
                                            <TableHead>Appointment Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {appointments.map((appointment, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{appointment.firstName}</TableCell>
                                                <TableCell>{appointment.lastName}</TableCell>
                                                <TableCell className="capitalize">{appointment.service}</TableCell>
                                                <TableCell className="capitalize">{!!appointment.notes ? appointment.notes : "-"}</TableCell>
                                                <TableCell>
                                                    {new Date(appointment.date).toLocaleString("en-GB", { timeZone: "Asia/Kolkata", day: "2-digit", month: "2-digit", year: "2-digit" }).replace(/\//g, '-')}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
