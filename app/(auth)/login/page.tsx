"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Login failed");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-center">Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <Input name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <Input name="password" type="password" placeholder="••••••••" required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>
        <div className="mt-4 flex items-center justify-between text-sm">
          <Link href="/forgot-password" className="text-indigo-600 hover:text-indigo-800 hover:underline">
            Forgot password?
          </Link>
          <Link href="/register" className="text-indigo-600 hover:text-indigo-800 hover:underline">
            Create account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
