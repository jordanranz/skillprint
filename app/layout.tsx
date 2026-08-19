import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Skillprint", template: "%s — Skillprint" },
  description: "Discover agent skills by ecosystem reach and inspected capability.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
