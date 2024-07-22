import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import React, { FC, type HTMLProps, type PropsWithChildren, forwardRef } from "react";

interface Props extends PropsWithChildren {
	className?: HTMLProps<HTMLElement>["className"];
	appearance?: "primary" | "secondary" | "icon";
	title?: string;
	disabled?: boolean;
	onClick?: (event: React.MouseEvent<HTMLElement | SVGSVGElement>) => void;
}

export const Button = forwardRef<any, Props>((props, ref) => {
	const { children, disabled, ...rest } = props;

	return (
		<VSCodeButton {...rest} disabled={disabled || undefined} ref={ref}>
			{children}
		</VSCodeButton>
	);
});
Button.displayName = "Button";
