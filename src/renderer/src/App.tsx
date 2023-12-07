import Border from "./components/Border";
import Flyout from "./components/Flyout";
import "@renderer/css/Global.css";

function App() {
	return (
		<div className="border-container">
			<Border>
				<Flyout />
			</Border>
		</div>
	);
}

export default App;
