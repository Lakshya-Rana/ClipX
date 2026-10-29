export type Snippet = {
  id: number;
  title: string;
  content: string;
  category: string;
};

export type ClipboardItem = {
  id: number;
  content: string;
  copiedAt: string;
};

declare global {
  interface Window {
    clipx?: {
      platform: string;
      closeWindow: () => void;
      minimizeWindow: () => void;
      toggleMaximize: () => void;
      toggleFullScreen: () => void;
      minimizeToIcon: () => void;
      restoreClipX: () => void;
      dragStart: (x: number, y: number) => void;
      dragMove: (x: number, y: number) => void;
      dragEnd: (x: number, y: number) => void;

      // Snippets API
      getSnippets: () => Promise<Snippet[]>;
      saveSnippets: (snippets: Snippet[]) => Promise<Snippet[]>;

      // Clipboard API
      getClipboard: () => Promise<ClipboardItem[]>;
      writeClipboard: (text: string) => Promise<boolean>;
      deleteClipboardItem: (id: number) => Promise<ClipboardItem[]>;
      clearClipboard: () => Promise<ClipboardItem[]>;
      onClipboardUpdated: (
        callback: (history: ClipboardItem[]) => void
      ) => () => void;
    };
  }
}
