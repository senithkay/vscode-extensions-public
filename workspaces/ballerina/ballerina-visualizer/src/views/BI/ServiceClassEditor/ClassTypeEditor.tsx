/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Type, ServiceClassModel, ModelFromCodeRequest, FieldType, FunctionModel, NodePosition, STModification, removeStatement, LineRange, EVENT_TYPE, RenameRequest } from "@wso2-enterprise/ballerina-core";
import { Button, Codicon, Typography, TextField, ProgressRing, Menu, MenuItem, Popover, Item } from "@wso2-enterprise/ui-toolkit";
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
import { Icon } from "@wso2-enterprise/ui-toolkit";


const ServiceContainer = styled.div`
    display: flex;
    padding: 10px 20px;
    gap: 16px;
    flex-direction: column;
    height: 100%;
`;

const ScrollableSection = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 0;
    gap: 16px;
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

const SectionTitle = styled.div`
    font-size: 14px;
    font-family: GilmerRegular;
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

export const Footer = styled.div`
    display: flex;
    gap: 8px;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    padding: 16px;
`;

const EditRow = styled.div`
    display: flex;
    gap: 8px;
    align-items: flex-end;
    width: 100%;
`;

const InputWrapper = styled.div`
    position: relative;
    width: 100%;
    display: flex;
    gap: 8px;
    align-items: flex-start;
`;

const TextFieldWrapper = styled.div`
    flex: 1;
`;

const EditButton = styled(Button)`
    margin-top: 42px;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 8px;
    margin-bottom: 2px; 
`;

const StyledButton = styled(Button)`
    font-size: 14px;
`;

const WarningText = styled(Typography)`
    color: var(--vscode-textLink-foreground);
    font-size: 12px;
    margin-top: 4px;
`;

const EditableRow = styled.div`
    display: flex;
    align-items: flex-start;
    width: 100%;
    flex-direction: column;
`;

interface ClassTypeEditorProps {
    type: Type;
    onClose: () => void;
    projectUri: string;
}

export function ClassTypeEditor(props: ClassTypeEditorProps) {
    const { onClose, type, projectUri } = props;
    const { rpcClient } = useRpcContext();
    const [serviceClassModel, setServiceClassModel] = useState<ServiceClassModel>();
    const [editingFunction, setEditingFunction] = useState<FunctionModel>(undefined);
    const [editingVariable, setEditingVariable] = useState<FieldType>(undefined);
    const [isNew, setIsNew] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | SVGSVGElement | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState("");
    const classNameField = serviceClassModel?.properties["name"];


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

    const menuItems: Item[] = [
        {
            id: "init",
            label: "Init",
            onClick: () => {
                handleAddFunction('init');
                setAnchorEl(null);
            }
        },
        {
            id: "resource",
            label: "Resource",
            onClick: () => {
                handleAddFunction('resource');
                setAnchorEl(null);
            }
        },
        {
            id: "remote",
            label: "Remote",
            onClick: () => {
                handleAddFunction('remote');
                setAnchorEl(null);
            }
        }
    ];

    const startEditing = () => {
        setTempName(serviceClassModel.properties["name"].value);
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setTempName("");
    };

    const editServiceClassName = async () => {
        if (!tempName || tempName === serviceClassModel.properties["name"].value) {
            cancelEditing();
            return;
        }

        try {
            await rpcClient.getBIDiagramRpcClient().renameIdentifier({
                fileName: serviceClassModel.codedata.lineRange.fileName,
                position: {
                    line: serviceClassModel.properties["name"].codedata.lineRange.startLine.line,
                    character: serviceClassModel.properties["name"].codedata.lineRange.startLine.offset
                },
                newName: tempName
            });

            setServiceClassModel({
                ...serviceClassModel,
                name: tempName,
                properties: {
                    ...serviceClassModel.properties,
                    name: {
                        ...serviceClassModel.properties["name"],
                        value: tempName
                    }
                }
            });

            cancelEditing();
        } catch (error) {
            console.error('Error renaming service class:', error);
        }
    };

    return (
        <>
            {!serviceClassModel && (
                <LoadingContainer>
                    <ProgressRing />
                    <Typography variant="h3" sx={{ marginTop: '16px' }}>Loading Service Class Designer...</Typography>
                </LoadingContainer>
            )}
            {serviceClassModel && !editingFunction && !editingVariable && (
                <PanelContainer title={"Edit Service Class"} show={true} onClose={onClose} width={400}>
                    <ServiceContainer>
                        {!classNameField.editable && !isEditing && (
                            <InputWrapper>
                                <TextFieldWrapper>
                                    <TextField
                                        id={classNameField.value}
                                        name={classNameField.value}
                                        value={classNameField.value}
                                        label={classNameField.metadata.label}
                                        required={!classNameField.optional}
                                        description={classNameField.metadata.description}
                                        placeholder={classNameField.placeholder}
                                        readOnly={!classNameField.editable}
                                    />
                                </TextFieldWrapper>
                                <EditButton appearance="icon" onClick={startEditing}>
                                    <Icon name="editIcon" />
                                </EditButton>
                            </InputWrapper>
                        )}
                        {isEditing && (
                            <>
                                <EditableRow>
                                    <EditRow>
                                        <TextFieldWrapper>
                                            <TextField
                                                id={classNameField.value}
                                                label={classNameField.metadata.label}
                                                value={tempName}
                                                onChange={(e) => setTempName(e.target.value)}
                                                description={classNameField.metadata.description}
                                                required={!classNameField.optional}
                                                placeholder={classNameField.placeholder}
                                                autoFocus
                                            />
                                        </TextFieldWrapper>
                                        <ButtonGroup>
                                            <StyledButton
                                                appearance="secondary"
                                                onClick={cancelEditing}
                                            >
                                                Cancel
                                            </StyledButton>
                                            <StyledButton
                                                appearance="primary"
                                                onClick={editServiceClassName}
                                                disabled={!tempName || tempName === serviceClassModel.properties["name"].value}
                                            >
                                                Save
                                            </StyledButton>
                                        </ButtonGroup>
                                    </EditRow>

                                    <WarningText variant="body3">
                                        Note: Renaming will update all references across the project
                                    </WarningText>
                                </EditableRow>

                            </>
                        )}
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
                                            onClick={(e) => setAnchorEl(e.currentTarget)}
                                        >
                                            <Codicon name="add" />
                                        </Button>
                                        <Popover
                                            open={Boolean(anchorEl)}
                                            anchorEl={anchorEl}
                                            handleClose={() => setAnchorEl(null)}
                                            sx={{
                                                padding: 0,
                                                borderRadius: 0,
                                                zIndex: 3000

                                            }}
                                            anchorOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right'
                                            }}
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right'
                                            }}
                                        >
                                            <Menu>
                                                {menuItems
                                                    .filter(item => !(item.id === 'init' && hasInitFunction))
                                                    .map((item) => (
                                                        <MenuItem key={item.id} item={item} />
                                                    ))}
                                            </Menu>
                                        </Popover>
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
                    </ServiceContainer>
                </PanelContainer>
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
