"use client";

import ClipboardCard from "@/components/ClipboardCard";

export default function ClipboardPage() {
  return (
    <main className="min-h-screen bg-[#101114] p-3 text-white">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-sm font-semibold">Clipboard History</h1>
        <span className="text-xs text-gray-500">0 items</span>
      </div>

      {/* Clipboard items */}
      <section className="flex flex-col gap-2">
        {/* Add your clipboard items here */}
      </section>

      {/* Empty state */}
      <section className="flex flex-col items-center justify-center py-16">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#17181d]">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <rect x="5" y="4" width="14" height="17" rx="2" />
            <path d="M9 4.5V3h6v1.5M8 9h8M8 13h8M8 17h5" />
          </svg>
        </div>

        <h2 className="text-sm font-medium text-gray-300">
          Nothing here yet
        </h2>

        <p className="mt-1 text-center text-xs text-gray-500">
          Your copied text and code will appear here.
        </p>
      </section>
    </main>
  );
}