"use client";

import { createContext, useContext } from "react";

const Ctx = createContext({ projectId: "", siteId: "" });

export function SiteFormProvider({
  projectId,
  siteId,
  children,
}: {
  projectId: string;
  siteId: string;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={{ projectId, siteId }}>{children}</Ctx.Provider>;
}

export function useSiteForm() {
  return useContext(Ctx);
}
