"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Stethoscope, Menu, X, LayoutDashboard, User } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Our Team", href: "/team" },
  { name: "Dental Tips", href: "/tips" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const session = useSession();
  const [clientType, setClientType] = useState("Guest");
  useEffect(() => {
    if (session.data?.user.role === "Admin") {
      setClientType("Admin")
    }
    if (session.data?.user.role === "User") {
      setClientType("User")
    }
  }, [session])

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Stethoscope className="h-8 w-8 text-primary" />
          <span className="font-headline text-xl font-bold tracking-tight text-primary">
            Veridian Dental
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.name}
            </Link>
          ))}
          {
            clientType === "Admin" ? (
              <Link
                href="/admin"
                className={cn(
                  "text-sm font-medium flex items-center gap-1 transition-colors hover:text-primary",
                  pathname === "/admin" ? "text-primary" : "text-muted-foreground"
                )}
              >
                <LayoutDashboard className="w-4 h-4" /> Admin
              </Link>
            ) : clientType === "User" ? (
              <Link
                href="/myAppointments"
                className={cn(
                  "text-sm font-medium flex items-center gap-1 transition-colors hover:text-primary",
                  pathname === "/myAppointments" ? "text-primary" : "text-muted-foreground"
                )}
              >
                <LayoutDashboard className="w-4 h-4" /> myAppointment
              </Link>
            ) : ""
          }
          <Button asChild className="bg-accent hover:bg-accent/90">
            <Link href="/book">Book Appointment</Link>
          </Button>
          {session.data ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <div className="flex flex-col">
                    <span className="font-medium">{session.data.user.username}</span>
                    <span className="text-sm text-muted-foreground">{session.data.user.email}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {signOut({ redirect: false });setClientType("Guest")}}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
          )}

        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-primary"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t bg-background p-4 flex flex-col space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.name}
            </Link>
          ))}
          {
            clientType === "Admin" ? (
              <Link
                href="/admin"
                className={cn(
                  "text-sm font-medium flex items-center gap-1 transition-colors hover:text-primary",
                  pathname === "/admin" ? "text-primary" : "text-muted-foreground"
                )}
              >
                <LayoutDashboard className="w-4 h-4" /> Admin
              </Link>
            ) : clientType === "User" ? (
              <Link
                href="/myAppointments"
                className={cn(
                  "text-sm font-medium flex items-center gap-1 transition-colors hover:text-primary",
                  pathname === "/myAppointments" ? "text-primary" : "text-muted-foreground"
                )}
              >
                <LayoutDashboard className="w-4 h-4" /> myAppointment
              </Link>
            ) : ""
          }
          <Button asChild className="bg-accent hover:bg-accent/90 w-full" onClick={() => setIsOpen(false)}>
            <Link href="/book">Book Appointment</Link>
          </Button>
          {session.data ? (
            <div className="flex flex-col space-y-2 pt-4 border-t">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{session.data.user.username}</span>
                  <span className="text-xs text-muted-foreground">{session.data.user.email}</span>
                </div>
              </div>
              <Button variant="outline" onClick={() => {signOut({ redirect: false });setClientType("Guest")}} className="w-full">
                Logout
              </Button>
            </div>
          ) : (
            <Button asChild variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}