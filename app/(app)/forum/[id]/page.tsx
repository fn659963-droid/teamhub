"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeft, Reply } from "lucide-react";
import Link from "next/link";

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  author: { realName: string; nickname: string | null };
  children: Reply[];
}

interface Topic {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  author: { realName: string; nickname: string | null };
}

export default function ForumTopicPage() {
  const { id } = useParams<{ id: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyTo, setReplyTo] = useState<string | null>(null); // null = top-level
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    const [topicRes, repliesRes] = await Promise.all([
      fetch(`/api/forum/topics/${id}`),
      fetch(`/api/forum/replies?topicId=${id}`),
    ]);
    const topicData = await topicRes.json();
    const repliesData = await repliesRes.json();
    setTopic(topicData);
    setReplies(repliesData);
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function submitReply() {
    if (!content.trim()) return;
    setLoading(true);
    await fetch("/api/forum/replies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId: id, parentId: replyTo, content }),
    });
    setContent("");
    setReplyTo(null);
    setLoading(false);
    fetchData();
  }

  if (!topic) return <div className="text-sm text-slate-400">Loading…</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/forum" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Back to Forum
      </Link>

      {/* Topic */}
      <Card>
        <CardContent className="pt-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-lg font-semibold text-slate-800">{topic.title}</h1>
            <span className="text-xs text-slate-400 shrink-0">{formatDateTime(topic.createdAt)}</span>
          </div>
          {topic.tags.length > 0 && (
            <div className="flex gap-1">
              {topic.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
            </div>
          )}
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{topic.content}</p>
          <p className="text-xs text-slate-400">{topic.author.nickname ?? topic.author.realName}</p>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-600">{replies.length} Replies</h2>
        {replies.map((reply) => (
          <ReplyItem key={reply.id} reply={reply} onReply={(id) => { setReplyTo(id); setContent(""); }} />
        ))}
      </div>

      {/* Reply box */}
      <div className="space-y-2 rounded-lg border border-slate-200 p-4 bg-white">
        {replyTo && (
          <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 rounded px-2 py-1">
            <span>Replying to a comment</span>
            <button onClick={() => setReplyTo(null)} className="hover:text-slate-700">✕ Cancel</button>
          </div>
        )}
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="Write a reply…"
        />
        <div className="flex justify-end">
          <Button disabled={loading || !content.trim()} onClick={submitReply} size="sm">
            {loading ? "Posting…" : "Post Reply"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReplyItem({ reply, onReply, depth = 0 }: { reply: Reply; onReply: (id: string) => void; depth?: number }) {
  return (
    <div className={depth > 0 ? "ml-6 border-l-2 border-slate-100 pl-4" : ""}>
      <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-medium text-slate-700">
            {reply.author.nickname ?? reply.author.realName}
          </span>
          <span className="text-xs text-slate-400">{formatDateTime(reply.createdAt)}</span>
        </div>
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{reply.content}</p>
        {depth === 0 && (
          <button
            onClick={() => onReply(reply.id)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
          >
            <Reply className="h-3 w-3" /> Reply
          </button>
        )}
      </div>
      {reply.children?.map((child) => (
        <ReplyItem key={child.id} reply={child} onReply={onReply} depth={1} />
      ))}
    </div>
  );
}
