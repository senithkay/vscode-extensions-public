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
import { BallerinaTrigger, ComponentTriggerType, FormDiagnostics, FunctionField, TRIGGER_CHARACTERS, TriggerCharacter, ListenerModel } from "@wso2-enterprise/ballerina-core";
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

interface ListenerConfigFormProps {
    listenerModel: ListenerModel;
    onSubmit?: (data: ListenerModel) => void;
    onBack?: () => void;
    formRef?: React.Ref<unknown>;
}

export function ListenerConfigForm(props: ListenerConfigFormProps) {
    const { rpcClient } = useRpcContext();

    const [listenerFields, setListenerFields] = useState<FormField[]>([]);
    const { listenerModel, onSubmit, onBack, formRef } = props;
    const [filePath, setFilePath] = useState<string>('');

    useEffect(() => {
        listenerModel && setListenerFields(convertConfig(listenerModel));
        rpcClient.getVisualizerLocation().then(res => { setFilePath(Utils.joinPath(URI.file(res.projectUri), 'triggers.bal').fsPath) });
    }, [listenerModel]);

    const handleListenerSubmit = async (data: FormValues) => {
        listenerFields.forEach(val => {
            if (data[val.key]) {
                val.value = data[val.key]
            }
        })
        const response = updateConfig(listenerFields, listenerModel);
        onSubmit(response);
    };

    return (
        <Container>

            {!listenerModel &&
                <LoadingContainer>
                    <ProgressRing />
                    <Typography variant="h3" sx={{ marginTop: '16px' }}>Loading Listener Configurations...</Typography>
                </LoadingContainer>
            }

            {listenerModel &&
                <>
                    {listenerFields.length > 0 &&
                        <FormContainer>
                            <Typography variant="h2" sx={{ marginTop: '16px' }}>{listenerModel.displayAnnotation.label} Configuration</Typography>
                            <BodyText>
                                Provide the necessary configuration details for the {listenerModel.displayAnnotation.label} to complete the
                                setup.
                            </BodyText>
                            {filePath &&
                                <FormGeneratorNew
                                    ref={formRef}
                                    fileName={filePath}
                                    targetLineRange={{ startLine: { line: 0, offset: 0 }, endLine: { line: 0, offset: 0 } }}
                                    fields={listenerFields}
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

export default ListenerConfigForm;

function convertConfig(listener: ListenerModel): FormField[] {
    const formFields: FormField[] = [];
    for (const key in listener.properties) {
        const expression = listener.properties[key];
        const formField: FormField = {
            key: key,
            label: expression?.metadata.label || key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, str => str.toUpperCase()),
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

function updateConfig(formFields: FormField[], listener: ListenerModel): ListenerModel {
    formFields.forEach(field => {
        const value = field.value as string;
        listener.properties[field.key].value = value;
        if (value && value.length > 0) {
            listener.properties[field.key].enabled = true;
        }
    })
    return listener;
}
