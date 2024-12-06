/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useRef, useState } from "react";
import styled from "@emotion/styled";
import { Button, ButtonWrapper, Codicon, FormGroup, Typography, CheckBox, RadioButtonGroup, ProgressRing, Divider, CompletionItem } from "@wso2-enterprise/ui-toolkit";
import { Form, FormField, FormValues, TypeEditor } from "@wso2-enterprise/ballerina-side-panel";
import { BallerinaTrigger, ComponentTriggerType, FunctionField } from "@wso2-enterprise/ballerina-core";
import { BodyText } from "../../../styles";
import { Colors } from "../../../../resources/constants";
import { debounce } from "lodash";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { URI, Utils } from "vscode-uri";
import { convertToVisibleTypes } from "../../../../utils/bi";

const Container = styled.div`
    padding: 0 20px 20px;
    max-width: 600px;
    height: 100%;
    > div:last-child {
        padding: 20px 0;
        height: calc(35vh - 160px);
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

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    width: 100%;
    color: ${Colors.ON_SURFACE};
`;

interface TriggerConfigViewProps {
    name: string;
    listenerFields: FormField[];
    serviceFields: FormField[];
    functionFields: Record<string, FunctionField>;
    serviceTypes: Record<string, FunctionField>;
    onSubmit: (data: ComponentTriggerType) => void;
    onBack: () => void;
}

