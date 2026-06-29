import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PageShell } from "@/components/PageShell";

import "./globals.css";

export const metadata: Metadata = {
  title: "CivicPulse AI",
  description: "Hyperlocal civic issue reporting and prioritization demo for community action."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PageShell>{children}</PageShell>
      </body>
    </html>
  );
}
