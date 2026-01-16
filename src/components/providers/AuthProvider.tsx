
"use client";

import { AuthProvider as ContextAuthProvider } from "@/contexts/AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return <ContextAuthProvider>{children}</ContextAuthProvider>;
}
