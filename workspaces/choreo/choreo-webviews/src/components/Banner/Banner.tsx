import classNames from "classnames";
import React, { type HTMLProps } from "react";
import type { PropsWithChildren } from "react";
import type { FC } from "react";

interface Props extends PropsWithChildren {
	className?: HTMLProps<HTMLElement>["className"];
	type?: "warning" | "error" | "info";
}

export const Banner: FC<Props> = ({ className, children, type }) => {
	return (
		<div
			className={classNames(
				{
					"flex gap-2 p-2 items-center border-1 rounded": true,
					"bg-vsc-inputValidation-warningBackground border-vsc-list-warningForeground text-vsc-list-warningForeground": type === "warning",
					"bg-vsc-inputValidation-errorBackground border-vsc-list-errorForeground text-vsc-list-errorForeground": type === "error",
					"bg-vsc-inputValidation-infoBackground border-vsc-editorInfo-foreground text-vsc-editorInfo-foreground": type === "info",
				},
				className,
			)}
		>
			<i className="codicon codicon-warning" />
			<div className="flex-1">{children}</div>
		</div>
	);
};
