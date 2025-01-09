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
import { Resource, ServiceDesigner as BServiceDesigner } from "@wso2-enterprise/ballerina-service-designer";
import { EVENT_TYPE, LineRange, MACHINE_VIEW, ServiceModel, FunctionModel, STModification, TriggerNode } from "@wso2-enterprise/ballerina-core";
import { BodyText, ViewWrapper } from "../../styles";
import { Codicon, Container, Divider, Grid, Icon, ProgressRing, Typography, View, ViewContent, ViewHeader } from "@wso2-enterprise/ui-toolkit";
import { BIHeader } from "../BIHeader";
import styled from "@emotion/styled";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { ResourceAccordion } from "./components/ResourceAccordion";
import { PanelContainer } from "@wso2-enterprise/ballerina-side-panel";
import { FunctionConfigForm } from "./Forms/FunctionConfigForm";
import { ResourceForm } from "./Forms/ResourceForm";
import { FunctionForm } from "./Forms/FunctionForm";


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

    const fetchService = () => {
        const lineRange: LineRange = { startLine: { line: position.startLine, offset: position.startColumn }, endLine: { line: position.endLine, offset: position.endColumn } };
        rpcClient.getServiceDesignerRpcClient().getServiceModelFromCode({ filePath, codedata: { lineRange } }).then(res => {
            console.log("Service Model: ", res.service);
            setServiceModel(res.service);
            setIsSaving(false);
        })
    }

    useEffect(() => {
        fetchService();
    }, [position]);

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
        // Handle remote function save
    }

    const handleFunctionConfigSubmit = async (value: ServiceModel) => {
        setIsSaving(true);
        const res = await rpcClient.getServiceDesignerRpcClient().updateServiceSourceCode({ filePath, service: value });
        await rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                documentUri: res.filePath,
                position: res.position
            },
        });
        setIsSaving(false);
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
                                        <Typography key={index} variant="body3">
                                            {serviceModel.properties[key].metadata.label}: {serviceModel.properties[key].value}
                                        </Typography>
                                    </InfoSection>
                                )
                            ))}
                        </InfoContainer>

                        <Typography key={"title"} variant="body2" sx={{ marginLeft: 10, marginBottom: 20, marginTop: 10 }}>
                            Available {serviceModel.moduleName === "http" ? "Resources" : "Functions"}
                        </Typography>
                        {serviceModel.functions.filter(functionModel => (serviceModel.moduleName === "http" ? functionModel.kind === "RESOURCE" : true) && functionModel.enabled).map((functionModel, index) => (
                            <ResourceAccordion
                                key={index}
                                functionModel={functionModel}
                                goToSource={() => { }}
                                onEditResource={handleFunctionEdit}
                                onDeleteResource={() => { }}
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
                        <FunctionConfigForm serviceModel={serviceModel} onSubmit={handleFunctionConfigSubmit} onBack={handleFunctionConfigClose} />
                    </PanelContainer>
                }

            </ServiceContainer>
        </View >
    );
}
