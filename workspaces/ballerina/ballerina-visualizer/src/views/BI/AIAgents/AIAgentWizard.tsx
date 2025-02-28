/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from 'react';
import { AgentTool, AIAgentRequest, CodeData, EVENT_TYPE, ListenerModel, ListenersResponse, PropertyModel, ServiceModel, TriggerModelsResponse } from '@wso2-enterprise/ballerina-core';
import { Icon, OptionProps, Stepper, View, ViewContent } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { useRpcContext } from '@wso2-enterprise/ballerina-rpc-client';
import AgentConfigForm from './Forms/AgentConfigForm';
import { LoadingContainer } from '../../styles';
import { TitleBar } from '../../../components/TitleBar';
import { TopNavigationBar } from '../../../components/TopNavigationBar';
import { LoadingRing } from '../../../components/Loader';
import { FormField, FormValues } from '@wso2-enterprise/ballerina-side-panel';
import EntryPointConfigForm from './Forms/EntryPointConfigForm';
import ModelConfigForm from './Forms/ModelConfigForm';
import ToolsConfigForm from './Forms/ToolsConfigForm';
import { getCustomEntryNodeIcon, getEntryNodeIcon } from '../ComponentListView';
import { URI, Utils } from 'vscode-uri';
import ToolsCreateForm from './Forms/ToolsCreateForm';
import { convertConfig } from '../../../utils/bi';
import AgentEntryConfigForm from './Forms/AgentEntryConfigForm';

const FORM_WIDTH = 600;

