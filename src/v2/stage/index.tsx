import React from "react";
import styles from "./stage.module.css";
import { DarkWavyBackground } from "../components/wallpaper";
import { AnimationTimeLine } from "../components/AnimationTimeLine";
import { Scene1 } from "./scenes/scene1";
import { Scene2 } from "./scenes/scene2";

export const Stage: React.FC = () => {
    return (
        <section className={styles.stage}>
            <Scene1 />
            <Scene2 />
            <AnimationTimeLine />
        </section>
    );
};
