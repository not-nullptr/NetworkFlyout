import { app, shell, BrowserWindow, Tray, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import main, { enable } from "@electron/remote/main";

main.initialize();

let trayIcon: Tray | null = null;
let win: BrowserWindow | null = null;

function createWindow(): void {
	const mainWindow = new BrowserWindow({
		width: 900,
		height: 670,
		autoHideMenuBar: true,
		...(process.platform === "linux" ? { icon } : {}),
		webPreferences: {
			preload: join(__dirname, "../preload/index.js"),
			sandbox: false,
			nodeIntegration: true,
			contextIsolation: false,
			webSecurity: false,
		},
		frame: false,
		transparent: true,
		resizable: false,
		skipTaskbar: true,
		thickFrame: true,
	});
	win = mainWindow;
	mainWindow.setHasShadow(true);
	mainWindow.setIgnoreMouseEvents(true);
	mainWindow.setOpacity(0);
	mainWindow.setAlwaysOnTop(true, "pop-up-menu");
	enable(mainWindow.webContents);
	mainWindow.on("blur", () => {
		mainWindow.setOpacity(0);
		mainWindow.setIgnoreMouseEvents(true);
	});
	mainWindow.webContents.openDevTools({
		mode: "detach",
	});
	mainWindow.on("ready-to-show", () => {
		mainWindow.show();
	});

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		return { action: "deny" };
	});

	// HMR for renderer base on electron-vite cli.
	// Load the remote URL for development or the local html file for production.
	if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
		mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
	} else {
		mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
	}
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	trayIcon = new Tray("resources/icons/pnidui_3048.ico");
	trayIcon.setToolTip("Network");
	trayIcon.on("click", (_, b) => {
		if (!win) return;
		const windowSize = win.getSize();
		win.setPosition(b.x - windowSize[0] / 2 - 16, b.y - windowSize[1]);
		if (win.getOpacity() === 0) {
			win.setOpacity(1);
			win.setIgnoreMouseEvents(false);
			win.focus();
		} else {
			win.setOpacity(0);
			win.setIgnoreMouseEvents(true);
		}
	});
	global.tray = trayIcon;
	// Set app user model id for windows
	electronApp.setAppUserModelId("com.electron");

	// Default open or close DevTools by F12 in development
	// and ignore CommandOrControl + R in production.
	// see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
	app.on("browser-window-created", (_, window) => {
		optimizer.watchWindowShortcuts(window);
	});

	createWindow();

	app.on("activate", function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
