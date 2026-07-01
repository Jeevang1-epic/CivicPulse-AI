import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PageShell } from "@/components/PageShell";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://civicpulse-ai-two.vercel.app"),
  title: {
    default: "CivicPulse AI",
    template: "%s | CivicPulse AI"
  },
  description:
    "A hyperlocal civic issue reporting platform with server-side AI triage, public issue tracking, and a demo operations dashboard.",
  openGraph: {
    title: "CivicPulse AI",
    description:
      "Report local civic issues, triage them into structured severity and action data, and track them through a public board and dashboard.",
    url: "https://civicpulse-ai-two.vercel.app",
    siteName: "CivicPulse AI",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "CivicPulse AI",
    description:
      "Hyperlocal civic issue reporting with server-side AI triage, public tracking, and a demo operations dashboard."
  }
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
