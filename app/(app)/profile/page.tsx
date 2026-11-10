"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    realName: "", nickname: "", phone: "", birthday: "",
    slackHandle: "", discordHandle: "", notes: "",
    newPassword: "", confirmPassword: "",
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/profile/me").then((r) => r.json()).then((d) => {
      if (!d.error) {
        const h = d.handles as Record<string, string> ?? {};
        setForm((f) => ({
          ...f,
          realName: d.realName ?? "",
          nickname: d.nickname ?? "",
          phone: d.phone ?? "",
          birthday: d.birthday ? d.birthday.substring(0, 10) : "",
          slackHandle: h.slack ?? "",
          discordHandle: h.discord ?? "",
          notes: d.notes ?? "",
        }));
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.newPassword && !form.confirmPassword) {
      setError("Please confirm your new password");
      return;
    }
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);

    const handles: Record<string, string> = {};
    if (form.slackHandle) handles.slack = form.slackHandle;
    if (form.discordHandle) handles.discord = form.discordHandle;

    const body: Record<string, unknown> = {
      realName: form.realName,
      nickname: form.nickname,
      phone: form.phone,
      birthday: form.birthday || null,
      handles,
      notes: form.notes,
    };
    if (form.newPassword) body.password = form.newPassword;

    const res = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to save");
    } else {
      setSaved(true);
      setTimeout(() => router.push("/members"), 800);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Real Name</label>
                <Input value={form.realName} onChange={(e) => setForm((f) => ({ ...f, realName: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Nickname</label>
                <Input value={form.nickname} onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))} placeholder="Optional" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Phone</label>
                <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="Optional" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Birthday</label>
                <Input type="date" value={form.birthday} onChange={(e) => setForm((f) => ({ ...f, birthday: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Slack Handle</label>
                <Input value={form.slackHandle} onChange={(e) => setForm((f) => ({ ...f, slackHandle: e.target.value }))} placeholder="@username" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Discord Handle</label>
                <Input value={form.discordHandle} onChange={(e) => setForm((f) => ({ ...f, discordHandle: e.target.value }))} placeholder="username#0000" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Notes</label>
              <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Optional notes about you" rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">New Password</label>
              <Input type="password" value={form.newPassword} onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))} placeholder="Leave blank to keep current" minLength={8} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Confirm Password</label>
              <Input type="password" value={form.confirmPassword} onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} placeholder="Repeat new password" />
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
