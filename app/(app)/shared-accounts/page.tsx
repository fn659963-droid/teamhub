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
    if (data) {
      setEditForm({
        realName: data.realName ?? "",
        nickname: data.nickname ?? "",
        phone: data.phone ?? "",
        slack: data.handles?.slack ?? "",
        discord: data.handles?.discord ?? "",
        notes: data.notes ?? "",
      });
    } else {
      setEditForm({ realName: "", nickname: "", phone: "", slack: "", discord: "", notes: "" });
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
        handles: Object.keys(handles).length ? handles : null,
        notes: editForm.notes || null,
      }),
    });
    const data = await res.json();
    setContactSaving(false);
    if (res.ok) {
      setContactCard(data);
      setEditingContact(false);
    }
  }

  async function createAccount() {
    if (!form.platform.trim() || !form.accountEmail.trim()) return;
    setLoading(true);

    const handles: Record<string, string> = {};
    if (form.contactSlack) handles.slack = form.contactSlack;
    if (form.contactDiscord) handles.discord = form.contactDiscord;

    const contact = form.contactEmail ? {
      email: form.contactEmail,
      realName: form.contactName || null,
      nickname: form.contactNickname || null,
      phone: form.contactPhone || null,
      handles: Object.keys(handles).length ? handles : null,
      notes: form.contactNotes || null,
    } : null;

    await fetch("/api/shared-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: form.platform,
        accountEmail: form.accountEmail,
        anydeskAddr: form.anydeskAddr || null,
        startDate: form.startDate || null,
        contact,
      }),
    });
    setLoading(false);
    setShowCreate(false);
    setForm({ platform: "", accountEmail: "", anydeskAddr: "", startDate: "", contactEmail: "", contactName: "", contactNickname: "", contactPhone: "", contactSlack: "", contactDiscord: "", contactNotes: "" });
    fetchAccounts();
  }

  async function requestTransfer(accountId: string) {
    await fetch("/api/shared-accounts/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sharedAccountId: accountId }),
    });
    fetchAccounts();
  }

  const isAdmin = myRole === "ADMIN";
  const contactData = contactCard !== "loading" ? contactCard : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Shared Accounts</h1>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> Add Row
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-medium text-slate-600">Platform</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">ID (Email)</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Anydesk Address</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Owner</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Current User</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Previous User</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Start Date</th>
              <th className="w-28"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {accounts.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-sm">
                  No shared accounts yet. Add one with the button above.
                </td>
              </tr>
            )}
            {accounts.map((acc) => {
              const isCurrentUser = acc.currentUser?.id === myId;
              return (
                <tr key={acc.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{acc.platform}</td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 hover:underline text-sm" onClick={() => lookupContact(acc.accountEmail)}>
                      {acc.accountEmail}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{acc.anydeskAddr ?? <span className="text-slate-300">—</span>}</td>
                  <td className="px-4 py-3">
                    {acc.owner ? (
                      <button className="text-blue-600 hover:underline" onClick={() => lookupContact(acc.owner!.email)}>
                        {displayName(acc.owner)}
                      </button>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {acc.currentUser ? (
                      <button className="text-blue-600 hover:underline" onClick={() => lookupContact(acc.currentUser!.email)}>
                        {displayName(acc.currentUser)}
                      </button>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {acc.previousUser ? (
                      <button className="text-blue-600 hover:underline" onClick={() => lookupContact(acc.previousUser!.email)}>
                        {displayName(acc.previousUser)}
                      </button>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {acc.startDate ? formatDate(acc.startDate) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {!isCurrentUser && (
                        <button title="Request transfer" onClick={() => requestTransfer(acc.id)} className="text-slate-400 hover:text-slate-700">
                          <ArrowRightLeft className="h-4 w-4" />
                        </button>
                      )}
                      <button title="Change history" className="text-slate-400 hover:text-slate-700">
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
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Account Info</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Platform *</label>
                  <Input value={form.platform} onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))} placeholder="e.g. AWS, GitHub" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Account Email *</label>
                  <Input value={form.accountEmail} onChange={(e) => setForm((f) => ({ ...f, accountEmail: e.target.value }))} placeholder="account@example.com" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Anydesk Address</label>
                  <Input value={form.anydeskAddr} onChange={(e) => setForm((f) => ({ ...f, anydeskAddr: e.target.value }))} placeholder="Optional" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Start Date</label>
                  <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Register a Contact (optional)</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Contact Email</label>
                  <Input value={form.contactEmail} onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))} placeholder="contact@example.com" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Real Name</label>
                  <Input value={form.contactName} onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Nickname</label>
                  <Input value={form.contactNickname} onChange={(e) => setForm((f) => ({ ...f, contactNickname: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Phone</label>
                  <Input value={form.contactPhone} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Slack</label>
                  <Input value={form.contactSlack} onChange={(e) => setForm((f) => ({ ...f, contactSlack: e.target.value }))} placeholder="@handle" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Discord</label>
                  <Input value={form.contactDiscord} onChange={(e) => setForm((f) => ({ ...f, contactDiscord: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Notes</label>
                <Textarea value={form.contactNotes} onChange={(e) => setForm((f) => ({ ...f, contactNotes: e.target.value }))} rows={2} />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button disabled={loading || !form.platform.trim() || !form.accountEmail.trim()} onClick={createAccount}>
              {loading ? "Adding…" : "Add Row"}
            </Button>
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
                <button
                  onClick={() => setEditingContact(true)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                  title="Edit contact"
                >
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
                    <label className="text-sm font-medium text-slate-700">Slack</label>
                    <Input value={editForm.slack} onChange={(e) => setEditForm((f) => ({ ...f, slack: e.target.value }))} placeholder="@handle" />
                  </div>
                  <div className="space-y-1 col-span-2">
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
                {isAdmin && (
                  <p className="text-xs text-slate-400 mt-2">Click the edit icon above to add contact info.</p>
                )}
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
