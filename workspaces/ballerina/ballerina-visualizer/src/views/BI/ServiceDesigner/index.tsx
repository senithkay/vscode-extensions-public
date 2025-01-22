/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { NodePosition, ServiceDeclaration } from "@wso2-enterprise/syntax-tree";
import { EVENT_TYPE, LineRange, MACHINE_VIEW, ServiceModel, FunctionModel, STModification, TriggerNode, removeStatement, buildProjectStructure, DIRECTORY_MAP, ProjectStructureArtifactResponse, PropertyModel } from "@wso2-enterprise/ballerina-core";
import { BodyText, ViewWrapper } from "../../styles";
import { Codicon, Container, Divider, Grid, Icon, LinkButton, ProgressRing, Typography, View, ViewContent, ViewHeader } from "@wso2-enterprise/ui-toolkit";
import { BIHeader } from "../BIHeader";
import styled from "@emotion/styled";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { ResourceAccordion } from "./components/ResourceAccordion";
import { PanelContainer } from "@wso2-enterprise/ballerina-side-panel";
import { FunctionConfigForm } from "./Forms/FunctionConfigForm";
import { ResourceForm } from "./Forms/ResourceForm";
import { FunctionForm } from "./Forms/FunctionForm";
import { applyModifications } from "../../../utils/utils";


const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80vh;
    flex-direction: column;
`;

const InfoContainer = styled.div`
    display: flex;
    gap: 20px;
    padding: 15px;
    //border: 1px solid var(--vscode-editorIndentGuide-background);
`;

const InfoSection = styled.div`
    display: flex;
    align-items: center;
`;

const ServiceContainer = styled.div`
    padding-right: 10px;
    padding-left: 10px;
