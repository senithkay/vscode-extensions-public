import React, { FC, HTMLProps, ReactNode } from "react";
import { VSCodeDropdown , VSCodeOption } from "@vscode/webview-ui-toolkit/react";
import { FormElementWrap } from "../FormElementWrap";
import classnames from "classnames";
import { Control, Controller } from "react-hook-form";

interface Props {
    name?: string;
    label?: string | ReactNode;
    required?: boolean;
    loading?: boolean;
    control?: Control;
    items?: ({ value: string; label?: string } | string)[];
    disabled?: boolean;
    wrapClassName?: HTMLProps<HTMLElement>["className"];
}

export const Dropdown: FC<Props> = (props) => {
    const { label, required, items, loading, control, name, disabled, wrapClassName } = props;
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <FormElementWrap
                    errorMsg={fieldState.error?.message}
                    label={label}
                    required={required}
                    loading={loading}
                    className={wrapClassName}
                >
                    <VSCodeDropdown
                        className={classnames(
                            "w-full border-[0.5px]",
                            fieldState.error ? "border-vsc-errorForeground" :'border-transparent' 
                        )}
                        disabled={disabled || loading || undefined}
                        {...field}
                    >
                        {items?.map((item) => (
                            <VSCodeOption
                                key={typeof item === "string" ? item : item?.value}
                                value={typeof item === "string" ? item : item.value}
                                className="p-1"
                            >
                                {typeof item === "string" ? item : item?.label || item.value}
                            </VSCodeOption>
                        ))}
                    </VSCodeDropdown>
                </FormElementWrap>
            )}
        />
    );
};
