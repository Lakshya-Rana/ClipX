"use client";

import { useEffect, useRef, useState } from "react";
import { copyToClipboard } from "@/utils/clipboard";
import type { Snippet } from "@/types/electron";

const categories = [
  "Code",
  "Git & Terminal",
  "SQL",
  "Prompts",
  "Text",
  "Links and Resources",
];

function CategoryIcon({
  category,
  className = "h-3.5 w-3.5 shrink-0",
}: {
  category: string;
  className?: string;
}) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  switch (category) {
    case "Code":
      return (
        <svg {...common}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case "Git & Terminal":
      return (
        <svg {...common}>
          <line x1="6" y1="3" x2="6" y2="15" />
          <circle cx="18" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <path d="M18 9a9 9 0 0 1-9 9" />
        </svg>
      );
    case "SQL":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        </svg>
      );
    case "Prompts":
      return (
        <svg {...common}>
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
        </svg>
      );
    case "Text":
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="16" y2="17" />
        </svg>
      );
    case "Links and Resources":
      return (
        <svg {...common}>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      );
  }
}

export default function SnippetsPage() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [addMenu, setAddMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Code");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Load persistent snippets on mount
  useEffect(() => {
    async function loadSnippets() {
      if (window.clipx?.getSnippets) {
        const loaded = await window.clipx.getSnippets();
        setSnippets(Array.isArray(loaded) ? loaded : []);
      } else {
        try {
          const saved = localStorage.getItem("clipx-snippets");
          setSnippets(saved ? JSON.parse(saved) : []);
        } catch {
          setSnippets([]);
        }
      }
    }
    void loadSnippets();
  }, []);

  // Persist snippets helper
  async function persist(updated: Snippet[]) {
    setSnippets(updated);
    if (window.clipx?.saveSnippets) {
      await window.clipx.saveSnippets(updated);
    } else {
      localStorage.setItem("clipx-snippets", JSON.stringify(updated));
    }
  }

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(target)) {
        setIsFilterDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function showMessage(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(""), 2000);
  }

  async function copySnippet(id: number, text: string) {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
      showMessage("Copied to clipboard!");
    } else {
      showMessage("Couldn't copy. Try again.");
    }
  }

  function addSnippet() {
    if (!title.trim() || !content.trim()) return;

    const newSnippet: Snippet = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      category,
    };

    const updated = [newSnippet, ...snippets];
    void persist(updated);

    setTitle("");
    setContent("");
    setCategory("Code");
    setAddMenu(false);
    showMessage("Snippet saved!");
  }

  function saveEditedSnippet() {
    if (!editingSnippet || !editingSnippet.title.trim() || !editingSnippet.content.trim()) {
      return;
    }

    const updated = snippets.map((item) =>
      item.id === editingSnippet.id
        ? {
            ...editingSnippet,
            title: editingSnippet.title.trim(),
            content: editingSnippet.content.trim(),
          }
        : item
    );

    void persist(updated);
    setEditingSnippet(null);
    showMessage("Snippet updated!");
  }

  function deleteSnippet(id: number) {
    const updated = snippets.filter((item) => item.id !== id);
    void persist(updated);
    showMessage("Snippet deleted.");
  }

  // Filtered snippets based on search and selected category
  const filtered = snippets.filter((snippet) => {
    const matchesSearch = `${snippet.title} ${snippet.content} ${snippet.category}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Categories" || snippet.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="flex min-h-screen flex-col bg-[#101114] text-white">
      <div className="flex flex-1 flex-col p-3">
        {/* Search, Filter & Add Controls */}
        <div className="mb-3 flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search snippets..."
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#1a1b20] px-3 py-1.5 text-xs outline-none transition focus:border-violet-500"
          />

          {/* Category Filter Dropdown */}
          <div className="relative" ref={filterDropdownRef}>
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#1a1b20] px-2.5 py-1.5 text-xs text-gray-300 transition hover:border-white/20"
            >
              <span className="truncate max-w-[110px]">{selectedCategory}</span>
              <span className="text-[10px] text-gray-500">⌄</span>
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-white/10 bg-[#17181d] p-1 shadow-xl">
                {["All Categories", ...categories].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`block w-full rounded-md px-2.5 py-1.5 text-left text-xs transition ${
                      selectedCategory === cat
                        ? "bg-violet-500/15 text-violet-300 font-medium"
                        : "text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Snippet Toggle Button */}
          <button
            onClick={() => setAddMenu((prev) => !prev)}
            className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              addMenu
                ? "border border-white/10 bg-white/10 text-white"
                : "bg-violet-600 text-white hover:bg-violet-500"
            }`}
          >
            {addMenu ? "✕ Cancel" : "+ Add"}
          </button>
        </div>

        {/* New Snippet Form */}
        {addMenu && (
          <section className="mb-3 rounded-lg border border-white/10 bg-[#17181d] p-3">
            <h2 className="mb-2 text-xs font-semibold text-gray-300">
              New snippet
            </h2>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Snippet title"
              className="mb-2 w-full rounded-md border border-white/10 bg-[#101114] px-2.5 py-1.5 text-xs outline-none focus:border-violet-500"
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your code, query or prompt..."
              rows={3}
              className="mb-2 w-full resize-y rounded-md border border-white/10 bg-[#101114] px-2.5 py-2 font-mono text-[11px] leading-4 outline-none focus:border-violet-500"
            />

            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between gap-1.5 rounded-md border border-white/10 bg-[#101114] px-2.5 py-1.5 text-xs hover:border-white/20"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <CategoryIcon
                      category={category}
                      className="h-3.5 w-3.5 text-violet-400"
                    />
                    <span className="truncate">{category}</span>
                  </span>
                  <span className="text-gray-400">⌄</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 z-20 mt-1 max-h-52 overflow-y-auto rounded-md border border-white/10 bg-[#17181d] p-1 shadow-2xl">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setCategory(cat);
                          setIsDropdownOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs ${
                          category === cat
                            ? "bg-violet-500/15 text-violet-300 font-medium"
                            : "text-gray-300 hover:bg-white/5"
                        }`}
                      >
                        <CategoryIcon category={cat} />
                        <span>{cat}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={addSnippet}
                disabled={!title.trim() || !content.trim()}
                className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </section>
        )}

        {/* Snippet List Section */}
        <section className="flex-1">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-gray-300">
              Your snippets
            </h2>
            <span className="text-[10px] text-gray-500">
              {filtered.length} {filtered.length === 1 ? "snippet" : "snippets"}
            </span>
          </div>

          <div className="space-y-2">
            {filtered.map((snippet) => (
              <article
                key={snippet.id}
                onClick={() => setEditingSnippet({ ...snippet })}
                className="cursor-pointer rounded-lg border border-white/10 bg-[#17181d] p-3 transition hover:border-white/20"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="break-words text-xs font-semibold">
                      {snippet.title}
                    </h3>

                    <span className="mt-1 inline-flex items-center gap-1 rounded bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-medium text-violet-300">
                      <CategoryIcon category={snippet.category} className="h-2.5 w-2.5" />
                      {snippet.category}
                    </span>
                  </div>

                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteSnippet(snippet.id);
                    }}
                    aria-label={`Delete ${snippet.title}`}
                    className="shrink-0 rounded px-1.5 py-0.5 text-[10px] text-gray-500 hover:bg-red-500/10 hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>

                <pre className="max-h-36 overflow-auto whitespace-pre-wrap break-words rounded bg-black/30 p-2 font-mono text-[11px] leading-4 text-gray-300">
                  {snippet.content}
                </pre>

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    void copySnippet(snippet.id, snippet.content);
                  }}
                  className={`mt-2 w-full rounded border py-1.5 text-[11px] font-medium transition ${
                    copiedId === snippet.id
                      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                      : "border-white/10 text-gray-200 hover:border-violet-400/50 hover:bg-violet-500/10"
                  }`}
                >
                  {copiedId === snippet.id ? "✓ Copied to clipboard!" : "Copy snippet"}
                </button>
              </article>
            ))}

            {filtered.length === 0 && (
              <p className="py-8 text-center text-xs text-gray-500">
                {snippets.length === 0
                  ? "No snippets yet. Click + Add to save one."
                  : "No matching snippets found."}
              </p>
            )}
          </div>
        </section>

        {/* Edit Snippet Modal */}
        {editingSnippet && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setEditingSnippet(null)}
          >
            <div
              className="w-full max-w-lg rounded-xl border border-white/10 bg-[#17181d] p-5"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 className="mb-4 text-sm font-semibold">Edit Snippet</h2>

              <input
                value={editingSnippet.title}
                onChange={(event) =>
                  setEditingSnippet({
                    ...editingSnippet,
                    title: event.target.value,
                  })
                }
                placeholder="Snippet title"
                className="mb-3 w-full rounded-lg border border-white/10 bg-[#101114] p-2.5 text-xs text-white outline-none focus:border-violet-500"
              />

              <textarea
                value={editingSnippet.content}
                onChange={(event) =>
                  setEditingSnippet({
                    ...editingSnippet,
                    content: event.target.value,
                  })
                }
                placeholder="Snippet content"
                rows={8}
                className="mb-4 w-full resize-y rounded-lg border border-white/10 bg-[#101114] p-2.5 font-mono text-xs text-white outline-none focus:border-violet-500"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingSnippet(null)}
                  className="rounded-lg px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  onClick={saveEditedSnippet}
                  disabled={
                    !editingSnippet.title.trim() || !editingSnippet.content.trim()
                  }
                  className="rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-violet-500 disabled:opacity-40"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Notification Toast */}
        {message && (
          <p className="mt-2 text-center text-[11px] text-violet-300">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
