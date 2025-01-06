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
import { Button, Codicon, FormGroup, Typography, CheckBox, RadioButtonGroup, ProgressRing, Divider, CompletionItem, LinkButton } from "@wso2-enterprise/ui-toolkit";
import { Form, FormField, FormValues, TypeEditor } from "@wso2-enterprise/ballerina-side-panel";
import { BallerinaTrigger, ComponentTriggerType, FormDiagnostics, FunctionField, TRIGGER_CHARACTERS, TriggerCharacter, ServiceModel } from "@wso2-enterprise/ballerina-core";
import { debounce } from "lodash";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { URI, Utils } from "vscode-uri";
import { BodyText } from "../../../styles";
import { FormGeneratorNew } from "../../Forms/FormGeneratorNew";

const Container = styled.div`
    padding: 0 20px 20px;
    max-width: 600px;
    height: 100%;
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

const ListenerBtn = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    margin-right: 15px;
`;



interface ServiceConfigFormProps {
    serviceModel: ServiceModel;
    onSubmit: (data: ServiceModel) => void;
    openListenerForm?: () => void;
    onBack?: () => void;
    formRef?: React.Ref<unknown>;
}

export function ServiceConfigForm(props: ServiceConfigFormProps) {
    const { rpcClient } = useRpcContext();

    const [serviceFields, setServiceFields] = useState<FormField[]>([]);
    const { serviceModel, onSubmit, onBack, formRef, openListenerForm } = props;
    const [filePath, setFilePath] = useState<string>('');

    useEffect(() => {
        serviceModel && setServiceFields(convertConfig(serviceModel));
        rpcClient.getVisualizerLocation().then(res => { setFilePath(Utils.joinPath(URI.file(res.projectUri), 'main.bal').fsPath) });
    }, [serviceModel]);

    const handleListenerSubmit = async (data: FormValues) => {
        serviceFields.forEach(val => {
            if (val.type === "CHOICE") {
                val.choices.forEach((choice, index) => {
                    choice.enabled = false;
                    if (data[val.key] === index) {
                        choice.enabled = true;
                        for (const key in choice.properties) {
                            choice.properties[key].value = data[key];
                        }
                    }
                })
            } else if (data[val.key]) {
                val.value = data[val.key];
            }
        })
        const response = updateConfig(serviceFields, serviceModel);
        onSubmit(response);
    };

    return (
        <Container>
            {serviceModel &&
                <>
                    {serviceFields.length > 0 &&
                        <FormContainer>
                            <Typography variant="h2" sx={{ marginTop: '16px' }}>{serviceModel.displayAnnotation.label} Configuration</Typography>
                            <BodyText>
                                Provide the necessary configuration details for the {serviceModel.displayAnnotation.label} to complete the
                                setup.
                            </BodyText>
                            {openListenerForm &&
                                <ListenerBtn>
                                    <LinkButton onClick={openListenerForm} sx={{ marginBottom: '-30px' }}>
                                        + New Listener
                                    </LinkButton>
                                </ListenerBtn>
                            }
                            {filePath &&
                                <FormGeneratorNew
                                    ref={formRef}
                                    fileName={filePath}
                                    targetLineRange={{ startLine: { line: 0, offset: 0 }, endLine: { line: 0, offset: 0 } }}
                                    fields={serviceFields}
                                    onBack={onBack}
                                    onSubmit={handleListenerSubmit}
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

export default ServiceConfigForm;

function convertConfig(listener: ServiceModel): FormField[] {
    const formFields: FormField[] = [];
    for (const key in listener.properties) {
        const expression = listener.properties[key];
        const formField: FormField = {
            key: key,
            label: expression?.metadata.label || key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, str => str.toUpperCase()),
            type: expression.valueType,
            documentation: expression?.metadata.description || "",
            valueType: expression.valueTypeConstraint,
            editable: true,
            optional: expression.optional,
            value: expression.valueType === "MULTIPLE_SELECT" ? [expression.value] : expression.value,
            valueTypeConstraint: expression.valueTypeConstraint,
            advanced: expression.advanced,
            diagnostics: [],
            items: expression.valueType === "SINGLE_SELECT" ? [""].concat(expression.items) : expression.items || [expression.value],
            choices: expression.choices,
            placeholder: expression.placeholder
        }

        formFields.push(formField);
    }
    return formFields;
}

function updateConfig(formFields: FormField[], listener: ServiceModel): ServiceModel {
    formFields.forEach(field => {
        const value = field.value;
        if (field.type === "MULTIPLE_SELECT" || field.type === "EXPRESSION_SET") {
            listener.properties[field.key].values = value as string[];
        } else {
            listener.properties[field.key].value = value as string;
        }
        if (value && value.length > 0) {
            listener.properties[field.key].enabled = true;
        }
    })
    return listener;
}
