import React from "react";
import styles from "./stage.module.css";
import { DarkWavyBackground } from "../components/wallpaper";
import { Scene1 } from "./scenes/scene1";
import { Scene2 } from "./scenes/scene2";

export const Stage: React.FC = () => {
    return (
        <section className={styles.stage}>
            <DarkWavyBackground parallax={0.4} />
            <Scene1
                delay={1500}
                duration={2000}
                lines={"Code Design Web".split(" ")}
            />
            <Scene2 />
        </section>
    );
};
