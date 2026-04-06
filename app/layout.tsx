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
  metadataBase: new URL("https://convert-rust-phi.vercel.app"),

  title: {
    default: "Convertly - Free Image Converter, Compressor & Resizer",
    template: "%s | Convertly"
  },

  description:
    "Convert, compress and resize images online for free. JPG to PNG, WebP converter and more.",

  robots: {
    index: true,
    follow: true
  },

  openGraph: {
    title: "Convertly - Free Image Tools",
    description:
      "Convert, compress and resize images online instantly in your browser.",
    url: "https://convert-rust-phi.vercel.app",
    siteName: "Convertly",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.variable} ${manrope.variable}`}>
        {children}
      </body>
    </html>
  );
}
