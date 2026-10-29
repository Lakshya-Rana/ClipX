
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type TitlebarProps = {
  title?: string;
  badge?: string;
};

export default function Titlebar({
  title = "ClipX",
  badge = "",
}: TitlebarProps) {
  const pathname = usePathname();

  const pages = [
    { name: "Snippets", href: "/snippets" },
    // { name: "Clipboard", href: "/clipboard" },
  ];

  return (
    <header
      className="sticky top-0 z-50 flex w-full shrink-0 items-center justify-between border-b border-white/5 bg-[#141518]/95 px-3 py-2 backdrop-blur-md select-none"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      {/* Window controls */}
      <div
        className="flex items-center gap-1.5"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <button
          type="button"
          aria-label="Quit ClipX"
          title="Quit ClipX"
          onClick={() => window.clipx?.closeWindow()}
          className="h-3 w-3 rounded-full border border-[#e0443e] bg-[#ff5f57] transition hover:brightness-110"
        />

        <button
          type="button"
          aria-label="Minimize ClipX"
          title="Minimize ClipX"
          onClick={() => window.clipx?.minimizeWindow()}
          className="h-3 w-3 rounded-full border border-[#dea123] bg-[#febc2e] transition hover:brightness-110"
        />

        <button
          type="button"
          aria-label="Toggle fullscreen"
          title="Toggle fullscreen"
          onClick={() => {
            if (window.clipx?.toggleFullScreen) {
              window.clipx.toggleFullScreen();
            } else {
              window.clipx?.toggleMaximize();
            }
          }}
          className="h-3 w-3 rounded-full border border-[#1dad2b] bg-[#28c840] transition hover:brightness-110"
        />
      </div>

      {/* Page navigation */}
      <nav
        aria-label="Main navigation"
        className="absolute left-1/2 flex -translate-x-1/2 items-center gap-0.5"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        {pages.map((page) => {
          const isActive = pathname === page.href;

          return (
            <Link
              key={page.href}
              href={page.href}
              aria-current={isActive ? "page" : undefined}
              className={`rounded px-2.5 py-1 text-[11px] font-medium transition ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-gray-500 hover:bg-white/5 hover:text-gray-200"
              }`}
            >
              {page.name}
            </Link>
          );
        })}
      </nav>

      {/* App badge */}
      <span
        className="px-1.5 text-[11px] text-white"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        {badge || title}
      </span>
    </header>
  );
}