const FormContainer = styled.div`
    padding-top: 15px;
    padding-bottom: 15px;
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


const _agentFields: FormField[] = [
    {
        key: `name`,
        label: "Name",
        type: "IDENTIFIER",
        optional: false,
        editable: true,
        documentation: "Name of your agent",
        value: "",
        valueTypeConstraint: "",
    },
    {
        key: `description`,
        label: "Instruction",
        type: 'TEXTAREA',
        optional: true,
        editable: true,
        documentation: '',
        value: "",
        valueTypeConstraint: ""
    }
]


export function AIAgentWizard() {
    const { rpcClient } = useRpcContext();
    const [filePath, setFilePath] = useState<string>("");
    const [step, setStep] = useState<number>(0);
    const [openToolsForm, setOpenToolsForm] = useState<boolean>(false);
    const [agentFields, setAgentFields] = useState<FormField[]>([]);
    const [agentEntryFields, setAgentEntryFields] = useState<FormField[]>([]);
    const [entryPointFields, setEntryPointFields] = useState<FormField[]>([]);
    const [modelFields, setModelFields] = useState<FormField[]>([]);
    const [toolsFields, setToolsFields] = useState<FormField[]>([]);

    const [newTools, setNewTools] = useState<AgentTool[]>([]);

    const [agentRequest, setAgentRequest] = useState<AIAgentRequest>(undefined);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [loadingMsg, setLoadingMsg] = useState<string>("Loading AI Agent...");

    useEffect(() => {
        rpcClient.getAIAgentRpcClient().getAllAgents().then(res => {
            console.log("All Agents ", res);
        });
        rpcClient.getAIAgentRpcClient().getAllModels({ agent: "FunctionCallAgent" }).then(res => {
            console.log("All FunctionCallAgent ", res);
        });

        rpcClient.getVisualizerLocation().then(res => {
            setFilePath(Utils.joinPath(URI.file(res.projectUri), 'agents.bal').fsPath)
            rpcClient.getAIAgentRpcClient().getModels({ agent: "FunctionCallAgent", filePath: Utils.joinPath(URI.file(res.projectUri), 'agents.bal').fsPath }).then(res => {
                console.log("Get models functionCallAgent ", res);
            });
        });
    }, []);


    const getNodeTemplate = async (codeData: CodeData, filePath: string) => {
        const res = await rpcClient
            .getBIDiagramRpcClient()
            .getNodeTemplate({
                position: { line: 0, offset: 0 },
                filePath: filePath,
                id: codeData,
            });
        const flowNode = res.flowNode;
        return flowNode;
    }

    useEffect(() => {
        if (filePath) {
            setAgentFields(_agentFields);
            setupEntryPointFields();
            setupAgentEntryPointFields();
            setupModelFields();
            setupToolsFields();
        }
    }, [filePath]);

    useEffect(() => {
        setupToolsFields();
    }, [newTools]);


    const setupEntryPointFields = async () => {
        setIsLoading(true);
        const field: FormField = {
            key: `name`,
            label: "Select Entry Point",
            type: "DROPDOWN_CHOICE",
            optional: false,
            editable: true,
            documentation: "Select your integration event",
            value: "",
            valueTypeConstraint: "",
        }

        const items: OptionProps[] = [];
        const dynamicFormFields: { [key: string]: FormField[] } = {};

        // Push Automation Entry
        const automationContent = (
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
                <Icon name="bi-task" iconSx={{ fontSize: 20 }} sx={{ fontSize: 20 }} />
                <span style={{ marginLeft: '10px' }}>Automation</span>
            </div>
        )
        items.push({ value: "automation", content: automationContent })

        // Push HTTP Service Entry
        const serviceContent = (
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
                <Icon name="bi-http-service" iconSx={{ fontSize: 20 }} sx={{ fontSize: 20 }} />
                <span style={{ marginLeft: '10px' }}>HTTP Service</span>
            </div>
        )
        items.push({ value: "http", content: serviceContent })


        // Fetch triggers and assign them to entry values
        const triggerList = await rpcClient.getServiceDesignerRpcClient().getTriggerModels({ query: "" });
        triggerList.local
            .filter((t) => t.type === "event")
            .forEach(async (trigger) => {
                items.push({ value: trigger.moduleName, content: triggerItem(trigger) })

                const triggerModel = await rpcClient.getServiceDesignerRpcClient().getServiceModel({ filePath: "", moduleName: trigger.moduleName });
                if (triggerModel.service.functions) {
                    dynamicFormFields[trigger.moduleName] = [{
                        key: "functionName",
                        label: "Select Entry Resource",
                        type: "SINGLE_SELECT",
                        optional: false,
                        editable: true,
                        documentation: "Select the trigger resource",
                        value: "",
                        items: triggerModel.service.functions.map(func => func.name.value),
                        valueTypeConstraint: "",
                    }]
                }
            })

        field.itemOptions = items;
        field.items = items.map(item => item.value);
        field.dynamicFormFields = dynamicFormFields;
        console.log("Dynamic Fields ", dynamicFormFields);
        setEntryPointFields([field]);
        setIsLoading(false);
    }

    const setupAgentEntryPointFields = async () => {
        setIsLoading(true);
        const field: FormField = {
            key: `name`,
            label: "Entry Point Template",
            type: "DROPDOWN_CHOICE",
            optional: false,
            editable: true,
            documentation: "Choose the entry point for your integration",
            value: "",
            valueTypeConstraint: "",
        }

        const items: OptionProps[] = [];
        const dynamicFormFields: { [key: string]: FormField[] } = {};

        // Push Automation Entry
        const automationContent = (
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
                <Icon name="bi-task" iconSx={{ fontSize: 20 }} sx={{ fontSize: 20 }} />
                <span style={{ marginLeft: '10px' }}>Automation</span>
            </div>
        )
        items.push({ value: "automation", content: automationContent })

        // Push HTTP Service Entry
        const serviceContent = (
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
                <Icon name="bi-http-service" iconSx={{ fontSize: 20 }} sx={{ fontSize: 20 }} />
                <span style={{ marginLeft: '10px' }}>HTTP Service</span>
            </div>
        )
        items.push({ value: "http", content: serviceContent })


        // Fetch triggers and assign them to entry values
        const triggerList = await rpcClient.getServiceDesignerRpcClient().getTriggerModels({ query: "" });
        triggerList.local
            .filter((t) => t.type === "event")
            .forEach(async (trigger) => {
                items.push({ value: trigger.moduleName, content: triggerItem(trigger) })

                const triggerModel = await rpcClient.getServiceDesignerRpcClient().getServiceModel({ filePath: "", moduleName: trigger.moduleName });
                if (triggerModel.service.functions) {
                    dynamicFormFields[trigger.moduleName] = [{
                        key: "functionName",
                        label: "Select Entry Resource",
                        type: "SINGLE_SELECT",
                        optional: false,
                        editable: true,
                        documentation: "Select the trigger resource",
                        value: "",
                        items: triggerModel.service.functions.map(func => func.name.value),
                        valueTypeConstraint: "",
                    }]
                }
            })

        field.itemOptions = items;
        field.items = items.map(item => item.value);
        field.dynamicFormFields = dynamicFormFields;
        console.log("Dynamic Fields ", dynamicFormFields);
        setAgentEntryFields([..._agentFields, field]);
        setIsLoading(false);
    }

    const setupModelFields = async () => {
        setIsLoading(true);
        const field: FormField = {
            key: `name`,
            label: "Choose AI Provider",
            type: "DROPDOWN_CHOICE",
            optional: false,
            editable: true,
            documentation: "Select your AI model for the agent.",
            value: "",
            valueTypeConstraint: "",
        }

        const items: OptionProps[] = [];
        const dynamicFormFields: { [key: string]: FormField[] } = {};

        items.push({ value: "", content: "" })


        const allModels = (await rpcClient.getAIAgentRpcClient().getAllModels({ agent: "FunctionCallAgent" })).models;


        console.log("All Models", allModels);

        for (const model of allModels) {
            const nodeModel = await getNodeTemplate(model, filePath);
            console.log("nodeModel", model.object, nodeModel);
            items.push({ value: model.object, content: model.object });
            dynamicFormFields[model.object] = convertConfig(nodeModel.properties);
        }

        field.itemOptions = items;
        field.items = items.map(item => item.value);
        field.dynamicFormFields = dynamicFormFields;
        console.log("Dynamic Fields ", dynamicFormFields);
        setModelFields([field]);
        setIsLoading(false);
    }

    const setupToolsFields = async () => {
        setIsLoading(true);
        const field: FormField = {
            key: `name`,
            label: "Add Tools",
            type: "MULTIPLE_SELECT",
            optional: false,
            editable: true,
            documentation: "Add Tools to your AI Agent",
            value: "",
            valueTypeConstraint: "",
            addNewButton: true,
            addNewButtonLabel: "Create New Tool"
        }
        const existingTools = await rpcClient.getAIAgentRpcClient().getTools({ filePath });
        field.items = existingTools?.tools.map(item => item);
        if (newTools.length > 0) {
            field.value = [];
            newTools.forEach(tool => {
                field.items.push(tool.toolName);
                (field.value as any[]).push(tool.toolName);
            })
        }
        setToolsFields([field]);
        setIsLoading(false);
    }

    const triggerItem = (item: ServiceModel) => {
        return (
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
                {getEntryNodeIcon(item, "20px")}
                <span style={{ marginLeft: '10px' }}>{item.displayName}</span>
            </div>
        );
    }


    const handleAgentConfigFormSubmit = async (value: FormField[]) => {
        setAgentFields(value);
        console.log("handleAgentConfigFormSubmit Fields ", value);
        const name = value[0].value as string;
        const description = value[1].value as string;
        setAgentRequest({ ...agentRequest, agentModel: { name, instruction: description } })
        setStep(1);
    }
    const handleAgentEntryConfigFormSubmit = async (value: FormField[]) => {
        setAgentFields(value);
        console.log("handleAgentConfigFormSubmit Fields ", value);
        const name = value[0].value as string;
        const description = value[1].value as string;
        setAgentRequest({ ...agentRequest, agentModel: { name, instruction: description } })
        setStep(2);
    }
    const handleEntryPointConfigFormSubmit = async (value: FormField[]) => {
        console.log("handleEntryPointConfigFormSubmit Fields ", value);
        setEntryPointFields(value);
        setStep(2);
    }
    const handleModelConfigFormSubmit = async (value: FormField[], data: FormValues) => {
        console.log("handleModelConfigFormSubmit Fields ", data, value);
        setModelFields(value);
        setStep(3);
    }
    const handleFinish = async (value: FormField[]) => {

        console.log("handleFinish Fields ", value);

        setIsLoading(true);


        // Mimic the agent creation flow with different messages as it takes some time.
        setLoadingMsg("Creating AI Agent...");
        await new Promise(resolve => setTimeout(resolve, 3000));
        setLoadingMsg("Configuring Entry Point...")
        await new Promise(resolve => setTimeout(resolve, 3000));
        setLoadingMsg("Setting up Model Configuration...")
        await new Promise(resolve => setTimeout(resolve, 3000));
        setLoadingMsg("Integrating Tools...")
        await new Promise(resolve => setTimeout(resolve, 3000));
        setLoadingMsg("Finalizing AI Agent Creation...")
        await new Promise(resolve => setTimeout(resolve, 3000));
        rpcClient.getVisualizerRpcClient().goHome();

        // const dynamicResources = entryPointFields[0].dynamicFormFields[entryPointFields[0].value as string];
        // const dynamicModelConfigs = modelFields[0].dynamicFormFields[modelFields[0].value as string];

        // const modelConfigs: { [key: string]: string } = {};

        // if (dynamicModelConfigs) {
        //     dynamicModelConfigs.forEach(config => {
        //         modelConfigs[config.key] = config.value as string;
        //     })
        // }
        // const req: AIAgentRequest = {
        //     agentModel: { name: agentFields[0].value as string, instruction: agentFields[1].value as string },
        //     entryPoint: {
        //         entryPoint: entryPointFields[0].value as string,
        //         resource: dynamicResources && dynamicResources[0].value as string
        //     },
        //     agentAIModel: {
        //         modelName: modelFields[0].value as string,
        //         modelConfigs: modelConfigs
        //     },
        //     agentTools: {
        //         tools: toolsFields[0].value as string[],
        //         newTools: newTools
        //     }
        // }
        // const response = await rpcClient.getAIAgentRpcClient().createAIAgent(req);
        // setToolsFields(value);
    }

    const handleToolCreation = (data: AgentTool) => {
        setNewTools([...newTools, data]);
        setOpenToolsForm(false);
    }

    const onBack = () => {
        setStep(1);
    }

    const defaultSteps = ["Agent", "Entry Point", "Model Configuration", "Tool Integration"];
    const defaultSteps2 = ["Agent Integration", "Model Configuration", "Tool Integration"];

    return (
        <View>
            <TopNavigationBar />
            <TitleBar title="AI Agent" subtitle="Create a new AI agent for your integration" />
            <ViewContent>
                <Container>
                    <StepperContainer>
                        <Stepper alignment='flex-start' steps={defaultSteps2} currentStep={step} />
                    </StepperContainer>
                    {isLoading &&
                        <LoadingContainer>
                            <LoadingRing message={loadingMsg} />
                        </LoadingContainer>
                    }
                    {!isLoading && step === 0 &&
                        <>
                            {/* <AgentConfigForm formFields={agentFields} onSubmit={handleAgentConfigFormSubmit} /> */}
                            <AgentEntryConfigForm formFields={agentEntryFields} onSubmit={handleAgentEntryConfigFormSubmit} />
                        </>
                    }
                    {/* {!isLoading && step === 1 &&
                        <>
                            <EntryPointConfigForm formFields={entryPointFields} onSubmit={handleEntryPointConfigFormSubmit} onBack={() => setStep(0)} />
                        </>
                    } */}
                    {!isLoading && step === 2 &&
                        <>
                            {/* <ModelConfigForm formFields={modelFields} onSubmit={handleModelConfigFormSubmit} onBack={() => setStep(1)} /> */}
                            <ModelConfigForm formFields={modelFields} onSubmit={handleModelConfigFormSubmit} onBack={() => setStep(0)} />
                        </>
                    }
                    {!isLoading && step === 3 &&
                        <>
                            {!openToolsForm && <ToolsConfigForm formFields={toolsFields} onSubmit={handleFinish} openToolsForm={() => setOpenToolsForm(true)} onBack={() => setStep(2)} formSubmitText="Finish" />}
                            {openToolsForm && <ToolsCreateForm onSubmit={handleToolCreation} onBack={() => setOpenToolsForm(false)} />}
                        </>
                    }
                </Container>
            </ViewContent>
        </View >


    );
};
