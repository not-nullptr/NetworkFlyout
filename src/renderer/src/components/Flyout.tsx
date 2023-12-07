import styles from "@renderer/css/Flyout.module.css";
import { Interface, NetUtils, Network, toUnicodeVariant } from "@renderer/util";
import React, { useEffect } from "react";
const remote = window.require(
	"@electron/remote",
) as typeof import("@electron/remote");
const childProcess = window.require(
	"child_process",
) as typeof import("child_process");

function useSize(el: HTMLDivElement | null) {
	React.useEffect(() => {
		if (!el) return;
		const resizeObserver = new ResizeObserver(() => {
			const win = remote.getCurrentWindow();
			const flyoutRect = el.getBoundingClientRect();
			const width = Math.round(flyoutRect.width) + 32;
			const height = Math.round(flyoutRect.height) + 36;
			const tray = remote.getGlobal("tray") as Electron.Tray;
			const b = tray.getBounds();
			const windowSize = win.getSize();
			win.setContentSize(width, height);
			win.setSize(width, height);
			win.setMinimumSize(width, height);
			win.setShape([
				{
					x: 0,
					y: 0,
					width: width,
					height: height,
				},
			]);
			const winPosX = Math.round(b.x - windowSize[0] / 2 - 16);
			const winPosY = Math.round(b.y - windowSize[1]);
			win.setPosition(winPosX, winPosY);
		});

		resizeObserver.observe(el);
	}, [el]);
}

export default function Flyout() {
	const tray = remote.getGlobal("tray") as Electron.Tray;
	const [selected, setSelected] = React.useState<
		(Interface & { type: string }) | undefined
	>();
	const [online, setOnline] = React.useState<boolean>(true);
	const [img, setImg] = React.useState("");
	const [wifi, setWifi] = React.useState<Network>();
	useEffect(() => {
		(async () => {
			tray.setToolTip(
				`${wifi?.ssid || selected?.name}\n${toUnicodeVariant(
					online ? "Internet access" : "No Internet access",
					"is",
					"",
				)}`,
			);
		})();
	}, [selected, online]);
	useEffect(() => {
		(async () => {
			const active = await NetUtils.getActiveInterface();
			setSelected(active);
		})();
	}, []);
	useEffect(() => {
		tray.setContextMenu(
			remote.Menu.buildFromTemplate([
				{
					label: "Exit",
					click: () => {
						const win = remote.getCurrentWindow();
						win.close();
					},
				},
			]),
		);
	}, [selected]);
	useEffect(() => {
		async function isOnline() {
			const int = selected;
			if (!int) return;
			const online = await NetUtils.isOnline(int);
			setOnline(online);
			tray.setImage(
				`resources/icons/pnidui_${online ? "3048" : "3035"}.ico`,
			);
			const isWifi = await NetUtils.isWifi();
			if (isWifi) {
				const info = await NetUtils.grabWifiInfo();
				console.log(info);
				setWifi(info);
			}
		}
		isOnline();
		const interval = setInterval(async () => {
			await isOnline();
		}, 5000);
		return () => {
			clearInterval(interval);
		};
	}, [selected]);
	useEffect(() => {
		setImg(`/icons/pnidui_${online ? "2400" : "3035"}-32-32.png`);
	}, [online]);
	const [el, setEl] = React.useState<HTMLDivElement | null>(null);
	useSize(el);
	return (
		<div ref={setEl} className={styles.flyout}>
			<div className={styles.networkInfo}>
				<div>
					{online ? "Currently connected to:" : "Not connected"}
				</div>
				<div className={styles.networkDetails}>
					<img className={styles.icon} src={img} />
					<div>
						<div
							className={styles.networkName}
							style={{
								fontWeight: online ? undefined : "unset",
							}}
						>
							{online
								? wifi?.ssid || selected?.name
								: "No networks are available"}
						</div>
						<div className={styles.networkStatus}>
							{online ? (
								"Internet access"
							) : (
								<a
									href="#"
									onClick={() =>
										childProcess.exec(
											"msdt.exe -skip TRUE -path c:\\windows\\diagnostics\\system\\networking -ep NetworkDiagnosticsPNI",
										)
									}
								>
									Troubleshoot
								</a>
							)}
						</div>
					</div>
				</div>
			</div>
			<div className={styles.networkAndSharingContainer}>
				<a
					href="#"
					onClick={() => {
						childProcess.exec(
							"control /name Microsoft.NetworkandSharingCenter",
						);
						const win = remote.getCurrentWindow();
						win.setOpacity(0);
						win.setIgnoreMouseEvents(true);
					}}
				>
					Open Network and Sharing Center
				</a>
			</div>
		</div>
	);
}
