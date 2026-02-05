import React, { useEffect, useState } from "react";
import cx from "classnames";
import styles from "./entryAnimationOne.module.css";

export const EntryAnimationOne: React.FC = () => {
    const [run, setRun] = useState(false);
    useEffect(() => {
        setTimeout(() => setRun(true), 0);
    });

    return (
        <div className={run ? styles.run : ""}>
            <div className={styles.sun__block}>
                <div className={styles.sun__wrapper}>
                    <div className={styles.sun}>
                        <div
                            className={`${styles.sun__part} ${styles["sun__part--1"]}`}
                        ></div>
                        <div
                            className={`${styles.sun__part} ${styles["sun__part--2"]}`}
                        ></div>
                        <div
                            className={`${styles.sun__part} ${styles["sun__part--3"]}`}
                        ></div>
                        <div
                            className={`${styles.sun__part} ${styles["sun__part--4"]}`}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
