import { Divider } from "@wso2-enterprise/ui-toolkit";
import React, { FC, PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
    title: string;
    showDivider?: boolean;
}

export const RightPanelSection: FC<Props> = ({ title, children, showDivider = true }) => {
    return (
        <>
            {showDivider && <Divider />}
            <div className="text-base">{title}</div>
            <div className="flex flex-col gap-1">{children}</div>
        </>
    );
};

export interface IRightPanelSectionItem {
    label: string;
    value: string | number;
}

export const RightPanelSectionItem: FC<IRightPanelSectionItem> = ({ label, value }) => {
    return (
        <div className="flex justify-between items-center mt">
            <div className="font-light">{label}</div>
            <div>{value}</div>
        </div>
    );
};
