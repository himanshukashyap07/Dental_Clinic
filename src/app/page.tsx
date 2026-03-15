
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ShieldCheck, Heart, UserCheck, Star } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const heroImg = PlaceHolderImages.find(img => img.id === "hero-dentist");
  const clinicImg = PlaceHolderImages.find(img => img.id === "clinic-interior");

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImg?.imageUrl || ""}
            alt={heroImg?.description || ""}
            fill
            className="object-cover brightness-[0.8] "
            priority
            data-ai-hint="dentist clinic"
          />
        </div>
        <div className="container mx-auto px-4 z-10 text-white">
          <div className="max-w-2xl space-y-6">
            <h1 className="font-headline text-5xl md:text-6xl font-bold leading-tight">
              A Healthier Smile Starts Here
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Welcome to Veridian Dental, where world-class technology meets compassionate care. We’re dedicated to providing the best oral health experience for you and your family.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold" asChild>
                <Link href="/book">Book Your Visit</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 border-white text-white" asChild>
                <Link href="/services">Our Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4 -mt-24 z-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: <ShieldCheck className="text-accent" />, title: "Trusted Care", desc: "Expert certified dentists" },
            { icon: <Heart className="text-accent" />, title: "Patient First", desc: "Compassionate approach" },
            { icon: <UserCheck className="text-accent" />, title: "Expert Staff", desc: "Decades of experience" },
            { icon: <CheckCircle2 className="text-accent" />, title: "Modern Tech", desc: "Latest dental equipment" },
          ].map((item, idx) => (
            <Card key={idx} className="shadow-lg border-none">
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="p-3 bg-accent/10 rounded-full">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Services Overview */}
      <section className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary">Comprehensive Dental Services</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From routine checkups to complex restorations, we offer a full range of services tailored to your specific needs.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "General Dentistry", img: "service-general", desc: "Preventative care, cleanings, and oral exams for long-term health." },
            { title: "Orthodontics", img: "service-ortho", desc: "Modern solutions like braces and clear aligners to perfect your smile." },
            { title: "Cosmetic Procedures", img: "service-cosmetic", desc: "Professional whitening and veneers to boost your confidence." },
          ].map((service, idx) => {
            const imgData = PlaceHolderImages.find(img => img.id === service.img);
            return (
              <div key={idx} className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
                <div className="relative h-48">
                  <Image
                    src={imgData?.imageUrl || ""}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="font-headline text-xl font-bold">{service.title}</h3>
                  <p className="text-sm text-muted-foreground">{service.desc}</p>
                  <Button variant="link" className="p-0 text-primary h-auto" asChild>
                    <Link href="/services">Learn more &rarr;</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI Tool CTA */}
      <section className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-block px-4 py-1.5 bg-accent/20 text-accent rounded-full text-sm font-semibold">
              New: AI Dental Assistant
            </div>
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary">Have a quick dental question?</h2>
            <p className="text-lg text-muted-foreground">
              Try our AI-powered Dental Tip Tool. Get instant answers to common oral hygiene questions and personalized tips for your routine.
            </p>
            <Button size="lg" className="bg-accent hover:bg-accent/90" asChild>
              <Link href="/tips">Ask the AI Tool</Link>
            </Button>
          </div>
          <div className="flex-1 relative w-full aspect-video md:aspect-square max-w-lg">
            <Image
              src={clinicImg?.imageUrl || ""}
              alt="AI Dental Assistant"
              fill
              className="rounded-2xl object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary">What Our Patients Say</h2>
          <div className="flex justify-center text-yellow-400">
            <Star fill="currentColor" />
            <Star fill="currentColor" />
            <Star fill="currentColor" />
            <Star fill="currentColor" />
            <Star fill="currentColor" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Emily Watson", quote: "The most comfortable dental experience I've ever had. Dr. Sarah is so gentle and professional." },
            { name: "Michael Reed", quote: "Highly recommend Veridian for kids. They made my son feel at ease during his first cavity filling." },
            { name: "Sarah Jenkins", quote: "The clear aligners changed my life! The team was supportive every step of the way." }
          ].map((item, idx) => (
            <Card key={idx} className="bg-white">
              <CardContent className="p-8 space-y-4 italic text-muted-foreground">
                <p>"{item.quote}"</p>
                <div className="not-italic font-bold text-foreground">– {item.name}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
