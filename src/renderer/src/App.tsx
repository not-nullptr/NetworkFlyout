import { useEffect } from "react";
import Border from "./components/Border";
import Flyout from "./components/Flyout";
import "@renderer/css/Global.css";
const remote = window.require(
	"@electron/remote",
) as typeof import("@electron/remote");

function App() {
	useEffect(() => {
		function accentListener(e: any, newColor: string) {
			// convert hex to rgb
			const rgb = newColor
				.replace("#", "")
				.match(/.{1,2}/g)
				?.map((x) => parseInt(x, 16));
			console.log(
				`rgba(${rgb?.[0] ?? 0}, ${rgb?.[1] ?? 0}, ${rgb?.[2] ?? 0}, ${
					rgb?.[3]
						? (parseFloat((rgb[3] / 255).toString().slice(0, 4)) /
								100) *
						  70
						: 0
				})`,
			);
			const root = document.querySelector(":root") as HTMLElement;
			root.style.setProperty(
				"--aero-accent",
				`rgba(${rgb?.[0] ?? 0}, ${rgb?.[1] ?? 0}, ${rgb?.[2] ?? 0}, ${
					rgb?.[3]
						? (parseFloat((rgb[3] / 255).toString().slice(0, 4)) /
								100) *
						  70
						: 0
				})`,
			);
		}
		accentListener(null, remote.systemPreferences.getAccentColor());
		remote.systemPreferences.on("accent-color-changed", accentListener);
		return () => {
			remote.systemPreferences.removeListener(
				"accent-color-changed",
				accentListener,
			);
		};
	}, []);
	return (
		<div className="border-container">
			<Border>
				<Flyout />
			</Border>
		</div>
	);
}

export default App;
