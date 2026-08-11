import type { Metadata } from "next";
import { Inter, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

// "vietnamese" subset is required for correct diacritics (ạ ệ ờ ữ ...) —
// without it the browser silently falls back to a system font for those
// glyphs, breaking the design's typography.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quỳnh Nail ART | Nail đẹp theo cách riêng của bạn",
  description:
    "Quỳnh Nail ART — sơn gel cao cấp, nail art thiết kế và chăm sóc móng trong không gian hiện đại, thư thái.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${inter.variable} ${playfairDisplay.variable} ${cormorantGaramond.variable} antialiased`}
      >
        <div className="mesh-bg" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        {children}
      </body>
    </html>
  );
}
