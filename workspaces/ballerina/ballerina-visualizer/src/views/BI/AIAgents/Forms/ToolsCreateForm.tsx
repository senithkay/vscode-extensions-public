/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { AutoComplete, Button, Codicon, ComponentCard, ContainerProps, Dropdown, OptionProps, RadioButtonGroup, TextField, Typography } from "@wso2-enterprise/ui-toolkit";
import { FormField, FormValues, PanelContainer } from "@wso2-enterprise/ballerina-side-panel";
import { AgentTool, AvailableNode, Category, CodeData, FlowNode, ServiceModel, SubPanel, SubPanelView } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { URI, Utils } from "vscode-uri";
import { BodyText, LoadingContainer } from "../../../styles";
import { FormGeneratorNew } from "../../Forms/FormGeneratorNew";
import { FormHeader } from "../../../../components/FormHeader";
import ConnectorView from "../../Connection/ConnectorView";
import ButtonCard from "../../../../components/ButtonCard";
import { ConnectorIcon } from "@wso2-enterprise/bi-diagram";
import { LoadingRing } from "../../../../components/Loader";
import { RelativeLoader } from "../../../../components/RelativeLoader";
import ConnectionConfigView from "../../Connection/ConnectionConfigView";

const Container = styled.div`
    max-width: 600px;
    height: 100%;
`;

const FormContainer = styled.div`
    display: grid;
    gap: 20px;
    padding: 16px;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 8px;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    margin-top: 8px;
    width: 100%;
`;

const ChoiceSection = styled.div`
    width: 100%;
    display: grid;
    gap: 20px;
`;

const ToolTypeContainer = styled.div`
    width: 100%;
    display: flex;
    gap: 10px;
`;

const ConnectorContainer = styled.div`
    width: 100%;
    display: grid;
    gap: 20px;
    margin-bottom: 20px;
`;

const LabelContainer = styled.div<ContainerProps>`
    display: flex;
    flex-direction: row;
    margin-bottom: 4px;
`;

const Description = styled.div<ContainerProps>`
    color: var(--vscode-list-deemphasizedForeground);
    margin-bottom: 4px;
    text-align: left;
    ${(props: ContainerProps) => props.sx};
`;



interface ConfigProps {
    onSubmit: (data: AgentTool) => void;
    onBack?: () => void;
}

