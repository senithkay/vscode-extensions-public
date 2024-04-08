import React from "react";
import { PropsWithChildren } from "react";
import { FC } from "react";
import classNames from "classnames";

interface Props extends PropsWithChildren {
    className?: string;
}

export const WarningBanner:FC<Props> = ({className, children}) => {
    return (
        <div className={classNames("flex gap-2 p-2 bg-vsc-inputValidation-warningBackground items-center border-1 rounded border-vsc-list-warningForeground", className)}>
            <i className="codicon codicon-warning text-vsc-list-warningForeground" />
            <span className="text-vsc-inputValidation-warningForeground">
                {children}
            </span>
        </div>
    );
};
