import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "履歴書・職務経歴書",
  description: "履歴書・職務経歴書",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <nav className="no-print bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-6">
            <a href="/" className="text-gray-700 hover:text-gray-900 font-medium">
              履歴書
            </a>
            <a href="/career" className="text-gray-700 hover:text-gray-900 font-medium">
              職務経歴書
            </a>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
