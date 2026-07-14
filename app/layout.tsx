import type { Metadata } from "next";
import { Newsreader, Hanken_Grotesk } from "next/font/google";
import { MetaPixel } from "@/components/MetaPixel";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  title: "California HR Risk Audit | be the change HR",
  description:
    "Get an instant A to F HR compliance risk grade for your California business, then book a free 30-minute HR risk assessment with be the change HR.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${hankenGrotesk.variable}`}
    >
      <body className="min-h-screen bg-surface font-sans text-btc-gray antialiased">
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
