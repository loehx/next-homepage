import React, { useEffect, useState } from "react";
import styles from "./button.module.css";
import { RichText, RichTextValue } from "@components/rich-text";
import { Entry, AssetEntry } from "data/definitions";
import { useInitializeClass } from "src/hooks";
import cx from "classnames";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text: string;
    primary: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    className,
    text,
    ...props
}) => {
    return (
        <button
            className={cx(styles.btn, styles["btn--primary"], className)}
            {...props}
        >
            {text}
        </button>
    );
};
