"use client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { Pencil, Info } from "lucide-react";
import Link from "next/link";

interface Member {
  id: string;
  email: string;
  realName: string;
  nickname: string | null;
  birthday: string | null;
  role: string;
  createdAt: string;
}

interface Contact {
  email: string;
  realName: string | null;
  nickname: string | null;
  phone: string | null;
  birthday: string | null;
  handles: Record<string, string> | null;
  notes: string | null;
}

function formatBirthday(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const avatarColors = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
];

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [myId, setMyId] = useState("");
  const [myRole, setMyRole] = useState("");
  const [contactCard, setContactCard] = useState<Contact | null | "loading">(null);
  const [contactEmail, setContactEmail] = useState("");
  const [editingContact, setEditingContact] = useState(false);
  const [editForm, setEditForm] = useState({ realName: "", nickname: "", phone: "", birthday: "", slack: "", discord: "", notes: "" });
  const [contactSaving, setContactSaving] = useState(false);

  useEffect(() => {
    fetch("/api/members").then((r) => r.json()).then((d) => setMembers(Array.isArray(d) ? d : []));
    fetch("/api/profile/me").then((r) => r.json()).then((d) => { setMyId(d.id ?? ""); setMyRole(d.role ?? ""); });
  }, []);

  async function lookupContact(email: string) {
    setContactEmail(email);
    setContactCard("loading");
    setEditingContact(false);
    const res = await fetch(`/api/contacts?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    setContactCard(data ?? null);
    if (data) {
      setEditForm({
        realName: data.realName ?? "",
        nickname: data.nickname ?? "",
        phone: data.phone ?? "",
        birthday: data.birthday ? data.birthday.substring(0, 10) : "",
        slack: data.handles?.slack ?? "",
        discord: data.handles?.discord ?? "",
        notes: data.notes ?? "",
      });
    } else {
      setEditForm({ realName: "", nickname: "", phone: "", birthday: "", slack: "", discord: "", notes: "" });
    }
  }

  async function saveContact() {
    setContactSaving(true);
    const handles: Record<string, string> = {};
    if (editForm.slack) handles.slack = editForm.slack;
    if (editForm.discord) handles.discord = editForm.discord;
    const res = await fetch("/api/contacts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: contactEmail,
        realName: editForm.realName || null,
        nickname: editForm.nickname || null,
        phone: editForm.phone || null,
        birthday: editForm.birthday || null,
        handles: Object.keys(handles).length ? handles : null,
        notes: editForm.notes || null,
      }),
    });
    const data = await res.json();
    setContactSaving(false);
    if (res.ok) { setContactCard(data); setEditingContact(false); }
  }

  const isAdmin = myRole === "ADMIN";
  const contactData = contactCard !== "loading" ? contactCard : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Members</h1>
          <p className="text-sm text-slate-500 mt-0.5">{members.length} active member{members.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/profile"
          className="text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors"
        >
          Edit my profile
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Name</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Nickname</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Email</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Birthday</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Role</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">No members found.</td></tr>
            )}
            {members.map((m, i) => {
              const isMe = m.id === myId;
              const color = avatarColors[i % avatarColors.length];
              return (
                <tr key={m.id} className={`transition-colors ${isMe ? "bg-indigo-50/40" : "hover:bg-slate-50/60"}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 font-semibold text-xs ${color}`}>
                        {initials(m.realName)}
                      </div>
                      <div className="leading-tight">
                        <span className="font-medium text-slate-800">{m.realName}</span>
                        {isMe && <span className="ml-1.5 text-xs text-indigo-500 font-medium">you</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{m.nickname ?? <span className="text-slate-300">—</span>}</td>
                  <td className="px-5 py-4">
                    <button
                      className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm"
                      onClick={() => lookupContact(m.email)}
                    >
                      {m.email}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{formatBirthday(m.birthday) ?? <span className="text-slate-300">—</span>}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      m.role === "ADMIN" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {m.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{formatDate(m.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Contact dialog */}
      <Dialog open={contactCard !== null} onOpenChange={(o) => { if (!o) { setContactCard(null); setEditingContact(false); } }}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Contact Info</DialogTitle>
              {isAdmin && !editingContact && (
                <button onClick={() => setEditingContact(true)} className="text-slate-400 hover:text-slate-700 p-1" title="Edit">
                  <Pencil className="h-4 w-4" />
                </button>
              )}
            </div>
          </DialogHeader>

          {contactCard === "loading" ? (
            <DialogBody><p className="text-sm text-slate-400">Loading…</p></DialogBody>
          ) : editingContact ? (
            <>
              <DialogBody className="space-y-3">
                <p className="text-xs text-slate-500">Email: <span className="font-medium text-slate-700">{contactEmail}</span></p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Real Name</label>
                    <Input value={editForm.realName} onChange={(e) => setEditForm((f) => ({ ...f, realName: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Nickname</label>
                    <Input value={editForm.nickname} onChange={(e) => setEditForm((f) => ({ ...f, nickname: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Phone</label>
                    <Input value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Birthday</label>
                    <Input type="date" value={editForm.birthday} onChange={(e) => setEditForm((f) => ({ ...f, birthday: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Slack</label>
                    <Input value={editForm.slack} onChange={(e) => setEditForm((f) => ({ ...f, slack: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Discord</label>
                    <Input value={editForm.discord} onChange={(e) => setEditForm((f) => ({ ...f, discord: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Notes</label>
                  <Textarea value={editForm.notes} onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))} rows={2} />
                </div>
              </DialogBody>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingContact(false)}>Cancel</Button>
                <Button disabled={contactSaving} onClick={saveContact}>{contactSaving ? "Saving…" : "Save"}</Button>
              </DialogFooter>
            </>
          ) : contactData ? (
            <>
              <DialogBody className="space-y-2 text-sm text-slate-700">
                <div><span className="font-medium">Email:</span> {contactData.email}</div>
                {contactData.realName && <div><span className="font-medium">Name:</span> {contactData.realName}</div>}
                {contactData.nickname && <div><span className="font-medium">Nickname:</span> {contactData.nickname}</div>}
                {contactData.phone && <div><span className="font-medium">Phone:</span> {contactData.phone}</div>}
                {contactData.birthday && <div><span className="font-medium">Birthday:</span> {formatBirthday(contactData.birthday)}</div>}
                {contactData.handles && Object.keys(contactData.handles).length > 0 && (
                  <div>
                    <span className="font-medium">Handles:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Object.entries(contactData.handles).map(([k, v]) => (
                        <span key={k} className="text-xs bg-slate-100 rounded px-1.5 py-0.5">{k}: {v}</span>
                      ))}
                    </div>
                  </div>
                )}
                {contactData.notes && <div><span className="font-medium">Notes:</span> {contactData.notes}</div>}
              </DialogBody>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setContactCard(null); setEditingContact(false); }}>Close</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogBody>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Info className="h-4 w-4" />
                  No contact info registered for this email.
                </div>
                {isAdmin && <p className="text-xs text-slate-400 mt-2">Click the edit icon above to add contact info.</p>}
              </DialogBody>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setContactCard(null); setEditingContact(false); }}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
