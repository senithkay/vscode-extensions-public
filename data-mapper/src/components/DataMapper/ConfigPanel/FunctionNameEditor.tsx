import { FormTextInput } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { FunctionDefinition } from "@wso2-enterprise/syntax-tree";
import React from "react";

export interface FunctionNameEditorProps {
    value: string;
    onChange: (newVal: string) => void;
    errorMessage?: string;
}

export function FunctionNameEditor(props: FunctionNameEditorProps)  {
    const { value, onChange, errorMessage } = props;
    return (
        <FormTextInput
            customProps={{ readonly: false, isErrored: errorMessage !== undefined }}
            onChange={onChange}
            defaultValue={value}
            label="Name"
            placeholder="Data Mapper Name"
            errorMessage={errorMessage}

        />
    );
}