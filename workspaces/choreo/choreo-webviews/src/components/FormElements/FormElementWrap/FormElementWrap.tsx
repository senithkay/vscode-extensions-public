import React, { FC, HTMLProps, PropsWithChildren, ReactNode } from "react";
import { RequiredFormInput } from "@wso2-enterprise/ui-toolkit";
import { ProgressIndicator } from "@wso2-enterprise/ui-toolkit";
import classNames from "classnames";

interface Props extends PropsWithChildren {
    label?: string | ReactNode;
    required?: boolean;
    errorMsg?: string;
    loading?: boolean;
    className?: HTMLProps<HTMLElement>["className"];
}

export const FormElementWrap: FC<Props> = (props) => {
    const { label, required, errorMsg, loading, className, children } = props;
    return (
        <div className={classNames("w-full flex flex-col ", className)}>
            <div className="flex justify-between gap-1">
                <span className="flex gap-1">
                    <label>{label}</label>
                    {required && <RequiredFormInput />}
                </span>
                {errorMsg && <label className="text-vsc-errorForeground line-clamp-1 text-right">{errorMsg}</label>}
            </div>
            {children}
            {loading && (
                <div className="relative">
                    <ProgressIndicator />
                </div>
            )}
        </div>
    );
};
