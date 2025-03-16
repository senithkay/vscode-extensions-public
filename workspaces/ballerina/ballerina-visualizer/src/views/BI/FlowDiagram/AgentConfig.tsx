/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { FlowNode } from "@wso2-enterprise/ballerina-core";
import { FormField, FormValues } from "@wso2-enterprise/ballerina-side-panel";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { convertConfig } from "../../../utils/bi";
import { URI, Utils } from "vscode-uri";
import ConfigForm from "./ConfigForm";
import { cloneDeep } from "lodash";

const Container = styled.div`
    padding: 16px 0 16px 16px;
`;

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
`;

interface AgentConfigProps {
    agentCallNode: FlowNode;
    fileName: string; // file name of the agent call node
    onSave?: () => void;
}

export function AgentConfig(props: AgentConfigProps): JSX.Element {
    const { agentCallNode, fileName, onSave } = props;
    console.log(">>> AgentConfig props", props);
    const { rpcClient } = useRpcContext();

    const [agentNode, setAgentNode] = useState<FlowNode | null>(null);
    const [agentCallNodeTemplate, setAgentCallNodeTemplate] = useState<FlowNode | null>(null);
    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [savingForm, setSavingForm] = useState<boolean>(false);

    const agentFilePath = useRef<string>("");

    useEffect(() => {
        initPanel();
    }, [agentCallNode]);

    useEffect(() => {
        if (agentNode && agentCallNodeTemplate) {
            configureFormFields();
        }
    }, [agentNode, agentCallNodeTemplate]);

    const initPanel = async () => {
        // get agent file path
        const filePath = await rpcClient.getVisualizerLocation();
        agentFilePath.current = Utils.joinPath(URI.file(filePath.projectUri), "agents.bal").fsPath;
        // fetch agent node
        await fetchAgentNode();
        await fetchAgentCallNode();
    };

    const fetchAgentNode = async () => {
        console.log(">>> agentNode");
        // get module nodes
        const moduleNodes = await rpcClient.getBIDiagramRpcClient().getModuleNodes();
        console.log(">>> module nodes", moduleNodes);
        // get agent name
        const agentName = agentCallNode.properties.connection.value;
        // get agent node
        const agentNode = moduleNodes.flowModel.connections.find(
            (node) => node.properties.variable.value === agentName
        );
        if (!agentNode) {
            console.error("Agent node not found");
            return;
        }
        console.log(">>> agent node", agentNode);
        setAgentNode(agentNode);
    };

    const fetchAgentCallNode = async () => {
        console.log(">>> agentCallNode", agentCallNode);
        // TODO: fetch the agent call node template and validate with the agent node
        setAgentCallNodeTemplate(agentCallNode);
    };

    const configureFormFields = () => {
        const agentCallFormFields = convertConfig(agentCallNodeTemplate.properties);
        const systemPromptProperty = agentNode.properties.systemPrompt;
        if (systemPromptProperty) {
            let roleValue = "";
            let instructionValue = "";
            if (systemPromptProperty.value) {
                const valueStr = systemPromptProperty.value.toString();
                const roleMatch = valueStr.match(/role:\s*"([^"]*)"/);
                if (roleMatch && roleMatch[1]) {
                    roleValue = roleMatch[1];
                }

                const instructionsMatch = valueStr.match(/instructions:\s*string\s*`([^`]*)`/);
                if (instructionsMatch && instructionsMatch[1]) {
                    instructionValue = instructionsMatch[1];
                }
            }

            const customFields: FormField[] = [
                {
                    key: "role",
                    label: "Role",
                    type: "STRING",
                    optional: true,
                    advanced: false,
                    placeholder: "e.g. Customer Support Assistant",
                    editable: true,
                    enabled: true,
                    documentation: "The role of the AI agent",
                    valueType: "STRING",
                    value: roleValue,
                    valueTypeConstraint: "string",
                    diagnostics: [],
                    metadata: {
                        label: "Role",
                        description: "The role of the AI agent",
                    },
                },
                {
                    key: "instruction",
                    label: "Instructions",
                    type: "TEXTAREA",
                    optional: false,
                    advanced: false,
                    placeholder: "Detailed instructions for the agent...",
                    editable: true,
                    enabled: true,
                    documentation: "Detailed instructions for the agent",
                    valueType: "STRING",
                    value: instructionValue,
                    valueTypeConstraint: "string",
                    diagnostics: [],
                    metadata: {
                        label: "Instructions",
                        description: "Detailed instructions for the agent",
                    },
                },
            ];
            const queryFieldIndex = agentCallFormFields.findIndex((field) => field.key === "query");
            if (queryFieldIndex !== -1) {
                agentCallFormFields.splice(queryFieldIndex, 0, ...customFields);
            } else {
                agentCallFormFields.push(...customFields);
            }
        }

        // let's hide connection field
        const connectionField = agentCallFormFields.find((field) => field.key === "connection");
        if (connectionField) {
            connectionField.enabled = false;
        }
        setFormFields(agentCallFormFields);
    };

    const handleOnSave = async (data: FormField[], rawData: FormValues) => {
        console.log(">>> save value", { data, rawData });
        setSavingForm(true);
        // update the agent node
        const updatedAgentNode = cloneDeep(agentNode);
        const roleValue = (rawData["role"] || "").replace(/"/g, '\\"');
        const instructionValue = (rawData["instruction"] || "").replace(/"/g, '\\"');
        const systemPromptValue = `{role: "${roleValue}", instructions: string \`${instructionValue}\`}`;
        updatedAgentNode.properties.systemPrompt.value = systemPromptValue;

        const agentResponse = await rpcClient
            .getBIDiagramRpcClient()
            .getSourceCode({ filePath: agentFilePath.current, flowNode: updatedAgentNode });
        console.log(">>> response getSourceCode with template ", { agentResponse });

        // wait 2 seconds (wait until LS is updated)
        console.log(">>> wait 2 seconds");
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // update the agent call node
        const updatedAgentCallNode = cloneDeep(agentCallNode);
        updatedAgentCallNode.properties.query.value = rawData["query"];
        console.log(">>> request getSourceCode", { filePath: fileName, flowNode: updatedAgentCallNode });
        const agentCallResponse = await rpcClient
            .getBIDiagramRpcClient()
            .getSourceCode({ filePath: fileName, flowNode: updatedAgentCallNode });
        console.log(">>> response getSourceCode with template ", { agentCallResponse });

        onSave?.();
        setSavingForm(false);
    };

    return (
        <Container>
            <ConfigForm
                formFields={formFields}
                filePath={agentFilePath.current}
                onSubmit={handleOnSave}
                disableSaveButton={savingForm}
            />
        </Container>
    );
}
