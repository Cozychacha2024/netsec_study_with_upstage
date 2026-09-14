import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "보안노트 | 나만의 네트워크 보안 용어집",
  description: "용어 복습, 별표 노트, 암기 게임으로 공부하는 나만의 네트워크 보안 용어집.",
  applicationName: "보안노트",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "보안노트", statusBarStyle: "default" },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#101d37",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
