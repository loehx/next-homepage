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
                <Area
                    tag="h1"
                    appear={10}
                    disappear={10}
                    text="If you want to get your project done..."
                    className={styles.title}
                />
                <Area
                    appear={10}
                    disappear={10}
                    initialAppearDelay={5000}
                    parallax={0.9}
                    blurryAppear={30}
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
