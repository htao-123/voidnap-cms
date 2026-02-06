import type { Metadata } from "next";
import { Manrope, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import { DataProvider } from "@/lib/data-context";
import { Layout } from "@/components/Layout";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AlexDev | Portfolio",
  description: "AI全栈工程师个人作品集",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <body className={`${manrope.variable} ${outfit.variable} antialiased`}>
        <ThemeProvider defaultTheme="dark">
          <DataProvider>
            <Layout>{children}</Layout>
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
