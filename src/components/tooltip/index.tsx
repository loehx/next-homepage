import React, { useEffect, useRef, useState } from "react";
import cx from "classnames";
import styles from "./tooltip.module.css";

export const Tooltip: React.FC<any> = ({
    children,
    className,
    text,
    ...props
}) => {
    const [show, setShow] = useState(false);

    return (
        <div
            {...props}
            className={cx(className, styles.container, "relative")}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            aria-label={text}
        >
            <div className={`rounded ${styles.tooltip}`}>{text}</div>
            {children}
        </div>
    );
};
