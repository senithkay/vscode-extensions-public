import { FormTextInput } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { FunctionDefinition } from "@wso2-enterprise/syntax-tree";
import React from "react";


export function getFnNameFromST(fnST: FunctionDefinition) {
    return fnST.functionName.value;
}

export interface FunctionNameEditorProps {
    value: string;
    onChange: (newVal: string) => void;
}

export function FunctionNameEditor(props: FunctionNameEditorProps)  {
    const { value, onChange } = props;
    return (
        <FormTextInput
            customProps={{
                validate: () => true,
            }}
            onChange={onChange}
            defaultValue={value}
            label="Name"
            placeholder="Data Mapper Name"
            errorMessage={""}

        />
    );
}