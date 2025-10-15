"use client";

import { ReactNode, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    const unsubscribe = authClient.subscribe(() => {});
    return unsubscribe;
  }, []);

  return (
    <div>
      {children}
    </div>
  );
}