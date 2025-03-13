/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from 'react';
import { EVENT_TYPE, ListenerModel, ListenersResponse, ServiceModel } from '@wso2-enterprise/ballerina-core';
import { Stepper, View, ViewContent, TextField, Button } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { useRpcContext } from '@wso2-enterprise/ballerina-rpc-client';
import ListenerConfigForm from '../ServiceDesigner/Forms/ListenerConfigForm';
import ServiceConfigForm from '../ServiceDesigner/Forms/ServiceConfigForm';
import { LoadingContainer } from '../../styles';
import { TitleBar } from '../../../components/TitleBar';
import { TopNavigationBar } from '../../../components/TopNavigationBar';
import { LoadingRing } from '../../../components/Loader';
import { FormHeader } from '../../../components/FormHeader';

const FORM_WIDTH = 600;

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    max-width: 600px;
    gap: 20px;
    padding: 20px;
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 10px;
`;

const ContainerX = styled.div`
    padding: 0 20px 20px;
    max-width: 600px;
    > div:last-child {
        padding: 20px 0;
        > div:last-child {
            justify-content: flex-start;
        }
    }
`;

const Container = styled.div`
    display: "flex";
    flex-direction: "column";
    gap: 10;
    margin: 20px;
`;

const BottomMarginTextWrapper = styled.div`
    margin-top: 20px;
    margin-left: 20px;
    font-size: 15px;
    margin-bottom: 10px;
`;

const HorizontalCardContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

const IconWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const ButtonWrapper = styled.div`
    max-width: 600px;
    display: flex;
    gap: 10px;
    justify-content: right;
`;

const StepperContainer = styled.div`
    margin-top: 16px;
    margin-left: 16px;
    margin-bottom: 20px;
`;

const FormFields = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
`;

export interface AIChatAgentWizardProps {
}

export function AIChatAgentWizard(props: AIChatAgentWizardProps) {
    // module name for ai.agent
    const type = "ai.agent";
    const { rpcClient } = useRpcContext();
    const [agentName, setAgentName] = useState<string>("");
    const [nameError, setNameError] = useState<string>("");
    const [listenerModel, setListenerModel] = useState<ListenerModel>(undefined);
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const steps = [
        { label: "Creating Agent", description: "Creating the AI chat agent" },
        { label: "Initializing", description: "Setting up the agent configuration" },
        { label: "Creating Listener", description: "Configuring the service listener" },
        { label: "Creating Service", description: "Setting up the AI chat service" },
        { label: "Completing", description: "Finalizing the agent setup" }
    ];

    useEffect(() => {
        rpcClient.getServiceDesignerRpcClient().getListenerModel({ moduleName: type }).then(res => {
            setListenerModel(res.listener);
        });
    }, []);

    const validateName = (name: string): boolean => {
        if (!name) {
            setNameError("Name is required");
            return false;
        }
        if (/^[0-9]/.test(name)) {
            setNameError("Name cannot start with a number");
            return false;
        }
        if (/[\s-]/.test(name)) {
            setNameError("Name cannot contain spaces or dashes");
            return false;
        }
        setNameError("");
        return true;
    };

    const constructStringLiteral = (name: string): any => {
        return {
            "addNewButton": false,
            "advanced": false,
            "codedata": {
                "inDisplayAnnotation": false,
                "inListenerInit": false,
                "isBasePath": false,
                "type": "STRING_LITERAL"
            },
            "editable": true,
            "enabled": true,
            "isType": false,
            "metadata": {
                "description": "The string literal of the service",
                "label": "String Literal"
            },
            "optional": false,
            "placeholder": "\"/path\"",
            "value": `"${name}"`,
            "values": [],
            "valueType": "EXPRESSION",
            "valueTypeConstraint": "string"
        }
    }

    const handleCreateService = async () => {
        if (!validateName(agentName)) {
            return;
        }
        setIsCreating(true);
        try {
            setCurrentStep(0);
            // Update the listener name and create the listener
            const listener = listenerModel;
            const listenerName = agentName + "Listener";
            listener.properties['name'].value = listenerName;

            setCurrentStep(1);
            await rpcClient.getServiceDesignerRpcClient().addListenerSourceCode({ filePath: "", listener });

            setCurrentStep(2);
            // Update the service name and create the service
            await rpcClient.getServiceDesignerRpcClient().getServiceModel({
                filePath: "",
                moduleName: type,
                listenerName: listenerName
            }).then(res => {
                const serviceModel = res.service;
                serviceModel.properties["listener"].editable = true;
                serviceModel.properties["listener"].items = [listenerName];
                serviceModel.properties["listener"].values = [listenerName];
                serviceModel.properties["stringLiteral"] = constructStringLiteral(agentName);
                console.log("Service Model: ", serviceModel);
                rpcClient.getServiceDesignerRpcClient().addServiceSourceCode({
                    filePath: "",
                    service: res.service
                }).then((res) => {
                    rpcClient.getVisualizerRpcClient().openView({
                        type: EVENT_TYPE.OPEN_VIEW,
                        location: {
                            documentUri: res.filePath,
                            position: res.position
                        },
                    });
                    setCurrentStep(3);
                    setIsCreating(false);
                });
            });

            setCurrentStep(3);
        } catch (error) {
            console.error("Error creating AI Chat Agent:", error);
            setIsCreating(false);
            setCurrentStep(0);
        } finally {

        }
    }

    return (
        <View>
            <TopNavigationBar />
            <TitleBar title="AI Chat Agent" subtitle="" />
            <ViewContent>
                {currentStep === 0 &&
                    <FormContainer>
                        <FormHeader
                            title="Create AI Chat Agent"
                            subtitle="Create a chattable AI agent using an LLM, prompts and tools."
                        />
                        <FormFields>
                            <TextField
                                label="Name"
                                description="Agent will be identified by this name. Cannot contain spaces or dashes, and cannot start with a number."
                                value={agentName}
                                onChange={(e) => {
                                    setAgentName(e.target.value);
                                    validateName(e.target.value);
                                }}
                                errorMsg={nameError}
                            />
                            <ButtonContainer>
                                <Button
                                    appearance="primary"
                                    onClick={handleCreateService}
                                    disabled={isCreating || !!nameError || !agentName}
                                >
                                    {isCreating ? 'Creating...' : 'Create'}
                                </Button>
                                <Button appearance="secondary">Cancel</Button>
                            </ButtonContainer>
                        </FormFields>
                    </FormContainer>
                }
                {currentStep !== 0 &&
                    <Container>
                        <LoadingContainer>
                            <LoadingRing message={steps[currentStep].description} />
                        </LoadingContainer>
                    </Container>
                }
            </ViewContent>
        </View>
    );
};
