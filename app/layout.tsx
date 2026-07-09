import type { Metadata } from "next";
import { Spectral, Inter } from "next/font/google";
import "./globals.css";

const spectral = Spectral({
  subsets: ["latin"],
  variable: "--font-spectral",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "California HR Risk Audit | Be the Change HR",
  description:
    "Get an instant A to F HR compliance risk grade for your California business, then book a free 30-minute HR risk assessment with a Be the Change HR Pro.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spectral.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-surface font-sans text-btc-gray antialiased">
        {children}
      </body>
    </html>
  );
}
