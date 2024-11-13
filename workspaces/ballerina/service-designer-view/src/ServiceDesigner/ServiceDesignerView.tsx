/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState, useEffect } from "react";
import { ResourceForm } from "./components/ResourceForm/ResourceForm";
import { ServiceDeclaration, NodePosition } from "@wso2-enterprise/syntax-tree";
import { Resource, Service, ServiceDesigner } from "@wso2-enterprise/service-designer";
import { getService, updateServiceDecl } from "./utils/utils";
import { ServiceForm } from "./components/ServiceForm/ServiceForm";
import { ServiceDesignerAPI, CommonRPCAPI, STModification, createImportStatement } from "@wso2-enterprise/ballerina-core";
import { ContextProvider } from "./ContextProvider";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { Codicon, View, ViewHeader, ViewContent, Typography } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";

const ServiceHeader = styled.div`
    padding-left: 24px;
`;

interface RPCClients {
    serviceDesignerRpcClient: ServiceDesignerAPI;
    commonRpcClient: CommonRPCAPI;
}
interface ServiceDesignerProps {
    // Model of the service. This is the ST of the service
    model?: ServiceDeclaration;
    // RPC client to communicate with the backend for ballerina
    rpcClients?: RPCClients;
    // Callback to send modifications to update source
    applyModifications?: (modifications: STModification[]) => Promise<void>;
    // Callback to send the position of the resource to navigae to code
    goToSource?: (resource: Resource) => void;
    // If the service designer is for bi
    isBI?: boolean;
    // If editing needs to be disabled
    isEditingDisabled?: boolean;
}

export function ServiceDesignerView(props: ServiceDesignerProps) {
    const { model, rpcClients, applyModifications, goToSource, isEditingDisabled } = props;

    const [serviceConfig, setServiceConfig] = useState<Service>();

    const [isResourceFormOpen, setResourceFormOpen] = useState<boolean>(false);
    const [isServiceFormOpen, setServiceFormOpen] = useState<boolean>(false);
    const [editingResource, setEditingResource] = useState<Resource>();

    const isParentBallerinaExt = !goToSource;
    const serviceDesignerRpcClient = rpcClients?.serviceDesignerRpcClient;
    const commonRpcClient = rpcClients?.commonRpcClient;

    // Callbacks for resource form
    const handleResourceFormClose = () => {
        setResourceFormOpen(false);
        setEditingResource(undefined);
    };
    const handleResourceFormOpen = () => {
        setResourceFormOpen(true);
    };
    const handleResourceEdit = async (resource: Resource) => {
        setEditingResource(resource);
        setResourceFormOpen(true);
    };
    const handleResourceDelete = async (resource: Resource) => {
        await applyModifications([{
            type: 'DELETE',
            ...resource.position
        }]);
    };
    const handleResourceFormSave = async (content: string, config: Resource, resourcePosition?: NodePosition) => {
        const position = model.closeBraceToken.position;
        position.endColumn = 0;
        await applyModifications([{
            type: "INSERT",
            isImport: false,
            config: {
                "STATEMENT": content
            },
            ...(resourcePosition ? resourcePosition : position)
        }]);
    };

    // Callbacks for service form
    const handleServiceEdit = () => {
        setServiceFormOpen(true);
    };
    const handleServiceFormClose = () => {
        setServiceFormOpen(false);
    };
    const handleServiceFormSave = async (service: Service) => {
        const content = updateServiceDecl({ BASE_PATH: service.path, PORT: `${service.port}`, SERVICE_TYPE: "http" });
        await applyModifications([{
            type: "INSERT",
            isImport: false,
            config: {
                "STATEMENT": content
            },
            ...service.position
        }]);
    };

    const handleGoToSource = (resource: Resource) => {
        if (goToSource) {
            goToSource(resource);
        } else {
            commonRpcClient.goToSource({ position: resource.position! });
        }
    };

    useEffect(() => {
        const fetchService = async () => {
            setServiceConfig(await getService(model, serviceDesignerRpcClient, props.isBI, handleResourceEdit, handleResourceDelete));
        };
        fetchService();
    }, [model]);

    const addNameRecord = async (source: string) => {
        const position = model.closeBraceToken.position;
        position.startColumn = position.endColumn;
        await applyModifications([{
            type: "INSERT",
            isImport: false,
            config: {
                "STATEMENT": source
            },
            ...position
        }]);
    };

    const handleExportOAS = () => {
        serviceDesignerRpcClient.exportOASFile({});
    };

    return (
        <ContextProvider commonRpcClient={commonRpcClient} applyModifications={applyModifications} serviceEndPosition={model?.closeBraceToken.position}>
            <div data-testid="service-design-view">
                <View>
                    <ViewHeader title={`Service ${serviceConfig?.path}`} codicon="globe" onEdit={!isEditingDisabled && handleServiceEdit}>
                        {!isEditingDisabled &&
                            <VSCodeButton appearance="primary" title="Edit Service" onClick={handleResourceFormOpen}>
                                <Codicon name="add" sx={{ marginRight: 5 }} /> Resource
                            </VSCodeButton>
                        }
                        <VSCodeButton appearance="secondary" title="Export OAS" onClick={handleExportOAS}>
                            <Codicon name="export" sx={{ marginRight: 5 }} /> Export OAS
                        </VSCodeButton>
                    </ViewHeader>
                    <ServiceHeader>
                        {isEditingDisabled && <Typography sx={{ marginBlockEnd: 10 }} variant="caption">This is generated from {serviceConfig?.path} contract</Typography>}
                        {serviceConfig?.port && <Typography sx={{ marginBlockEnd: 10 }} variant="caption">Listening on: {serviceConfig.port}</Typography>}
                    </ServiceHeader>
                    <ViewContent padding>
                        <ServiceDesigner
                            model={serviceConfig}
                            onResourceClick={handleGoToSource}
                            disableServiceHeader={props.isBI}
                            onResourceEdit={handleResourceEdit}
                            onResourceDelete={handleResourceDelete}
                        />
                    </ViewContent>
                </View>
                {isResourceFormOpen &&
                    <ResourceForm
                        isOpen={isResourceFormOpen}
                        isBallerniaExt={isParentBallerinaExt}
                        resourceConfig={serviceConfig.resources.length > 0 ? editingResource : undefined}
                        onSave={handleResourceFormSave}
                        onClose={handleResourceFormClose}
                        addNameRecord={addNameRecord}
                        commonRpcClient={commonRpcClient}
                        applyModifications={applyModifications}
                    />
                }
                {isServiceFormOpen &&
                    <ServiceForm
                        isOpen={isServiceFormOpen}
                        serviceConfig={serviceConfig}
                        onSave={handleServiceFormSave}
                        onClose={handleServiceFormClose}
                    />
                }
            </div>
        </ContextProvider>
    )
}
