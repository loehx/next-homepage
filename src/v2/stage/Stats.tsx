import React from "react";
import styles from "./Stats.module.css";

export const Stats: React.FC = () => {
    return (
        <div className={styles.stats}>
            <div className={styles.stat}>
                <span className={styles.number}>16+</span>
                <span className={styles.label}>years of experience</span>
            </div>
            <div className={styles.stat}>
                <span className={styles.number}>20+</span>
                <span className={styles.label}>projects delivered</span>
            </div>
            <div className={styles.stat}>
                <span className={styles.number}>3+</span>
                <span className={styles.label}>years of freelancing</span>
            </div>
            <div className={styles.quote}>
                The difference between a fast developer is not 20% or 50%
                faster, but <span className={styles.emphasis}>2x, 5x, 10x</span>
            </div>
        </div>
    );
};

export default Stats;
