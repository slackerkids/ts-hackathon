import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TMAProvider } from "./providers";

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
          <main className="min-h-screen pb-20">{children}</main>
          <BottomNav />
        </TMAProvider>
      </body>
    </html>
  );
}

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-secondary-bg border-t border-hint/20">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        <NavItem label="Home" icon="🏠" active />
        <NavItem label="Clubs" icon="👥" />
        <NavItem label="Events" icon="🏆" />
        <NavItem label="Profile" icon="👤" />
      </div>
    </nav>
  );
}

function NavItem({
  label,
  icon,
  active = false,
}: {
  label: string;
  icon: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
        active ? "text-link" : "text-hint"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
