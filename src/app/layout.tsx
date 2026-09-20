import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "VIERA — Listening & Reading Test", template: "%s · VIERA" },
  description:
    "Vocational Institutional English Readiness Assessment — Listening and Reading Comprehension Module",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
