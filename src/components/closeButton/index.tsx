import React, { useEffect, useState } from "react";
import styles from "./closeButton.module.css";
import { RichText, RichTextValue } from "@components/rich-text";
import { Entry, AssetEntry } from "data/definitions";
import { useInitializeClass } from "src/hooks";
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
