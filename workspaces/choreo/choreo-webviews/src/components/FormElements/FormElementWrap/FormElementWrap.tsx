import React, { FC, HTMLProps, PropsWithChildren, ReactNode } from "react";
import { RequiredFormInput } from "@wso2-enterprise/ui-toolkit";
import { ProgressIndicator } from "@wso2-enterprise/ui-toolkit";
import classNames from "classnames";
import { useAutoAnimate } from "@formkit/auto-animate/react";

interface Props extends PropsWithChildren {
    label?: string | ReactNode;
    required?: boolean;
    errorMsg?: string;
    loading?: boolean;
    wrapClassName?: HTMLProps<HTMLElement>["className"];
    labelWrapClassName?: HTMLProps<HTMLElement>["className"];
}

export const FormElementWrap: FC<Props> = (props) => {
    const [labelWrapRef] = useAutoAnimate({ duration: 150 });
    
    const { label, required, errorMsg, loading, wrapClassName, labelWrapClassName, children } = props;
    return (
        <div className={classNames("w-full flex flex-col", wrapClassName)}>
            <div className={classNames("flex justify-between gap-1",labelWrapClassName)} ref={labelWrapRef}>
                <span className="flex gap-1">
                    <label>{label}</label>
                    {required && <RequiredFormInput />}
                </span>
                {errorMsg && <label className="text-vsc-errorForeground text-right line-clamp-1" title={errorMsg}>{errorMsg}</label>}
            </div>
            <div className="grid grid-cols-1">{children}</div>
            {loading && (
                <div className="relative">
                    <ProgressIndicator />
                </div>
            )}
        </div>
    );
};