export function TriggerConfigView(props: TriggerConfigViewProps) {
    const { rpcClient } = useRpcContext();

    const listenerFieldsRef = useRef<{ triggerSave: () => void }>(null);
    const serviceFieldsRef = useRef<{ triggerSave: () => void }>(null);
    const functionFieldsRefs: Record<string, React.RefObject<{ triggerSave: () => void }>> = {};
    const serviceTypesRef: Record<string, React.RefObject<{ triggerSave: () => void }>> = {};
    const { name, listenerFields, serviceFields, functionFields, serviceTypes, onSubmit, onBack } = props;


    const handleListenerSubmit = async (data: FormValues) => {
        listenerFields.forEach(val => {
            if (data[val.key]) {
                val.value = data[val.key]
            }
        })
    };

    const handleServiceSubmit = async (data: FormValues) => {
        serviceFields.forEach(val => {
            if (data[val.key]) {
                val.value = data[val.key]
            }
        })
    };

    const handleTriggerSave = async () => {
        if (listenerFieldsRef.current) {
            listenerFieldsRef.current.triggerSave();
        }
        if (serviceFieldsRef.current) {
            serviceFieldsRef.current.triggerSave();
        }

        for (const key in functionFieldsRefs) {
            if (functionFieldsRefs[key].current) {
                functionFieldsRefs[key].current.triggerSave();
            }
        }
        for (const key in serviceTypesRef) {
            if (serviceTypesRef[key].current) {
                serviceTypesRef[key].current.triggerSave();
            }
        }
        console.log("Updated serviceTypesRef", serviceTypes);
        console.log("Updated handleListenerSubmit", listenerFields);
        console.log("Updated handleServiceSubmit", serviceFields);
        console.log("Updated handleFunctionsSubmit", functionFields);

        const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        await wait(1000); // Wait for 1 second

        const response: ComponentTriggerType = {
            name: name,
            listener: listenerFields,
            serviceTypes: serviceTypes,
            service: serviceFields,
            functions: functionFields
        }
        onSubmit(response);
    };


    const [filteredTypes, setFilteredTypes] = useState<CompletionItem[]>([]);
    const [types, setTypes] = useState<CompletionItem[]>([]);

    // <------------- Expression Editor Util functions list start --------------->
    const debouncedGetVisibleTypes = debounce(async (value: string, cursorPosition: number) => {
        let visibleTypes: CompletionItem[] = types;
        if (!types.length) {
            const context = await rpcClient.getVisualizerLocation();
            const functionFilePath = Utils.joinPath(URI.file(context.projectUri), 'triggers.bal');
            const response = await rpcClient.getBIDiagramRpcClient().getVisibleTypes({
                filePath: functionFilePath.fsPath,
                position: { line: 0, offset: 0 },
            });

            visibleTypes = convertToVisibleTypes(response.types);
            setTypes(visibleTypes);
        }

        const effectiveText = value.slice(0, cursorPosition);
        const filteredTypes = visibleTypes.filter((type) => {
            const lowerCaseText = effectiveText.toLowerCase();
            const lowerCaseLabel = type.label.toLowerCase();

            return lowerCaseLabel.includes(lowerCaseText);
        });

        setFilteredTypes(filteredTypes);
        return { visibleTypes, filteredTypes };
    }, 250);

    const handleGetVisibleTypes = async (value: string, cursorPosition: number) => {
        return await debouncedGetVisibleTypes(value, cursorPosition) as any;
    };

    const handleCompletionSelect = async () => {
        handleExpressionEditorCancel();
    };

    const handleExpressionEditorCancel = () => {
        setFilteredTypes([]);
        setTypes([]);
    };

    const handleExpressionEditorBlur = () => {
        handleExpressionEditorCancel();
    };
    // <------------- Expression Editor Util functions list end --------------->

    return (
        <Container>

            {!name &&
                <LoadingContainer>
                    <ProgressRing />
                    <Typography variant="h3" sx={{ marginTop: '16px' }}>Loading Trigger...</Typography>
                </LoadingContainer>
            }

            {name &&
                <>
                    {serviceFields.length > 0 &&
                        <FormContainer>
                            <FormGroup title="Service Configuration" isCollapsed={false}>
                                <Form
                                    ref={serviceFieldsRef}
                                    hideSave={true}
                                    formFields={serviceFields}
                                    onSubmit={handleServiceSubmit}
                                    expressionEditor={
                                        {
                                            types: filteredTypes,
                                            retrieveVisibleTypes: handleGetVisibleTypes,
                                            onCompletionItemSelect: handleCompletionSelect,
                                            onCancel: handleExpressionEditorCancel,
                                            onBlur: handleExpressionEditorBlur
                                        }
                                    }
                                />
                            </FormGroup>
                        </FormContainer>
                    }

                    {listenerFields.length > 0 &&
                        <FormContainer>
                            <FormGroup title="Listener Configuration" isCollapsed={false}>
                                <Form
                                    ref={listenerFieldsRef}
                                    hideSave={true}
                                    formFields={listenerFields}
                                    onSubmit={handleListenerSubmit}
                                    expressionEditor={
                                        {
                                            types: filteredTypes,
                                            retrieveVisibleTypes: handleGetVisibleTypes,
                                            onCompletionItemSelect: handleCompletionSelect,
                                            onCancel: handleExpressionEditorCancel,
                                            onBlur: handleExpressionEditorBlur
                                        }
                                    }
                                />
                            </FormGroup>
                        </FormContainer>
                    }

                    {Object.keys(serviceTypes).length > 1 &&
                        <FormContainer>
                            <FormGroup title="Service Types" isCollapsed={false}>
                                {Object.keys(serviceTypes).map((serviceType) => {
                                    // Initialize ref for each function field if it doesn't exist
                                    if (!serviceTypesRef[serviceType]) {
                                        serviceTypesRef[serviceType] = React.createRef<{ triggerSave: () => void }>();
                                    }
                                    return (
                                        <>
                                            <CheckBox
                                                checked={serviceTypes[serviceType].required}
                                                disabled={serviceTypes[serviceType].required}
                                                label={serviceType}
                                                onChange={(checked) => {
                                                    serviceTypes[serviceType].checked = checked
                                                }}
                                                value={serviceType}
                                            />
                                            <Typography variant="caption">{serviceTypes[serviceType].serviceType.description}</Typography>
                                            <Divider />
                                        </>
                                    )
                                })}
                            </FormGroup>
                        </FormContainer>
                    }

                    {Object.keys(serviceTypes).length === 1 &&
                        <FormContainer>
                            <FormGroup title="Remote Functions" isCollapsed={false}>
                                {Object.keys(functionFields).map((functionName) => {
                                    // Initialize ref for each function field if it doesn't exist
                                    if (!functionFieldsRefs[functionName]) {
                                        functionFieldsRefs[functionName] = React.createRef<{ triggerSave: () => void }>();
                                    }
                                    return (
                                        <>
                                            {functionFields[functionName].radioValues?.length > 0 ?
                                                <RadioButtonGroup
                                                    id="options"
                                                    label="Select one of the functions"
                                                    value={functionFields[functionName].functionType.name}
                                                    options={functionFields[functionName].radioValues.map(value => ({ content: value, value: value }))}
                                                    onChange={(e) => {
                                                        functionFields[functionName].functionType = { name: e.target.value }
                                                    }}
                                                />
                                                :
                                                <>
                                                    <CheckBox
                                                        checked={functionFields[functionName].required}
                                                        disabled={functionFields[functionName].required}
                                                        label={functionName}
                                                        onChange={(checked) => {
                                                            functionFields[functionName].checked = checked
                                                        }}
                                                        value={functionName}
                                                    />
                                                    <Typography variant="caption">{functionFields[functionName].functionType.documentation}</Typography>
                                                    <Divider />
                                                </>
                                            }
                                        </>
                                    )
                                })}
                            </FormGroup>
                        </FormContainer>
                    }
                    <ButtonWrapper>
                        <Button appearance="primary" onClick={handleTriggerSave}>
                            Create Trigger
                        </Button>
                    </ButtonWrapper>
                </>
            }
        </Container>
    );
}

export default TriggerConfigView;
