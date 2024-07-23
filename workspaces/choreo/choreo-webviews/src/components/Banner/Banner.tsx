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
					"flex items-center gap-2 rounded border-1 p-2": true,
					"border-vsc-list-warningForeground bg-vsc-inputValidation-warningBackground text-vsc-list-warningForeground": type === "warning",
					"border-vsc-list-errorForeground bg-vsc-inputValidation-errorBackground text-vsc-list-errorForeground": type === "error",
					"border-vsc-editorInfo-foreground bg-vsc-inputValidation-infoBackground text-vsc-editorInfo-foreground": type === "info",
				},
				className,
			)}
		>
			<i className="codicon codicon-warning" />
			<div className="flex-1">{children}</div>
		</div>
	);
};
