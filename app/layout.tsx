import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verdict+ | Multi-Scale Critical Thinking Engine",
  description:
    "LLM-powered agentic orchestration for dual-scale evaluation of content integrity and source motivation. Grounded in Waller and validated source-credibility research.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
