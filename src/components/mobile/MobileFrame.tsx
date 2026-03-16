import { ReactNode } from "react";

export function MobileFrame({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-white dark:bg-slate-900">{children}</div>;
}

