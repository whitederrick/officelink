import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: {
    default: "OFFICELINK · 1인가구 오피스텔 라이프 플랫폼",
    template: "%s · OFFICELINK",
  },
  description: "오피스텔 리뷰, 임대인/관리소 평판, 생활 편의 서비스를 한 곳에서. 1인가구를 위한 스마트한 동네 라이프.",
  keywords: ["오피스텔", "리뷰", "1인가구", "임대", "관리소", "편의서비스", "동네"],
  authors: [{ name: "OFFICELINK Team" }],
  openGraph: {
    type: "website",
    title: "OFFICELINK · 1인가구 오피스텔 라이프 플랫폼",
    description: "오피스텔 리뷰, 임대인/관리소 평판, 생활 편의 서비스",
    siteName: "OFFICELINK",
  },
  manifest: "/manifest.json",
  themeColor: "#f59e0b",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OFFICELINK",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <AppShell>{children}</AppShell>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
