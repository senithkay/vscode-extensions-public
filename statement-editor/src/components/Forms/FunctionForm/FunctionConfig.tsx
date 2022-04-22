/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useEffect, useState } from 'react';

import { FormControl } from "@material-ui/core";
import {
    ExpressionEditorLangClientInterface,
    getSource,
    mutateFunctionSignature
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    FormHeaderSection,
    FormTextInput,
    useStyles as useFormStyles
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { FunctionDefinition, NodePosition } from "@wso2-enterprise/syntax-tree";

import { StmtDiagnostic } from "../../../models/definitions";
import { getPartialSTForTopLevelComponents } from "../../../utils/ls-utils";

export interface FunctionProps {
    model: FunctionDefinition;
    targetPosition: NodePosition;
    onChange: (genSource: string) => void;
    onCancel: () => void;
    getLangClient: () => Promise<ExpressionEditorLangClientInterface>;
}

export function FunctionConfig(props: FunctionProps) {
    const { targetPosition, model, onChange, onCancel, getLangClient  } = props;

    const formClasses = useFormStyles();

    const [functionName, setFunctionName] = useState<string>(model ? model.functionName.value : "");
    const [nameDiagnostics, setNameDiagnostics] = useState<StmtDiagnostic[]>(undefined);
    const [returnType, setReturnType] = useState<string>(model ?
        model.functionSignature?.returnTypeDesc?.type?.source?.trim() : "");
    const [returnDiagnostics, setReturnDiagnostics] = useState<StmtDiagnostic[]>(undefined);

    const onNameChange = async (value: string) => {
        setFunctionName(value);
        const genSource = getSource(mutateFunctionSignature("", value, "",
            returnType ? `returns ${returnType}` : "", targetPosition));
        const partialST = await getPartialSTForTopLevelComponents(
            {codeSnippet: genSource.trim()}, getLangClient
        );
        if (!partialST.syntaxDiagnostics.length) {
            setNameDiagnostics(partialST.syntaxDiagnostics);
        } else {
            setNameDiagnostics(undefined);
        }
        // onChange(genSource);
    }

    const onReturnTypeChange = (value: string) => {
        setReturnType(value);
        const genSource = getSource(mutateFunctionSignature("", functionName, "",
            value ? `returns ${value}` : "", targetPosition));
        onChange(genSource.trim());
        // onChange(genSource);
    }

    useEffect(() => {
        setReturnType(model ? model.functionSignature?.returnTypeDesc?.type?.source?.trim() : "");
        setFunctionName(model ? model.functionName.value : "");
    }, [model]);

    return (
        <FormControl data-testid="listener-form" className={formClasses.wizardFormControl}>
            <FormHeaderSection
                onCancel={onCancel}
                formTitle={"Function Configuration"}
                defaultMessage={"Function Configuration"}
            />
            <FormTextInput
                label="Name"
                dataTestId="service-name"
                defaultValue={functionName}
                onChange={onNameChange}
                customProps={{
                    optional: true,
                    isErrored: (nameDiagnostics !== undefined)
                }}
                errorMessage={"Diagnostics Name"}
                onBlur={null}
                onFocus={null}
                placeholder={"Enter Name"}
                size="small"
            />
            <FormTextInput
                label="Return Type"
                dataTestId="return-type"
                defaultValue={returnType}
                customProps={{
                    optional: true,
                    isErrored: (returnDiagnostics !== undefined)
                }}
                errorMessage={"Diagnostics"}
                onChange={onReturnTypeChange}
                onBlur={null}
                onFocus={null}
                placeholder={"Enter Return Type"}
                size="small"
            />
        </FormControl>
    )
}
