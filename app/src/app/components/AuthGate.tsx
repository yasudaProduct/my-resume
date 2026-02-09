"use client";

import { useState, useSyncExternalStore, useCallback, type FormEvent } from "react";

async function sha256(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const SESSION_KEY = "authenticated";

// Simple pub/sub to notify useSyncExternalStore when auth state changes
const listeners = new Set<() => void>();

function subscribeAuth(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifyAuthChange() {
  listeners.forEach((l) => l());
}

export default function AuthGate({
  children,
  passwordHash,
}: {
  children: React.ReactNode;
  passwordHash: string;
}) {
  const isAuthenticated = useSyncExternalStore(
    subscribeAuth,
    () => {
      if (!passwordHash) return true;
      if (window.location.pathname.includes("/print/")) return true;
      return sessionStorage.getItem(SESSION_KEY) === passwordHash;
    },
    () => !passwordHash,
  );

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");

      const hash = await sha256(password);

      if (hash === passwordHash) {
        sessionStorage.setItem(SESSION_KEY, passwordHash);
        notifyAuthChange();
      } else {
        setError("パスワードが正しくありません");
        setPassword("");
      }
    },
    [password, passwordHash],
  );

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-sm w-full mx-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-10 w-10 text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
            <h1 className="text-xl font-bold text-gray-800">
              パスワードを入力してください
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              このページは保護されています
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <button
              type="submit"
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              認証
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
