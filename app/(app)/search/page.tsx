"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import Link from "next/link";

interface Result {
  type: string;
  id: string;
  label: string;
  sub: string;
  href: string;
}

const typeColors: Record<string, "default" | "secondary" | "success" | "warning"> = {
  member: "default",
  friend: "secondary",
  news: "success",
  forum: "warning",
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(q: string) {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setResults(data.results ?? []);
    setLoading(false);
  }

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold text-slate-900">Search</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Search members, news, forum topics…"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          autoFocus
        />
      </div>

      {loading && <p className="text-sm text-slate-400">Searching…</p>}

      {!loading && results.length > 0 && (
        <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 overflow-hidden">
          {results.map((r) => (
            <Link
              key={r.id}
              href={r.href}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
            >
              <Badge variant={typeColors[r.type] ?? "secondary"} className="w-16 justify-center shrink-0">
                {r.type}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{r.label}</p>
                <p className="text-xs text-slate-400">{r.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && query.length >= 2 && results.length === 0 && (
        <p className="text-sm text-slate-400">No results for &quot;{query}&quot;</p>
      )}
    </div>
  );
}
