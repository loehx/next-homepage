import React from "react";
import { Scene } from "./Scene";
import styles from "../stage.module.css";

export const Scene2: React.FC = () => {
    return (
        <Scene offset={200} height={100} className={styles.container}>
            {/* Scene 2 content */}
        </Scene>
    );
};
