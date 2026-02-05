import React from "react";
import styles from "./closeButton.module.css";
import cx from "classnames";

export type CloseButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const CloseButton: React.FC<CloseButtonProps> = ({
    className,
    ...props
}) => {
    return (
        <button
            className={cx(styles.closeButton, className)}
            {...props}
        ></button>
    );
};
