/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DIRECTORY_MAP, EVENT_TYPE, FunctionModel, LineRange, MACHINE_VIEW, ProjectStructureArtifactResponse, PropertyModel, ServiceModel, FunctionModelResponse, STModification, removeStatement } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { Button, Codicon, Divider, Dropdown, Icon, LinkButton, ProgressRing, Typography, ViewHeader } from "@wso2-enterprise/ui-toolkit";
import React, { useEffect, useState } from "react";
import { LoadingContainer } from "../styles";
import styled from "@emotion/styled";
import { OperationAccordion } from "./OperationAccordian";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { PanelContainer } from "@wso2-enterprise/ballerina-side-panel";
import { OperationForm } from "./OperationForm";
import { Colors } from "../../resources/constants";
import { NodePosition } from "../BI/ServiceDesigner/components/TypeBrowser/TypeBrowser";
import { applyModifications } from "../../utils/utils";


const InfoContainer = styled.div`
    display: flex;
    gap: 20px;
    padding: 15px;
`;

const InfoSection = styled.div`
    display: flex;
    align-items: center;
`;

const ServiceContainer = styled.div`
    padding-right: 10px;
    padding-left: 10px;
    padding-top: 10px;
`;

const GraphqlContainer = styled.div`
    position: fixed;
    top: 0;
    right: 0;
    width: 600px;
    height: 100%;
    background-color: ${Colors.SURFACE_BRIGHT};
`;

const TopBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

type FunctionTemapltes = {
    query: FunctionModel;
    mutation: FunctionModel;
    subscription: FunctionModel;
}

interface GraphqlServiceEditorProps {
    filePath: string;
    lineRange: LineRange;
    onClose: () => void;
}

