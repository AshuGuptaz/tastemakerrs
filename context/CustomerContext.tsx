"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AddressDTO, OccasionDTO } from "@/lib/account-serialize";

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: AddressDTO[];
  occasions: OccasionDTO[];
};

type CustomerCtx = {
  customer: Customer | null;
  loading: boolean;
  signedIn: boolean;
  /** Re-fetch the profile (call after sign-in or any account mutation). */
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<CustomerCtx | null>(null);

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/account/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCustomer(data.customer ?? null);
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/account/logout", { method: "POST" });
    } catch {
      /* clearing client state below is what matters for UX */
    }
    setCustomer(null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<CustomerCtx>(
    () => ({ customer, loading, signedIn: !!customer, refresh, logout }),
    [customer, loading, refresh, logout]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCustomer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCustomer must be used inside <CustomerProvider>");
  return ctx;
}
