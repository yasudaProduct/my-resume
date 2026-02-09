import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import AuthGate from "./components/AuthGate";
import PdfDownloadButton from "./components/PdfDownloadButton";

export const metadata: Metadata = {
  title: "履歴書・職務経歴書",
  description: "履歴書・職務経歴書",
};

// GitHub Pages用のベースパス
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// パスワード保護用のSHA-256ハッシュ
const passwordHash = process.env.NEXT_PUBLIC_SITE_PASSWORD_HASH || "";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <AuthGate passwordHash={passwordHash}>
          <nav className="no-print bg-white border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex gap-6">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  履歴書
                </Link>
                <Link
                  href="/career"
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  職務経歴書
                </Link>
              </div>
              <div className="flex gap-3 text-sm">
                <PdfDownloadButton
                  encPath={`${basePath}/resume.pdf.enc`}
                  fallbackPath={`${basePath}/履歴書.pdf`}
                  downloadName="履歴書.pdf"
                  label="履歴書PDF"
                />
                <PdfDownloadButton
                  encPath={`${basePath}/career.pdf.enc`}
                  fallbackPath={`${basePath}/職務経歴書.pdf`}
                  downloadName="職務経歴書.pdf"
                  label="職務経歴書PDF"
                />
              </div>
            </div>
          </nav>
          <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
        </AuthGate>
      </body>
    </html>
  );
}