export function ToolsCreateForm(props: ConfigProps) {
    const { rpcClient } = useRpcContext();


    const TOOLS_FIE_NAME = "agents.bal";

    const { onSubmit, onBack } = props;

    const [filePath, setFilePath] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [toolName, setToolName] = useState<string>("");
    const [toolType, setToolType] = useState<string>("Connector"); // Connector | Function

    // ------ Connectors Related ------
    const [connectionState, setConnectionState] = useState<number>(1); // 1 = New | 2 = Existing
    const [connectorNode, setConnectorNode] = useState<AvailableNode>(); // New connector codedata node
    const [connectorFlowNode, setConnectorFlowNode] = useState<FlowNode>(undefined); // New connector flow node
    const [selectedAction, setSelectedAction] = useState<string>(""); // Selected action name value which will be used to filter and get the codedata from action list

    const [isOpenConfig, setIsOpenConfig] = useState<boolean>(false);
    const [existingConnections, setExistingConnectors] = useState<Category[]>([]);
    const [selectedConnector, setSelectedConnector] = useState<string>("");
    const [actionsList, setActionsList] = useState<AvailableNode[]>([]);

    // ------ Functions Related ------
    const [functionState, setFunctionState] = useState<number>(1); // 1 = New | 2 = Existing
    const [newFunctionName, setNewFunctionName] = useState<string>("");    // New function name
    const [existingFunctions, setExistingFunctions] = useState<Category[]>([]);
    const [selectedFunction, setSelectedFunction] = useState<string>("");
    const [functionScope] = useState<string>("Current Integration"); // This will be a fixed Scope for now
    const [selectedScopeFunctionList, setSelectedScopeFunctionsList] = useState<OptionProps[]>([]);


    // Set the path initially
    useEffect(() => {
        setIsLoading(true);
        rpcClient.getVisualizerLocation().then(res => {
            setFilePath(Utils.joinPath(URI.file(res.projectUri), TOOLS_FIE_NAME).fsPath);
            setIsLoading(false);
        });
    }, []);


    // After getting the file path fetch all the
    useEffect(() => {
        if (toolType === "Connector") {
            // No need to do anything as the component list form will handle the initial view
            if (connectionState === 2) {
                getAvailableConnections(); // Get available connections
            }
        } else {
            if (functionState === 2) {
                getExistingFunctions(); // Fetch any existing functions
            }
        }
        // Reset all the form values and data
        setNewFunctionName(""); // Reset the function name
        setSelectedAction(undefined); // Reset the action name
        setConnectorNode(undefined); // Reset the connector node
        setConnectorFlowNode(undefined); // Reset the selected connector flow node
    }, [toolType, connectionState, functionState]);

    // Filter out the current integration functions list
    useEffect(() => {
        setSelectedScopeFunctionsList(getFunctionList(functionScope))
    }, [existingFunctions]);

    // Submit the form with all the values
    const handleSubmit = () => {
        let actionCodeData: AvailableNode;
        let functionCodeData: AvailableNode;
        if (connectionState === 2 && selectedAction) {
            const getConnectorCodeData = existingConnections.find(c => c.metadata.label === selectedConnector);
            actionCodeData = getConnectorCodeData.items.find(item => item.metadata.label === selectedAction) as AvailableNode;
        } else {
            actionCodeData = actionsList.find(item => item.metadata.label === selectedAction);
        }

        if (functionState === 2 && selectedFunction) {
            existingFunctions.forEach(category => {
                if (category.metadata.label === functionScope) {
                    functionCodeData = category.items.find(item => item.metadata.label === selectedFunction) as AvailableNode;
                }
            })
        }
        const toolModel: AgentTool = {
            toolName: toolName,
            toolType: toolType,

            functionState: functionState,
            functionScope: functionScope,
            functionName: functionState === 1 ? newFunctionName : selectedFunction,
            existingFunctionCodeData: functionCodeData?.codedata,

            connectorFlowNode: connectorFlowNode,
            connectorActionCodeData: actionCodeData?.codedata,
            connectorState: connectionState,
        }
        console.log("New Agent Tool:", toolModel);
        onSubmit(toolModel);
    }


    const handleToolTypeChange = (value: string) => {
        setToolType(value)
    };

    const handleOnSelectConnector = async (connector: AvailableNode) => {
        setIsLoading(true);
        console.log(`Selected connector: ${connector}`);
        setSelectedConnector(connector.metadata.label);
        setConnectorNode(connector);
        const node = await getNodeTemplate(connector.codedata, filePath);
        console.log(`connectorNode:`, node);
        setConnectorFlowNode(node);

        const actions = await rpcClient
            .getAIAgentRpcClient()
            .getActions({
                filePath: filePath,
                flowNode: node,
            });
        console.log(`actions list:`, actions.actions);

        setActionsList(actions.actions);

        setIsLoading(false);
        // Open the relevant config form
        setIsOpenConfig(true);
    };

    // ----------- Helper functions --------------
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

    const getExistingFunctions = () => {
        setIsLoading(true);
        rpcClient
            .getBIDiagramRpcClient()
            .search({
                searchKind: "FUNCTION",
                position: { startLine: { line: 0, offset: 0 }, endLine: { line: 0, offset: 0 } },
                filePath: filePath,
                queryMap: {
                    q: "",
                    limit: 12,
                    offset: 0
                }
            })
            .then((response) => {
                if (response.categories?.length) {
                    console.log("Tools Functions: ", response);
                    setExistingFunctions(response.categories);
                    setIsLoading(false);
                }
            });
    }

    const getAvailableConnections = () => {
        setIsLoading(true);
        rpcClient
            .getBIDiagramRpcClient()
            .getAvailableNodes({ filePath, position: { line: 0, offset: 0 } })
            .then((response) => {
                console.log(">>> Available nodesxx", response);
                const connections = response.categories.find(cat => cat.metadata.label === "Connections").items as Category[];
                setExistingConnectors(connections);
                setIsLoading(false);
            })
    }

    const getFunctionList = (label: string) => {
        const list: OptionProps[] = [];
        list.push({ value: "- Select -", content: "" });
        existingFunctions.forEach(category => {
            if (category.metadata.label === label) {
                category.items.forEach(item => {
                    list.push({ value: item.metadata.label });
                })
            }
        })
        return list;
    }

    const getExistingConnectionsOption = () => {
        const list: OptionProps[] = [];
        list.push({ value: "- Select -", content: "" });
        existingConnections.forEach(category => {
            list.push({ value: category.metadata.label, content: category.metadata.label });
        })
        return list;
    }

    const getExistingConnectionsMethodsOption = (label: string) => {
        const list: OptionProps[] = [];
        existingConnections.forEach(category => {
            if (category.metadata.label === label) {
                category.items.forEach(item => {
                    list.push({ value: item.metadata.label, content: item.metadata.label });
                })
            }
        })
        return list;
    }

    const validateToolForm = () => {
        return !toolName || (!selectedFunction && !newFunctionName && !selectedAction);
    }

    const handleSubmitConnectorConfig = (node?: FlowNode) => {
        console.log("Updated connector node", node);
        setIsOpenConfig(false);
        setConnectorFlowNode(node);
    }

    return (
        <Container>
            <FormHeader title={`Tool Integration`} subtitle={`Connect services or add custom logic to empower your agent.`} />
            <FormContainer>
                <TextField
                    autoFocus
                    required={true}
                    description={"Name of the tool."}
                    errorMsg={""}
                    label="Tool Name"
                    size={70}
                    onTextChange={(input) => {
                        setToolName(input.replace(/\s/g, ''));
                    }}
                    placeholder="Tool Name"
                    value={toolName}
                    id="toolName"
                    onFocus={(e) => e.target.select()}
                />
                <div>
                    <LabelContainer>
                        <div style={{ color: "var(--vscode-editor-foreground)" }}>
                            <label>Select Tool Type*</label>
                        </div>
                    </LabelContainer>
                    <Description>
                        Choose a tool method from connectors or existingFunctions
                    </Description>
                    <ToolTypeContainer>
                        <ComponentCard
                            id={"connector"}
                            key={"connector"}
                            isSelected={toolType === "Connector"}
                            onClick={() => handleToolTypeChange("Connector")}
                            sx={{
                                borderRadius: 0,
                                width: 'inherit',
                                height: '32px'
                            }}
                        >
                            Connector
                        </ComponentCard>
                        <ComponentCard
                            id={"function"}
                            key={"function"}
                            isSelected={toolType === "Function"}
                            onClick={() => handleToolTypeChange("Function")}
                            sx={{
                                borderRadius: 0,
                                width: 'inherit',
                                height: '32px'
                            }}
                        >
                            Function
                        </ComponentCard>
                    </ToolTypeContainer>
                </div>
                {toolType === "Connector" &&
                    <ChoiceSection>
                        <RadioButtonGroup
                            id="choice-options"
                            defaultValue={1}
                            defaultChecked={true}
                            value={connectionState}
                            options={[{ value: 1, content: "Create New Connection" }, { value: 2, content: "Use Existing Connection" }]}
                            onChange={(e) => {
                                const checkedValue = Number(e.target.value);
                                setConnectionState(checkedValue);
                            }}
                        />

                        {connectionState === 1 &&
                            <>
                                {!connectorNode &&
                                    <ConnectorView
                                        fileName={TOOLS_FIE_NAME}
                                        targetLinePosition={{ line: 0, offset: 0 }}
                                        onSelectConnector={handleOnSelectConnector}
                                        fetchingInfo={false}
                                        onClose={() => { }}
                                        hideTitle={true}
                                    />
                                }
                                {connectorNode &&
                                    <ConnectorContainer>

                                        {/* Config the connector first */}
                                        {!isLoading && isOpenConfig && connectorFlowNode && (
                                            <PanelContainer
                                                show={true}
                                                title={`Configure the ${connectorNode?.metadata.label || ""} Connector`}
                                                onClose={() => { setConnectorNode(undefined) }}
                                                width={400}
                                                onBack={() => { setConnectorNode(undefined) }}
                                            >
                                                <>
                                                    <BodyText style={{ padding: "20px 20px 0 20px" }}>
                                                        Provide the necessary configuration details for the selected connector to complete the
                                                        setup.
                                                    </BodyText>
                                                    <ConnectionConfigView
                                                        fileName={filePath}
                                                        selectedNode={connectorFlowNode}
                                                        onSubmit={handleSubmitConnectorConfig}
                                                    />
                                                </>
                                            </PanelContainer>
                                        )}

                                        {/* Show the configured connector */}
                                        {!isLoading && connectorFlowNode && (
                                            <ButtonCard
                                                key={"selectedConnector"}
                                                title={connectorNode.metadata.label}
                                                description={
                                                    (connectorNode as AvailableNode).codedata.org +
                                                    " / " +
                                                    (connectorNode as AvailableNode).codedata.module
                                                }
                                                icon={
                                                    connectorNode.metadata.icon ? (
                                                        <ConnectorIcon node={connectorNode as unknown as FlowNode} />
                                                    ) : (
                                                        <Codicon name="package" />
                                                    )
                                                }
                                                onClick={() => {
                                                    setSelectedConnector("");
                                                    setConnectorNode(undefined);
                                                }}
                                            />
                                        )}

                                        {isLoading &&
                                            <RelativeLoader message={"Fetching actions list.."} />
                                        }
                                        {!isLoading && !isOpenConfig &&
                                            <AutoComplete
                                                sx={{
                                                    height: 26
                                                }}
                                                borderBox={true}
                                                label="Actions"
                                                notItemsFoundMessage="No Actions"
                                                value={selectedAction}
                                                items={actionsList.map((item) => ({
                                                    key: item.metadata.label,
                                                    item: `${item.metadata.label} - ${item.metadata.description}`
                                                }))}
                                                onValueChange={(item) => { setSelectedAction(item) }}
                                            />
                                        }
                                    </ConnectorContainer>
                                }
                            </>
                        }
                        {connectionState === 2 &&
                            <>
                                {!isLoading && existingConnections?.length === 0 &&
                                    <Typography variant="body3">
                                        There are no existing connections. Please select a new connectionState
                                    </Typography>
                                }
                                {isLoading &&
                                    <RelativeLoader message={"Fetching existing connections.."} />
                                }
                                {!isLoading && existingConnections?.length > 0 &&
                                    <Dropdown
                                        isRequired
                                        errorMsg=""
                                        id="drop-down"
                                        items={getExistingConnectionsOption()}
                                        label="Select Connection"
                                        description={"Existing Connections"}
                                        onValueChange={(value: string) => { setSelectedConnector(value) }}
                                        value={selectedConnector}
                                    />
                                }
                                {!isLoading && existingConnections?.length > 0 && selectedConnector &&
                                    <div>
                                        <Dropdown
                                            isRequired
                                            errorMsg=""
                                            id="drop-down"
                                            items={getExistingConnectionsMethodsOption(selectedConnector)}
                                            value={selectedAction}
                                            label="Select Action"
                                            description={"Action to be used"}
                                            onValueChange={(value: string) => { setSelectedAction(value) }}
                                        />
                                    </div>
                                }
                            </>
                        }
                    </ChoiceSection>
                }

                {toolType === "Function" &&
                    <>
                        <RadioButtonGroup
                            id="choice-options"
                            defaultValue={1}
                            defaultChecked={true}
                            value={functionState}
                            options={[{ value: 1, content: "Create New Function" }, { value: 2, content: "Use Existing Function" }]}
                            onChange={(e) => {
                                const checkedValue = Number(e.target.value);
                                setFunctionState(checkedValue);
                            }}
                        />

                        {functionState === 1 &&
                            <>
                                <TextField
                                    autoFocus
                                    required={true}
                                    description={"Name of the new function."}
                                    errorMsg={""}
                                    label="Function Name"
                                    size={70}
                                    onTextChange={(input) => {
                                        setNewFunctionName(input.replace(/\s/g, ''));
                                    }}
                                    placeholder="Function Name"
                                    value={newFunctionName}
                                    id="functionName"
                                    onFocus={(e) => e.target.select()}
                                />
                            </>
                        }
                        {functionState === 2 &&
                            <>
                                {isLoading &&
                                    <RelativeLoader message={"Loading existingFunctions.."} />
                                }
                                {!isLoading && selectedScopeFunctionList?.length === 0 &&
                                    <Typography variant="body3">
                                        There are no existing existingFunctions. Please create a new function
                                    </Typography>
                                }
                                {!isLoading && selectedScopeFunctionList?.length > 0 &&
                                    <Dropdown
                                        isRequired
                                        errorMsg=""
                                        id="drop-down"
                                        items={selectedScopeFunctionList}
                                        label="Select Function"
                                        onValueChange={(value: string) => { setSelectedFunction(value) }}
                                        value={selectedFunction}
                                    />
                                }
                            </>
                        }

                    </>
                }
                <ButtonGroup>
                    <Button appearance="secondary" onClick={onBack}>Cancel</Button>
                    <Button appearance="primary" onClick={handleSubmit} disabled={validateToolForm()}>Add</Button>
                </ButtonGroup>
            </FormContainer>
        </Container >
    );
}

export default ToolsCreateForm;
