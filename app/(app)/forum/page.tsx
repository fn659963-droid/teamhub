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
        <h1 className="text-3xl font-bold text-black">Forum</h1>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> New Topic
        </Button>
      </div>

      <div className="rounded-xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden bg-white">
        {topics.length === 0 && (
          <div className="p-16 text-center">
            <div className="h-14 w-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-6 w-6 text-neutral-400" />
            </div>
            <p className="text-base font-semibold text-black">No topics yet</p>
            <p className="text-sm text-neutral-400 mt-1">Start the first conversation!</p>
          </div>
        )}
        {topics.map((topic) => (
          <Link
            key={topic.id}
            href={`/forum/${topic.id}`}
            className={`flex items-start gap-5 px-6 py-5 hover:bg-neutral-50 transition-colors ${topic.isPinned ? "bg-neutral-50" : ""}`}
          >
            <div className="flex flex-col items-center gap-0.5 shrink-0 w-10 pt-0.5">
              <span className="text-xl font-bold text-black">{topic._count.replies}</span>
              <span className="text-xs text-neutral-400 uppercase tracking-wide">replies</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {topic.isPinned && <Pin className="h-3.5 w-3.5 text-black" />}
                <span className="text-lg font-semibold text-black leading-snug">
                  {topic.title}
                </span>
                {topic.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-sm">{tag}</Badge>
                ))}
              </div>
              <p className="text-base text-neutral-500 line-clamp-1 mb-1.5">{topic.content}</p>
              <p className="text-sm text-neutral-400">
                <span className="font-medium text-neutral-600">{topic.author.nickname ?? topic.author.realName}</span>
                {" · "}{formatDateTime(topic.createdAt)}
              </p>
            </div>

            <MessageSquare className="h-4 w-4 text-neutral-300 shrink-0 mt-1.5" />
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-base font-medium text-black">{page} / {totalPages}</span>
          <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Topic</DialogTitle></DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-black">Title</label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Topic title" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-black">Content</label>
              <Textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={5} placeholder="Write your post…" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-black">Tags</label>
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
