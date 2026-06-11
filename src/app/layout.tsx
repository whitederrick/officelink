import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { I18nProvider } from "@/components/I18nProvider";
import { SWRegister } from "@/components/SWRegister";

export const metadata: Metadata = {
  title: "OFFICELINK — 1인가구 오피스텔 라이프",
  description: "건물 리뷰 · 임대료 관리 · 이웃 커뮤니티 · 외국인 단기임대",
  applicationName: "OFFICELINK",
  keywords: ["오피스텔", "1인가구", "리뷰", "단기임대", "외국인", "officetel", "short-term"],
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
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "OFFICELINK",
    "msapplication-TileColor": "#2a3548",
    "msapplication-config": "/manifest.webmanifest",
    "theme-color": "#2a3548",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#2a3548",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#2a3548" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="OFFICELINK" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="apple-touch-startup-image" href="/icon-512.png" />
      </head>
      <body className="bg-concrete-50 text-concrete-900">
        <I18nProvider>
          <AppShell>
            {children}
          </AppShell>
        </I18nProvider>
        <SWRegister />

      </body>
    </html>
  );
}
