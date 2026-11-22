"use client";

import { createContext, useContext } from "react";
import type { OfficeContact } from "@/lib/forms/fields";

const OfficeContactContext = createContext<OfficeContact>({});

/**
 * The office phone number and email address from the site settings, read
 * with the page. A form whose entry does not reach the office offers them,
 * even when the request itself failed.
 */
export function OfficeContactProvider({
  children,
  contact,
}: {
  children: React.ReactNode;
  contact: OfficeContact;
}) {
  return <OfficeContactContext value={contact}>{children}</OfficeContactContext>;
}

export function useOfficeContact() {
  return useContext(OfficeContactContext);
}
