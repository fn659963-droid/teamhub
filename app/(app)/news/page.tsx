"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/utils";
import { Pin, ThumbsUp, Bookmark, Plus, ChevronLeft, ChevronRight } from "lucide-react";

interface NewsPost {
  id: string;
  title: string;
  content: string;
  attachment: string | null;
  isPinned: boolean;
  createdAt: string;
  author: { id: string; realName: string; nickname: string | null };
  reactions: Array<{ userId: string; type: string }>;
}

export default function NewsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [myId, setMyId] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    const res = await fetch(`/api/news?page=${page}`);
    const data = await res.json();
    setPosts(data.posts ?? []);
    setTotalPages(data.totalPages ?? 1);
  }, [page]);

  useEffect(() => {
    fetchPosts();
    fetch("/api/profile/me").then((r) => r.json()).then((d) => setMyId(d.id ?? ""));
  }, [fetchPosts]);

  async function createPost() {
    if (!form.title.trim() || !form.content.trim()) return;
    setLoading(true);
    await fetch("/api/news", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    setShowCreate(false);
    setForm({ title: "", content: "" });
    fetchPosts();
  }

  async function react(postId: string, type: string) {
    await fetch(`/api/news/${postId}/react`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type }) });
    fetchPosts();
  }

  function reactionCount(post: NewsPost, type: string) {
    return post.reactions.filter((r) => r.type === type).length;
  }

  function hasReacted(post: NewsPost, type: string) {
    return post.reactions.some((r) => r.userId === myId && r.type === type);
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">News</h1>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {post.isPinned && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Pin className="h-3 w-3" /> Pinned
                    </Badge>
                  )}
                  <h2 className="text-base font-semibold text-slate-800">{post.title}</h2>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{formatDateTime(post.createdAt)}</span>
              </div>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{post.content}</p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400">
                  {post.author.nickname ?? post.author.realName}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => react(post.id, "thumbsup")}
                    className={`flex items-center gap-1 text-xs rounded px-2 py-1 transition-colors ${hasReacted(post, "thumbsup") ? "bg-blue-100 text-blue-700" : "text-slate-400 hover:bg-slate-100"}`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" /> {reactionCount(post, "thumbsup")}
                  </button>
                  <button
                    onClick={() => react(post.id, "bookmark")}
                    className={`flex items-center gap-1 text-xs rounded px-2 py-1 transition-colors ${hasReacted(post, "bookmark") ? "bg-amber-100 text-amber-700" : "text-slate-400 hover:bg-slate-100"}`}
                  >
                    <Bookmark className="h-3.5 w-3.5" /> {reactionCount(post, "bookmark")}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
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

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>New News Post</DialogTitle></DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Title</label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Post title" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Content</label>
              <Textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={6} placeholder="Write your news…" />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button disabled={loading || !form.title.trim() || !form.content.trim()} onClick={createPost}>
              {loading ? "Posting…" : "Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
