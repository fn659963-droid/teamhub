"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";

type WorkLogStatus = "DRAFT" | "SUBMITTED" | "ACKNOWLEDGED";

interface WorkLogEntry {
  id: string;
  userId: string;
  morningPlan: string | null;
  whatIDid: string | null;
  tomorrowPlan: string | null;
  status: WorkLogStatus;
  comments: Array<{ id: string; content: string; author: { realName: string; nickname: string | null } }>;
  user: { id: string; realName: string; nickname: string | null; avatar: string | null };
}

interface User {
  id: string;
  realName: string;
  nickname: string | null;
  avatar: string | null;
}

function statusVariant(s: WorkLogStatus) {
  if (s === "ACKNOWLEDGED") return "secondary";
  if (s === "SUBMITTED") return "default";
  return "outline";
}

function dateToISO(d: Date) {
  return d.toISOString().split("T")[0];
}

export default function WorkLogPage() {
  const [date, setDate] = useState(new Date());
  const [logs, setLogs] = useState<WorkLogEntry[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [myId, setMyId] = useState<string>("");
  const [myRole, setMyRole] = useState<string>("");
  const [editing, setEditing] = useState<null | "my">(null);
  const [form, setForm] = useState({ morningPlan: "", whatIDid: "", tomorrowPlan: "" });
  const [commentTarget, setCommentTarget] = useState<WorkLogEntry | null>(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    const res = await fetch(`/api/worklog?date=${dateToISO(date)}`);
    const data = await res.json();
    setLogs(data.logs ?? []);
    setAllUsers(data.allUsers ?? []);
    setMyId(data.requestingUserId ?? "");
    setMyRole(data.requestingUserRole ?? "");
  }, [date]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  function getLog(userId: string): WorkLogEntry | undefined {
    return logs.find((l) => l.userId === userId);
  }

  function openEdit() {
    const my = getLog(myId);
    setForm({ morningPlan: my?.morningPlan ?? "", whatIDid: my?.whatIDid ?? "", tomorrowPlan: my?.tomorrowPlan ?? "" });
    setEditing("my");
  }

  async function saveLog(status: WorkLogStatus) {
    setLoading(true);
    await fetch("/api/worklog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateToISO(date), ...form, status }),
    });
    setEditing(null);
    setLoading(false);
    fetchLogs();
  }

  async function submitComment() {
    if (!commentTarget || !commentText.trim()) return;
    setLoading(true);
    await fetch("/api/worklog/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workLogId: commentTarget.id, content: commentText }),
    });
    setCommentTarget(null);
    setCommentText("");
    setLoading(false);
    fetchLogs();
  }

  const isToday = dateToISO(date) === dateToISO(new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">Work Log</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => { const d = new Date(date); d.setDate(d.getDate() - 1); setDate(d); }}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-base font-semibold text-black w-36 text-center">{formatDate(date)}</span>
          <Button variant="outline" size="icon" disabled={isToday} onClick={() => { const d = new Date(date); d.setDate(d.getDate() + 1); setDate(d); }}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {!isToday && (
            <Button variant="ghost" size="sm" onClick={() => setDate(new Date())}>Today</Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full text-base">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="text-left px-5 py-4 text-sm font-semibold uppercase tracking-wide text-neutral-500 w-36">Member</th>
              <th className="text-left px-5 py-4 text-sm font-semibold uppercase tracking-wide text-neutral-500 w-28">Status</th>
              <th className="text-left px-5 py-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">Morning Plan</th>
              <th className="text-left px-5 py-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">What I Did</th>
              <th className="text-left px-5 py-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">Tomorrow&apos;s Plan</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {allUsers.map((u) => {
              const log = getLog(u.id);
              const isMe = u.id === myId;
              return (
                <tr key={u.id} className={isMe ? "bg-neutral-50" : "hover:bg-neutral-50/60 transition-colors"}>
                  <td className="px-5 py-4 font-semibold text-black">
                    {u.nickname ?? u.realName}
                    {isMe && <span className="ml-1.5 text-sm text-neutral-400 font-normal">(you)</span>}
                  </td>
                  <td className="px-5 py-4">
                    {log ? (
                      <Badge variant={statusVariant(log.status)}>{log.status}</Badge>
                    ) : (
                      <Badge variant="outline">—</Badge>
                    )}
                  </td>
                  <td className="px-5 py-4 text-neutral-700 max-w-xs whitespace-pre-wrap">{log?.morningPlan ?? <span className="text-neutral-300">—</span>}</td>
                  <td className="px-5 py-4 text-neutral-700 max-w-xs whitespace-pre-wrap">{log?.whatIDid ?? <span className="text-neutral-300">—</span>}</td>
                  <td className="px-5 py-4 text-neutral-700 max-w-xs whitespace-pre-wrap">{log?.tomorrowPlan ?? <span className="text-neutral-300">—</span>}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      {isMe && isToday && (
                        <Button variant="ghost" size="sm" onClick={openEdit}>
                          {log ? "Edit" : "Add"}
                        </Button>
                      )}
                      {myRole === "ADMIN" && log && (
                        <button
                          className="text-neutral-400 hover:text-black transition-colors"
                          title="Add comment"
                          onClick={() => { setCommentTarget(log); setCommentText(""); }}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit dialog */}
      <Dialog open={editing === "my"} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>My Work Log — {formatDate(date)}</DialogTitle>
          </DialogHeader>
          <DialogBody className="grid grid-cols-3 gap-4">
            {(["morningPlan", "whatIDid", "tomorrowPlan"] as const).map((field, i) => (
              <div key={field} className="space-y-2">
                <label className="text-sm font-semibold text-black uppercase tracking-wide">
                  {["Morning Plan", "What I Did", "Tomorrow's Plan"][i]}
                </label>
                <Textarea
                  value={form[field]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  rows={8}
                  placeholder="—"
                />
              </div>
            ))}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="secondary" disabled={loading} onClick={() => saveLog("DRAFT")}>Save Draft</Button>
            <Button disabled={loading} onClick={() => saveLog("SUBMITTED")}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comment dialog */}
      <Dialog open={!!commentTarget} onOpenChange={(o) => !o && setCommentTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comment on work log</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <p className="text-base text-neutral-600">
              Leaving a comment will mark this log as <strong>Acknowledged</strong>.
            </p>
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Your comment…"
              rows={4}
            />
            {commentTarget?.comments?.length ? (
              <div className="space-y-2 pt-1">
                <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Previous comments</p>
                {commentTarget.comments.map((c) => (
                  <div key={c.id} className="rounded-lg bg-neutral-50 border border-neutral-100 px-4 py-3 text-base text-black">
                    <span className="font-semibold">{c.author.nickname ?? c.author.realName}: </span>
                    {c.content}
                  </div>
                ))}
              </div>
            ) : null}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommentTarget(null)}>Cancel</Button>
            <Button disabled={loading || !commentText.trim()} onClick={submitComment}>Save Comment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
