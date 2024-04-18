import React, { FC, HTMLProps, PropsWithChildren } from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

interface Props extends PropsWithChildren {
    className?: HTMLProps<HTMLElement>["className"];
    appearance?: "primary" | "secondary" | "icon";
    title?: string;
    disabled?: boolean;
    onClick?: (event: React.MouseEvent<HTMLElement | SVGSVGElement>) => void;
}

export const Button: FC<Props> = ({ children, disabled, ...rest }) => {
    return (
        <VSCodeButton {...rest} disabled={disabled || undefined}>
            {children}
        </VSCodeButton>
    );
};
