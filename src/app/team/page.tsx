
"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

interface ITeamMember {
  name: string;
  role: string;
  bio: string;
  image?: string;
  specialty?: string;
  education?: string;
}

export default function TeamPage() {
  const [doctors, setDoctors] = useState<ITeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await axios.get("/api/details");
        
        setDoctors(response.data.details.team || []);
      } catch (error) {
        toast({
        title: "Error Occure in fetch Team",
        description: "Please Refresh or wait some time and try again",
        variant: "destructive",
      });
        setDoctors([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="text-lg">Loading team...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-20">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Meet Our Experts</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our team of world-class specialists is dedicated to providing you with the highest standard of dental care in a welcoming environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {doctors.map((doc, index) => {
            // Use a placeholder image or find by name
            // const img = PlaceHolderImages.find(p => p.id === `dr-${doc.name.toLowerCase().split(' ')[1]}`) || PlaceHolderImages.find(p => p.id === "doctor");
            return (
              <Card key={index} className="overflow-hidden border-none shadow-xl">
                <div className="relative h-80 w-full bg-muted">

                  <Image
                    src={doc.image || ""}
                    alt={doc.name}
                    fill
                    className="object-contain bg-blue-100"
                  />
                </div>
                <CardContent className="p-8 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-primary">{doc.name}</h3>
                    <p className="text-accent font-semibold">{doc.role}</p>
                    {doc.specialty && (
                      <p className="text-sm text-muted-foreground">{doc.specialty}</p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {doc.bio}
                  </p>
                  {doc.education && (
                    <div className="pt-4 border-t">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Education</p>
                      <p className="text-sm font-medium">{doc.education}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
