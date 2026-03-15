
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

interface IService {
  name: string;
  description: string;
}

interface IServiceCategory {
  category: string;
  services: IService[];
}

export default function ServicesPage() {
  const [serviceList, setServiceList] = useState<IServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get("/api/details");
        const raw = response.data.details.services || [];


        // Normalize to category format: [{ category, services: [{ name, description }] }]
        const normalized = Array.isArray(raw) && raw.length > 0 && "services" in raw[0]
          ? raw
          : [
            {
              category: "Services",
              services: (raw as any[]).map((item) => ({
                name: item.name ?? item.title ?? "",
                description: item.description ?? "",
              })),
            },
          ];

        setServiceList(normalized);
      } catch (error) {
        toast({
          title: "Error occure",
          description: "Error occure while saving try again",
          variant: "destructive",
        });
        // Fallback to empty array
        setServiceList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const clinicImg = PlaceHolderImages.find(img => img.id === "clinic-interior");

  if (isLoading) {
    return (
      <div className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="text-lg">Loading services...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="space-y-6">
            <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Our Services</h1>
            <p className="text-lg text-muted-foreground">
              At Veridian Dental, we provide a holistic approach to oral health. We don't just treat symptoms; we care for the person behind the smile. Our wide range of services ensures that every patient gets the specialized care they deserve.
            </p>
            <div className="flex gap-4">
              <Button className="bg-accent hover:bg-accent/90" asChild>
                <Link href="/book">Schedule a Consultation</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
            <Image
              src={clinicImg?.imageUrl || ""}
              alt="Our Clinic"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <h2 className="font-headline text-3xl font-bold text-center mb-12">Treatments We Offer</h2>
          <Accordion type="single" collapsible className="w-full">
            {serviceList.map((cat, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger className="text-xl font-bold text-primary py-6">
                  {cat.category}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                    {cat.services && cat.services.map((service, sIdx) => (
                      <div key={sIdx} className="p-4 bg-white rounded-lg border">
                        <h4 className="font-bold mb-2">{service.name}</h4>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
