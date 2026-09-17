"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Card, Btn, Input } from "@/components/ui";
import { ThemeToggle } from "@/components/theme";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const res = await authClient.signUp.email({ email, password, name });
      if (res.error) setError(res.error.message ?? "Sign up failed");
      else router.push("/dashboard");
    } catch {
      setError("Sign up needs MONGODB_URI configured. Or continue in demo mode.");
    } finally { setBusy(false); }
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-6">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <Card>
        <h1 className="text-xl font-bold">Create your LifeOS account</h1>
        <p className="mt-1 text-sm text-zinc-500">Email + password, or Google from the login page.</p>
        <form onSubmit={onSubmit} className="mt-4 space-y-2">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password (8+ chars)" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Btn type="submit" disabled={busy}>{busy ? "Creating…" : "Create account"}</Btn>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-500">Have an account? <Link href="/login" className="font-medium text-zinc-900 dark:text-white">Sign in</Link></p>
      </Card>
    </div>
  );
}
