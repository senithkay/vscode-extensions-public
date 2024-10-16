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
import { Button, ButtonWrapper, Codicon, FormGroup, Typography } from "@wso2-enterprise/ui-toolkit";
import { Form, FormField, FormValues } from "@wso2-enterprise/ballerina-side-panel";
import { ComponentTriggerType } from "@wso2-enterprise/ballerina-core";
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
    functionFields: Record<string, FormField[]>;
    onSubmit: (data: ComponentTriggerType) => void;
    onBack: () => void;
}

export function TriggerConfigView(props: TriggerConfigViewProps) {
    const listenerFieldsRef = useRef<{ triggerSave: () => void }>(null);
    const serviceFieldsRef = useRef<{ triggerSave: () => void }>(null);
    const functionFieldsRefs: Record<string, React.RefObject<{ triggerSave: () => void }>> = {};
    const { name, listenerFields, serviceFields, functionFields, onSubmit, onBack } = props;


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

    const handleFunctionsSubmit = async (data: FormValues, key?: string) => {
        if (functionFields[key]) {
            functionFields[key].forEach(val => {
                if (data[val.key]) {
                    val.value = data[val.key]
                }
            })
        }
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
        console.log("Updated handleListenerSubmit", listenerFields);
        console.log("Updated handleServiceSubmit", serviceFields);
        console.log("Updated handleFunctionsSubmit", functionFields);

        const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        await wait(1000); // Wait for 1 second

        const response: ComponentTriggerType = {
            name: name,
            listener: listenerFields,
            service: serviceFields,
            functions: functionFields
        }
        onSubmit(response);
    };

    return (
        <Container>
            <Row>
                <Button appearance="icon" onClick={onBack}>
                    <Codicon name="arrow-left" />
                </Button>
                <Typography variant="h2">Configure {name} Trigger</Typography>
            </Row>
            <BodyText>
                Provide the necessary configuration details for the selected trigger to complete the setup.
            </BodyText>
            <FormGroup title="Listener Configuration" isCollapsed={false}>
                <Form ref={listenerFieldsRef} hideSave={true} formFields={listenerFields} onSubmit={handleListenerSubmit} />
            </FormGroup>

            {serviceFields.length > 0 &&
                <FormGroup title="Service Configuration" isCollapsed={false}>
                    <Form ref={serviceFieldsRef} hideSave={true} formFields={serviceFields} onSubmit={handleServiceSubmit} />
                </FormGroup>
            }

            <FormGroup title="Remote Functions" isCollapsed={false}>
                {Object.keys(functionFields).map((functionName) => {
                    // Initialize ref for each function field if it doesn't exist
                    if (!functionFieldsRefs[functionName]) {
                        functionFieldsRefs[functionName] = React.createRef<{ triggerSave: () => void }>();
                    }
                    return (
                        <FormGroup key={functionName} title={functionName} isCollapsed={false}>
                            <Form refKey={functionName} ref={functionFieldsRefs[functionName]} hideSave={true} formFields={functionFields[functionName]} onSubmit={handleFunctionsSubmit} />
                        </FormGroup>
                    )
                })}
            </FormGroup>
            <ButtonWrapper>
                <Button appearance="primary" onClick={handleTriggerSave}>
                    Create Trigger
                </Button>
            </ButtonWrapper>
        </Container>
    );
}

export default TriggerConfigView;
