import { FC } from "react";
import styles from "./terminalCursor.module.css";

/** Blinking block cursor (terminal-style), sized with parent font-size via `em`. */
export const TerminalCursor: FC = () => (
    <span className={styles.cursor} aria-hidden />
);
