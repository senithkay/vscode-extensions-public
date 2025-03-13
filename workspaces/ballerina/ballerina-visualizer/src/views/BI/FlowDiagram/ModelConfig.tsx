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
import { URI, Utils } from "vscode-uri";
import ConfigForm from "./ConfigForm";
import { Dropdown } from "@wso2-enterprise/ui-toolkit";
import { cloneDeep } from "lodash";

const Container = styled.div`
    padding: 16px;
`;

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
`;

interface ModelConfigProps {
    agentCallNode: FlowNode;
    onSave?: () => void;
}

export function ModelConfig(props: ModelConfigProps): JSX.Element {
    const { agentCallNode, onSave } = props;

    const { rpcClient } = useRpcContext();
    // use selected model
    const [modelsCodeData, setModelsCodeData] = useState<CodeData[]>([]);
    const [selectedModelCodeData, setSelectedModelCodeData] = useState<CodeData>();
    // already assigned model
    const [selectedModel, setSelectedModel] = useState<FlowNode>();
    const [selectedModelFields, setSelectedModelFields] = useState<FormField[]>([]);
    const [savingForm, setSavingForm] = useState<boolean>(false);

    const filepath = useRef<string>("");
    const moduleConnectionNodes = useRef<FlowNode[]>([]);
    const selectedModelFlowNode = useRef<FlowNode>();

    useEffect(() => {
        // get file path
        rpcClient.getVisualizerLocation().then((res) => {
            filepath.current = Utils.joinPath(URI.file(res.projectUri), "agents.bal").fsPath;
        });
        // get all models
        fetchModels();
        // fetch selected agent model
        fetchSelectedAgentModel();
    }, []);

    useEffect(() => {
        if (modelsCodeData.length > 0 && selectedModel && !selectedModelCodeData) {
            fetchModelNodeTemplate(selectedModel.codedata);
        }
    }, [modelsCodeData, selectedModel]);

    const fetchModels = async () => {
        console.log(">>> agent call node", agentCallNode);
        const agentName = agentCallNode?.properties.connection.value;
        if (!agentName) {
            console.error("Agent name not found", agentCallNode);
            return;
        }
        const models = await rpcClient
            .getAIAgentRpcClient()
            .getAllModels({ agent: agentName, filePath: filepath.current });
        console.log(">>> all models", models);
        setModelsCodeData(models.models);
    };

    const fetchSelectedAgentModel = async () => {
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
        // get model name
        const modelName = agentNode?.properties.model.value;
        console.log(">>> model name", modelName);
        // get model node
        const modelNode = moduleConnectionNodes.current.find((node) => node.properties.variable.value === modelName);
        setSelectedModel(modelNode);
        console.log(">>> selected model node", modelNode);
    };

    // fetch selected model code data - node template
    const fetchModelNodeTemplate = async (modelCodeData: CodeData) => {
        let nodeProperties: NodeProperties = {};
        if (selectedModel?.codedata.object === modelCodeData.object) {
            // use selected model properties
            selectedModelFlowNode.current = cloneDeep(selectedModel);
            nodeProperties = selectedModel?.properties;
        } else {
            const modelNodeTemplate = await getNodeTemplate(modelCodeData, filepath.current);
            console.log(">>> selected model node template", { modelNodeTemplate, modelCodeData });
            selectedModelFlowNode.current = cloneDeep(modelNodeTemplate);
            nodeProperties = modelNodeTemplate.properties;
        }
        console.log(">>> node properties", nodeProperties);
        // use same variable name for model fields
        nodeProperties.variable = selectedModel?.properties.variable;

        const modelFields = convertConfig(nodeProperties);
        setSelectedModelFields(modelFields);
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
        const nodeTemplate = selectedModelFlowNode.current;
        data.forEach((field) => {
            if (field.editable) {
                nodeTemplate.properties[field.key as keyof typeof nodeTemplate.properties].value = field.value;
            }
        });
        // update codedata range with already assigned model range (override)
        nodeTemplate.codedata.lineRange = selectedModel?.codedata.lineRange;
        // update isNew to false
        nodeTemplate.codedata.isNew = false;
        console.log(">>> request getSourceCode with template ", { nodeTemplate });
        // update source
        const response = await rpcClient
            .getBIDiagramRpcClient()
            .getSourceCode({ filePath: filepath.current, flowNode: nodeTemplate });
        console.log(">>> response getSourceCode with template ", { response });
        onSave?.();
        setSavingForm(false);
    };

    return (
        <Container>
            {modelsCodeData.length > 0 && (
                <Row>
                    <Dropdown
                        isRequired
                        errorMsg=""
                        id="agent-model-dropdown"
                        items={[
                            { value: "Select a model...", content: "Select a model..." },
                            ...modelsCodeData.map((model) => ({ value: model.object, content: model.object })),
                        ]}
                        label="Select Model Family"
                        description={"Available Model Families"}
                        onValueChange={(value) => {
                            if (value === "Select a model...") {
                                return; // Skip the init option
                            }
                            const selectedModelCodeData = modelsCodeData.find((model) => model.object === value);
                            setSelectedModelCodeData(selectedModelCodeData);
                            fetchModelNodeTemplate(selectedModelCodeData);
                        }}
                        value={selectedModelCodeData?.object || (agentCallNode.metadata.data?.model?.type as string)}
                        containerSx={{ width: "100%" }}
                    />
                </Row>
            )}
            {selectedModelFields?.length > 0 && (
                <ConfigForm formFields={selectedModelFields} onSubmit={handleOnSave} disableSaveButton={savingForm} />
            )}
        </Container>
    );
}
