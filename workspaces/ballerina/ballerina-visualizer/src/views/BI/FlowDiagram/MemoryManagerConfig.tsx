/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { CodeData, FlowNode, NodeProperties } from "@wso2-enterprise/ballerina-core";
import { FormField, FormValues } from "@wso2-enterprise/ballerina-side-panel";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { convertConfig } from "../../../utils/bi";
import ConfigForm from "./ConfigForm";
import { Dropdown } from "@wso2-enterprise/ui-toolkit";
import { cloneDeep } from "lodash";
import { RelativeLoader } from "../../../components/RelativeLoader";
import { getAgentFilePath } from "./utils";

const Container = styled.div`
    padding: 16px;
    height: 100%;
`;

const LoaderContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
`;

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
`;

interface MemoryManagerConfigProps {
    agentCallNode: FlowNode;
    onSave?: () => void;
}

export function MemoryManagerConfig(props: MemoryManagerConfigProps): JSX.Element {
    const { agentCallNode, onSave } = props;

    const { rpcClient } = useRpcContext();
    // use selected memory manager
    const [memoryManagersCodeData, setMemoryManagersCodeData] = useState<CodeData[]>([]);
    const [selectedMemoryManagerCodeData, setSelectedMemoryManagerCodeData] = useState<CodeData>();
    // already assigned memory manager
    const [selectedMemoryManager, setSelectedMemoryManager] = useState<FlowNode>();
    const [selectedMemoryManagerFields, setSelectedMemoryManagerFields] = useState<FormField[]>([]);

    const [loading, setLoading] = useState<boolean>(false);
    const [savingForm, setSavingForm] = useState<boolean>(false);

    const agentFilePath = useRef<string>("");
    const agentNodeRef = useRef<FlowNode>();
    const moduleConnectionNodes = useRef<FlowNode[]>([]);
    const selectedMemoryManagerFlowNode = useRef<FlowNode>();

    useEffect(() => {
        initPanel();
    }, []);

    useEffect(() => {
        if (memoryManagersCodeData?.length > 0 && selectedMemoryManager && !selectedMemoryManagerCodeData) {
            fetchMemoryManagerNodeTemplate(selectedMemoryManager.codedata);
        }
    }, [memoryManagersCodeData, selectedMemoryManager]);

    const initPanel = async () => {
        setLoading(true);
        agentFilePath.current = await getAgentFilePath(rpcClient);
        // fetch all memory managers
        await fetchMemoryManagers();
        // fetch selected agent memory manager
        await fetchSelectedAgentMemoryManager();
        setLoading(false);
    };

    const fetchMemoryManagers = async () => {
        console.log(">>> agent call node", agentCallNode);
        const agentName = agentCallNode?.properties.connection.value;
        if (!agentName) {
            console.error("Agent name not found", agentCallNode);
            return;
        }
        try {
            const memoryManagers = await rpcClient
                .getAIAgentRpcClient()
                .getAllMemoryManagers({ filePath: agentFilePath.current });
            console.log(">>> all memory managers", memoryManagers);
            if (memoryManagers.memoryManagers) {
                setMemoryManagersCodeData(memoryManagers.memoryManagers);
            } else {
                console.error("Memory managers not found", memoryManagers);
            }
        } catch (error) {
            console.error("Error fetching memory managers", error);
        }
    };

    const fetchSelectedAgentMemoryManager = async () => {
        // get module nodes
        const moduleNodes = await rpcClient.getBIDiagramRpcClient().getModuleNodes();
        console.log(">>> module nodes", moduleNodes);
        if (moduleNodes.flowModel.connections.length > 0) {
            moduleConnectionNodes.current = moduleNodes.flowModel.connections;
        }
        // get agent name
        const agentName = agentCallNode.properties.connection.value;
        // get agent node
        const agentNode = moduleConnectionNodes.current.find((node) => node.properties.variable.value === agentName);
        console.log(">>> agent node", agentNode);
        if (!agentNode) {
            console.error("Agent node not found", agentCallNode);
            return;
        }
        agentNodeRef.current = agentNode;
        // get memory manager name
        const memoryManagerName = (agentNode?.properties?.memoryManager?.value as string) || "";
        console.log(">>> memory manager name", memoryManagerName);
        // get memory manager node
        const memoryManagerNode = moduleConnectionNodes.current.find(
            (node) => node.properties.variable.value === memoryManagerName.trim().replace(/\n/g, "")
        );
        setSelectedMemoryManager(memoryManagerNode);
        console.log(">>> selected memory manager node", memoryManagerNode);
    };

    // fetch selected memory manager code data - node template
    const fetchMemoryManagerNodeTemplate = async (memoryManagerCodeData: CodeData) => {
        setLoading(true);
        let nodeProperties: NodeProperties = {};
        if (selectedMemoryManager?.codedata.object === memoryManagerCodeData.object) {
            // use selected memory manager properties
            selectedMemoryManagerFlowNode.current = cloneDeep(selectedMemoryManager);
            nodeProperties = selectedMemoryManager?.properties;
        } else {
            const memoryManagerNodeTemplate = await getNodeTemplate(memoryManagerCodeData, agentFilePath.current);
            console.log(">>> selected memory manager node template", {
                memoryManagerNodeTemplate,
                memoryManagerCodeData,
            });
            selectedMemoryManagerFlowNode.current = cloneDeep(memoryManagerNodeTemplate);
            nodeProperties = memoryManagerNodeTemplate.properties;
        }
        console.log(">>> node properties", nodeProperties);
        // use same variable name for memory manager fields
        if (selectedMemoryManager?.properties.variable) {
            nodeProperties.variable.value = selectedMemoryManager?.properties.variable.value;
        } else {
            console.error("Already assigned memory manager node variable not found", selectedMemoryManager);
        }

        const memoryManagerFields = convertConfig(nodeProperties);
        setSelectedMemoryManagerFields(memoryManagerFields);
        setLoading(false);
    };

    const getNodeTemplate = async (codeData: CodeData, filePath: string) => {
        const response = await rpcClient.getBIDiagramRpcClient().getNodeTemplate({
            position: { line: 0, offset: 0 },
            filePath: filePath,
            id: codeData,
        });
        console.log(">>> get node template response", response);
        return response?.flowNode;
    };

    const handleOnSave = async (data: FormField[], rawData: FormValues) => {
        console.log(">>> save value", { data, rawData });
        setSavingForm(true);
        // create new memory manager
        const nodeTemplate = selectedMemoryManagerFlowNode.current;
        data.forEach((field) => {
            if (field.editable) {
                nodeTemplate.properties[field.key as keyof typeof nodeTemplate.properties].value = field.value;
            }
        });
        nodeTemplate.codedata.isNew = true;
        console.log(">>> request getSourceCode with template ", { nodeTemplate });
        const response = await rpcClient
            .getBIDiagramRpcClient()
            .getSourceCode({ filePath: agentFilePath.current, flowNode: nodeTemplate });
        console.log(">>> response getSourceCode with template ", { response });
        // update agent node memory manager
        if (!agentNodeRef.current) {
            console.error("Agent node not found", { agentCallNode, agentNodeRef });
            return;
        }
        const updatedAgentNode = cloneDeep(agentNodeRef.current);
        updatedAgentNode.properties.memoryManager.value = nodeTemplate.properties.variable.value;
        console.log(">>> updated agent node", updatedAgentNode);
        const updatedAgentNodeResponse = await rpcClient.getBIDiagramRpcClient().getSourceCode({
            filePath: agentFilePath.current,
            flowNode: updatedAgentNode,
        });
        console.log(">>> updated agent node response", updatedAgentNodeResponse);
        onSave?.();
        setSavingForm(false);
    };

    const memoryManagerDropdownPlaceholder = "Select a memory manager...";

    return (
        <Container>
            {memoryManagersCodeData?.length > 0 && (
                <Row>
                    <Dropdown
                        isRequired
                        errorMsg=""
                        id="agent-memory-dropdown"
                        items={[
                            { value: memoryManagerDropdownPlaceholder, content: memoryManagerDropdownPlaceholder },
                            ...memoryManagersCodeData.map((memory) => ({
                                value: memory.object,
                                content: memory.object,
                            })),
                        ]}
                        label="Select Memory Manager"
                        description={"Available Memory Managers"}
                        onValueChange={(value) => {
                            if (value === memoryManagerDropdownPlaceholder) {
                                return; // Skip the init option
                            }
                            const selectedMemoryManagerCodeData = memoryManagersCodeData.find(
                                (memory) => memory.object === value
                            );
                            setSelectedMemoryManagerCodeData(selectedMemoryManagerCodeData);
                            fetchMemoryManagerNodeTemplate(selectedMemoryManagerCodeData);
                        }}
                        value={
                            selectedMemoryManagerCodeData?.object ||
                            (agentCallNode?.metadata?.data?.memoryManager?.type as string) ||
                            memoryManagerDropdownPlaceholder
                        }
                        containerSx={{ width: "100%" }}
                    />
                </Row>
            )}
            {loading && (
                <LoaderContainer>
                    <RelativeLoader />
                </LoaderContainer>
            )}
            {!loading && selectedMemoryManagerFields?.length > 0 && (
                <ConfigForm
                    formFields={selectedMemoryManagerFields}
                    filePath={agentFilePath.current}
                    onSubmit={handleOnSave}
                    disableSaveButton={savingForm}
                />
            )}
        </Container>
    );
}
