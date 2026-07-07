import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { I18nProvider } from "@/components/I18nProvider";
import { SWRegister } from "@/components/SWRegister";

export const metadata: Metadata = {
  title: "OFFICELINK | 건물과 동네를 한눈에",
  description: "건물 리뷰, 생활 서비스, 이웃 커뮤니티, 단기 거주 정보를 생활권 기준으로 연결합니다.",
  applicationName: "OFFICELINK",
  keywords: ["오피스텔", "건물 리뷰", "동네 커뮤니티", "단기 거주", "생활 서비스", "officetel"],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OFFICELINK",
    startupImage: ["/icon-512.png"],
  },
  formatDetection: { telephone: false, address: false, email: false },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "OFFICELINK",
    "msapplication-TileColor": "#0f172a",
    "msapplication-config": "/manifest.webmanifest",
    "theme-color": "#0f172a",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0f172a",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="OFFICELINK" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="apple-touch-startup-image" href="/icon-512.png" />
      </head>
      <body>
        <I18nProvider>
          <AppShell>{children}</AppShell>
        </I18nProvider>
        <SWRegister />
      </body>
    </html>
  );
}
