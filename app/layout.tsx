
import React from 'react';
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthRedirect } from "@/components/auth/AuthRedirect";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Oyaboug - Anti-gaspillage alimentaire",
    description: "Récupérez des invendus de qualité à petit prix près de chez vous.",
};

import QueryProvider from "@/providers/QueryProvider";

// ... existing imports

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <body className={inter.className}>
                <QueryProvider>
                    <AuthProvider>
                        <AuthRedirect />
                        <TooltipProvider>
                            {children}
                            <Toaster />
                            <Sonner />
                        </TooltipProvider>
                    </AuthProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
