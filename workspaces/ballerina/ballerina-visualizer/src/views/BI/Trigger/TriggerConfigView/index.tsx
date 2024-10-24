/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useRef } from "react";
import styled from "@emotion/styled";
import { Button, ButtonWrapper, Codicon, FormGroup, Typography, CheckBox, ProgressRing } from "@wso2-enterprise/ui-toolkit";
import { Form, FormField, FormValues } from "@wso2-enterprise/ballerina-side-panel";
import { BallerinaTrigger, ComponentTriggerType, FunctionField } from "@wso2-enterprise/ballerina-core";
import { BodyText } from "../../../styles";
import { Colors } from "../../../../resources/constants";

const Container = styled.div`
    padding: 0 20px 20px;
    max-width: 600px;
    > div:last-child {
        padding: 20px 0;
        height: calc(100vh - 160px);
        > div:last-child {
            justify-content: flex-start;
        }
    }
`;

const FormContainer = styled.div`
    padding-top: 15px;
    paddding-bottom: 15px;
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

    // const handleFunctionsSubmit = async (data: FormValues, key?: string) => {
    //     if (functionFields[key]) {
    //         functionFields[key].fields.forEach(val => {
    //             if (data[val.key]) {
    //                 val.value = data[val.key]
    //             }
    //         })
    //     }
    // };

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
                    <FormContainer>
                        <FormGroup title="Listener Configuration" isCollapsed={false}>
                            <Form ref={listenerFieldsRef} hideSave={true} formFields={listenerFields} onSubmit={handleListenerSubmit} />
                        </FormGroup>
                    </FormContainer>

                    {serviceFields.length > 0 &&
                        <FormContainer>
                            <FormGroup title="Service Configuration" isCollapsed={false}>
                                <Form ref={serviceFieldsRef} hideSave={true} formFields={serviceFields} onSubmit={handleServiceSubmit} />
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
                                            <CheckBox
                                                checked={functionFields[functionName].required}
                                                disabled={functionFields[functionName].required}
                                                label={functionName}
                                                onChange={(checked) => {
                                                    functionFields[functionName].checked = checked
                                                }}
                                                value={functionName}
                                            />
                                            {/* <FormGroup key={functionName} title={functionName} isCollapsed={false}>
                                <Form refKey={functionName} ref={functionFieldsRefs[functionName]} hideSave={true} formFields={functionFields[functionName].fields} onSubmit={handleFunctionsSubmit} />
                            </FormGroup> */}
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
