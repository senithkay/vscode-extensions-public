import React, { type FC, type PropsWithChildren, type ReactNode } from "react";
import { Divider } from "../../../components/Divider";

interface Props extends PropsWithChildren {
	title: ReactNode;
	showDivider?: boolean;
}

export const RightPanelSection: FC<Props> = ({ title, children, showDivider = true }) => {
	return (
		<>
			{showDivider && <Divider />}
			<div className="flex flex-col gap-3">
				<div className="text-base">{title}</div>
				<div className="flex flex-col gap-1">{children}</div>
			</div>
		</>
	);
};

export interface IRightPanelSectionItem {
	label: string;
	value: string | number;
}

export const RightPanelSectionItem: FC<IRightPanelSectionItem> = ({ label, value }) => {
	return (
		<div className="flex flex-wrap items-center gap-0.5 duration-200 hover:bg-vsc-editorHoverWidget-background">
			<p className="flex-1 font-light">{label}</p>
			<p>{value}</p>
		</div>
	);
};
