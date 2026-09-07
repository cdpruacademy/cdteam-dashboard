import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppNav } from "@/components/app-nav";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Prudential Thailand - New Product Timeline & Knowledge Base",
  description: "Internal dashboard for curriculum development team, timeline management, and knowledge search",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-screen bg-[#F8FAFC] text-[#2D2D2D] flex flex-col">
        <AppNav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
