/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from 'react';
import { AgentTool, AgentToolRequest, AIAgentRequest, CodeData, EVENT_TYPE, ListenerModel, ListenersResponse, PropertyModel, ServiceModel, TriggerModelsResponse } from '@wso2-enterprise/ballerina-core';
import { Dropdown, Icon, OptionProps, RadioButtonGroup, Stepper, Typography, View, ViewContent } from '@wso2-enterprise/ui-toolkit';
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
import { FormHeader } from '../../../components/FormHeader';
import { RelativeLoader } from '../../../components/RelativeLoader';
import { AIAgentSidePanel } from './AIAgentSidePanel';

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

const ChoiceSection = styled.div`
    max-width: 600px;
    display: grid;
`;

const ChoicePaddingSection = styled.div`
    padding: 16px;
`;


export function AIAgentWizard() {
    const { rpcClient } = useRpcContext();
    const [filePath, setFilePath] = useState<string>("");

    const [step, setStep] = useState<number>(0);


    const [modelState, setModelState] = useState<number>(1); // 1 = New | 2 = Existing

    const [openToolsForm, setOpenToolsForm] = useState<boolean>(false);

    const [agentFields, setAgentFields] = useState<FormField[]>([]);
    const [modelFields, setModelFields] = useState<FormField[]>([]);
    const [toolsFields, setToolsFields] = useState<FormField[]>([]);

    const [existingModels, setExistingModel] = useState<string[]>([]);

    const [newModels, setNewModels] = useState<CodeData[]>([]);
    const [selectedNewModel, setSelectedNewModel] = useState<string>("");

    const [newTools, setNewTools] = useState<AgentToolRequest[]>([]);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [fetching, setFetching] = useState<boolean>(false);
    const [loadingMsg, setLoadingMsg] = useState<string>("Loading AI Agent...");

    useEffect(() => {
        rpcClient.getVisualizerLocation().then(res => {
            setFilePath(Utils.joinPath(URI.file(res.projectUri), 'agents.bal').fsPath)
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
            setupAgentFields();

        }
    }, [filePath]);

    useEffect(() => {
        if (step === 2 && !openToolsForm) {
            setupToolsFields();
        }
    }, [newTools, step]);

    useEffect(() => {
        switch (modelState) {
            case 1: // Set New Models Form Values
                selectedNewModel && setupModelFields();
                break;
            case 2: // Set Existing Models Form Values
                setupModelFieldsExisting();
                break;
            default:
                break;
        }
    }, [modelState, selectedNewModel]);


    const setupAgentFields = async () => {
        setIsLoading(true);

        const allAgents = (await rpcClient.getAIAgentRpcClient().getAllAgents({ filePath }));
        console.log("All Agents: ", allAgents);
        const fixedAgent = allAgents.agents.at(0);

        const existingModels = await rpcClient.getAIAgentRpcClient().getModels({ agent: fixedAgent.object, filePath });
        console.log("Get existingModels ", existingModels);
        setExistingModel(existingModels.models);

        const newModels = await rpcClient.getAIAgentRpcClient().getAllModels({ agent: fixedAgent.object, filePath })
        console.log("Get newModels ", newModels);
        setNewModels(newModels.models);


        const nodeModel = await getNodeTemplate(fixedAgent, filePath);
        console.log("AI Agent node template: ", nodeModel);

        const formProperties = convertConfig(nodeModel.properties, nodeModel.metadata.data.paramsToHide);
        console.log(">>> AI AGENT Form properties", formProperties);
        setAgentFields(formProperties);
        setIsLoading(false);
    }

    const setupModelFields = async () => {
        setFetching(true);

        const nodeModel = await getNodeTemplate(newModels.find(val => val.object === selectedNewModel), filePath);
        console.log("New Model node template: ", nodeModel);

        const formProperties = convertConfig(nodeModel.properties);
        console.log(">>> New Model node Form properties", formProperties);
        setModelFields(formProperties);
        setFetching(false);
    }

    const setupModelFieldsExisting = async () => {
        const field: FormField = {
            key: `models`,
            label: "Existing Models",
            type: "SINGLE_SELECT",
            optional: false,
            editable: true,
            documentation: "Add existing model to AI Agent",
            value: "",
            items: existingModels.map(val => val),
            valueTypeConstraint: "",
            enabled: true
        }
        console.log(">>> Existing Model node Form properties", field);
        setModelFields([field]);
    }

    const setupToolsFields = async () => {
        setFetching(true);
        const field: FormField = {
            key: `name`,
            label: "Add Tools",
            type: "MULTIPLE_SELECT",
            optional: false,
            editable: true,
            documentation: "Add Tools to your AI Agent",
            value: [],
            valueTypeConstraint: "",
            addNewButton: true,
            addNewButtonLabel: "Create New Tool",
            enabled: true
        }
        const existingTools = await rpcClient.getAIAgentRpcClient().getTools({ filePath });
        field.items = existingTools?.tools ? existingTools?.tools.map(item => item) : [];
        if (newTools.length > 0) {
            newTools.forEach(tool => {
                field.items.push(tool.toolName);
                if (!(field.value as any[]).includes(tool.toolName)) {
                    (field.value as any[]).push(tool.toolName);
                }
            })
        }
        setToolsFields([field]);
        setFetching(false);
    }

    const handleAgentConfigFormSubmit = async (value: FormField[]) => {
        setAgentFields(value);
        console.log("handleAgentConfigFormSubmit Fields ", value);
        setStep(1);
    }

    const handleModelConfigFormSubmit = async (value: FormField[], data: FormValues) => {
        console.log("handleModelConfigFormSubmit Fields ", data, value);
        setModelFields(value);
        setStep(2);
    }
    const handleFinish = async (value: FormField[]) => {
        console.log("toolsFields ", value);
        const selectedTools = value.at(0).value as string[];
        const updatedNewTools = newTools.filter(tool => selectedTools.includes(tool.toolName));  // Remove all the unused tools from new tools array
        setIsLoading(true);
        const req: AIAgentRequest = {
            agentFields: agentFields,
            modelState: modelState,
            selectedModel: selectedNewModel,
            modelFields: modelFields,
            toolsFields: toolsFields,
            newTools: updatedNewTools
        }
        const response = await rpcClient.getAIAgentRpcClient().createAIAgent(req);
        console.log("Response: ", response)

        // Redirect to relevant page
        rpcClient.getVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { documentUri: response.filePath, position: response.position } })
    }

    // TODO: Remove these once side panel is final
    // const handleToolCreation = (data: AgentTool) => {
    //     setNewTools([...newTools, data]);
    //     setOpenToolsForm(false);
    // }

    useEffect(() => {
        console.log("xxx openToolsForm changed to:", openToolsForm);
    }, [openToolsForm]);

    const handleToolCreationSidePanel = (data: AgentToolRequest) => {
        setNewTools([...newTools, data]);
        handleOnToolFormBack();
    }
    const handleOnToolFormBack = () => {
        setOpenToolsForm(false);
    }
    const handleToolFormOpen = () => {
        setOpenToolsForm(true);
    }

    const defaultSteps = ["Agent Configuration", "Model Configuration", "Tool Integration"];

    return (
        <View>
            <TopNavigationBar />
            <TitleBar title="AI Agent" subtitle="Create a new AI agent for your integration" />
            <ViewContent>
                <Container>
                    <StepperContainer>
                        <Stepper alignment='flex-start' steps={defaultSteps} currentStep={step} />
                    </StepperContainer>
                    {isLoading &&
                        <LoadingContainer>
                            <LoadingRing message={loadingMsg} />
                        </LoadingContainer>
                    }
                    {!isLoading && step === 0 &&
                        <>
                            <AgentConfigForm formFields={agentFields} onSubmit={handleAgentConfigFormSubmit} />
                        </>
                    }
                    {!isLoading && step === 1 &&
                        <>
                            <ChoiceSection>
                                <FormHeader title={`Configure LLM Model`} subtitle={`Choose a foundation model or reuse an existing configuration.`} />
                                <ChoicePaddingSection>
                                    <RadioButtonGroup
                                        id="model-options"
                                        defaultValue={1}
                                        defaultChecked={true}
                                        value={modelState}
                                        options={[{ value: 1, content: "Create New Model" }, { value: 2, content: "Use Existing Model" }]}
                                        onChange={(e) => {
                                            const checkedValue = Number(e.target.value);
                                            setModelState(checkedValue);
                                        }}
                                    />
                                </ChoicePaddingSection>
                                {modelState === 1 &&
                                    <>
                                        <ChoicePaddingSection>
                                            <Dropdown
                                                isRequired
                                                errorMsg=""
                                                id="drop-down"
                                                items={[{ value: "- Select -" }, ...newModels.map((model) => ({ value: model.object, content: model.object }))]}
                                                label="Select AI Model"
                                                description={"Available AI Models"}
                                                onValueChange={(value: string) => {
                                                    if (value === "Select Model") {
                                                        return; // Skip the init option
                                                    }
                                                    setSelectedNewModel(value)
                                                }}
                                                value={selectedNewModel}
                                                containerSx={{ paddingRight: 16 }}
                                            />
                                        </ChoicePaddingSection>
                                        {fetching &&
                                            <RelativeLoader message={"Fetching Model Form"} />
                                        }
                                        {!fetching && selectedNewModel &&
                                            <ModelConfigForm formFields={modelFields} onSubmit={handleModelConfigFormSubmit} onBack={() => setStep(0)} />
                                        }
                                    </>
                                }
                                {modelState === 2 &&
                                    <>
                                        {existingModels.length > 0 &&
                                            <ModelConfigForm formFields={modelFields} onSubmit={handleModelConfigFormSubmit} onBack={() => setStep(0)} />
                                        }
                                        {existingModels.length === 0 &&
                                            <BottomMarginTextWrapper>
                                                <Typography variant="body3">
                                                    There are no existing models. Please create a new model
                                                </Typography>
                                            </BottomMarginTextWrapper>
                                        }
                                    </>
                                }
                            </ChoiceSection>
                        </>
                    }
                    {!isLoading && step === 2 &&
                        <>
                            {fetching &&
                                <BottomMarginTextWrapper>
                                    <RelativeLoader message={"Loading tools.."} />
                                </BottomMarginTextWrapper>
                            }
                            {!fetching && <ToolsConfigForm formFields={toolsFields} onSubmit={handleFinish} openToolsForm={handleToolFormOpen} onBack={() => setStep(1)} formSubmitText="Finish" />}
                            {/* {!fetching && openToolsForm && <ToolsCreateForm onSubmit={handleToolCreation} onBack={() => setOpenToolsForm(false)} />} */}
                            {!fetching && <AIAgentSidePanel projectPath={filePath} showSidePanel={openToolsForm} onSubmit={handleToolCreationSidePanel} onBack={handleOnToolFormBack} />}
                        </>
                    }
                </Container>
            </ViewContent>
        </View >


    );
};
