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
import { CodeData, FlowNode, LinePosition, LineRange } from "@wso2-enterprise/ballerina-core";
import { FormField, FormValues } from "@wso2-enterprise/ballerina-side-panel";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { convertConfig } from "../../../utils/bi";
import { URI, Utils } from "vscode-uri";
import ConfigForm from "./ConfigForm";
import { cloneDeep } from "lodash";

const Container = styled.div`
    padding: 16px;
`;

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
`;

interface NewAgentProps {
    agentCallNode: FlowNode;
    fileName: string; // file name of the agent call node
    lineRange: LineRange;
    onSave?: () => void;
}

export function NewAgent(props: NewAgentProps): JSX.Element {
    const { agentCallNode, fileName, lineRange, onSave } = props;
    console.log(">>> NewAgent props", props);
    const { rpcClient } = useRpcContext();

    const [agentNode, setAgentNode] = useState<FlowNode | null>(null);
    const [defaultModelNode, setDefaultModelNode] = useState<FlowNode | null>(null);
    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [savingForm, setSavingForm] = useState<boolean>(false);

    const agentFilePath = useRef<string>("");

    useEffect(() => {
        // get agent file path
        rpcClient.getVisualizerLocation().then((res) => {
            agentFilePath.current = Utils.joinPath(URI.file(res.projectUri), "agents.bal").fsPath;
        });
        fetchAgentNode();
    }, []);

    useEffect(() => {
        if (agentNode && defaultModelNode) {
            configureFormFields();
        }
    }, [agentNode, defaultModelNode]);

    const fetchAgentNode = async () => {
        // get the agent node
        const allAgents = await rpcClient.getAIAgentRpcClient().getAllAgents({ filePath: agentFilePath.current });
        console.log(">>> allAgents", allAgents);
        if (!allAgents.agents.length) {
            console.log(">>> no agents found");
            return;
        }
        const agentCodeData = allAgents.agents.at(0);
        // get agent node template
        const agentNodeTemplate = await getNodeTemplate(agentCodeData, agentFilePath.current);
        setAgentNode(agentNodeTemplate);

        // get all llm models
        const allModels = await rpcClient
            .getAIAgentRpcClient()
            .getAllModels({ agent: agentCodeData.object, filePath: agentFilePath.current });
        console.log(">>> allModels", allModels);
        // get openai model
        const defaultModel = allModels.models.find((model) => model.object === "OpenAiModel");
        if (!defaultModel) {
            console.log(">>> no default model found");
            return;
        }
        // get model node template
        const modelNodeTemplate = await getNodeTemplate(defaultModel, agentFilePath.current);
        setDefaultModelNode(modelNodeTemplate);

        // get agent call node template
    };

    const configureFormFields = () => {
        if (!(agentNode && agentCallNode)) {
            return;
        }
        const agentCallFormFields = convertConfig(agentCallNode.properties);
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

        // save model node
        const modelResponse = await rpcClient
            .getBIDiagramRpcClient()
            .getSourceCode({ filePath: agentFilePath.current, flowNode: defaultModelNode });
        console.log(">>> modelResponse getSourceCode", { modelResponse });
        const modelVarName = defaultModelNode.properties.variable.value as string;

        // wait 2 seconds (wait until LS is updated)
        console.log(">>> wait 2 seconds");
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // save the agent node
        const updatedAgentNode = cloneDeep(agentNode);
        const roleValue = (rawData["role"] || "").replace(/"/g, '\\"');
        const instructionValue = (rawData["instruction"] || "").replace(/"/g, '\\"');
        const systemPromptValue = `{role: "${roleValue}", instructions: string \`${instructionValue}\`}`;
        updatedAgentNode.properties.systemPrompt.value = systemPromptValue;
        updatedAgentNode.properties.model.value = modelVarName;
        updatedAgentNode.properties.tools.value = [];

        const agentResponse = await rpcClient
            .getBIDiagramRpcClient()
            .getSourceCode({ filePath: agentFilePath.current, flowNode: updatedAgentNode });
        console.log(">>> agentResponse getSourceCode", { agentResponse });
        const agentVarName = agentNode.properties.variable.value as string;

        // wait 2 seconds (wait until LS is updated)
        console.log(">>> wait 2 seconds");
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // update the agent call node
        const updatedAgentCallNode = cloneDeep(agentCallNode);
        updatedAgentCallNode.properties.query.value = rawData["query"];
        updatedAgentCallNode.properties.connection.value = agentVarName;
        updatedAgentCallNode.codedata.parentSymbol = agentVarName;
        // HACK: add line range
        updatedAgentCallNode.codedata.lineRange = {
            fileName: fileName,
            startLine: lineRange.startLine,
            endLine: lineRange.endLine,
        };
        console.log(">>> request getSourceCode", { filePath: fileName, flowNode: updatedAgentCallNode });
        const agentCallResponse = await rpcClient
            .getBIDiagramRpcClient()
            .getSourceCode({ filePath: fileName, flowNode: updatedAgentCallNode });
        console.log(">>> response getSourceCode with template ", { agentCallResponse });

        onSave?.();
        setSavingForm(false);
    };

    const getNodeTemplate = async (
        codeData: CodeData,
        filePath: string,
        position: LinePosition = { line: 0, offset: 0 }
    ) => {
        const response = await rpcClient.getBIDiagramRpcClient().getNodeTemplate({
            position: position,
            filePath: filePath,
            id: codeData,
        });
        console.log(">>> get node template response", response);
        return response?.flowNode;
    };

    return (
        <Container>
            <ConfigForm formFields={formFields} onSubmit={handleOnSave} disableSaveButton={savingForm} />
        </Container>
    );
}
