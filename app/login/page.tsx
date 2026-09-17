"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Card, Btn, Input } from "@/components/ui";
import { ThemeToggle } from "@/components/theme";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const res = await authClient.signIn.email({ email, password });
      if (res.error) setError(res.error.message ?? "Sign in failed");
      else router.push("/dashboard");
    } catch (err) {
      setError("Sign in failed. In demo mode (no MONGODB_URI) just use Open app.");
    } finally { setBusy(false); }
  }

  async function google() {
    try {
      await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
    } catch {
      setError("Google login needs GOOGLE_CLIENT_ID/SECRET + MongoDB configured.");
    }
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-6">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <Card>
        <h1 className="text-xl font-bold">Welcome back to LifeOS</h1>
        <p className="mt-1 text-sm text-zinc-500">Sign in with email or Google.</p>
        <form onSubmit={onSubmit} className="mt-4 space-y-2">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Btn type="submit" disabled={busy} >{busy ? "Signing in…" : "Sign in"}</Btn>
        </form>
        <button onClick={google} className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
          Continue with Google
        </button>
        <p className="mt-4 text-center text-sm text-zinc-500">No account? <Link href="/signup" className="font-medium text-zinc-900 dark:text-white">Sign up</Link> · <Link href="/dashboard" className="font-medium">Demo mode →</Link></p>
      </Card>
    </div>
  );
}
