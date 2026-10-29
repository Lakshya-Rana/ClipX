import { app, BrowserWindow, ipcMain, screen, clipboard } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let miniWindow = null;

let dragOffsetX = 0;
let dragOffsetY = 0;

const MINI_SIZE = 58;
const SNAP_MARGIN = 12;

let snippetsFile = "";
let clipboardFile = "";

let snippets = [];
let clipboardHistory = [];
let lastClipboardText = "";
const MAX_HISTORY = 100;

async function loadPersistentData() {
  snippetsFile = path.join(app.getPath("userData"), "snippets.json");
  clipboardFile = path.join(app.getPath("userData"), "clipboard.json");
  try {
    const raw = await fs.readFile(snippetsFile, "utf8");
    const parsed = JSON.parse(raw);
    snippets = Array.isArray(parsed) ? parsed : [];
  } catch {
    snippets = [];
  }

  try {
    const raw = await fs.readFile(clipboardFile, "utf8");
    const parsed = JSON.parse(raw);
    clipboardHistory = Array.isArray(parsed) ? parsed : [];
    if (clipboardHistory.length > 0) {
      lastClipboardText = clipboardHistory[0].content;
    }
  } catch {
    clipboardHistory = [];
  }
}

async function persistSnippets() {
  try {
    await fs.mkdir(path.dirname(snippetsFile), { recursive: true });
    await fs.writeFile(snippetsFile, JSON.stringify(snippets, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save snippets:", err);
  }
}
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 590,
    height: 580,
    minWidth: 340,
    minHeight: 400,
    title: "ClipX",
    frame: false,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    backgroundColor: "#101114",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  if (!app.isPackaged) {
    mainWindow.loadURL("http://localhost:3000");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../out/index.html"));
  }

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow?.webContents.send("clipx:clipboard-updated", clipboardHistory);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    if (miniWindow && !miniWindow.isDestroyed()) {
      miniWindow.close();
    }
  });
}

function createMiniWindow() {
  if (miniWindow && !miniWindow.isDestroyed()) {
    miniWindow.showInactive();
    return;
  }

  const display = screen.getPrimaryDisplay();
  const { x, y, width, height } = display.workArea;

  const defaultX = x + width - MINI_SIZE - SNAP_MARGIN;
  const defaultY = y + height - MINI_SIZE - 60;

  miniWindow = new BrowserWindow({
    x: defaultX,
    y: defaultY,
    width: MINI_SIZE,
    height: MINI_SIZE,
    frame: false,
    transparent: true,
    resizable: false,
    movable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    focusable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  miniWindow.setAlwaysOnTop(true, "floating");
  miniWindow.loadFile(path.join(__dirname, "mini.html"));

  miniWindow.on("closed", () => {
    miniWindow = null;
  });
}

// Window management IPC
ipcMain.on("clipx:close-window", () => {
  app.quit();
});

ipcMain.on("clipx:minimize-window", () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.hide();
  createMiniWindow();
});

ipcMain.on("clipx:minimize-to-icon", () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.hide();
  createMiniWindow();
});

ipcMain.on("clipx:restore", () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (miniWindow && !miniWindow.isDestroyed()) {
    miniWindow.hide();
  }
  mainWindow.show();
  mainWindow.focus();
  mainWindow.webContents.send("clipx:clipboard-updated", clipboardHistory);
});

const toggleFullScreen = () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.setFullScreen(!mainWindow.isFullScreen());
};

ipcMain.on("clipx:toggle-maximize", toggleFullScreen);
ipcMain.on("clipx:maximize-window", toggleFullScreen);
ipcMain.on("clipx:toggle-fullscreen", toggleFullScreen);

// Mini window drag handling
ipcMain.on("clipx:drag-start", (_event, screenX, screenY) => {
  if (!miniWindow || miniWindow.isDestroyed()) return;
  const [winX, winY] = miniWindow.getPosition();
  dragOffsetX = screenX - winX;
  dragOffsetY = screenY - winY;
});

ipcMain.on("clipx:drag-move", (_event, screenX, screenY) => {
  if (!miniWindow || miniWindow.isDestroyed()) return;
  const targetX = Math.round(screenX - dragOffsetX);
  const targetY = Math.round(screenY - dragOffsetY);

  const display = screen.getDisplayNearestPoint({
    x: targetX + MINI_SIZE / 2,
    y: targetY + MINI_SIZE / 2,
  });

  const { x, y, width, height } = display.workArea;
  const boundedX = Math.max(x, Math.min(targetX, x + width - MINI_SIZE));
  const boundedY = Math.max(y, Math.min(targetY, y + height - MINI_SIZE));

  miniWindow.setPosition(boundedX, boundedY);
});

ipcMain.on("clipx:drag-end", () => {
  if (!miniWindow || miniWindow.isDestroyed()) return;
  const [currentX, currentY] = miniWindow.getPosition();
  const display = screen.getDisplayNearestPoint({
    x: currentX + MINI_SIZE / 2,
    y: currentY + MINI_SIZE / 2,
  });
  const { x, y, width, height } = display.workArea;
  miniWindow.setPosition(
    Math.max(x, Math.min(currentX, x + width - MINI_SIZE)),
    Math.max(y, Math.min(currentY, y + height - MINI_SIZE))
  );
});

ipcMain.handle("clipx:get-snippets", () => {
  return snippets;
});

ipcMain.handle("clipx:save-snippets", async (_event, newSnippets) => {
  snippets = Array.isArray(newSnippets) ? newSnippets : [];
  await persistSnippets();
  return snippets;
});

app.whenReady().then(async () => {
  await loadPersistentData();
  createWindow();

  app.on("activate", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.focus();
    } else if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
