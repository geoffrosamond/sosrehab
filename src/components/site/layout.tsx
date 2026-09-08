import type { ReactNode } from "react";
import { Footer } from "./footer";
import { Header } from "./header";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-ink">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
