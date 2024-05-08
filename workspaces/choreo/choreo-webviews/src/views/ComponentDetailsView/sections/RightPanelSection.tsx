import React, { FC, PropsWithChildren, ReactNode } from "react";
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
        <div className="flex flex-wrap items-center hover:bg-vsc-editorHoverWidget-background duration-200 gap-0.5">
            <p className="font-light flex-1">{label}</p>
            <p>{value}</p>
        </div>
    );
};
