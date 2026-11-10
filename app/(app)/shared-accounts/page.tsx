"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { Plus, History, ArrowRightLeft, Info, Pencil } from "lucide-react";

interface UserRef { id: string; realName: string; nickname: string | null; email: string }

interface SharedAccount {
  id: string;
  platform: string;
  accountEmail: string;
  anydeskAddr: string | null;
  startDate: string | null;
  owner: UserRef | null;
  currentUser: UserRef | null;
  previousUser: UserRef | null;
}

interface Contact {
  id: string;
  email: string;
  realName: string | null;
  nickname: string | null;
  phone: string | null;
  handles: Record<string, string> | null;
  notes: string | null;
}

function displayName(u: UserRef | null) {
  if (!u) return "—";
  return u.nickname ?? u.realName;
}

export default function SharedAccountsPage() {
  const [accounts, setAccounts] = useState<SharedAccount[]>([]);
  const [myId, setMyId] = useState("");
  const [myRole, setMyRole] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [contactCard, setContactCard] = useState<Contact | null | "loading">(null);
  const [contactEmail, setContactEmail] = useState("");
  const [editingContact, setEditingContact] = useState(false);
  const [editForm, setEditForm] = useState({ realName: "", nickname: "", phone: "", slack: "", discord: "", notes: "" });
  const [contactSaving, setContactSaving] = useState(false);
  const [form, setForm] = useState({
    platform: "", accountEmail: "", anydeskAddr: "", startDate: "",
    contactEmail: "", contactName: "", contactNickname: "", contactPhone: "",
    contactSlack: "", contactDiscord: "", contactNotes: "",
  });
  const [loading, setLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    const res = await fetch("/api/shared-accounts");
    const data = await res.json();
    setAccounts(data.accounts ?? []);
  }, []);

  useEffect(() => {
    fetchAccounts();
    fetch("/api/profile/me").then((r) => r.json()).then((d) => { setMyId(d.id ?? ""); setMyRole(d.role ?? ""); });
  }, [fetchAccounts]);

  async function lookupContact(email: string) {
    setContactEmail(email);
    setContactCard("loading");
    setEditingContact(false);
    const res = await fetch(`/api/contacts?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    setContactCard(data ?? null);
    setEditForm(data ? {
      realName: data.realName ?? "", nickname: data.nickname ?? "",
      phone: data.phone ?? "", slack: data.handles?.slack ?? "",
      discord: data.handles?.discord ?? "", notes: data.notes ?? "",
    } : { realName: "", nickname: "", phone: "", slack: "", discord: "", notes: "" });
  }

  async function saveContact() {
    setContactSaving(true);
    const handles: Record<string, string> = {};
    if (editForm.slack) handles.slack = editForm.slack;
    if (editForm.discord) handles.discord = editForm.discord;
    const res = await fetch("/api/contacts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: contactEmail, realName: editForm.realName || null, nickname: editForm.nickname || null, phone: editForm.phone || null, handles: Object.keys(handles).length ? handles : null, notes: editForm.notes || null }),
    });
    const data = await res.json();
    setContactSaving(false);
    if (res.ok) { setContactCard(data); setEditingContact(false); }
  }

  async function createAccount() {
    if (!form.platform.trim() || !form.accountEmail.trim()) return;
    setLoading(true);
    const handles: Record<string, string> = {};
    if (form.contactSlack) handles.slack = form.contactSlack;
    if (form.contactDiscord) handles.discord = form.contactDiscord;
    const contact = form.contactEmail ? { email: form.contactEmail, realName: form.contactName || null, nickname: form.contactNickname || null, phone: form.contactPhone || null, handles: Object.keys(handles).length ? handles : null, notes: form.contactNotes || null } : null;
    await fetch("/api/shared-accounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ platform: form.platform, accountEmail: form.accountEmail, anydeskAddr: form.anydeskAddr || null, startDate: form.startDate || null, contact }) });
    setLoading(false);
    setShowCreate(false);
    setForm({ platform: "", accountEmail: "", anydeskAddr: "", startDate: "", contactEmail: "", contactName: "", contactNickname: "", contactPhone: "", contactSlack: "", contactDiscord: "", contactNotes: "" });
    fetchAccounts();
  }

  async function requestTransfer(accountId: string) {
    await fetch("/api/shared-accounts/transfer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sharedAccountId: accountId }) });
    fetchAccounts();
  }

  const isAdmin = myRole === "ADMIN";
  const contactData = contactCard !== "loading" ? contactCard : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">Shared Accounts</h1>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> Add Row
        </Button>
      </div>

      <div className="rounded-xl border border-neutral-200 overflow-auto bg-white">
        <table className="w-full text-base">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="text-left px-4 py-4 font-semibold text-neutral-500 text-sm uppercase tracking-wide">Platform</th>
              <th className="text-left px-4 py-4 font-semibold text-neutral-500 text-sm uppercase tracking-wide">ID (Email)</th>
              <th className="text-left px-4 py-4 font-semibold text-neutral-500 text-sm uppercase tracking-wide">Anydesk</th>
              <th className="text-left px-4 py-4 font-semibold text-neutral-500 text-sm uppercase tracking-wide">Owner</th>
              <th className="text-left px-4 py-4 font-semibold text-neutral-500 text-sm uppercase tracking-wide">Current User</th>
              <th className="text-left px-4 py-4 font-semibold text-neutral-500 text-sm uppercase tracking-wide">Previous User</th>
              <th className="text-left px-4 py-4 font-semibold text-neutral-500 text-sm uppercase tracking-wide">Start Date</th>
              <th className="w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {accounts.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-neutral-400">No shared accounts yet.</td></tr>
            )}
            {accounts.map((acc) => {
              const isCurrentUser = acc.currentUser?.id === myId;
              return (
                <tr key={acc.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-4 font-semibold text-black">{acc.platform}</td>
                  <td className="px-4 py-4">
                    <button className="text-black hover:underline underline-offset-4" onClick={() => lookupContact(acc.accountEmail)}>{acc.accountEmail}</button>
                  </td>
                  <td className="px-4 py-4 text-neutral-600">{acc.anydeskAddr ?? <span className="text-neutral-300">—</span>}</td>
                  <td className="px-4 py-4">
                    {acc.owner ? <button className="text-black hover:underline underline-offset-4" onClick={() => lookupContact(acc.owner!.email)}>{displayName(acc.owner)}</button> : <span className="text-neutral-300">—</span>}
                  </td>
                  <td className="px-4 py-4">
                    {acc.currentUser ? <button className="text-black hover:underline underline-offset-4" onClick={() => lookupContact(acc.currentUser!.email)}>{displayName(acc.currentUser)}</button> : <span className="text-neutral-300">—</span>}
                  </td>
                  <td className="px-4 py-4">
                    {acc.previousUser ? <button className="text-black hover:underline underline-offset-4" onClick={() => lookupContact(acc.previousUser!.email)}>{displayName(acc.previousUser)}</button> : <span className="text-neutral-300">—</span>}
                  </td>
                  <td className="px-4 py-4 text-neutral-600">{acc.startDate ? formatDate(acc.startDate) : <span className="text-neutral-300">—</span>}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {!isCurrentUser && (
                        <button title="Request transfer" onClick={() => requestTransfer(acc.id)} className="text-neutral-400 hover:text-black transition-colors">
                          <ArrowRightLeft className="h-4 w-4" />
                        </button>
                      )}
                      <button title="Change history" className="text-neutral-400 hover:text-black transition-colors">
                        <History className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add row dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Add Shared Account</DialogTitle></DialogHeader>
          <DialogBody className="space-y-5">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Account Info</p>
              <div className="grid grid-cols-2 gap-3">
                {[["Platform *", "platform", "text", "e.g. AWS, GitHub"], ["Account Email *", "accountEmail", "text", "account@example.com"], ["Anydesk Address", "anydeskAddr", "text", "Optional"], ["Start Date", "startDate", "date", ""]].map(([label, field, type, placeholder]) => (
                  <div key={field} className="space-y-1.5">
                    <label className="text-sm font-semibold text-black">{label}</label>
                    <Input type={type} value={form[field as keyof typeof form]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))} placeholder={placeholder || undefined} />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3 pt-2 border-t border-neutral-100">
              <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Register a Contact (optional)</p>
              <div className="grid grid-cols-2 gap-3">
                {[["Contact Email", "contactEmail", "Contact Name", "contactName"], ["Nickname", "contactNickname", "Phone", "contactPhone"], ["Slack", "contactSlack", "Discord", "contactDiscord"]].map(([l1, f1, l2, f2]) => (
                  <>
                    <div key={f1} className="space-y-1.5">
                      <label className="text-sm font-semibold text-black">{l1}</label>
                      <Input value={form[f1 as keyof typeof form]} onChange={(e) => setForm((f) => ({ ...f, [f1]: e.target.value }))} />
                    </div>
                    <div key={f2} className="space-y-1.5">
                      <label className="text-sm font-semibold text-black">{l2}</label>
                      <Input value={form[f2 as keyof typeof form]} onChange={(e) => setForm((f) => ({ ...f, [f2]: e.target.value }))} />
                    </div>
                  </>
                ))}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-black">Notes</label>
                <Textarea value={form.contactNotes} onChange={(e) => setForm((f) => ({ ...f, contactNotes: e.target.value }))} rows={2} />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button disabled={loading || !form.platform.trim() || !form.accountEmail.trim()} onClick={createAccount}>{loading ? "Adding…" : "Add Row"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact card dialog */}
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
                  {[["Real Name", "realName"], ["Nickname", "nickname"], ["Phone", "phone"], ["Slack", "slack"], ["Discord", "discord"]].map(([label, field]) => (
                    <div key={field} className="space-y-1.5">
                      <label className="text-sm font-semibold text-black">{label}</label>
                      <Input value={editForm[field as keyof typeof editForm]} onChange={(e) => setEditForm((f) => ({ ...f, [field]: e.target.value }))} />
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-black">Notes</label>
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
