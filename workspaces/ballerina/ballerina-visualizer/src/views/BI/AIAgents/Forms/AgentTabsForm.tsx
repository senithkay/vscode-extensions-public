/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from 'react';
import { AgentToolRequest, AIAgentToolsUpdateRequest, FlowNode } from '@wso2-enterprise/ballerina-core';
import { Tabs } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { useRpcContext } from '@wso2-enterprise/ballerina-rpc-client';
import AgentConfigForm from '../Forms/AgentConfigForm';
import { LoadingContainer } from '../../../styles';
import { LoadingRing } from '../../../../components/Loader';
import { FormField } from '@wso2-enterprise/ballerina-side-panel';
import ModelConfigForm from '../Forms/ModelConfigForm';
import ToolsConfigForm from '../Forms/ToolsConfigForm';
import { URI, Utils } from 'vscode-uri';
import { convertConfig } from '../../../../utils/bi';
import { RelativeLoader } from '../../../../components/RelativeLoader';
import { AIAgentSidePanel } from '../AIAgentSidePanel';


const BottomMarginTextWrapper = styled.div`
    margin-top: 20px;
    margin-left: 20px;
    font-size: 15px;
    margin-bottom: 10px;
`;

enum Views {
    AGENT = "AGENT",
    MODEL = "MODEL",
    TOOLS = "TOOLS"
}

interface AIAgentEditViewProps {
    agentName: string;
}

