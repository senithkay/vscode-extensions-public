/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Type, ServiceClassModel, ModelFromCodeRequest, FieldType, FunctionModel, NodePosition, STModification, removeStatement, LineRange, EVENT_TYPE } from "@wso2-enterprise/ballerina-core";
import { Button, Codicon, Typography, TextField, ProgressRing } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { Colors } from "../../../resources/constants";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { LoadingContainer } from "../../styles";
import { FunctionCard } from "./FunctionCard";
import { VariableCard } from "./VariableCard";
import { OperationForm } from "../../GraphQLDiagram/OperationForm";
import { VariableForm } from "./VariableForm";
import { URI, Utils } from "vscode-uri";
import { PanelContainer } from "@wso2-enterprise/ballerina-side-panel";
import { applyModifications } from "../../../utils/utils";


const ServiceClassContainer = styled.div`
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    height: 100%;
    background-color: ${Colors.SURFACE_BRIGHT};
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
`;

const ServiceContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
`;

const HeaderSection = styled.div`
    flex-shrink: 0;
    padding: 0 10px;
`;

const ScrollableSection = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 0;
    gap: 16px;
    padding: 0 10px;
    overflow-y: auto;
`;

const Section = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 0;
`;

const ScrollableContent = styled.div`
    overflow-y: auto;
    min-height: 0;
`;

const StyledButton = styled(Button)`
        border-radius: 5px;
    `;

const SidePanelTitleContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--vscode-panel-border);
    font-size: 16px;
    padding: 20px 0 20px 0;
    font-family: GilmerBold;
    color: var(--vscode-editor-foreground);
`;

const SectionTitle = styled.div`
    font-size: 14px;
    font-family: GilmerBold;
    margin-bottom: 10px;
    padding: 8px 0;
`;

const SectionHeader = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
`;

const EmptyStateText = styled(Typography)`
    color: ${Colors.ON_SURFACE_VARIANT};
    padding: 12px;
    text-align: center;
`;

const ClassNameField = styled.div`
    margin: 16px 0;
`;

export const Footer = styled.div`
    display: flex;
    gap: 8px;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    padding: 16px;
    background-color: ${Colors.SURFACE_BRIGHT};
`;

const MenuContainer = styled.div`
    width: 120px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 4px;
    position: absolute;
    right: 0;
    top: 100%;
    background-color: ${Colors.SURFACE_BRIGHT};
    border: 1px solid var(--vscode-panel-border);
    border-radius: 4px;
    z-index: 1000;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const MenuButton = styled(Button)`
    width: 100%;
    justify-content: flex-start;
    padding: 6px 12px;
    text-align: left;
    height: 32px;
`;

interface ClassTypeEditorProps {
    type: Type;
    onClose: () => void;
    projectUri: string;
}

