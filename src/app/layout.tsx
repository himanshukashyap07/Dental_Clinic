import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import AuthProvider from '@/context/AuthProvider';

export const metadata: Metadata = {
  title: 'Veridian Dental | Expert Care for Your Smile',
  description: 'Veridian Dental offers comprehensive dental treatments, preventative care, and specialized services with a patient-first approach.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <AuthProvider>
        <body className="font-body antialiased min-h-screen flex flex-col bg-background">
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <Toaster />
        </body>
      </AuthProvider>
    </html>
  );
}
