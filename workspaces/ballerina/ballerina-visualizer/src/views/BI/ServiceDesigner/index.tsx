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
import { EVENT_TYPE, LineRange, MACHINE_VIEW, ServiceModel, STModification, TriggerNode } from "@wso2-enterprise/ballerina-core";
import { BodyText, ViewWrapper } from "../../styles";
import { Codicon, Container, Grid, ProgressRing, Typography, View, ViewContent, ViewHeader } from "@wso2-enterprise/ui-toolkit";
import ServiceConfigView from "../Trigger/ServiceConfigView";
import { BIHeader } from "../BIHeader";
import styled from "@emotion/styled";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { ResourceAccordion } from "./components/ResourceAccordion";


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

    useEffect(() => {
        const lineRange: LineRange = { startLine: { line: position.startLine, offset: position.startColumn }, endLine: { line: position.endLine, offset: position.endColumn } };
        rpcClient.getServiceDesignerRpcClient().getServiceModelFromCode({ filePath, codedata: { lineRange } }).then(res => {
            console.log("Service Model: ", res.service);
            setServiceModel(res.service);
        })
    }, []);



    const [isSaving, setIsSaving] = useState<boolean>(false);

    const handleOpenDiagram = (resource: Resource) => {
        rpcClient.getVisualizerLocation().then(res => {
            rpcClient.getVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { position: resource.position, documentUri: res.documentUri } })
        })
    }


    const handlServiceSubmit = async (value: ServiceModel) => {
        setIsSaving(true);
        const res = await rpcClient.getServiceDesignerRpcClient().updateServiceSourceCode({ filePath: "", service: value });
        await rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                documentUri: res.filePath,
                position: res.position
            },
        });
        setIsSaving(false);
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
    const handlenewFunction = () => {

    };

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
                {serviceModel &&
                    <>
                        <ViewHeader title={serviceModel.displayAnnotation.label} codicon="globe" onEdit={handleServiceEdit}>
                            <VSCodeButton appearance="primary" title="Add Function" onClick={handlenewFunction}>
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
                                    onEditResource={() => { }}
                                    onDeleteResource={() => { }}
                                    onResourceImplement={() => { }}
                                    onResourceClick={() => { }}
                                />
                            ))}
                        </FunctionSection>
                    </>
                }
            </ViewContent>
        </View>
    );
}
