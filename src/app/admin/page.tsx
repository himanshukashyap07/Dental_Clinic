"use client";

import { useEffect, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Calendar, Phone, Trash2, CheckCircle, Clock, XCircle, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Appointment {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  service: string;
  date: any;
  notes: string;
  status: string;
  createdAt: any;
}

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter()
  const session = useSession();

  useEffect(() => {
    if (session.status === "loading") return; // Wait for session to load
    if (session.data?.user.role !== "Admin") {
      router.push("/");
      return;
    }
    // Fetch appointments only if user is admin
    async function fetchAppointments() {
      setIsLoading(true);
      const appointments = await axios.get("/api/Booking");
      setAppointments(appointments.data.Bookings);
      setIsLoading(false);
    }
    fetchAppointments();
  }, [session, router]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await axios.patch(`/api/Booking/${id}`, { status: newStatus });
      toast({
        title: "Status Updated, hit a refresh to see the changes",
        description: `Appointment marked as ${newStatus}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await axios.patch(`/api/Booking/${id}`, { status: "Deleted" });
      toast({
        title: "Deleted, hit a refresh to see the changes",
        description: "Record removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete record.",
        variant: "destructive",
      });
    }
  };

  const isNew = (createdAt: any) => {
    if (!createdAt?.seconds) return false;
    const now = new Date().getTime();
    const createdTime = createdAt.seconds * 1000;
    return (now - createdTime) < 24 * 60 * 60 * 1000;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmed":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Confirmed</Badge>;
      case "Cancelled":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Cancelled</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  return (
    <div className="py-10 bg-background min-h-screen">
      <div className="container mx-auto px-4">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-headline font-bold text-primary">Appointments</h1>

            <p className="text-muted-foreground">Manage patient appointments and review details.</p>
          </div>
          <div className="gap-5 flex justify-evenly items-center">
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-semibold text-sm">
              <Bell className="w-4 h-4" />
              <span>{appointments.filter(a => a.status === "Pending").length} Pending Requests</span>
            </div>
            <Link href={"/admin/dashboard"}>
              <Button className="bg-accent hover:bg-accent/90 text-white">
                Services/Team
              </Button>
            </Link>
          </div>
        </header>

        <Card className="shadow-xl border-none">
          <CardHeader>
            <CardTitle>Appointment Requests</CardTitle>
            <CardDescription>A list of all incoming appointment requests from the website.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <p>Loading appointments...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-10 bg-muted/20 rounded-lg">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-lg text-muted-foreground font-medium">No appointment requests yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Appointment Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {appointment.firstName} {appointment.lastName}
                            {isNew(appointment.createdAt) && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1 bg-blue-50 text-blue-600 border-blue-200 uppercase font-bold">New</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-xs">
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {appointment.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{appointment.service}</TableCell>
                        <TableCell>
                          {new Date(appointment.date).toLocaleString("en-GB", { timeZone: "Asia/Kolkata", day: "2-digit", month: "2-digit", year: "2-digit" }).replace(/\//g, '-')}
                        </TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => updateStatus(appointment._id, "Confirmed")}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Confirm
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStatus(appointment._id, "Cancelled")}>
                                <XCircle className="mr-2 h-4 w-4 text-red-500" /> Cancel
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => deleteAppointment(appointment._id)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
