import styles from "@renderer/css/Border.module.css";

export default function Border(props: { children: React.ReactNode }) {
	return (
		<div className={styles.windowFrame}>
			<div className={styles.contentsContainer}>
				<div className={styles.windowContents}>{props.children}</div>
			</div>
		</div>
	);
}
