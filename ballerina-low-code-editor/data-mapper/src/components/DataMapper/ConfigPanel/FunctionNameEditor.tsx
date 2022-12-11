import React from "react";

import { LinearProgress } from "@material-ui/core";
import { FormTextInput } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

export interface FunctionNameEditorProps {
    value: string;
    onBlur: (event: unknown) => void;
    onChange: (newVal: string) => void;
    isValidating: boolean;
    errorMessage?: string;
}

export function FunctionNameEditor(props: FunctionNameEditorProps)  {
    const { value, onBlur, onChange, isValidating, errorMessage } = props;
    return (
        <>
            <FormTextInput
                customProps={{ readonly: false, isErrored: errorMessage !== "" }}
                onBlur={onBlur}
                onChange={onChange}
                defaultValue={value}
                label="Name"
                placeholder="Data Mapper Name"
                errorMessage={errorMessage}
                dataTestId={`data-mapper-config-fn-name`}
            />
            {isValidating && <LinearProgress />}
        </>
    );
}
