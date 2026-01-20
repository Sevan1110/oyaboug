"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-6 max-w-md px-4">
                <div className="relative">
                    <h1 className="text-9xl font-bold text-primary/20">404</h1>
                    <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-semibold text-foreground">
                        Page non trouvée
                    </p>
                </div>

                <p className="text-muted-foreground">
                    Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
                </p>

                <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour
                    </Button>
                    <Button onClick={() => router.push("/")}>
                        <Home className="mr-2 h-4 w-4" />
                        Accueil
                    </Button>
                </div>
            </div>
        </div>
    );
}
