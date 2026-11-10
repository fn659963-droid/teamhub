"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/utils";
import { Plus, Pin, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Topic {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  author: { realName: string; nickname: string | null };
  _count: { replies: number };
}

export default function ForumPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", tags: "" });
  const [loading, setLoading] = useState(false);

  const fetchTopics = useCallback(async () => {
    const res = await fetch(`/api/forum/topics?page=${page}`);
    const data = await res.json();
    setTopics(data.topics ?? []);
    setTotalPages(data.totalPages ?? 1);
  }, [page]);

  useEffect(() => { fetchTopics(); }, [fetchTopics]);

  async function createTopic() {
    if (!form.title.trim() || !form.content.trim()) return;
    setLoading(true);
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    await fetch("/api/forum/topics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, tags }) });
    setLoading(false);
    setShowCreate(false);
    setForm({ title: "", content: "", tags: "" });
    fetchTopics();
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Forum</h1>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> New Topic
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 overflow-hidden">
        {topics.length === 0 && (
          <div className="p-12 text-center text-sm text-slate-400">No topics yet. Start one!</div>
        )}
        {topics.map((topic) => (
          <div key={topic.id} className="flex items-start gap-4 px-4 py-3 hover:bg-slate-50">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {topic.isPinned && <Pin className="h-3.5 w-3.5 text-slate-400" />}
                <Link href={`/forum/${topic.id}`} className="text-sm font-medium text-slate-800 hover:underline">
                  {topic.title}
                </Link>
                {topic.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {topic.author.nickname ?? topic.author.realName} · {formatDateTime(topic.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
              <MessageSquare className="h-3.5 w-3.5" />
              {topic._count.replies}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-slate-600">{page} / {totalPages}</span>
          <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Topic</DialogTitle></DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Title</label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Topic title" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Content</label>
              <Textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={5} placeholder="Write your post…" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Tags</label>
              <Input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="tag1, tag2 (comma separated)" />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button disabled={loading || !form.title.trim() || !form.content.trim()} onClick={createTopic}>
              {loading ? "Posting…" : "Post Topic"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
