"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeft, Reply, Pin } from "lucide-react";
import Link from "next/link";

interface ReplyData {
  id: string;
  content: string;
  createdAt: string;
  author: { realName: string; nickname: string | null };
  children: ReplyData[];
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

const AVATAR_COLORS = ["bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-sky-500"];

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export default function ForumTopicPage() {
  const { id } = useParams<{ id: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<ReplyData[]>([]);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    const [topicRes, repliesRes] = await Promise.all([
      fetch(`/api/forum/topics/${id}`),
      fetch(`/api/forum/replies?topicId=${id}`),
    ]);
    setTopic(await topicRes.json());
    setReplies(await repliesRes.json());
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

  if (!topic) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-sm text-slate-400">Loading…</div>
    </div>
  );

  const authorName = topic.author.nickname ?? topic.author.realName;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back */}
      <Link href="/forum" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Forum
      </Link>

      {/* Topic card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1 min-w-0">
            {topic.isPinned && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                <Pin className="h-3.5 w-3.5" /> Pinned
              </div>
            )}
            <h1 className="text-xl font-bold text-slate-900 leading-snug">{topic.title}</h1>
            {topic.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {topic.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
              </div>
            )}
          </div>
          <span className="text-xs text-slate-400 shrink-0 mt-1">{formatDateTime(topic.createdAt)}</span>
        </div>

        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{topic.content}</p>

        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <div className={`h-6 w-6 rounded-full ${avatarColor(authorName)} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
            {initials(authorName)}
          </div>
          <span className="text-xs font-medium text-slate-600">{authorName}</span>
        </div>
      </div>

      {/* Replies section */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
        </h2>
        {replies.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
            <p className="text-sm text-slate-400">No replies yet. Be the first!</p>
          </div>
        )}
        {replies.map((reply) => (
          <ReplyItem key={reply.id} reply={reply} onReply={(rid) => { setReplyTo(rid); setContent(""); }} />
        ))}
      </div>

      {/* Reply compose box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
        <p className="text-sm font-semibold text-slate-700">Write a reply</p>
        {replyTo && (
          <div className="flex items-center justify-between text-xs text-indigo-700 bg-indigo-50 rounded-lg px-3 py-2">
            <span>Replying to a comment</span>
            <button onClick={() => setReplyTo(null)} className="font-medium hover:text-indigo-900">Cancel ✕</button>
          </div>
        )}
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="Share your thoughts…"
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

function ReplyItem({ reply, onReply, depth = 0 }: { reply: ReplyData; onReply: (id: string) => void; depth?: number }) {
  const name = reply.author.nickname ?? reply.author.realName;
  return (
    <div className={depth > 0 ? "ml-8 border-l-2 border-indigo-100 pl-4" : ""}>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`h-7 w-7 rounded-full ${avatarColor(name)} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
              {initials(name)}
            </div>
            <span className="text-sm font-semibold text-slate-700">{name}</span>
          </div>
          <span className="text-xs text-slate-400">{formatDateTime(reply.createdAt)}</span>
        </div>
        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{reply.content}</p>
        {depth === 0 && (
          <button
            onClick={() => onReply(reply.id)}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <Reply className="h-3.5 w-3.5" /> Reply
          </button>
        )}
      </div>
      {reply.children?.map((child) => (
        <ReplyItem key={child.id} reply={child} onReply={onReply} depth={depth + 1} />
      ))}
    </div>
  );
}
