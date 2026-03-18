"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

import axios from "axios";

export default function BookPage() {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [service, setService] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    if (!date) {
      toast({
        title: "Date Required",
        description: "Please select a preferred date for your appointment.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(form);
    
    try {
      const appointment = await axios.post("/api/booking", {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        phone: formData.get("phone"),
        service,
        date,
        notes: formData.get("notes"),
      })
      
      if (!appointment.data.success) {
        toast({
          title: "Submission Error",
          description: "Something went wrong. Please try again later.",
          variant: "destructive",
        });
        return;
      }
      toast({
          title: "Request Sent!",
          description: "We've received your appointment request and will contact you shortly to confirm.",
        });
      form.reset();
      setDate(undefined);
      setService("");
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="py-20 min-h-screen bg-primary/5">
      <div className="container mx-auto px-4 flex justify-center">
        <Card className="w-full max-w-2xl shadow-2xl">
          <CardHeader className="text-center space-y-2 pb-8">
            <CardTitle className="text-3xl font-headline font-bold text-primary">Request an Appointment</CardTitle>
            <CardDescription className="text-lg">
              Fill out the form below and our patient coordinator will reach out to schedule your visit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input name="firstName" id="firstName" placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input name="lastName" id="lastName" placeholder="Doe" required />
                </div>
              </div>

              <div className="grid grid-cols-1  gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input name="phone" id="phone" type="tel" placeholder="(555) 000-0000" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Preferred Service</Label>
                  <Select onValueChange={setService} value={service} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checkup">General Checkup</SelectItem>
                      <SelectItem value="cleaning">Teeth Cleaning</SelectItem>
                      <SelectItem value="whitening">Teeth Whitening</SelectItem>
                      <SelectItem value="ortho">Orthodontics Consultation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Preferred Date</Label>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        className="rounded-lg border w-[250px] md:w-[350px] p-3"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Information (Optional)</Label>
                <Textarea 
                  name="notes"
                  id="notes" 
                  placeholder="Tell us about any symptoms or specific concerns..." 
                  className="min-h-[120px]"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-accent hover:bg-accent/90 py-6 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending Request..." : "Request Appointment"}
                {!isSubmitting && <Send className="ml-2 h-5 w-5" />}
              </Button>
              <p className="text-center text-xs text-muted-foreground pt-4">
                By submitting this form, you agree to our privacy policy and consent to being contacted by Veridian Dental.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}