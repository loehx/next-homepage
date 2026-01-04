import React from "react";
import styles from "./stage.module.css";
import { DarkWavyBackground } from "../components/wallpaper";
import { AnimatedWaves } from "../../contentParts/stage/AnimatedWaves";

export const Stage: React.FC = () => {
    return (
        <section className={styles.stage}>
            <DarkWavyBackground />
            <div className={styles.container}>
                <h1 className={styles.title}>Welcome to Version 2</h1>
                <p className={styles.subtitle}>This is the beginning of the new website.</p>
            </div>
            <div className={styles.waves}>
                <AnimatedWaves />
            </div>
        </section>
    );
};

export default Stage;

