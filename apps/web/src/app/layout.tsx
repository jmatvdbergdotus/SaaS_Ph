import type { Metadata, Viewport } from "next";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Sari-SaaS Hub",
  description: "Unified MSME Commerce Operating System",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageSwitcher />
        {children}
      </body>
    </html>
  );
}