export function AgentTabsForm(params: AIAgentEditViewProps) {
    const { rpcClient } = useRpcContext();

    const { agentName } = params;

    const [agentFlowNode, setAgentFlowNode] = useState<FlowNode>();
    const [modelFlowNode, setModelFlowNode] = useState<FlowNode>();
    const [savedTools, setSavedTools] = useState<string[]>([]);


    const [filePath, setFilePath] = useState<string>("");

    const [currentView, setCurrentView] = useState(Views.AGENT);
    const [openToolsForm, setOpenToolsForm] = useState<boolean>(false);

    const [agentFields, setAgentFields] = useState<FormField[]>([]);
    const [modelFields, setModelFields] = useState<FormField[]>([]);
    const [toolsFields, setToolsFields] = useState<FormField[]>([]);

    const [newTools, setNewTools] = useState<AgentToolRequest[]>([]);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [fetching, setFetching] = useState<boolean>(false);
    const [loadingMsg, setLoadingMsg] = useState<string>("Loading Configurations...");

    useEffect(() => {
        rpcClient.getVisualizerLocation().then(res => {
            setFilePath(Utils.joinPath(URI.file(res.projectUri), 'agents.bal').fsPath)
            fetchData();
        });
    }, []);


    const fetchData = async () => {
        setIsLoading(true);
        const res = await rpcClient.getBIDiagramRpcClient().getModuleNodes();

        console.log("Module Node List: ", res);
        if (!res.flowModel.connections || res.flowModel.connections.length === 0) {
            return;
        }
        const agentFlowNode = res.flowModel.connections.find(
            (node) => node.properties.variable.value === agentName
        );
        if (!agentFlowNode) {
            console.error(">>> Error finding agent node", { agentName });
        }
        setAgentFlowNode(agentFlowNode); // Get the agent node
        console.log("Agent Node: ", agentFlowNode);
        const agentProperties = convertConfig(agentFlowNode.properties);
        setAgentFields(agentProperties);


        // Get the model name and find its connection
        const modelName = agentFlowNode.properties.model.value;

        const modelFlowNode = res.flowModel.connections.find(
            (node) => node.properties.variable.value === modelName
        );
        if (!modelFlowNode) {
            console.error(">>> Error finding model node", { modelName });
        }
        setModelFlowNode(modelFlowNode); // Get the model node
        console.log("Model Node: ", modelFlowNode);
        const modelProperties = convertConfig(modelFlowNode.properties);
        setModelFields(modelProperties);

        const toolsList: string[] = (agentFlowNode.properties.tools.value as string).replace(/[\[\]]/g, '').split(',').map(item => item.trim());
        console.log("Tools List: ", toolsList);
        setSavedTools(toolsList);
        setupToolsFields(toolsList);
        setIsLoading(false);
    }

    useEffect(() => {
        if (!openToolsForm) {
            setupToolsFields(savedTools);
        }
    }, [newTools]);



    const setupToolsFields = async (toolsList: string[]) => {
        const field: FormField = {
            key: `name`,
            label: "Add Tools",
            type: "MULTIPLE_SELECT",
            optional: false,
            editable: true,
            documentation: "Add Tools to your AI Agent",
            value: toolsList,
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
    }

    const handleAgentConfigFormSubmit = async (value: FormField[]) => {
        value.forEach(field => {
            if (field.editable) {
                agentFlowNode.properties[field.key as keyof typeof agentFlowNode.properties].value = field.value;
            }
        });
        await rpcClient.getBIDiagramRpcClient().getSourceCode({ filePath, flowNode: agentFlowNode });
        console.log("Updated agent node: ", agentFlowNode);
        fetchData();
    }

    const handleModelConfigFormSubmit = async (value: FormField[]) => {
        value.forEach(field => {
            if (field.editable) {
                modelFlowNode.properties[field.key as keyof typeof modelFlowNode.properties].value = field.value;
            }
        });
        await rpcClient.getBIDiagramRpcClient().getSourceCode({ filePath, flowNode: modelFlowNode });
        console.log("Updated model node: ", modelFlowNode);
        fetchData();
    }

    const handleToolsConfigFormSubmit = async (value: FormField[]) => {
        const selectedTools = value.at(0).value as string[];
        const updatedNewTools = newTools.filter(tool => selectedTools.includes(tool.toolName));  // Remove all the unused tools from new tools array
        const req: AIAgentToolsUpdateRequest = {
            agentFlowNode: agentFlowNode,
            newTools: updatedNewTools,
            toolsFields: value
        }
        const response = await rpcClient.getAIAgentRpcClient().updateAIAgentTools(req);
        console.log("Updated tools: ", modelFlowNode);
        fetchData();
    }

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

    const handleViewChange = (view: string) => {
        setCurrentView(view as Views);
        fetchData();
    };


    return (
        <>
            <Tabs
                sx={{ paddingLeft: 10 }}
                childrenSx={{ overflowY: "auto" }}
                tabTitleSx={{ marginLeft: 5 }}
                titleContainerSx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 5,
                }}
                views={[
                    { id: Views.AGENT, name: 'Agent Configuration' },
                    { id: Views.MODEL, name: 'Model Configuration' },
                    { id: Views.TOOLS, name: 'Tool Integration' },
                ]}
                currentViewId={currentView}
                onViewChange={handleViewChange}
            >
                <div id={Views.AGENT}>
                    {isLoading &&
                        <LoadingContainer>
                            <LoadingRing message={loadingMsg} />
                        </LoadingContainer>
                    }
                    {!isLoading && <AgentConfigForm isEdit={true} formFields={agentFields} onSubmit={handleAgentConfigFormSubmit} formSubmitText={"Save"} />}
                </div>
                <div id={Views.MODEL}>
                    {isLoading &&
                        <LoadingContainer>
                            <LoadingRing message={loadingMsg} />
                        </LoadingContainer>
                    }
                    {!isLoading && <ModelConfigForm formFields={modelFields} onSubmit={handleModelConfigFormSubmit} formSubmitText={"Save"} />}
                </div>
                <div id={Views.TOOLS}>
                    {fetching &&
                        <BottomMarginTextWrapper>
                            <RelativeLoader message={"Loading tools.."} />
                        </BottomMarginTextWrapper>
                    }
                    {!fetching && <ToolsConfigForm isEdit={true} formFields={toolsFields} onSubmit={handleToolsConfigFormSubmit} openToolsForm={handleToolFormOpen} formSubmitText="Save" />}
                    {!fetching && <AIAgentSidePanel projectPath={filePath} showSidePanel={openToolsForm} onSubmit={handleToolCreationSidePanel} onBack={handleOnToolFormBack} />}
                </div>
            </Tabs>
        </ >
    );
};
