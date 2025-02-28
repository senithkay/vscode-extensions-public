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
import { Button, ComponentCard, ContainerProps, Dropdown, OptionProps, RadioButtonGroup, TextField, Typography } from "@wso2-enterprise/ui-toolkit";
import { FormField, FormValues } from "@wso2-enterprise/ballerina-side-panel";
import { AgentTool, AvailableNode, Category, ServiceModel, SubPanel, SubPanelView } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { URI, Utils } from "vscode-uri";
import { BodyText } from "../../../styles";
import { FormGeneratorNew } from "../../Forms/FormGeneratorNew";
import { FormHeader } from "../../../../components/FormHeader";
import ConnectorView from "../../Connection/ConnectorView";

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

    const { onSubmit, onBack } = props;
    const [filePath, setFilePath] = useState<string>('');

    const [toolName, setToolName] = useState<string>("");
    const [toolType, setToolType] = useState<string>("Connector");


    const [connection, setConnection] = useState<number>(1); // 1 = New | 2 = Existing

    const [existingConnections, setExistingConnectors] = useState<Category[]>([]);
    const [functions, setFunctions] = useState<Category[]>([]);
    const [selectedFunction, setSelectedFunction] = useState<string>("");
    const [selectedConnector, setSelectedConnector] = useState<string>("");
    const [selectedResource, setSelectedResource] = useState<string>("");
    const [functionScope, setFunctionScope] = useState<string>("Current Integration");
    const [selectedScope, setSelectedScope] = useState<OptionProps[]>([]);



    const handleToolCreation = () => {
        const toolModel: AgentTool = {
            toolName: toolName,
            toolType: toolType,
            connectorName: selectedConnector,
            connectorResource: selectedResource,
            connectorState: connection,

            functionType: functionScope,
            functionName: selectedFunction
        }
        onSubmit(toolModel);
    }

    useEffect(() => {
        rpcClient.getVisualizerLocation().then(res => { setFilePath(Utils.joinPath(URI.file(res.projectUri), 'agents.bal').fsPath) });
    }, []);

    useEffect(() => {
        if (filePath) {
            getFunctions();
            getAvailableConnections();
        }
    }, [filePath]);

    useEffect(() => {
        if (connection === 2) {
            getAvailableConnections();
        }
    }, [connection]);

    useEffect(() => {
        if (functions.length > 0) {
            setSelectedScope(getFunctionList(functionScope))
        } else {
            getFunctions();
        }
    }, [functions, functionScope, toolType]);

    const handleSubmit = () => {
        handleToolCreation();
    };

    const handleToolTypeChange = (value: string) => {
        setToolType(value)
    };

    const handleOnSelectConnector = (connector: AvailableNode) => {
        console.log(`Selected connector: ${connector.metadata.label}`);
        setSelectedConnector(connector.metadata.label);
    };

    const getFunctions = () => {
        rpcClient
            .getBIDiagramRpcClient()
            .getFunctions({
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
                    setFunctions(response.categories);
                }
            });
    }

    const getAvailableConnections = () => {
        rpcClient
            .getBIDiagramRpcClient()
            .getAvailableNodes({ filePath, position: { line: 0, offset: 0 } })
            .then((response) => {
                console.log(">>> Available nodesxx", response);
                const connections = response.categories.find(cat => cat.metadata.label === "Connections").items as Category[];
                setExistingConnectors(connections);
            })
    }

    const getFunctionList = (label: string) => {
        const list: OptionProps[] = [];
        functions.forEach(category => {
            if (category.metadata.label === label) {
                category.items.forEach(item => {
                    list.push({ value: item.metadata.label });
                })
            }
        })
        return list;
    }

    const getFunctionScopes = () => {
        const list: OptionProps[] = [];
        functions.forEach(category => {
            list.push({ value: category.metadata.label, content: category.metadata.label });
        })
        return list;
    }

    const getExistingConnectionsOption = () => {
        const list: OptionProps[] = [];
        list.push({ value: "", content: "" });
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
                        Choose a tool method from connectors or functions
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
                            value={connection}
                            options={[{ value: 1, content: "Create New Connection" }, { value: 2, content: "Use Existing Connection" }]}
                            onChange={(e) => {
                                const checkedValue = Number(e.target.value);
                                setConnection(checkedValue);
                            }}
                        />

                        {connection === 1 &&
                            <>
                                {!selectedConnector &&
                                    <ConnectorView
                                        onSelectConnector={handleOnSelectConnector}
                                        fetchingInfo={false}
                                        onClose={() => { }}
                                        hideTitle={true}
                                    />
                                }
                                {selectedConnector &&
                                    <div>
                                        {selectedConnector}
                                        <Button appearance="secondary" onClick={() => setSelectedConnector("")}>Select Connector</Button>
                                    </div>
                                }
                            </>
                        }
                        {connection === 2 &&
                            <>
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
                                {selectedConnector &&
                                    <div>
                                        <Dropdown
                                            isRequired
                                            errorMsg=""
                                            id="drop-down"
                                            items={getExistingConnectionsMethodsOption(selectedConnector)}
                                            label="Select Resource"
                                            description={"Resource to be used"}
                                            onValueChange={(value: string) => { setSelectedResource(value) }}
                                            value={selectedResource}
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
                            value={functionScope}
                            options={getFunctionScopes()}
                            onChange={(e) => {
                                setFunctionScope(e.target.value);
                            }}
                        />
                        <Dropdown
                            isRequired
                            errorMsg=""
                            id="drop-down"
                            items={selectedScope}
                            label="Select Function"
                            onValueChange={(value: string) => { setSelectedFunction(value) }}
                            value={selectedFunction}
                        />
                    </>
                }
                <ButtonGroup>
                    <Button appearance="secondary" onClick={onBack}>Cancel</Button>
                    <Button appearance="primary" onClick={handleSubmit} disabled={!toolName}>Add</Button>
                </ButtonGroup>
            </FormContainer>
        </Container >
    );
}

export default ToolsCreateForm;
