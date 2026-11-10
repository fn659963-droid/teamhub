"use client";
import { useState, useEffect } from "react";
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
          <h1 className="text-3xl font-bold text-black">Members</h1>
          <p className="text-base text-neutral-500 mt-1">{members.length} active member{members.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/profile"
          className="text-base font-medium text-black border border-neutral-300 rounded-lg px-4 py-2 hover:bg-neutral-100 transition-colors"
        >
          Edit my profile
        </Link>
      </div>

      <div className="rounded-xl border border-neutral-200 overflow-hidden bg-white">
        <table className="w-full text-base">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="text-left px-5 py-4 font-semibold text-neutral-500 text-sm uppercase tracking-wide">Name</th>
              <th className="text-left px-5 py-4 font-semibold text-neutral-500 text-sm uppercase tracking-wide">Nickname</th>
              <th className="text-left px-5 py-4 font-semibold text-neutral-500 text-sm uppercase tracking-wide">Email</th>
              <th className="text-left px-5 py-4 font-semibold text-neutral-500 text-sm uppercase tracking-wide">Birthday</th>
              <th className="text-left px-5 py-4 font-semibold text-neutral-500 text-sm uppercase tracking-wide">Role</th>
              <th className="text-left px-5 py-4 font-semibold text-neutral-500 text-sm uppercase tracking-wide">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {members.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-base text-neutral-400">No members found.</td></tr>
            )}
            {members.map((m) => {
              const isMe = m.id === myId;
              return (
                <tr key={m.id} className={`transition-colors ${isMe ? "bg-neutral-50" : "hover:bg-neutral-50/60"}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-neutral-200 flex items-center justify-center shrink-0 font-semibold text-sm text-black">
                        {initials(m.realName)}
                      </div>
                      <div className="leading-tight">
                        <span className="font-semibold text-black">{m.realName}</span>
                        {isMe && <span className="ml-1.5 text-sm text-neutral-400 font-normal">(you)</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-neutral-600">{m.nickname ?? <span className="text-neutral-300">—</span>}</td>
                  <td className="px-5 py-4">
                    <button
                      className="text-black hover:underline underline-offset-4"
                      onClick={() => lookupContact(m.email)}
                    >
                      {m.email}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-neutral-600">{formatBirthday(m.birthday) ?? <span className="text-neutral-300">—</span>}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold ${
                      m.role === "ADMIN" ? "bg-black text-white" : "bg-neutral-100 text-neutral-600"
                    }`}>
                      {m.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-neutral-600">{formatDate(m.createdAt)}</td>
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
                <button onClick={() => setEditingContact(true)} className="text-neutral-400 hover:text-black p-1 transition-colors" title="Edit">
                  <Pencil className="h-4 w-4" />
                </button>
              )}
            </div>
          </DialogHeader>

          {contactCard === "loading" ? (
            <DialogBody><p className="text-base text-neutral-400">Loading…</p></DialogBody>
          ) : editingContact ? (
            <>
              <DialogBody className="space-y-3">
                <p className="text-sm text-neutral-500">Email: <span className="font-medium text-black">{contactEmail}</span></p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Real Name", "realName"], ["Nickname", "nickname"],
                    ["Phone", "phone"], ["Birthday", "birthday"],
                    ["Slack", "slack"], ["Discord", "discord"],
                  ].map(([label, field]) => (
                    <div key={field} className="space-y-1.5">
                      <label className="text-sm font-medium text-black">{label}</label>
                      <Input
                        type={field === "birthday" ? "date" : "text"}
                        value={editForm[field as keyof typeof editForm]}
                        onChange={(e) => setEditForm((f) => ({ ...f, [field]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-black">Notes</label>
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
              <DialogBody className="space-y-3 text-base text-black">
                <div><span className="font-semibold">Email:</span> {contactData.email}</div>
                {contactData.realName && <div><span className="font-semibold">Name:</span> {contactData.realName}</div>}
                {contactData.nickname && <div><span className="font-semibold">Nickname:</span> {contactData.nickname}</div>}
                {contactData.phone && <div><span className="font-semibold">Phone:</span> {contactData.phone}</div>}
                {contactData.birthday && <div><span className="font-semibold">Birthday:</span> {formatBirthday(contactData.birthday)}</div>}
                {contactData.handles && Object.keys(contactData.handles).length > 0 && (
                  <div>
                    <span className="font-semibold">Handles:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Object.entries(contactData.handles).map(([k, v]) => (
                        <span key={k} className="text-sm bg-neutral-100 border border-neutral-200 rounded px-2 py-0.5">{k}: {v}</span>
                      ))}
                    </div>
                  </div>
                )}
                {contactData.notes && <div><span className="font-semibold">Notes:</span> {contactData.notes}</div>}
              </DialogBody>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setContactCard(null); setEditingContact(false); }}>Close</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogBody>
                <div className="flex items-center gap-2 text-neutral-500 text-base">
                  <Info className="h-4 w-4" />
                  No contact info registered for this email.
                </div>
                {isAdmin && <p className="text-sm text-neutral-400 mt-2">Click the edit icon above to add contact info.</p>}
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
