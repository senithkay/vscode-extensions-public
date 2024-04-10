import React, { ComponentProps, FC, ReactNode } from "react";
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { FormElementWrap } from "../FormElementWrap";
import classnames from "classnames";
import { Control, Controller } from "react-hook-form";
import { TextFieldType } from "@vscode/webview-ui-toolkit";


export interface Props {
    name?: string;
    label?: string | ReactNode;
    required?: boolean;
    loading?: boolean;
    control?: Control;
    disabled?: boolean;
    placeholder?: string;
    type?:TextFieldType
}

export const TextField: FC<Props> = (props) => {
    const { label, required, loading, name, control, disabled, type, placeholder } = props;
    
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
                >
                    <VSCodeTextField
                        onInput={field.onChange}
                        className={classnames(
                            "w-full border-[0.5px]",
                            fieldState.error ? "border-vsc-errorForeground" :'border-transparent' 
                        )}
                        disabled={disabled || loading || undefined}
                        type={type}
                        placeholder={placeholder}
                        {...field}
                    />
                </FormElementWrap>
            )}
        />
    );
};
