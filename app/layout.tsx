import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body"
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-headline"
});

export const metadata: Metadata = {
  title: "Convertly - Precision File Conversion",
  description: "Fast, secure browser-based file conversion"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.variable} ${manrope.variable}`}>{children}</body>
    </html>
  );
}
