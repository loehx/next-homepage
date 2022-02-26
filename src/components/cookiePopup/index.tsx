import React, { useEffect, useRef, useState } from "react";
import styles from "./cookiePopup.module.css";
import { RichText, RichTextValue } from "@components/rich-text";
import { Entry, AssetEntry } from "data/definitions";
import { useInitializeClass, useIsMobile } from "src/hooks";
import cx from "classnames";
import { CloseButton } from "@components/closeButton";

export interface CookiePopupProps extends Entry {
    text: RichTextValue;
    acceptButtonText: string;
    backgroundImage: AssetEntry;
    cookiePopupCss: string;
}

export const CookiePopup: React.FC<CookiePopupProps> = (props) => {
    const [hidden, setHidden] = useState(false);
    const popupRef = useRef(null);
    const classNames = useInitializeClass(
        styles.initializing,
        styles.cookiePopupWrapper,
        2000,
    );
    useEffect(() => {
        if (popupRef.current) {
            const style = `background-image: url(${props.backgroundImage.url}); ${props.cookiePopupCss}`;
            (popupRef.current as any).setAttribute("style", style);
        }
    }, []);
    return (
        <div className={cx(classNames, hidden && styles.hidden)}>
            <div className={styles.cookiePopup} ref={popupRef}>
                <RichText document={props.text} />
                <CloseButton onClick={() => setHidden(true)} />
            </div>
        </div>
    );
};
