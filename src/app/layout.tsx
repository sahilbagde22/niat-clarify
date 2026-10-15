import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NIAT Parent Decision & Career ROI Engine | NxtWave NIAT",
  description: "AI-native Career ROI, Campus Integrity & Break-Even Evaluation Engine for post-NAT qualified 12th-grade parents and students.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#070d1e] text-slate-100 selection:bg-[#3a86ff] selection:text-white">
        {children}
      </body>
    </html>
  );
}
