import React from "react";
import styles from "./stage.module.css";
import { DarkWavyBackground } from "../components/wallpaper";
import { Area } from "../components/Area";
import { Stats } from "./Stats";

export const Stage: React.FC = () => {
    return (
        <section className={styles.stage}>
            <DarkWavyBackground />
            <div className={styles.container}>
                <h1 className={styles.title}>Wanna get shit done?</h1>
                <Area
                    appear={10}
                    disappear={10}
                    parallax={0.9}
                    text="Hire a professional"
                    className={styles.subtitle}
                />
            </div>
            <div className={styles.container}>
                <Stats />
            </div>
        </section>
    );
};
