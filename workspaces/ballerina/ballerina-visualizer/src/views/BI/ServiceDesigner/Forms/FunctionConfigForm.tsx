/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { Button, ButtonWrapper, Codicon, FormGroup, Typography, CheckBox, RadioButtonGroup, ProgressRing, Divider, CompletionItem } from "@wso2-enterprise/ui-toolkit";
import { Form, FormField, FormValues, TypeEditor } from "@wso2-enterprise/ballerina-side-panel";
import { BallerinaTrigger, ComponentTriggerType, FormDiagnostics, FunctionField, TRIGGER_CHARACTERS, TriggerCharacter, FunctionModel, FunctionModel } from "@wso2-enterprise/ballerina-core";
import { debounce } from "lodash";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { URI, Utils } from "vscode-uri";
import { BodyText } from "../../../styles";
import FormGeneratorNew from "../../Forms/FormGeneratorNew";

const Container = styled.div`
    padding: 0 20px 20px;
    max-width: 600px;
    > div:last-child {
        padding: 20px 0;
        > div:last-child {
            justify-content: flex-start;
        }
    }
`;

const FormContainer = styled.div`
    padding-top: 15px;
    padding-bottom: 15px;
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80vh;
    flex-direction: column;
`;

interface FunctionConfigFormProps {
    functionModel: FunctionModel;
    onSubmit?: (data: FunctionModel) => void;
    onBack?: () => void;
    formRef?: React.Ref<unknown>;
}

export function FunctionConfigForm(props: FunctionConfigFormProps) {
    const { rpcClient } = useRpcContext();

    const [functionFields, setFunctionFields] = useState<FormField[]>([]);
    const { functionModel, onSubmit, onBack, formRef } = props;
    const [filePath, setFilePath] = useState<string>('');

    useEffect(() => {
        functionModel && setFunctionFields(convertConfig(functionModel));
        rpcClient.getVisualizerLocation().then(res => { setFilePath(Utils.joinPath(URI.file(res.projectUri), 'triggers.bal').fsPath) });
    }, [functionModel]);

    const handleListenerSubmit = async (data: FormValues) => {
        functionFields.forEach(val => {
            if (data[val.key]) {
                val.value = data[val.key]
            }
        })
        const response = updateConfig(functionFields, functionModel);
        onSubmit(response);
    };

    return (
        <Container>

            {!functionModel &&
                <LoadingContainer>
                    <ProgressRing />
                    <Typography variant="h3" sx={{ marginTop: '16px' }}>Loading Listener Configurations...</Typography>
                </LoadingContainer>
            }

            {functionModel &&
                <>
                    {functionFields.length > 0 &&
                        <FormContainer>
                            {filePath &&
                                <FormGeneratorNew
                                    ref={formRef}
                                    fileName={filePath}
                                    targetLineRange={{ startLine: { line: 0, offset: 0 }, endLine: { line: 0, offset: 0 } }}
                                    fields={functionFields}
                                    onSubmit={handleListenerSubmit}
                                    onBack={onBack}
                                    submitText={formRef && "Next"}
                                />
                            }
                        </FormContainer>
                    }
                </>
            }
        </Container>
    );
}

export default FunctionConfigForm;

function convertConfig(functionModel: FunctionModel): FormField[] {
    const formFields: FormField[] = [];

    if (functionModel?.accessor) {
        const expression = functionModel.accessor;
        const formField: FormField = {
            key: "accessor",
            label: expression?.metadata.label,
            type: expression.valueType,
            documentation: expression?.metadata.description || "",
            valueType: expression.valueTypeConstraint,
            editable: expression.editable,
            optional: expression.optional,
            value: expression.value,
            valueTypeConstraint: expression.valueTypeConstraint,
            advanced: expression.advanced,
            diagnostics: [],
            items: expression.items,
            placeholder: expression.placeholder
        }
        formFields.push(formField);
    }

    if (functionModel?.name) {
        const expression = functionModel.name;
        const formField: FormField = {
            key: "name",
            label: expression?.metadata.label,
            type: expression.valueType,
            documentation: expression?.metadata.description || "",
            valueType: expression.valueTypeConstraint,
            editable: expression.editable || functionModel.kind === "RESOURCE",
            optional: expression.optional,
            value: expression.value,
            valueTypeConstraint: expression.valueTypeConstraint,
            advanced: expression.advanced,
            diagnostics: [],
            items: expression.items,
            placeholder: expression.placeholder
        }
        formFields.push(formField);
    }

    if (functionModel?.returnType) {
        const expression = functionModel.returnType;
        const formField: FormField = {
            key: "returnType",
            label: expression?.metadata.label,
            type: expression.valueType,
            documentation: expression?.metadata.description || "",
            valueType: expression.valueTypeConstraint,
            editable: expression.editable,
            optional: expression.optional,
            value: expression.value,
            valueTypeConstraint: expression.valueTypeConstraint,
            advanced: expression.advanced,
            diagnostics: [],
            items: [""].concat(expression.items),
            placeholder: expression.placeholder
        }
        formFields.push(formField);
    }

    return formFields;
}

function updateConfig(formFields: FormField[], functionModel: FunctionModel): FunctionModel {
    // formFields.forEach(field => {
    //     const value = field.value as string;
    //     functionModel.properties[field.key].value = value;
    //     if (value && value.length > 0) {
    //         functionModel.properties[field.key].enabled = true;
    //     }
    // })
    return functionModel;
}
