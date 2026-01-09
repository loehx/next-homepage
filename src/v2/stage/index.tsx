import React from "react";
import styles from "./stage.module.css";
import { DarkWavyBackground } from "../components/wallpaper";
import { Scene1 } from "./scenes/scene1";
import { Scene2 } from "./scenes/scene2";
import { Scene3 } from "./scenes/scene3";

export const Stage: React.FC = () => {
    return (
        <section className={styles.stage}>
            <DarkWavyBackground parallax={0.3} />
            <Scene1
                delay={500}
                duration={2000}
                distance={0.8}
                onAnimationEnd={() => console.log("Scene1 completed")}
            />
            <Scene2
                delay={1500}
                duration={2000}
                lines={["Design", "Develop", "Launch"]}
            />
            <Scene3 />
        </section>
    );
};
