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
import { Codicon, Container, Grid, ProgressRing, Typography, View, ViewContent, ViewHeader } from "@wso2-enterprise/ui-toolkit";
import { BIHeader } from "../BIHeader";
import styled from "@emotion/styled";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { ResourceAccordion } from "./components/ResourceAccordion";
import { PanelContainer } from "@wso2-enterprise/ballerina-side-panel";
import { FunctionConfigForm } from "./Forms/FunctionConfigForm";
import { ResourceForm } from "./Forms/ResourceForm";


const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80vh;
    flex-direction: column;
`;

const ServiceHeader = styled.div`
    padding-left: 24px;
`;

const FunctionSection = styled.div`
    
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

    const handleNewFunction = () => {
        rpcClient.getServiceDesignerRpcClient().getHttpResourceModel({}).then(res => {
            console.log("New Function Model: ", res.resource);
            setFunctionModel(res.resource);
            setIsNew(true);
            setShowForm(true);
        })
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

    const handleFunctionSubmit = async (value: FunctionModel) => {
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

    const handleExportOAS = () => {
        rpcClient.getServiceDesignerRpcClient().exportOASFile({});
    };

    return (
        <View>
            <ViewContent padding>
                <BIHeader />
                {!serviceModel &&
                    <LoadingContainer>
                        <ProgressRing />
                        <Typography variant="h3" sx={{ marginTop: '16px' }}>Loading Service Designer...</Typography>
                    </LoadingContainer>
                }
                {isSaving && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                        <ProgressRing />
                        {/* {setTimeout(() => (
                            <button style={{ marginTop: '20px' }} onClick={() => setIsSaving(false)}>Cancel</button>
                        ), 10000)} */}
                    </div>
                )}
                {serviceModel &&
                    <>
                        <ViewHeader title={serviceModel.displayAnnotation.label} codicon="globe" onEdit={handleServiceEdit}>
                            <VSCodeButton appearance="primary" title="Add Function" onClick={handleNewFunction}>
                                <Codicon name="add" sx={{ marginRight: 5 }} /> Function
                            </VSCodeButton>

                            <VSCodeButton appearance="secondary" title="Export OAS" onClick={handleExportOAS}>
                                <Codicon name="export" sx={{ marginRight: 5 }} /> Export OAS
                            </VSCodeButton>

                        </ViewHeader>
                        <ServiceHeader>
                            {Object.keys(serviceModel.properties).map((key, index) => (
                                serviceModel.properties[key].value && (
                                    <Typography key={index} variant="h4" sx={{ marginBlockEnd: 10 }}>
                                        {serviceModel.properties[key].metadata.label}: {serviceModel.properties[key].value}
                                    </Typography>
                                )
                            ))}
                        </ServiceHeader>
                        <FunctionSection>
                            {serviceModel.functions.map((functionModel, index) => (
                                <ResourceAccordion
                                    key={index}
                                    functionModel={functionModel}
                                    goToSource={() => { }}
                                    onEditResource={handleFunctionEdit}
                                    onDeleteResource={() => { }}
                                    onResourceImplement={handleOpenDiagram}
                                />
                            ))}
                        </FunctionSection>
                    </>
                }
                {functionModel && functionModel.kind === "RESOURCE" &&
                    <PanelContainer
                        title={"Resource Configuration"}
                        show={showForm}
                        onClose={handleNewFunctionClose}
                        width={600}
                    >
                        <ResourceForm model={functionModel} onSave={handleFunctionSubmit} onClose={handleNewFunctionClose} />
                    </PanelContainer>
                }
            </ViewContent>
        </View>
    );
}
