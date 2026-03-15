"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface IService {
    name: string;
    description: string;
    icon?: string;
}

interface IServiceCategory {
    category: string;
    services: IService[];
}

interface ITeamMember {
    name: string;
    role: string;
    bio: string;
    image?: string;
    specialty?: string;
    education?: string;
}

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { toast } = useToast();
    const [services, setServices] = useState<IServiceCategory[]>([]);
    const [team, setTeam] = useState<ITeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (status === "loading") return;
        if (!session || session.user.role !== "Admin") {
            router.push("/");
            return;
        }

        fetchDetails();
    }, [session, status, router]);

    const fetchDetails = async () => {
        try {
            const response = await axios.get("/api/details");
            setServices(response.data.details.services || []);
            setTeam(response.data.details.team || []);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load details.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const saveDetails = async () => {
        setIsSaving(true);
        try {
                                    
            await axios.put("/api/details", { services, team });
            toast({
                title: "Saved",
                description: "Details updated successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save details.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const addServiceCategory = () => {
        setServices([...services, { category: "", services: [] }]);
    };

    const removeServiceCategory = (index: number) => {
        setServices(services.filter((_, i) => i !== index));
    };

    const updateServiceCategory = (index: number, field: keyof IServiceCategory, value: string) => {
        const updated = [...services];
        updated[index] = { ...updated[index], [field]: value };
        setServices(updated);
    };

    const addService = (categoryIndex: number) => {
        setServices((prev) => {
            const updated = [...prev];
            const category = updated[categoryIndex];
            if (!category) return updated;

            const servicesArray = Array.isArray(category.services) ? category.services : [];
            updated[categoryIndex] = {
                ...category,
                services: [...servicesArray, { name: "", description: "" }],
            };

            return updated;
        });
    };

    const removeService = (categoryIndex: number, serviceIndex: number) => {
        setServices((prev) => {
            const updated = [...prev];
            const category = updated[categoryIndex];
            if (!category || !Array.isArray(category.services)) return updated;

            updated[categoryIndex] = {
                ...category,
                services: category.services.filter((_, i) => i !== serviceIndex),
            };

            return updated;
        });
    };

    const updateService = (categoryIndex: number, serviceIndex: number, field: keyof IService, value: string) => {
        setServices((prev) => {
            const updated = [...prev];
            const category = updated[categoryIndex];
            if (!category || !Array.isArray(category.services)) return updated;

            const service = category.services[serviceIndex];
            if (!service) return updated;

            updated[categoryIndex] = {
                ...category,
                services: category.services.map((item, i) =>
                    i === serviceIndex ? { ...item, [field]: value } : item
                ),
            };

            return updated;
        });
    };

    const addTeamMember = () => {
        setTeam([...team, { name: "", role: "", bio: "", specialty: "", education: "" }]);
    };

    const removeTeamMember = (index: number) => {
        setTeam(team.filter((_, i) => i !== index));
    };

    const updateTeamMember = (index: number, field: keyof ITeamMember, value: string) => {
        const updated = [...team];
        updated[index] = { ...updated[index], [field]: value };
        setTeam(updated);
    };

    if (status === "loading" || isLoading) {
        return <div className="py-10 text-center">Loading...</div>;
    }

    if (!session || session.user.role !== "Admin") {
        return null;
    }

    return (
        <div className="py-10 bg-background min-h-screen">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-headline font-bold text-primary mb-10">Admin Dashboard</h1>

                <Tabs defaultValue="services" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="services">Services</TabsTrigger>
                        <TabsTrigger value="team">Team</TabsTrigger>
                    </TabsList>

                    <TabsContent value="services">
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Services</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {services.map((category, categoryIndex) => (
                                    <div key={categoryIndex} className="border p-4 rounded space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-lg font-semibold">Category {categoryIndex + 1}</Label>
                                            <Button variant="destructive" size="sm" onClick={() => removeServiceCategory(categoryIndex)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Input
                                            placeholder="Category Name (e.g., Preventative Care)"
                                            value={category.category}
                                            onChange={(e) => updateServiceCategory(categoryIndex, "category", e.target.value)}
                                        />
                                        <div className="space-y-2">
                                            <Label>Services in this category:</Label>
                                            {category.services && category.services.map((service, serviceIndex) => (
                                                <div key={serviceIndex} className="border-l-2 border-primary pl-4 py-2 space-y-2">
                                                    <div className="flex justify-between">
                                                        <Label>Service {serviceIndex + 1}</Label>
                                                        <Button variant="destructive" size="sm" onClick={() => removeService(categoryIndex, serviceIndex)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <Input
                                                        placeholder="Service Name"
                                                        value={service.name}
                                                        onChange={(e) => updateService(categoryIndex, serviceIndex, "name", e.target.value)}
                                                    />
                                                    <Textarea
                                                        placeholder="Description"
                                                        value={service.description}
                                                        onChange={(e) => updateService(categoryIndex, serviceIndex, "description", e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                            <Button variant="outline" size="sm" onClick={() => addService(categoryIndex)}>
                                                <Plus className="h-4 w-4 mr-2" /> Add Service to Category
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <Button onClick={addServiceCategory}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Service Category
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="team">
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Team</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {team && team.map((member, index) => (
                                    <div key={index} className="border p-4 rounded space-y-2">
                                        <div className="flex justify-between">
                                            <Label>Team Member {index + 1}</Label>
                                            <Button variant="destructive" size="sm" onClick={() => removeTeamMember(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Input
                                            placeholder="Name"
                                            value={member.name}
                                            onChange={(e) => updateTeamMember(index, "name", e.target.value)}
                                        />
                                        <Input
                                            placeholder="Role (e.g., Lead Dentist & Founder)"
                                            value={member.role}
                                            onChange={(e) => updateTeamMember(index, "role", e.target.value)}
                                        />
                                        <Input
                                            placeholder="Specialty (e.g., Cosmetic & General Dentistry)"
                                            value={member.specialty || ""}
                                            onChange={(e) => updateTeamMember(index, "specialty", e.target.value)}
                                        />
                                        <Textarea
                                            placeholder="Bio"
                                            value={member.bio}
                                            onChange={(e) => updateTeamMember(index, "bio", e.target.value)}
                                        />
                                        <Input
                                            placeholder="Education (e.g., DDS, University of Pennsylvania)"
                                            value={member.education || ""}
                                            onChange={(e) => updateTeamMember(index, "education", e.target.value)}
                                        />
                                        <Input
                                            placeholder="Enter Image Url"
                                            value={member.image || ""}
                                            onChange={(e) => updateTeamMember(index, "image", e.target.value)}
                                        />
                                    </div>
                                ))}
                                <Button onClick={addTeamMember}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Team Member
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="mt-6">
                    <Button onClick={saveDetails} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