export function ClassTypeEditor(props: ClassTypeEditorProps) {
    console.log("======Service Class Type Editor", props);
    const { onClose, type, projectUri } = props;
    const { rpcClient } = useRpcContext();
    const [serviceClassModel, setServiceClassModel] = useState<ServiceClassModel>();
    const [editingFunction, setEditingFunction] = useState<FunctionModel>(undefined);
    const [editingVariable, setEditingVariable] = useState<FieldType>(undefined);
    const [showFunctionMenu, setShowFunctionMenu] = useState<boolean>(false);
    const [isNew, setIsNew] = useState<boolean>(false);


    useEffect(() => {
        getServiceClassModel();
    }, [type]);


    const getServiceClassModel = async () => {
        if (!type) return;
        const currentFilePath = Utils.joinPath(URI.file(projectUri), type.codedata.lineRange.fileName).fsPath;
        const serviceClassModelRequest: ModelFromCodeRequest = {
            filePath: currentFilePath,
            codedata: {
                lineRange: {
                    startLine: { line: type.codedata.lineRange.startLine.line, offset: type.codedata.lineRange.startLine.offset },
                    endLine: { line: type.codedata.lineRange.endLine.line, offset: type.codedata.lineRange.endLine.offset }
                }
            }
        }

        const serviceClassModelResponse = await rpcClient.getBIDiagramRpcClient().getServiceClassModel(serviceClassModelRequest);
        console.log("======Service Class Model", serviceClassModelResponse);
        setServiceClassModel(serviceClassModelResponse.model);
    }

    const handleEditFunction = (func: FunctionModel) => {
        setEditingFunction(func);
    };

    const handleDeleteFunction = async (func: FunctionModel) => {
        const targetPosition: NodePosition = {
            startLine: func?.codedata?.lineRange?.startLine.line,
            startColumn: func?.codedata.lineRange?.startLine?.offset,
            endLine: func?.codedata?.lineRange?.endLine?.line,
            endColumn: func?.codedata?.lineRange?.endLine?.offset
        }
        const deleteAction: STModification = removeStatement(targetPosition);
        const currentFilePath = Utils.joinPath(URI.file(projectUri), type.codedata.lineRange.fileName).fsPath;
        await applyModifications(rpcClient, [deleteAction], currentFilePath);
        getServiceClassModel();
    }

    const onFunctionImplement = async (func: FunctionModel) => {
        const lineRange: LineRange = func.codedata.lineRange;
        const currentFilePath = Utils.joinPath(URI.file(projectUri), type.codedata.lineRange.fileName).fsPath;
        const nodePosition: NodePosition = { startLine: lineRange.startLine.line, startColumn: lineRange.startLine.offset, endLine: lineRange.endLine.line, endColumn: lineRange.endLine.offset }
        await rpcClient.getVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { position: nodePosition, documentUri: currentFilePath } })
    }

    const handleFunctionSave = async (updatedFunction: FunctionModel) => {
        try {
            let lsResponse;
            const currentFilePath = Utils.joinPath(URI.file(projectUri), serviceClassModel.codedata.lineRange.fileName).fsPath;
            if (isNew) {
                lsResponse = await rpcClient.getServiceDesignerRpcClient().addFunctionSourceCode({
                    filePath: currentFilePath,
                    codedata: {
                        lineRange: {
                            startLine: { line: serviceClassModel.codedata.lineRange.startLine.line, offset: serviceClassModel.codedata.lineRange.startLine.offset },
                            endLine: { line: serviceClassModel.codedata.lineRange.endLine.line, offset: serviceClassModel.codedata.lineRange.endLine.offset }
                        }
                    },
                    function: updatedFunction
                });
            } else {
                lsResponse = await rpcClient.getServiceDesignerRpcClient().updateResourceSourceCode({
                    filePath: currentFilePath,
                    codedata: {
                        lineRange: {
                            startLine: { line: serviceClassModel.codedata.lineRange.startLine.line, offset: serviceClassModel.codedata.lineRange.startLine.offset },
                            endLine: { line: serviceClassModel.codedata.lineRange.endLine.line, offset: serviceClassModel.codedata.lineRange.endLine.offset }
                        }
                    },
                    function: updatedFunction
                });
            }

            if (isNew) {
                setIsNew(false);
            }
            setEditingFunction(null);
            getServiceClassModel(); // Refresh the model
        } catch (error) {
            console.error('Error updating function:', error);
        }
    };

    const handleEditVariable = (variable: FieldType) => {
        setEditingVariable(variable);
    };

    const handleVariableSave = async (updatedVariable: FieldType) => {

        try {
            const currentFilePath = Utils.joinPath(URI.file(projectUri), serviceClassModel.codedata.lineRange.fileName).fsPath;
            if (isNew) {

                const lsResponse = await rpcClient.getBIDiagramRpcClient().addClassField({
                    filePath: currentFilePath,
                    field: updatedVariable,
                    codedata: {
                        lineRange: {
                            fileName: serviceClassModel.codedata.lineRange.fileName,
                            startLine: { line: serviceClassModel.codedata.lineRange.startLine.line, offset: serviceClassModel.codedata.lineRange.startLine.offset },
                            endLine: { line: serviceClassModel.codedata.lineRange.endLine.line, offset: serviceClassModel.codedata.lineRange.endLine.offset }
                        }
                    }
                });

            } else {
                const lsResponse = await rpcClient.getBIDiagramRpcClient().updateClassField({
                    filePath: currentFilePath,
                    field: updatedVariable
                });
            }
            if (isNew) {
                setIsNew(false);
            }
            setEditingVariable(undefined);
            getServiceClassModel();
        } catch (error) {
            console.error('Error updating variable:', error);
        }

    };

    const handleSave = async () => {
        try {
            const currentFilePath = Utils.joinPath(URI.file(projectUri), type.codedata.lineRange.fileName).fsPath;
            const lsResponse = await rpcClient.getBIDiagramRpcClient().updateServiceClass({
                filePath: currentFilePath,
                serviceClass: serviceClassModel
            });
            onClose();

        } catch (error) {
            console.error('Error saving service class:', error);
        }

    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (serviceClassModel) {
            setServiceClassModel({
                ...serviceClassModel,
                name: e.target.value,
                properties: {
                    ...serviceClassModel.properties,
                    name: {
                        ...serviceClassModel.properties["name"],
                        value: e.target.value
                    }
                }
            });
        }
    };

    const handleAddFunction = async (type: 'init' | 'resource' | 'remote') => {
        const lsResponse = await rpcClient.getServiceDesignerRpcClient().getFunctionModel({
            type: 'object',
            functionName: type
        });
        if (lsResponse.function) {
            // if resouce we need to update the models accessor value to get and valueType to Identifier
            if (type === 'resource' && lsResponse.function.accessor) {
                lsResponse.function.accessor.value = 'get';
                lsResponse.function.accessor.valueType = 'IDENTIFIER';
            }

            setIsNew(true);
            setEditingFunction(lsResponse.function);
            console.log(`Adding ${type} function`, lsResponse.function);

            setShowFunctionMenu(false);
        }
    };

    const handleCloseFunctionForm = () => {
        setEditingFunction(undefined);
        setIsNew(false);
    };

    const handleAddVariable = () => {
        // TODO: Add the LS call when its ready
        const newVariable: FieldType = {
            isPrivate: true,
            isFinal: true,
            codedata: {
                lineRange: {
                    fileName: serviceClassModel.codedata.lineRange.fileName,
                    startLine: {
                        line: serviceClassModel.codedata.lineRange.startLine.line,
                        offset: serviceClassModel.codedata.lineRange.startLine.offset
                    },
                    endLine: {
                        line: serviceClassModel.codedata.lineRange.endLine.line,
                        offset: serviceClassModel.codedata.lineRange.endLine.offset
                    }
                },
                inListenerInit: false,
                isBasePath: false,
                inDisplayAnnotation: false
            },
            type: {
                metadata: {
                    label: "Field Type",
                    description: "The type of the field"
                },
                enabled: true,
                editable: true,
                value: "",
                valueType: "TYPE",
                isType: true,
                optional: false,
                advanced: false,
                addNewButton: false
            },
            name: {
                metadata: {
                    label: "Field Name",
                    description: "The name of the field"
                },
                enabled: true,
                editable: true,
                value: "",
                valueType: "IDENTIFIER",
                isType: false,
                optional: false,
                advanced: false,
                addNewButton: false
            },
            defaultValue: {
                metadata: {
                    label: "Initial Value",
                    description: "The initial value of the filed"
                },
                value: "",
                enabled: false,
                editable: true,
                isType: false,
                optional: false,
                advanced: false,
                addNewButton: false
            },
            enabled: true,
            editable: false,
            optional: false,
            advanced: false
        };
        setIsNew(true);
        setEditingVariable(newVariable);
    };

    const handleDeleteVariable = async (variable: FieldType) => {
        const targetPosition: NodePosition = {
            startLine: variable?.codedata?.lineRange?.startLine.line,
            startColumn: variable?.codedata.lineRange?.startLine?.offset,
            endLine: variable?.codedata.lineRange?.endLine?.line,
            endColumn: variable?.codedata.lineRange?.endLine?.offset
        }
        const deleteAction: STModification = removeStatement(targetPosition);
        const currentFilePath = Utils.joinPath(URI.file(projectUri), type.codedata.lineRange.fileName).fsPath;
        await applyModifications(rpcClient, [deleteAction], currentFilePath);
        getServiceClassModel();
    }

    const hasInitFunction = serviceClassModel?.functions?.some(func => func.kind === 'INIT');

    return (
        <>
            {!serviceClassModel && (
                <LoadingContainer>
                    <ProgressRing />
                    <Typography variant="h3" sx={{ marginTop: '16px' }}>Loading Service Class Designer...</Typography>
                </LoadingContainer>
            )}
            {serviceClassModel && !editingFunction && !editingVariable && (
                <ServiceClassContainer>
                    <ServiceContainer>
                        <HeaderSection>
                            <SidePanelTitleContainer>
                                {"Edit Service Class"}
                                <StyledButton appearance="icon" onClick={onClose}>
                                    <Codicon name="close" />
                                </StyledButton>
                            </SidePanelTitleContainer>
                            <ClassNameField>
                                <TextField
                                    label="Service Class Name"
                                    value={serviceClassModel.properties["name"].value}
                                    onChange={handleNameChange}
                                />
                            </ClassNameField>
                        </HeaderSection>

                        <ScrollableSection>
                            <Section>
                                <SectionHeader>
                                    <SectionTitle>Variables</SectionTitle>
                                    <Button
                                        appearance="icon"
                                        tooltip="Add Variable"
                                        onClick={() => handleAddVariable()}
                                    >
                                        <Codicon name="add" />
                                    </Button>
                                </SectionHeader>

                                <ScrollableContent>
                                    {serviceClassModel.fields?.map((field: FieldType, index: number) => (
                                        <VariableCard
                                            key={index}
                                            fieldModel={field}
                                            onEditVariable={() => handleEditVariable(field)}
                                            onDeleteVariable={() => handleDeleteVariable(field)}
                                        />
                                    ))}
                                    {(!serviceClassModel.fields || serviceClassModel.fields.length === 0) && (
                                        <EmptyStateText variant="body2">
                                            No variables found
                                        </EmptyStateText>
                                    )}
                                </ScrollableContent>
                            </Section>

                            <Section>
                                <SectionHeader>
                                    <SectionTitle>Functions</SectionTitle>
                                    <div style={{ position: 'relative' }}>
                                        <Button
                                            appearance="icon"
                                            tooltip="Add Function"
                                            onClick={() => setShowFunctionMenu(!showFunctionMenu)}
                                        >
                                            <Codicon name="add" />
                                        </Button>
                                        {showFunctionMenu && (
                                            <MenuContainer>
                                                {!hasInitFunction && (
                                                    <MenuButton
                                                        appearance="secondary"
                                                        onClick={() => handleAddFunction('init')}
                                                    >
                                                        Init
                                                    </MenuButton>
                                                )}
                                                <MenuButton
                                                    appearance="secondary"
                                                    onClick={() => handleAddFunction('resource')}
                                                >
                                                    Resource
                                                </MenuButton>
                                                <MenuButton
                                                    appearance="secondary"
                                                    onClick={() => handleAddFunction('remote')}
                                                >
                                                    Remote
                                                </MenuButton>
                                            </MenuContainer>
                                        )}
                                    </div>
                                </SectionHeader>

                                <ScrollableContent>
                                    {serviceClassModel.functions?.map((func: FunctionModel, index: number) => (
                                        <FunctionCard
                                            key={index}
                                            functionModel={func}
                                            goToSource={() => { }}
                                            onEditFunction={() => handleEditFunction(func)}
                                            onDeleteFunction={() => handleDeleteFunction(func)}
                                            onFunctionImplement={() => onFunctionImplement(func)}
                                        />
                                    ))}
                                    {(!serviceClassModel.functions || serviceClassModel.functions.length === 0) && (
                                        <EmptyStateText variant="body2">
                                            No functions found
                                        </EmptyStateText>
                                    )}
                                </ScrollableContent>
                            </Section>
                        </ScrollableSection>

                        <Footer>
                            <Button
                                appearance="primary"
                                onClick={handleSave}
                            >
                                Save
                            </Button>
                        </Footer>
                    </ServiceContainer>
                </ServiceClassContainer>
            )}
            {editingFunction && serviceClassModel && (
                <PanelContainer
                    title={isNew ? "Add Function" : "Edit Function"}
                    show={true}
                    onClose={() => setEditingFunction(undefined)}
                    width={400}
                >
                    <OperationForm
                        model={editingFunction}
                        filePath={Utils.joinPath(URI.file(projectUri), serviceClassModel.codedata.lineRange.fileName).fsPath}
                        lineRange={serviceClassModel.codedata.lineRange}
                        onClose={handleCloseFunctionForm}
                        onSave={handleFunctionSave}
                    />
                </PanelContainer>
            )}
            {editingVariable && serviceClassModel && (
                <PanelContainer
                    title={isNew ? "Add Variable" : "Edit Variable"}
                    show={true}
                    onClose={() => setEditingVariable(undefined)}
                    width={400}
                >
                    <VariableForm
                        model={editingVariable}
                        filePath={Utils.joinPath(URI.file(projectUri), serviceClassModel.codedata.lineRange.fileName).fsPath}
                        lineRange={serviceClassModel.codedata.lineRange}
                        onClose={() => setEditingVariable(null)}
                        onSave={handleVariableSave}
                    />
                </PanelContainer>
            )}
        </>
    );
}
