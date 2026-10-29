const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("clipx", {
  platform: process.platform,

  // Window controls
  closeWindow: () => ipcRenderer.send("clipx:close-window"),
  minimizeWindow: () => ipcRenderer.send("clipx:minimize-window"),
  toggleMaximize: () => ipcRenderer.send("clipx:toggle-maximize"),
  toggleFullScreen: () => ipcRenderer.send("clipx:toggle-fullscreen"),

  // Mini window controls
  minimizeToIcon: () => ipcRenderer.send("clipx:minimize-to-icon"),
  restoreClipX: () => ipcRenderer.send("clipx:restore"),
  dragStart: (x, y) => ipcRenderer.send("clipx:drag-start", x, y),
  dragMove: (x, y) => ipcRenderer.send("clipx:drag-move", x, y),
  dragEnd: (x, y) => ipcRenderer.send("clipx:drag-end", x, y),

  // Persistent Snippets API
  getSnippets: () => ipcRenderer.invoke("clipx:get-snippets"),
  saveSnippets: (snippets) => ipcRenderer.invoke("clipx:save-snippets", snippets),
});
