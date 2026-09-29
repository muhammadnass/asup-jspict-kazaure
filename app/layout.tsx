import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ASUP Jigawa ICT Kazaure",
  description: "Official website of ASUP — Jigawa State Polytechnic ICT Kazaure Chapter",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, -apple-system, sans-serif", margin: 0 }}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}