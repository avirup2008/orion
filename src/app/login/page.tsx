"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });

        const data = await res.json();

        if (data.ok) {
          router.push("/");
          router.refresh();
        } else {
          setError(data.error || "Authentication failed");
        }
      } catch {
        setError("Connection error");
      } finally {
        setLoading(false);
      }
    },
    [password, router]
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="w-full max-w-[380px] mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-[10px] bg-[var(--accent)] flex items-center justify-center font-bold text-lg text-white">
              O
            </div>
            <div>
              <div className="text-[22px] font-bold text-[var(--text)] tracking-[0.5px]">
                Orion<span className="text-[var(--accent2)]">.</span>
              </div>
              <div className="font-mono text-[9px] text-[var(--text4)] uppercase tracking-[2px]">
                by EyeOn
              </div>
            </div>
          </div>
          <p className="text-sm text-[var(--text3)]">
            Anaplan Proposal Engine
          </p>
        </div>

        {/* Login card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-lg)] p-7 shadow-[var(--sh-md)]">
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="password"
              className="block font-mono text-[9px] uppercase tracking-[1.5px] text-[var(--text4)] mb-2"
            >
              Access Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              className="w-full px-4 py-3 rounded-lg bg-[var(--surface2)] border border-[var(--border2)] text-[var(--text)] text-sm placeholder:text-[var(--text4)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all"
            />

            {error && (
              <div className="mt-3 text-xs text-[var(--neg)] font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full mt-5 py-3 rounded-lg bg-[var(--accent)] text-white text-sm font-semibold transition-all hover:bg-[var(--accent2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Authenticating..." : "Enter Orion"}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-[var(--text4)] mt-6 font-mono">
          CONFIDENTIAL &mdash; EyeOn B.V.
        </p>
      </div>
    </div>
  );
}
