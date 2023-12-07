import styles from "@renderer/css/Flyout.module.css";
import { Interface, Netsh, toUnicodeVariant } from "@renderer/util";
import React, { useEffect } from "react";
const remote = window.require(
	"@electron/remote",
) as typeof import("@electron/remote");

function useSize(el: HTMLDivElement | null) {
	React.useEffect(() => {
		if (!el) return;
		const resizeObserver = new ResizeObserver(() => {
			const win = remote.getCurrentWindow();
			const flyoutRect = el.getBoundingClientRect();
			const width = Math.round(flyoutRect.width) + 32;
			const height = Math.round(flyoutRect.height) + 36;
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
		});

		resizeObserver.observe(el);
	}, [el]);
}

export default function Flyout() {
	const tray = remote.getGlobal("tray") as Electron.Tray;
	const [interfaces, setInterfaces] = React.useState<Interface[]>([]);
	useEffect(() => {
		Promise.all([
			(async () => {
				const output = await Netsh.getInterfaces();
				tray.setToolTip(
					`${output[0]?.name}\n${toUnicodeVariant(
						"Internet access",
						"is",
						"",
					)}`,
				);
				setInterfaces(output);
			})(),
		]);
	}, []);
	const [el, setEl] = React.useState<HTMLDivElement | null>(null);
	useSize(el);
	return (
		<div ref={setEl} className={styles.flyout}>
			<div className={styles.networkInfo}>
				<div>Currently connected to:</div>
				<div className={styles.networkDetails}>
					<img
						className={styles.icon}
						src="/icons/pnidui_2400-32-32.png"
					/>
					<div>
						<div className={styles.networkName}>
							{interfaces[0]?.name}
						</div>
						<div className={styles.networkStatus}>
							Internet access
						</div>
					</div>
				</div>
			</div>
			<div
				style={{
					// allow \n
					whiteSpace: "pre-wrap",
				}}
			></div>
		</div>
	);
}
