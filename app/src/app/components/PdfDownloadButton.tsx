"use client";

import { useState, useCallback } from "react";

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const PASSWORD_KEY = "site_password";

async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
}

async function decryptPdf(
  encryptedData: ArrayBuffer,
  password: string,
): Promise<Blob> {
  const data = new Uint8Array(encryptedData);
  const salt = data.slice(0, SALT_LENGTH);
  const iv = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = data.slice(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + TAG_LENGTH,
  );
  const ciphertext = data.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  // Web Crypto AES-GCM expects ciphertext + tag concatenated
  const ciphertextWithTag = new Uint8Array(ciphertext.length + tag.length);
  ciphertextWithTag.set(ciphertext);
  ciphertextWithTag.set(tag, ciphertext.length);

  const key = await deriveKey(password, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertextWithTag,
  );

  return new Blob([decrypted], { type: "application/pdf" });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function PdfDownloadButton({
  encPath,
  fallbackPath,
  downloadName,
  label,
}: {
  encPath: string;
  fallbackPath: string;
  downloadName: string;
  label: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      // 暗号化ファイルを試行
      const encResponse = await fetch(encPath);
      if (encResponse.ok) {
        const password = sessionStorage.getItem(PASSWORD_KEY);
        if (!password) {
          setError("PDFの復号に失敗しました。再ログインしてください。");
          return;
        }
        const encryptedData = await encResponse.arrayBuffer();
        const blob = await decryptPdf(encryptedData, password);
        triggerDownload(blob, downloadName);
        return;
      }

      // 暗号化ファイルが無い場合、非暗号化PDFを試行（ローカル開発用）
      const pdfResponse = await fetch(fallbackPath);
      if (pdfResponse.ok) {
        const blob = await pdfResponse.blob();
        triggerDownload(blob, downloadName);
        return;
      }

      setError("PDFが見つかりませんでした。");
    } catch {
      setError("PDFのダウンロードに失敗しました。");
    } finally {
      setIsLoading(false);
    }
  }, [encPath, fallbackPath, downloadName]);

  return (
    <div className="relative">
      <button
        onClick={handleDownload}
        disabled={isLoading}
        className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {isLoading ? "..." : label}
      </button>
      {error && (
        <p className="absolute top-full right-0 mt-1 text-xs text-red-600 bg-white border border-red-200 rounded px-2 py-1 whitespace-nowrap shadow-sm">
          {error}
        </p>
      )}
    </div>
  );
}
