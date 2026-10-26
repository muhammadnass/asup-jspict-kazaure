import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ASUP JSPICT Kazaure Chapter — Official Website",
  description: "Official website of the Academic Staff Union of Polytechnics (ASUP) — Jigawa State Polytechnic ICT Kazaure Chapter",
  icons: {
    icon: "/asup-logo.png",
    apple: "/asup-logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif", margin: 0, backgroundColor: "#f8fafc" }}>
        <Navbar />
        <main style={{ minHeight: "calc(100vh - 64px)" }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
