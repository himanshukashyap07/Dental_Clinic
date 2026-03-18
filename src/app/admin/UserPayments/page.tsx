"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@radix-ui/react-accordion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, DollarSign, FileText, Users } from "lucide-react";

interface PaymentEntry {
    _id: string;
    amount: number;
    paymentMethod: string;
    date: string;
}

interface TreatmentEntry {
    _id: string;
    treatmentName: string;
    description: string;
    date: string;
}

interface PaymentDetail {
    _id: string;
    username: string;
    mobileNumber: number;
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
    amountPaid: PaymentEntry[];
    treatements: TreatmentEntry[];
    createdAt: string;
    updatedAt: string;
}

export default function AdminUserPaymentsPage() {
    const { toast } = useToast();
    const router = useRouter();
    const session = useSession();

    const [payments, setPayments] = useState<PaymentDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchName, setSearchName] = useState("");
    const [searchMobile, setSearchMobile] = useState("");

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [statusFilter, setStatusFilter] = useState("");

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
    const [isEditPaymentOpen, setIsEditPaymentOpen] = useState(false);
    const [isAddTreatmentOpen, setIsAddTreatmentOpen] = useState(false);
    const [isEditTreatmentOpen, setIsEditTreatmentOpen] = useState(false);

    const [selectedPayment, setSelectedPayment] = useState<PaymentDetail | null>(null);
    const [selectedPaymentEntryId, setSelectedPaymentEntryId] = useState<string | null>(null);
    const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(null);

    const [createPayload, setCreatePayload] = useState({
        username: "",
        mobileNumber: "",
        totalAmount: "",
        paymentMethod: "Online",
        paymentStatus: "Pending",
        amount: "",
        amountMethod: "Online",
        treatmentName: "",
        treatmentDescription: "",
    });

    const [paymentPayload, setPaymentPayload] = useState({ amount: "", paymentMethod: "Online" });
    const [treatmentPayload, setTreatmentPayload] = useState({ treatmentName: "", description: "" });

    const [editPaymentPayload, setEditPaymentPayload] = useState({ amount: "", paymentMethod: "Online" });
    const [editTreatmentPayload, setEditTreatmentPayload] = useState({ treatmentName: "", description: "" });

    useEffect(() => {
        if (session.status === "loading") return;
        if (session.data?.user.role !== "Admin") {
            router.push("/");
            return;
        }
        fetchPayments();
    }, [router, session]);

    useEffect(() => {
        if (session.status === "loading") return;
        if (session.data?.user.role !== "Admin") return;
        fetchPayments();
    }, [page, pageSize, sortBy, sortOrder, statusFilter]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    useEffect(() => {
        if (!selectedPayment || !selectedPaymentEntryId) return;
        const entry = selectedPayment.amountPaid?.find((p) => p._id === selectedPaymentEntryId);
        if (!entry) return;
        setEditPaymentPayload({ amount: entry.amount.toString(), paymentMethod: entry.paymentMethod });
    }, [selectedPayment, selectedPaymentEntryId]);

    useEffect(() => {
        if (!selectedPayment || !selectedTreatmentId) return;
        const entry = selectedPayment.treatements?.find((t) => t._id === selectedTreatmentId);
        if (!entry) return;
        setEditTreatmentPayload({ treatmentName: entry.treatmentName, description: entry.description });
    }, [selectedPayment, selectedTreatmentId]);

    async function fetchPayments(options?: {
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
        statusFilter?: string;
        username?: string;
        mobileNumber?: string;
    }) {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            const pageToUse = options?.page ?? page;
            const pageSizeToUse = options?.pageSize ?? pageSize;
            const sortByToUse = options?.sortBy ?? sortBy;
            const sortOrderToUse = options?.sortOrder ?? sortOrder;
            const statusFilterToUse = options?.statusFilter ?? statusFilter;
            const usernameToUse = options?.username ?? searchName;
            const mobileNumberToUse = options?.mobileNumber ?? searchMobile;

            if (usernameToUse.trim()) params.set("username", usernameToUse.trim());
            if (mobileNumberToUse.trim()) params.set("mobileNumber", mobileNumberToUse.trim());
            if (statusFilterToUse) params.set("paymentStatus", statusFilterToUse);
            params.set("page", String(pageToUse));
            params.set("limit", String(pageSizeToUse));
            params.set("sortBy", sortByToUse);
            params.set("sortOrder", sortOrderToUse);

            const res = await axios.get(`/api/paymentDetails?${params.toString()}`);
            console.log(res.data);
            
            const resp = res.data.responseObj;
            setPayments(resp.payments ?? []);
            setTotalPages(resp.totalPages ?? 1);
        } catch (error) {
            toast({
                title: "Failed to load payments",
                description: "Could not fetch payment records.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSearch() {
        setPage(1);
        await fetchPayments({ page: 1, username: searchName, mobileNumber: searchMobile });
    }

    async function handleCreate() {
        try {
            const payload = {
                username: createPayload.username.trim(),
                mobileNumber: Number(createPayload.mobileNumber),
                totalAmount: Number(createPayload.totalAmount),
                paymentMethod: createPayload.paymentMethod,
                paymentStatus: createPayload.paymentStatus,
                amountPaid: createPayload.amount ? [{
                    amount: Number(createPayload.amount),
                    paymentMethod: createPayload.amountMethod,
                    date: new Date().toISOString(),
                }] : [],
                treatements: createPayload.treatmentName ? [{
                    treatmentName: createPayload.treatmentName,
                    description: createPayload.treatmentDescription,
                    date: new Date().toISOString(),
                }] : [],
            };

            await axios.post("/api/paymentDetails", payload);
            toast({
                title: "Created",
                description: "New payment user created successfully.",
            });
            setIsCreateOpen(false);
            setCreatePayload({
                username: "",
                mobileNumber: "",
                totalAmount: "",
                paymentMethod: "Online",
                paymentStatus: "Pending",
                amount: "",
                amountMethod: "Online",
                treatmentName: "",
                treatmentDescription: "",
            });
            fetchPayments();
        } catch (error: any) {
            toast({
                title: "Create failed",
                description: error?.response?.data?.message ?? "Unable to create payment.",
                variant: "destructive",
            });
        }
    }
    async function handleUpdatePaymentStatus(payment: PaymentDetail, status: string) {
        try {
            await axios.patch(`/api/paymentDetails/${payment.username}+${payment.mobileNumber}`, { status });
            toast({
                title: "status updated",
                description: "User payment status updated.",
            });
            fetchPayments();
        } catch (error: any) {
            toast({
                title: "status update failed",
                description: error?.response?.data?.message ?? "Unable to update payment status.",
                variant: "destructive",
            });
        }
    }

    async function handleDeleteUser(payment: PaymentDetail) {
        try {
            await axios.delete(`/api/paymentDetails/${payment.username}+${payment.mobileNumber}`);
            toast({
                title: "Deleted",
                description: "User payment record removed.",
            });
            fetchPayments();
        } catch (error: any) {
            toast({
                title: "Delete failed",
                description: error?.response?.data?.message ?? "Unable to delete user.",
                variant: "destructive",
            });
        }
    }

    async function handleAddPayment() {
        if (!selectedPayment) return;
        try {
            await axios.patch(
                `/api/paymentDetails/amountPaid/${selectedPayment.username}+${selectedPayment.mobileNumber}`,
                {
                    amount: Number(paymentPayload.amount),
                    paymentMethod: paymentPayload.paymentMethod,
                }
            );
            toast({
                title: "Updated",
                description: "Payment added successfully.",
            });
            setIsAddPaymentOpen(false);
            setPaymentPayload({ amount: "", paymentMethod: "Online" });
            setSelectedPaymentEntryId(null);
            fetchPayments();
        } catch (error: any) {
            toast({
                title: "Update failed",
                description: error?.response?.data?.message ?? "Unable to update payment.",
                variant: "destructive",
            });
        }
    }

    async function handleEditPayment() {
        if (!selectedPayment || !selectedPaymentEntryId) return;
        try {
            await axios.patch(
                `/api/paymentDetails/amountPaid/${selectedPayment.username}+${selectedPayment.mobileNumber}`,
                {
                    action: "update",
                    paymentId: selectedPaymentEntryId,
                    amount: Number(editPaymentPayload.amount),
                    paymentMethod: editPaymentPayload.paymentMethod,
                }
            );
            toast({
                title: "Updated",
                description: "Payment updated successfully.",
            });
            setIsEditPaymentOpen(false);
            setSelectedPaymentEntryId(null);
            setEditPaymentPayload({ amount: "", paymentMethod: "Online" });
            fetchPayments();
        } catch (error: any) {
            toast({
                title: "Update failed",
                description: error?.response?.data?.message ?? "Unable to update payment.",
                variant: "destructive",
            });
        }
    }


    async function handleDeletePayment() {
        if (!selectedPayment || !selectedPaymentEntryId) return;
        try {
            await axios.patch(
                `/api/paymentDetails/amountPaid/${selectedPayment.username}+${selectedPayment.mobileNumber}`,
                {
                    action: "delete",
                    paymentId: selectedPaymentEntryId,
                }
            );
            toast({
                title: "Deleted",
                description: "Payment record removed.",
            });
            setIsEditPaymentOpen(false);
            setSelectedPaymentEntryId(null);
            setEditPaymentPayload({ amount: "", paymentMethod: "Online" });
            fetchPayments();
        } catch (error: any) {
            toast({
                title: "Delete failed",
                description: error?.response?.data?.message ?? "Unable to delete payment.",
                variant: "destructive",
            });
        }
    }

    async function handleAddTreatment() {
        if (!selectedPayment) return;
        try {
            await axios.put(
                `/api/paymentDetails/treatment/${selectedPayment.username}+${selectedPayment.mobileNumber}`,
                {
                    treatmentName: treatmentPayload.treatmentName,
                    description: treatmentPayload.description,
                    date: new Date().toISOString(),
                }
            );
            toast({
                title: "Updated",
                description: "Treatment added successfully.",
            });
            setIsAddTreatmentOpen(false);
            setTreatmentPayload({ treatmentName: "", description: "" });
            fetchPayments();
        } catch (error: any) {
            toast({
                title: "Update failed",
                description: error?.response?.data?.message ?? "Unable to update treatment.",
                variant: "destructive",
            });
        }
    }

    async function handleEditTreatment() {
        if (!selectedPayment || !selectedTreatmentId) return;
        try {
            await axios.put(
                `/api/paymentDetails/treatment/${selectedPayment.username}+${selectedPayment.mobileNumber}`,
                {
                    action: "update",
                    treatmentId: selectedTreatmentId,
                    treatmentName: editTreatmentPayload.treatmentName,
                    description: editTreatmentPayload.description,
                }
            );
            toast({
                title: "Updated",
                description: "Treatment updated successfully.",
            });
            setIsEditTreatmentOpen(false);
            setSelectedTreatmentId(null);
            setEditTreatmentPayload({ treatmentName: "", description: "" });
            fetchPayments();
        } catch (error: any) {
            toast({
                title: "Update failed",
                description: error?.response?.data?.message ?? "Unable to update treatment.",
                variant: "destructive",
            });
        }
    }


    async function handleDeleteTreatment() {
        if (!selectedPayment || !selectedTreatmentId) return;
        try {
            await axios.put(
                `/api/paymentDetails/treatment/${selectedPayment.username}+${selectedPayment.mobileNumber}`,
                {
                    action: "delete",
                    treatmentId: selectedTreatmentId,
                }
            );
            toast({
                title: "Deleted",
                description: "Treatment record removed.",
            });
            setIsEditTreatmentOpen(false);
            setSelectedTreatmentId(null);
            setEditTreatmentPayload({ treatmentName: "", description: "" });
            fetchPayments();
        } catch (error: any) {
            toast({
                title: "Delete failed",
                description: error?.response?.data?.message ?? "Unable to delete treatment.",
                variant: "destructive",
            });
        }
    }

    return (
        <div className="py-10 bg-background min-h-screen">
            <div className="container mx-auto px-4">
                <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-headline font-bold text-primary">User Payments</h1>
                        <p className="text-muted-foreground">Create users, track payments, and update treatments.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="Search by name"
                                    value={searchName}
                                    onChange={(event) => setSearchName(event.target.value)}
                                    className="w-48"
                                />
                                <Input
                                    placeholder="Search by mobile"
                                    value={searchMobile}
                                    onChange={(event) => setSearchMobile(event.target.value)}
                                    className="w-44"
                                />
                                <Button
                                    variant="secondary"
                                    className="gap-2"
                                    onClick={handleSearch}
                                >
                                    <Search className="h-4 w-4" />
                                    Search
                                </Button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Select
                                    value={statusFilter || "all"}
                                    onValueChange={(value) => {
                                        setStatusFilter(value === "all" ? "" : value);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-44">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Failed">Failed</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={sortBy}
                                    onValueChange={(value) => {
                                        setSortBy(value);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-44">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="createdAt">Newest</SelectItem>
                                        <SelectItem value="username">Username</SelectItem>
                                        <SelectItem value="totalAmount">Total amount</SelectItem>
                                        <SelectItem value="paymentStatus">Status</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                                        setPage(1);
                                    }}
                                >
                                    {sortOrder === "asc" ? "Asc" : "Desc"}
                                </Button>

                                <Select
                                    value={String(pageSize)}
                                    onValueChange={(value) => {
                                        setPageSize(Number(value));
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="Per page" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5 / page</SelectItem>
                                        <SelectItem value="10">10 / page</SelectItem>
                                        <SelectItem value="20">20 / page</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    Page {page} / {totalPages}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    Prev
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 bg-accent hover:bg-accent/90 text-white">
                                    <Plus className="h-4 w-4" />
                                    Create new payment
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Payment User</DialogTitle>
                                    <DialogDescription>
                                        Provide user credentials and initial payment details.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-2">
                                    <div className="grid grid-cols-1 gap-2">
                                        <Label>Username</Label>
                                        <Input
                                            value={createPayload.username}
                                            onChange={(e) => setCreatePayload((p) => ({ ...p, username: e.target.value }))}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        <Label>Mobile Number</Label>
                                        <Input
                                            value={createPayload.mobileNumber}
                                            onChange={(e) => setCreatePayload((p) => ({ ...p, mobileNumber: e.target.value }))}
                                            type="tel"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        <Label>Total amount</Label>
                                        <Input
                                            value={createPayload.totalAmount}
                                            onChange={(e) => setCreatePayload((p) => ({ ...p, totalAmount: e.target.value }))}
                                            type="number"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        <Label>Payment Status</Label>
                                        <Select
                                            value={createPayload.paymentStatus}
                                            onValueChange={(value) => setCreatePayload((p) => ({ ...p, paymentStatus: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Completed">Completed</SelectItem>
                                                <SelectItem value="Failed">Failed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        <Label>Initial Payment Amount</Label>
                                        <Input
                                            value={createPayload.amount}
                                            onChange={(e) => setCreatePayload((p) => ({ ...p, amount: e.target.value }))}
                                            type="number"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        <Label>Initial Payment Method</Label>
                                        <Select
                                            value={createPayload.amountMethod}
                                            onValueChange={(value) => setCreatePayload((p) => ({ ...p, amountMethod: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Online">Online</SelectItem>
                                                <SelectItem value="Cash">Cash</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        <Label>Treatment name (optional)</Label>
                                        <Input
                                            value={createPayload.treatmentName}
                                            onChange={(e) => setCreatePayload((p) => ({ ...p, treatmentName: e.target.value }))}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        <Label>Treatment description</Label>
                                        <Input
                                            value={createPayload.treatmentDescription}
                                            onChange={(e) => setCreatePayload((p) => ({ ...p, treatmentDescription: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="button" onClick={handleCreate}>
                                        Create
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </header>

                <Card className="shadow-xl border-none">
                    <CardHeader>
                        <CardTitle>User Payments</CardTitle>
                        <CardDescription>Manage payment records for all users.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <p>Loading payments...</p>
                            </div>
                        ) : payments.length === 0 ? (
                            <div className="text-center py-10 bg-muted/20 rounded-lg">
                                <Users className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                                <p className="text-lg text-muted-foreground font-medium">No payment records yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                {/* /////////////////////////////////////////////////////// */}
                                <div className="space-y-4">
                                    {payments.map((payment) => (
                                        <Accordion key={payment._id} type="single" className="border-slate-400 border-b-2" collapsible>
                                            <AccordionItem value={payment._id}>
                                                <AccordionTrigger>
                                                    <div className="flex justify-between w-full">
                                                        <span className="font-semibold mr-2">{payment.username}</span>
                                                        <span className="text-green-600 font-medium">
                                                            ₹{payment.totalAmount.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <p className="text-sm text-gray-500">Mobile: {payment.mobileNumber}</p>
                                                    <p className="text-sm mt-1">
                                                        Status:{" "}
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${payment.paymentStatus === "Completed"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-yellow-100 text-yellow-700"
                                                                }`}
                                                        >
                                                            {payment.paymentStatus}
                                                        </span>
                                                    </p>

                                                    {/* Payments */}
                                                    <h4 className="mt-3 font-semibold text-sm">Payments</h4>
                                                    {payment.amountPaid?.map((amount, index) => (
                                                        <p key={index} className="text-sm text-gray-700">
                                                            ₹{amount.amount.toFixed(2)} on{" "}
                                                            {new Date(amount.date).toLocaleDateString()}
                                                        </p>
                                                    ))}

                                                    {/* Treatments */}
                                                    <h4 className="mt-3 font-semibold text-sm">Treatments</h4>
                                                    {payment.treatements?.map((treatment, index) => (
                                                        <div key={index} className="mt-1">
                                                            <p className="text-sm font-medium">
                                                                {treatment.treatmentName} on{" "}
                                                                {new Date(treatment.date).toLocaleDateString()}
                                                            </p>
                                                            <p className="text-xs text-gray-500">{treatment.description}</p>
                                                        </div>
                                                    ))}

                                                    {/* Actions */}
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => {
                                                            setSelectedPayment(payment);
                                                            setIsAddPaymentOpen(true);
                                                            setSelectedPaymentEntryId(null);
                                                        }}>➕ Payment</Button>
                                                        <Button size="sm" variant="outline" onClick={() => {
                                                            setSelectedPayment(payment);
                                                            setSelectedPaymentEntryId(null);
                                                            setIsEditPaymentOpen(true);
                                                        }}>✏️ Edit</Button>
                                                        <Button size="sm" variant="outline" onClick={() => {
                                                            setSelectedPayment(payment);
                                                            setIsAddTreatmentOpen(true);
                                                            setSelectedTreatmentId(null);
                                                        }}>➕ Treatment</Button>
                                                        <Button size="sm" variant="outline" onClick={() => {
                                                            setSelectedPayment(payment);
                                                            setSelectedTreatmentId(null);
                                                            setIsEditTreatmentOpen(true);
                                                        }}>✏️ Treatment</Button>
                                                        <Button size="sm" variant="outline" onClick={() => {
                                                            handleUpdatePaymentStatus(payment, payment.paymentStatus === "Pending" ? "Completed" : "Pending");
                                                        }}>🔄 Status</Button>
                                                        <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(payment)}>🗑️ Delete</Button>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {selectedPayment && (
                    <>
                        <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Payment</DialogTitle>
                                    <DialogDescription>
                                        Add a new payment record for <strong>{selectedPayment.username}</strong>.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-2">
                                    <div className="grid grid-cols-1 gap-2">
                                        <Label>Amount</Label>
                                        <Input
                                            value={paymentPayload.amount}
                                            onChange={(e) => setPaymentPayload((p) => ({ ...p, amount: e.target.value }))}
                                            type="number"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        <Label>Method</Label>
                                        <Select
                                            value={paymentPayload.paymentMethod}
                                            onValueChange={(value) => setPaymentPayload((p) => ({ ...p, paymentMethod: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Online">Online</SelectItem>
                                                <SelectItem value="Cash">Cash</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="secondary" onClick={() => setIsAddPaymentOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="button" onClick={handleAddPayment}>
                                        Save
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isAddTreatmentOpen} onOpenChange={setIsAddTreatmentOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Treatment</DialogTitle>
                                    <DialogDescription>
                                        Add a treatment entry for <strong>{selectedPayment.username}</strong>.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-2">
                                    <div className="grid grid-cols-1 gap-2">
                                        <Label>Treatment name</Label>
                                        <Input
                                            value={treatmentPayload.treatmentName}
                                            onChange={(e) => setTreatmentPayload((p) => ({ ...p, treatmentName: e.target.value }))}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        <Label>Description</Label>
                                        <Input
                                            value={treatmentPayload.description}
                                            onChange={(e) => setTreatmentPayload((p) => ({ ...p, description: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="secondary" onClick={() => setIsAddTreatmentOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="button" onClick={handleAddTreatment}>
                                        Save
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isEditPaymentOpen} onOpenChange={setIsEditPaymentOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Edit Payment</DialogTitle>
                                    <DialogDescription>
                                        Update or remove a payment entry for <strong>{selectedPayment.username}</strong>.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-2">
                                    <div className="grid grid-cols-1 gap-2">
                                        <Label>Pick payment</Label>
                                        <Select
                                            value={selectedPaymentEntryId || undefined}
                                            onValueChange={(value) => setSelectedPaymentEntryId(value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select payment" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(selectedPayment.amountPaid ?? []).map((entry) => (
                                                    <SelectItem key={entry._id} value={entry._id}>
                                                        ₹{entry.amount.toFixed(2)} — {new Date(entry.date).toLocaleDateString()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        <Label>Amount</Label>
                                        <Input
                                            value={editPaymentPayload.amount}
                                            onChange={(e) => setEditPaymentPayload((p) => ({ ...p, amount: e.target.value }))}
                                            type="number"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        <Label>Method</Label>
                                        <Select
                                            value={editPaymentPayload.paymentMethod}
                                            onValueChange={(value) => setEditPaymentPayload((p) => ({ ...p, paymentMethod: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Online">Online</SelectItem>
                                                <SelectItem value="Cash">Cash</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="secondary" onClick={() => setIsEditPaymentOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="button" variant="destructive" onClick={handleDeletePayment}>
                                        Delete
                                    </Button>
                                    <Button type="button" onClick={handleEditPayment}>
                                        Save
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isEditTreatmentOpen} onOpenChange={setIsEditTreatmentOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Edit Treatment</DialogTitle>
                                    <DialogDescription>
                                        Update or remove a treatment entry for <strong>{selectedPayment.username}</strong>.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-2">
                                    <div className="grid grid-cols-1 gap-2">
                                        <Label>Pick treatment</Label>
                                        <Select
                                            value={selectedTreatmentId || undefined}
                                            onValueChange={(value) => setSelectedTreatmentId(value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select treatment" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(selectedPayment.treatements ?? []).map((entry) => (
                                                    <SelectItem key={entry._id} value={entry._id}>
                                                        {entry.treatmentName} — {new Date(entry.date).toLocaleDateString()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        <Label>Treatment name</Label>
                                        <Input
                                            value={editTreatmentPayload.treatmentName}
                                            onChange={(e) => setEditTreatmentPayload((p) => ({ ...p, treatmentName: e.target.value }))}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        <Label>Description</Label>
                                        <Input
                                            value={editTreatmentPayload.description}
                                            onChange={(e) => setEditTreatmentPayload((p) => ({ ...p, description: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="secondary" onClick={() => setIsEditTreatmentOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="button" variant="destructive" onClick={handleDeleteTreatment}>
                                        Delete
                                    </Button>
                                    <Button type="button" onClick={handleEditTreatment}>
                                        Save
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </>
                )}
            </div>
        </div>
    );
}
