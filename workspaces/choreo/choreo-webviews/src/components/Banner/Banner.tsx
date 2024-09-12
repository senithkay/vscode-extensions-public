/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import classNames from "classnames";
import React, { type HTMLProps } from "react";
import type { PropsWithChildren, ReactNode } from "react";
import type { FC } from "react";
import { Codicon } from "../Codicon";

interface Props {
	className?: HTMLProps<HTMLElement>["className"];
	type?: "warning" | "error" | "info";
	title: ReactNode;
	subTitle?: ReactNode;
}

export const Banner: FC<Props> = ({ className, title, subTitle, type }) => {
	return (
		<div
			className={classNames(
				{
					"col-span-full flex flex-col rounded border-1 p-2": true,
					"border-vsc-list-warningForeground bg-vsc-inputValidation-warningBackground text-vsc-list-warningForeground": type === "warning",
					"border-vsc-list-errorForeground bg-vsc-inputValidation-errorBackground text-vsc-list-errorForeground": type === "error",
					"border-vsc-editorInfo-foreground bg-vsc-inputValidation-infoBackground text-vsc-editorInfo-foreground": type === "info",
					"bg-vsc-editorIndentGuide-background": type === undefined,
				},
				className,
			)}
		>
			<div className="flex items-center gap-2">
				<Codicon name="warning" />
				<div className="line-clamp-1 flex-1">{title}</div>
			</div>
			{subTitle && <p className="font-light text-[10px]">{subTitle}</p>}
		</div>
	);
};
