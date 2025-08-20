import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import { NextAuthProvider } from "./providers";
import { ToastContainer } from "@/components/Toast";
import "./globals.css";

const prompt = Prompt({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin", "thai"],
  variable: "--font-prompt",
});

export const metadata: Metadata = {
  title: "ระบบติดตามอุปกรณ์สำนักงาน",
  description: "ระบบจัดการและติดตามสินทรัพย์อุปกรณ์สำนักงาน",
  icons: {
    icon: [
      { url: "/fav.png", type: "image/png" },
      { url: "/fav.png", sizes: "any" },
    ],
    shortcut: "/fav.png",
    apple: "/fav.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/fav.png" type="image/png" />
        <link rel="icon" href="/fav.png" sizes="any" />
        <link rel="shortcut icon" href="/fav.png" />
        <link rel="apple-touch-icon" href="/fav.png" />
      </head>
      <body
        className={`${prompt.variable} font-prompt min-h-screen bg-background antialiased`}
        suppressHydrationWarning
      >
        <NextAuthProvider>
          {children}
          <ToastContainer />
        </NextAuthProvider>
      </body>
    </html>
  );
}