`;

interface ServiceDesignerProps {
    filePath: string;
    position: NodePosition;
}

export function ServiceDesigner(props: ServiceDesignerProps) {
    const { filePath, position } = props;
    const { rpcClient } = useRpcContext();
    const [serviceModel, setServiceModel] = useState<ServiceModel>(undefined);
    const [functionModel, setFunctionModel] = useState<FunctionModel>(undefined);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const [isNew, setIsNew] = useState<boolean>(false);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [showFunctionConfigForm, setShowFunctionConfigForm] = useState<boolean>(false);
    const [projectListeners, setProjectListeners] = useState<ProjectStructureArtifactResponse[]>([]);

    useEffect(() => {
        fetchService();
    }, [position]);

    const fetchService = () => {
        const lineRange: LineRange = { startLine: { line: position.startLine, offset: position.startColumn }, endLine: { line: position.endLine, offset: position.endColumn } };
        rpcClient.getServiceDesignerRpcClient().getServiceModelFromCode({ filePath, codedata: { lineRange } }).then(res => {
            console.log("Service Model: ", res.service);
            setServiceModel(res.service);
            setIsSaving(false);
        })
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

    const handleOpenListener = (value: string) => {
        const listenerValue = projectListeners.find(listener => listener.name === value);
        rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.BIListenerConfigView,
                position: listenerValue.position,
                documentUri: listenerValue.path
            }
        })
    }

    const handleOpenDiagram = async (resource: FunctionModel) => {
        const lineRange: LineRange = resource.codedata.lineRange;
        const nodePosition: NodePosition = { startLine: lineRange.startLine.line, startColumn: lineRange.startLine.offset, endLine: lineRange.endLine.line, endColumn: lineRange.endLine.offset }
        await rpcClient.getVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { position: nodePosition, documentUri: filePath } })
    }

    const handleServiceEdit = async () => {
        await rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.BIServiceConfigView,
                position: position,
                documentUri: filePath
            },
        });
    };

    const handleNewResourceFunction = () => {
        rpcClient.getServiceDesignerRpcClient().getHttpResourceModel({}).then(res => {
            console.log("New Function Model: ", res.resource);
            setFunctionModel(res.resource);
            setIsNew(true);
            setShowForm(true);
        })
    };

    const handleNewFunction = () => {
        setIsNew(true);
        setShowFunctionConfigForm(true);
    };

    const handleNewFunctionClose = () => {
        setIsNew(false);
        setShowForm(false);
    };

    const handleFunctionEdit = (value: FunctionModel) => {
        setFunctionModel(value);
        setIsNew(false);
        setShowForm(true);
    };

    const handleFunctionDelete = async (model: FunctionModel) => {
        if (model.kind === "REMOTE") {
            model.enabled = false;
            await handleResourceSubmit(model);
        } else {
            console.log("Deleting Resource Model:", model);
            const targetPosition: NodePosition = {
                startLine: model.codedata.lineRange.startLine.line,
                startColumn: model.codedata.lineRange.startLine.offset,
                endLine: model.codedata.lineRange.endLine.line,
                endColumn: model.codedata.lineRange.endLine.offset
            }
            const deleteAction: STModification = removeStatement(targetPosition);
            await applyModifications(rpcClient, [deleteAction]);
            fetchService();
        }
    };

    const handleResourceSubmit = async (value: FunctionModel) => {
        setIsSaving(true);
        const lineRange: LineRange = { startLine: { line: position.startLine, offset: position.startColumn }, endLine: { line: position.endLine, offset: position.endColumn } };
        let res = undefined;
        if (isNew) {
            res = await rpcClient.getServiceDesignerRpcClient().addResourceSourceCode({ filePath, codedata: { lineRange }, function: value });
        } else {
            res = await rpcClient.getServiceDesignerRpcClient().updateResourceSourceCode({ filePath, codedata: { lineRange }, function: value });
        }
        setIsNew(false);
        handleNewFunctionClose();
        await rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                documentUri: res.filePath,
                position: res.position
            },
        });
    }

    const handleFunctionSubmit = async (value: FunctionModel) => {
        setIsSaving(true);
        const lineRange: LineRange = { startLine: { line: position.startLine, offset: position.startColumn }, endLine: { line: position.endLine, offset: position.endColumn } };
        let res = undefined;
        if (isNew) {
            res = await rpcClient.getServiceDesignerRpcClient().addFunctionSourceCode({ filePath, codedata: { lineRange }, function: value });
        } else {
            res = await rpcClient.getServiceDesignerRpcClient().updateResourceSourceCode({ filePath, codedata: { lineRange }, function: value });
        }
        setIsNew(false);
        handleNewFunctionClose();
        handleFunctionConfigClose();
        await rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                documentUri: res.filePath,
                position: res.position
            },
        });
    }

    const handleFunctionConfigClose = () => {
        setShowFunctionConfigForm(false);
    }

    const handleExportOAS = () => {
        rpcClient.getServiceDesignerRpcClient().exportOASFile({});
    };


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

    return (
        <View>
            <ServiceContainer>
                {!serviceModel &&
                    <LoadingContainer>
                        <ProgressRing />
                        <Typography variant="h3" sx={{ marginTop: '16px' }}>Loading Service Designer...</Typography>
                    </LoadingContainer>
                }
                {isSaving && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                        <ProgressRing />
                    </div>
                )}
                {serviceModel &&
                    <>
                        <ViewHeader title={serviceModel.displayAnnotation.label} codicon="globe" onEdit={handleServiceEdit}>

                            {serviceModel.moduleName !== "http" && serviceModel.functions.some(func => !func.enabled) &&
                                <VSCodeButton appearance="primary" title="Add Function" onClick={handleNewFunction}>
                                    <Codicon name="add" sx={{ marginRight: 5 }} /> Function
                                </VSCodeButton>
                            }

                            {serviceModel.moduleName === "http" &&
                                <VSCodeButton appearance="primary" title="Add Resource" onClick={handleNewResourceFunction}>
                                    <Codicon name="add" sx={{ marginRight: 5 }} /> Resource
                                </VSCodeButton>
                            }

                            {serviceModel.moduleName === "http" &&
                                <VSCodeButton appearance="secondary" title="Export OAS" onClick={handleExportOAS}>
                                    <Codicon name="export" sx={{ marginRight: 5 }} /> Export OAS
                                </VSCodeButton>
                            }

                        </ViewHeader>
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

                            {serviceModel.moduleName === "http" && serviceModel.functions.filter(func => func.kind === "DEFAULT" && func.enabled).map((functionModel, index) => (
                                <InfoSection>
                                    <Icon name={findIcon('init')} isCodicon sx={{ marginRight: '8px' }} />
                                    <Typography key={`${index}-label`} variant="body3">
                                        Init Function:
                                    </Typography>
                                    <Typography key={`${index}-value`} variant="body3">
                                        <LinkButton sx={{ fontSize: 12, padding: 8, gap: 4 }} onClick={() => handleOpenDiagram(functionModel)}>
                                            {functionModel.name.value}
                                        </LinkButton>
                                    </Typography>
                                </InfoSection>
                            ))}
                        </InfoContainer>

                        <Typography key={"title"} variant="body2" sx={{ marginLeft: 10, marginBottom: 20, marginTop: 10 }}>
                            Available {serviceModel.moduleName === "http" ? "Resources" : "Functions"}
                        </Typography>
                        {serviceModel.functions.filter(functionModel => (serviceModel.moduleName === "http" ? functionModel.kind === "RESOURCE" : true) && functionModel.enabled).map((functionModel, index) => (
                            <ResourceAccordion
                                key={`${index}-${functionModel.name.value}`}
                                functionModel={functionModel}
                                goToSource={() => { }}
                                onEditResource={handleFunctionEdit}
                                onDeleteResource={handleFunctionDelete}
                                onResourceImplement={handleOpenDiagram}
                            />
                        ))}
                    </>
                }
                {functionModel && functionModel.kind === "RESOURCE" &&
                    <PanelContainer
                        title={"Resource Configuration"}
                        show={showForm}
                        onClose={handleNewFunctionClose}
                        width={600}
                    >
                        <ResourceForm model={functionModel} onSave={handleResourceSubmit} onClose={handleNewFunctionClose} />
                    </PanelContainer>
                }
                {functionModel && functionModel.kind === "REMOTE" &&
                    <PanelContainer
                        title={"Function Configuration"}
                        show={showForm}
                        onClose={handleNewFunctionClose}
                        width={600}
                    >
                        <FunctionForm model={functionModel} onSave={handleFunctionSubmit} onClose={handleNewFunctionClose} />
                    </PanelContainer>
                }

                {serviceModel?.moduleName !== "http" &&
                    < PanelContainer
                        title={"Function Configuration"}
                        show={showFunctionConfigForm}
                        onClose={handleFunctionConfigClose}
                    >
                        <FunctionConfigForm serviceModel={serviceModel} onSubmit={handleFunctionSubmit} onBack={handleFunctionConfigClose} />
                    </PanelContainer>
                }

            </ServiceContainer>
        </View >
    );
}
