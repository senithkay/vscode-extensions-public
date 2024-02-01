
import React from "react";

import { ProgressIndicator, TextField } from "@wso2-enterprise/ui-toolkit";

export interface FunctionNameEditorProps {
    value: string;
    onBlur?: (event: unknown) => void;
    onChange: (newVal: string) => void;
    isValidating: boolean;
    errorMessage?: string;
}

export function FunctionNameEditor(props: FunctionNameEditorProps)  {
    const { value, onChange, onBlur, isValidating, errorMessage } = props;
    return (
        <>
            <TextField
                onBlur={onBlur}
                onChange={onChange}
                value={value}
                placeholder="Data Mapper Name"
                errorMsg={errorMessage}
                data-testid={`data-mapper-config-fn-name`}
            />
            {isValidating && <ProgressIndicator />}
        </>
    );
}
