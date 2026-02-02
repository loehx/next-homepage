import React from "react";
import styles from "./stage.module.css";
import { DarkWavyBackground } from "../components/wallpaper";
import { AnimationTimeLine } from "../components/AnimationTimeLine";
import { Scene1 } from "./scenes/scene1";
import { Scene2 } from "./scenes/scene2";
import { Menu } from "../components/menu";
import { LogoWrapper } from "../components/logo/LogoWrapper";

export const Stage: React.FC = () => {
    return (
        <section className={styles.stage}>
            <Menu />
            <LogoWrapper />
            <Scene1 />
            <Scene2 />
            {/* <AnimationTimeLine /> */}
        </section>
    );
};
