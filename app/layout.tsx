import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "LazorKey",
  description:
    "A modern Solana wallet featuring passkey authentication and gasless transactions.",
  icons: {
    icon: "/favicon.ico",
    apple: "/images/logo.svg",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "LazorKey",
    description:
      "Create a Solana wallet with biometrics. No seed phrases, no gas fees.",
    images: ["/images/logo.svg"],
  },
  twitter: {
    card: "summary",
    title: "LazorKey",
    description:
      "Create a Solana wallet with biometrics. No seed phrases, no gas fees.",
    images: ["/images/logo.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
