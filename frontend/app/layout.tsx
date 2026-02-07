import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TMAProvider } from "./providers";
import { AuthProvider } from "@/lib/auth";
import { BottomNav } from "./components/bottom-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TS Community OS",
  description: "Telegram Mini App for Tomorrow School community",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TMAProvider>
          <AuthProvider>
            <main className="min-h-screen pb-20">{children}</main>
            <BottomNav />
          </AuthProvider>
        </TMAProvider>
      </body>
    </html>
  );
}
