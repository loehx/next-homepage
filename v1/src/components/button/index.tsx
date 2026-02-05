import React from "react";
import cx from "classnames";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    primary: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    className,
    children,
    ...props
}) => {
    return (
        <button
            className={cx(
                {
                    "p-2": true,
                },
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
};
