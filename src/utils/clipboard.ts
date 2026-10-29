export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Electron IPC API (writes directly to OS clipboard via native binding)
  if (typeof window !== "undefined" && window.clipx?.writeClipboard) {
    try {
      const success = await window.clipx.writeClipboard(text);
      if (success) return true;
    } catch (e) {
      console.warn("Electron writeClipboard failed, trying browser fallback:", e);
    }
  }

  // 2. Browser Clipboard API
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.warn("navigator.clipboard.writeText failed, trying execCommand fallback:", e);
    }
  }

  // 3. Fallback using hidden textarea
  if (typeof document !== "undefined") {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "-9999px";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (success) return true;
    } catch (e) {
      console.error("execCommand copy fallback failed:", e);
    }
  }

  return false;
}

