
import Link from "next/link";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-headline text-lg font-bold mb-4">Veridian Dental</h3>
          <p className="text-primary-foreground/80 mb-4 max-w-xs">
            Providing compassionate, world-class dental care for the whole family. Your smile is our top priority.
          </p>
          <div className="flex space-x-4">
            {/* Social Icons Placeholder */}
          </div>
        </div>
        <div>
          <h3 className="font-headline text-lg font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link href="/services" className="hover:underline">Treatments</Link></li>
            <li><Link href="/team" className="hover:underline">Our Doctors</Link></li>
            <li><Link href="/book" className="hover:underline">Appointment</Link></li>
            <li><Link href="/tips" className="hover:underline">Health Tips</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-headline text-lg font-bold mb-4">Contact Info</h3>
          <ul className="space-y-3">
            <li className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-accent" />
              <span>Address of the clinic</span>
            </li>
            <li className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-accent" />
              <span>+91 1234567890</span>
            </li>
            <li className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-accent" />
              <span>hello@veridiandental.com</span>
            </li>
            <li className="flex items-start space-x-2">
              <Clock className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <p>Mon-Fri: 8:00 AM - 6:00 PM</p>
                <p>Sat: 9:00 AM - 2:00 PM</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-primary-foreground/20 text-center text-sm">
        <p className="mb-2">&copy; {new Date().getFullYear()} Veridian Dental Clinic. All rights reserved.</p>
        <p>Created By <a target="_blank" href="https://himanshu-kashyap-portfolio.vercel.app"><em className="font-extrabold ">Himanshu Kashyap</em></a></p>
      </div>
    </footer>
  );
}
