import React from "react";
import { Area } from "../components/Area";
import styles from "./Stats.module.css";

export const Stats: React.FC = () => {
    return (
        <div className={styles.stats}>
            <Area appear={10} disappear={10} parallax={0.8}>
                <div>
                    <span>16+</span> years of experience
                </div>
            </Area>
            <Area appear={10} disappear={10} parallax={0.85}>
                <div>
                    <span>20+</span> projects delivered
                </div>
            </Area>
            <Area appear={10} disappear={10} parallax={0.95}>
                <div>
                    <span>3+</span> years of freelancing
                </div>
            </Area>
            <Area appear={10} disappear={10} parallax={0.9}>
                <div className={styles.quote}>
                    The difference between a fast developer is not 20% or 50%
                    faster, but 2x, 5x, 10x
                </div>
            </Area>
        </div>
    );
};

export default Stats;
