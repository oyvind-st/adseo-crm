import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Adseo CRM",
  description: "Kundeoppfølging & Salg",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body>
        <Sidebar />
        <Header />
        <div className="main-content" style={{ paddingTop: 56 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
