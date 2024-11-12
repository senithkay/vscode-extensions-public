/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import React, { type FC, type ReactNode } from "react";
import { Button } from "../Button";
import { Divider } from "../Divider";

export interface HeaderTag {
	label: string;
	value: string;
	onClick?: () => void;
	onClickTitle?: string;
	tooltip?: string;
}
interface Props {
	title: string;
	secondaryTitle?: string;
	secondaryIcon?: ReactNode;
	tags?: HeaderTag[];
	buttons?: { onClick: () => any; label: string }[];
}

export const HeaderSection: FC<Props> = ({ title, secondaryTitle, tags = [], buttons = [], secondaryIcon }) => {
	const [tagsRef] = useAutoAnimate();

	return (
		<div className="flex flex-col gap-2">
			<div className="flex gap-2">
				<div className="flex flex-1 flex-wrap items-center gap-3 md:mb-1">
					<h1 className="font-bold text-2xl md:text-3xl">{title}</h1>
					<h2 className="hidden font-thin text-2xl tracking-wider opacity-30 sm:block md:text-3xl">{secondaryTitle}</h2>
				</div>
				<span className="mt-1">{secondaryIcon}</span>
			</div>
			{tags.length > 0 && (
				<div className="flex flex-wrap gap-1 lg:gap-2" ref={tagsRef}>
					{tags.map((item, index) => (
						<React.Fragment key={item.label}>
							<div>
								<span className="font-thin">{item.label}:</span>{" "}
								{item.onClick ? (
									<VSCodeLink onClick={item.onClick} className="text-vsc-foreground" title={item.onClickTitle}>
										{item.value}
									</VSCodeLink>
								) : (
									<span title={item.tooltip}>{item.value}</span>
								)}
							</div>
							{index !== tags.length - 1 && <div className="hidden font-thin opacity-50 md:block">|</div>}
						</React.Fragment>
					))}
				</div>
			)}
			{buttons.length > 0 && (
				<div className="mb-4 flex flex-wrap gap-2">
					{buttons.map((item) => (
						<Button key={item.label} appearance="secondary" onClick={item.onClick}>
							{item.label}
						</Button>
					))}
				</div>
			)}
			<Divider className="mt-2" />
		</div>
	);
};
