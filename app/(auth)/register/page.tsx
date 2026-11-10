"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("MEMBER");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);

    if (form.get("password") !== form.get("confirmPassword")) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
        realName: form.get("realName"),
        nickname: form.get("nickname"),
        role,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Registration failed");
      setLoading(false);
    } else {
      router.push("/login?registered=1");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Real Name</label>
            <Input name="realName" placeholder="Full name" required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Nickname</label>
            <Input name="nickname" placeholder="Display name (optional)" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <Input name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <Input name="password" type="password" placeholder="Minimum 8 characters" required minLength={8} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Confirm Password</label>
            <Input name="confirmPassword" type="password" placeholder="Re-enter password" required minLength={8} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Role</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">Member</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="text-indigo-600 hover:text-indigo-800 hover:underline">
            Already have an account? Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
