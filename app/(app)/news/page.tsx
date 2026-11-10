"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/utils";
import { Pin, ThumbsUp, Bookmark, Plus, ChevronLeft, ChevronRight, Newspaper } from "lucide-react";

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
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">News</h1>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>

      {posts.length === 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-16 text-center">
          <div className="h-14 w-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <Newspaper className="h-6 w-6 text-neutral-400" />
          </div>
          <p className="text-base font-semibold text-black">No news yet</p>
          <p className="text-sm text-neutral-400 mt-1">Post the first update!</p>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className={post.isPinned ? "border-neutral-400 bg-neutral-50" : ""}>
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 flex-1 min-w-0">
                  {post.isPinned && (
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-black">
                      <Pin className="h-3.5 w-3.5" /> Pinned
                    </div>
                  )}
                  <h2 className="text-xl font-bold text-black">{post.title}</h2>
                </div>
                <span className="text-sm text-neutral-400 shrink-0 mt-1">{formatDateTime(post.createdAt)}</span>
              </div>
              <p className="text-base text-neutral-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <span className="text-sm font-medium text-neutral-500">
                  {post.author.nickname ?? post.author.realName}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => react(post.id, "thumbsup")}
                    className={`flex items-center gap-1.5 text-sm rounded-lg px-3 py-1.5 font-medium transition-colors border ${
                      hasReacted(post, "thumbsup")
                        ? "bg-black text-white border-black"
                        : "text-neutral-500 border-neutral-200 hover:bg-neutral-100 hover:text-black"
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4" /> {reactionCount(post, "thumbsup")}
                  </button>
                  <button
                    onClick={() => react(post.id, "bookmark")}
                    className={`flex items-center gap-1.5 text-sm rounded-lg px-3 py-1.5 font-medium transition-colors border ${
                      hasReacted(post, "bookmark")
                        ? "bg-black text-white border-black"
                        : "text-neutral-500 border-neutral-200 hover:bg-neutral-100 hover:text-black"
                    }`}
                  >
                    <Bookmark className="h-4 w-4" /> {reactionCount(post, "bookmark")}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
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
          <DialogHeader><DialogTitle>New News Post</DialogTitle></DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-black">Title</label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Post title" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-black">Content</label>
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