export function GraphqlServiceEditor(props: GraphqlServiceEditorProps) {
    console.log("===GraphqlServiceEditor Props: ", props);
    const { filePath, lineRange, onClose } = props;
    const { rpcClient } = useRpcContext();

    const [serviceModel, setServiceModel] = useState<ServiceModel>(undefined);
    const [projectListeners, setProjectListeners] = useState<ProjectStructureArtifactResponse[]>([]);
    const [functionModel, setFunctionModel] = useState<FunctionModel>(undefined);
    // const [showForm, setShowForm] = useState<boolean>(false);
    const [isNewForm, setIsNewForm] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [functionTemplates, setFunctionTemplates] = useState<FunctionTemapltes>({
        query: undefined,
        mutation: undefined,
        subscription: undefined
    });


    useEffect(() => {
        fetchServiceModel();
    }, [lineRange]);

    useEffect(() => {
        // Fetch all templates on mount
        const fetchTemplates = async () => {
            const [queryModel, mutationModel, subscriptionModel] = await Promise.all([
                getFunctionModel("query"),
                getFunctionModel("mutation"),
                getFunctionModel("subscription")
            ]);

            setFunctionTemplates({
                query: queryModel,
                mutation: mutationModel,
                subscription: subscriptionModel
            });
        };

        fetchTemplates();
    }, []);

    const getFunctionModel = async (type: string) => {
        const response: FunctionModelResponse = await rpcClient.getServiceDesignerRpcClient().getFunctionModel({
            type: "graphql",
            functionName: type
        });

        return response?.function;
    }


    const fetchServiceModel = async (newFilePath?: string, linePosition?: NodePosition) => {
        const reqLineRange: LineRange = linePosition ? {
            startLine: {
                line: linePosition.startLine,
                offset: linePosition.startColumn
            },
            endLine: {
                line: linePosition.endLine,
                offset: linePosition.endColumn
            }
        } : lineRange;


        const reqFilePath = newFilePath ? newFilePath : filePath;

        rpcClient.getServiceDesignerRpcClient().getServiceModelFromCode({
            filePath: reqFilePath, codedata: {
                lineRange: reqLineRange
            }
        }).then(res => {
            console.log("Service Model: ", res.service);
            setServiceModel(res.service);

        });
        getProjectListeners();
    }

    const getProjectListeners = () => {
        rpcClient
            .getBIDiagramRpcClient()
            .getProjectStructure()
            .then((res) => {
                const listeners = res.directoryMap[DIRECTORY_MAP.LISTENERS];
                if (listeners.length > 0) {
                    setProjectListeners(listeners);
                }
            });
    }

    const handleServiceEdit = async () => {
        await rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.BIServiceConfigView,
                position: {
                    startLine: lineRange?.startLine?.line,
                    startColumn: lineRange?.startLine?.offset,
                    endLine: lineRange?.endLine?.line,
                    endColumn: lineRange?.endLine?.offset
                },
                documentUri: filePath
            },
        });
    }

    const findIcon = (label: string) => {
        label = label.toLowerCase();
        switch (true) {
            case label.includes("listener"):
                return "bell";
            case label.includes("path"):
                return "link";
            default:
                return "info";
        }
    }

    const handleOpenListener = (value: string) => {
        const listenerValue = projectListeners.find(listener => listener.name === value);
        if (listenerValue) {
            rpcClient.getVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.BIListenerConfigView,
                    position: listenerValue.position,
                    documentUri: listenerValue.path
                }
            });
        }
    }

    const getAttributeComponent = (component: PropertyModel) => {
        const label = component.metadata.label.toLowerCase();
        switch (true) {
            case label.includes("listener"):
                return (
                    component.values?.length > 0 ? component.values.map((item, index) => (
                        <LinkButton sx={{ fontSize: 12, padding: 8, gap: 4 }} key={`${index}-btn`} onClick={() => handleOpenListener(item)}>{item}</LinkButton>
                    )) : <LinkButton sx={{ fontSize: 12, padding: 8, gap: 4 }} onClick={() => handleOpenListener(component.value)}>{component.value}</LinkButton>
                )
            case label.includes("path"):
                return component.value;
            default:
                return component.value;
        }
    }

    const goToSource = (resource: FunctionModel) => {
        // rpcClient.getCommonRpcClient().goToSource({ position: position });
    }

    const onEditOperation = (currentFun: FunctionModel) => {
        // Create a copy of the resource to avoid modifying the original
        const currentFuncModel = {
            ...currentFun,
            parameters: currentFun.parameters.map(param => ({
                ...param,
                type: {
                    ...param.type,
                    value: param.type.value || "",
                    valueType: param.type.valueType || "TYPE",
                    isType: param.type.isType !== undefined ? param.type.isType : true,
                },
                name: {
                    ...param.name,
                    value: param.name.value || "",
                    valueType: param.name.valueType || "IDENTIFIER",
                    isType: param.name.isType !== undefined ? param.name.isType : false,
                },
                defaultValue: {
                    ...param.defaultValue,
                    value: param.defaultValue?.value || "",
                    valueType: param.defaultValue?.valueType || "EXPRESSION",
                    isType: param.defaultValue?.isType !== undefined ? param.defaultValue.isType : false,
                }
            }))
        };
        setFunctionModel(currentFuncModel);
        setIsEdit(true);
        // setShowForm(true);
    }

    const onDeleteFunction = async (model: FunctionModel) => {
        const targetPosition: NodePosition = {
            startLine: model?.codedata?.lineRange?.startLine.line,
            startColumn: model?.codedata.lineRange?.startLine?.offset,
            endLine: model?.codedata?.lineRange?.endLine?.line,
            endColumn: model?.codedata?.lineRange?.endLine?.offset
        }
        const deleteAction: STModification = removeStatement(targetPosition);
        await applyModifications(rpcClient, [deleteAction]);
        fetchServiceModel();
    }

    const onFunctionImplement = async (func: FunctionModel) => {
        const lineRange: LineRange = func.codedata.lineRange;
        const nodePosition: NodePosition = { startLine: lineRange.startLine.line, startColumn: lineRange.startLine.offset, endLine: lineRange.endLine.line, endColumn: lineRange.endLine.offset }
        await rpcClient.getVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { position: nodePosition, documentUri: filePath } })
    }

    const renderOperations = () => {
        const categories: { query: FunctionModel[]; mutation: FunctionModel[]; subscription: FunctionModel[] } = {
            query: [],
            mutation: [],
            subscription: []
        };

        serviceModel?.functions.forEach(operation => {
            switch (operation.kind) {
                case 'QUERY':
                    categories.query.push(operation);
                    break;
                case 'MUTATION':
                    categories.mutation.push(operation);
                    break;
                case 'SUBSCRIPTION':
                    categories.subscription.push(operation);
                    break;
                default:
                    break;
            }
        });


        return (
            <>
                {categories.query.length > 0 && (
                    <div>
                        <Typography variant="body2" sx={{ marginLeft: 10, marginBottom: 20, marginTop: 10 }}>
                            Query Operations
                        </Typography>
                        {categories.query.map((operation, index) => (
                            <OperationAccordion
                                key={index}
                                functionModel={operation}
                                goToSource={goToSource}
                                onEditFunction={onEditOperation}
                                onDeleteFunction={onDeleteFunction}
                                onFunctionImplement={onFunctionImplement}
                            />
                        ))}
                    </div>
                )}
                {categories.mutation.length > 0 && (
                    <div>
                        <Typography variant="body2" sx={{ marginLeft: 10, marginBottom: 20, marginTop: 10 }}>
                            Mutation Operations
                        </Typography>
                        {categories.mutation.map((operation, index) => (
                            <OperationAccordion
                                key={index}
                                functionModel={operation}
                                goToSource={goToSource}
                                onEditFunction={onEditOperation}
                                onDeleteFunction={onDeleteFunction}
                                onFunctionImplement={onFunctionImplement}
                            />
                        ))}
                    </div>
                )}
                {categories.subscription.length > 0 && (
                    <div>
                        <Typography variant="body2" sx={{ marginLeft: 10, marginBottom: 20, marginTop: 10 }}>
                            Subscription Operations
                        </Typography>
                        {categories.subscription.map((operation, index) => (
                            <OperationAccordion
                                key={index}
                                functionModel={operation}
                                goToSource={goToSource}
                                onEditFunction={onEditOperation}
                                onDeleteFunction={onDeleteFunction}
                                onFunctionImplement={onFunctionImplement}
                            />
                        ))}
                    </div>
                )}
            </>
        );

    }

    const handleNewOperation = async () => {
        setFunctionModel(JSON.parse(JSON.stringify(functionTemplates.query)));
        console.log("New Function Model: ", functionTemplates);
        setIsNewForm(true);
    }

    const handleNewFunctionClose = () => {
        setIsNewForm(false);
        setFunctionModel(undefined);

    }

    const handleEditFunctionClose = () => {
        setIsEdit(false);
        setFunctionModel(undefined);
    }

    const handleFunctionSubmit = async (updatedModel: FunctionModel) => {
        try {
            let LsReponse;
            if (isEdit) {
                LsReponse = await rpcClient.getServiceDesignerRpcClient().updateResourceSourceCode({
                    filePath,
                    codedata: {
                        lineRange: lineRange
                    },
                    function: updatedModel
                });
            } else {
                LsReponse = await rpcClient.getServiceDesignerRpcClient().addFunctionSourceCode({
                    filePath,
                    codedata: {
                        lineRange: lineRange
                    },
                    function: updatedModel
                });
            }

            // Refresh the service model
            fetchServiceModel(LsReponse?.filePath, LsReponse?.position);

            if (isEdit) {
                setIsEdit(false);
            } else {
                setIsNewForm(false);
            }
            setFunctionModel(undefined);
        } catch (error) {
            console.error('Error handling submit:', error);
        }
    };

    const handleMethodChange = (value: string) => {
        switch (value) {
            case 'Query':
                setFunctionModel(JSON.parse(JSON.stringify(functionTemplates.query)));
                break;
            case 'Mutation':
                setFunctionModel(JSON.parse(JSON.stringify(functionTemplates.mutation)));
                break;
            case 'Subscription':
                setFunctionModel(JSON.parse(JSON.stringify(functionTemplates.subscription)));
                break;
        }
    };

    return (
        <>
            {!isNewForm && !isEdit && (
                <GraphqlContainer>
                    <ServiceContainer>
                        {!serviceModel &&
                            <LoadingContainer>
                                <ProgressRing />
                                <Typography variant="h3" sx={{ marginTop: '16px' }}>Loading Service Designer...</Typography>
                            </LoadingContainer>
                        }
                        {serviceModel && (
                            <>
                                <TopBar>
                                    <ViewHeader title={serviceModel.displayAnnotation.label} codicon="globe" onEdit={handleServiceEdit} />
                                    <Button appearance="icon" onClick={onClose}>
                                        <Codicon name="close" />
                                    </Button>
                                </TopBar>
                                <Divider />
                                <InfoContainer>
                                    {Object.keys(serviceModel.properties).map((key, index) => (
                                        serviceModel.properties[key].value && (
                                            <InfoSection>
                                                <Icon name={findIcon(serviceModel.properties[key].metadata.label)} isCodicon sx={{ marginRight: '8px' }} />
                                                <Typography key={`${index}-label`} variant="body3">
                                                    {serviceModel.properties[key].metadata.label}:
                                                </Typography>
                                                <Typography key={`${index}-value`} variant="body3">
                                                    {getAttributeComponent(serviceModel.properties[key])}
                                                </Typography>
                                            </InfoSection>
                                        )
                                    ))}
                                </InfoContainer>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography key={"title"} variant="body2" sx={{ marginLeft: 10, marginBottom: 20, marginTop: 10 }}>
                                        Available Operations
                                    </Typography>
                                    <VSCodeButton appearance="primary" title="Add Resource" onClick={handleNewOperation}>
                                        <Codicon name="add" sx={{ marginRight: 5 }} /> Operation
                                    </VSCodeButton>
                                </div>
                                {renderOperations()}
                            </>
                        )}
                    </ServiceContainer>
                </GraphqlContainer>
            )}
            {functionModel && isNewForm && (
                <PanelContainer
                    title={"Operation Configuration"}
                    show={isNewForm}
                    onClose={handleNewFunctionClose}
                    width={600}
                >

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 0 16px' }}>
                        <Dropdown
                            sx={{ width: 160 }}
                            isRequired
                            errorMsg=""
                            id="drop-down"
                            items={[{ value: 'Query' }, { value: 'Mutation' }, { value: 'Subscription' }]}
                            label="Operation Type"
                            onValueChange={handleMethodChange}
                            value={functionModel.kind === 'QUERY' ? 'Query' :
                                functionModel.kind === 'MUTATION' ? 'Mutation' :
                                    functionModel.kind === 'SUBSCRIPTION' ? 'Subscription' : ''}
                        />
                    </div>
                    <OperationForm
                        model={functionModel}
                        filePath={filePath}
                        lineRange={lineRange}
                        onSave={handleFunctionSubmit}
                        onClose={handleNewFunctionClose}
                    />
                </PanelContainer>
            )}
            {functionModel && isEdit && (
                <PanelContainer
                    title={"Edit Operation"}
                    show={isEdit}
                    onClose={handleEditFunctionClose}
                    width={600}
                >
                    <OperationForm
                        model={functionModel}
                        filePath={filePath}
                        lineRange={lineRange}
                        onSave={handleFunctionSubmit}
                        onClose={handleEditFunctionClose}
                    />
                </PanelContainer>
            )}
        </>
    );
}
