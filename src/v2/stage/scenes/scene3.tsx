import React from "react";
import { Scene } from "./Scene";
import styles from "../stage.module.css";

export const Scene3: React.FC = () => {
    return (
        <Scene offset={200} height={100} className={styles.container}>
            {/* Scene 3 content */}
        </Scene>
    );
};
