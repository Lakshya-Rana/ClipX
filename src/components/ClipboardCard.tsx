"use client";

import { useState } from "react";
import type { ClipboardItem } from "@/types/electron";

type ClipboardProps = {
  item: ClipboardItem;
  onCopy: (content: string) => Promise<unknown> | void;
  onDelete?: (id: number) => void;
};

export default function ClipboardCard({
  item,
  onCopy,
  onDelete,
}: ClipboardProps) {
  const [copied, setCopied] = useState(false);

  const formattedTime = (() => {
    try {
      const date = new Date(item.copiedAt);
      return `${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • ${date.toLocaleDateString()}`;
    } catch {
      return item.copiedAt;
    }
  })();

  const handleCopyClick = async () => {
    await onCopy(item.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#17181d] p-3 transition hover:border-white/20">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[10px] text-gray-500">
          {formattedTime}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyClick}
            className={`rounded border px-2 py-0.5 text-[11px] font-medium transition ${
              copied
                ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                : "border-white/10 text-gray-300 hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-white"
            }`}
          >
            {copied ? "✓ Copied!" : "Copy"}
          </button>

          {onDelete && (
            <button
              onClick={() => onDelete(item.id)}
              className="rounded px-1.5 py-0.5 text-[11px] text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
              title="Delete from clipboard history"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <pre className="max-h-36 overflow-auto whitespace-pre-wrap break-words rounded bg-black/30 p-2 font-mono text-[11px] leading-4 text-gray-200">
        {item.content}
      </pre>
    </div>
  );
}
