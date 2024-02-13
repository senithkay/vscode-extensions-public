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
import { ServiceDesignerAPI, CommonRPCAPI } from "@wso2-enterprise/ballerina-core";

interface RPCClients {
    serviceDesignerRpcClient: ServiceDesignerAPI;
    commonRpcClient: CommonRPCAPI;
}
interface ServiceDesignerProps {
    // Model of the service. This is the ST of the service
    model?: ServiceDeclaration;
    // RPC client to communicate with the backend for ballerina
    rpcClients?: RPCClients;
    // Callback to send the position of the resource to navigae to code
    goToSource?: (resource: Resource) => void;
}

export function ServiceDesignerView(props: ServiceDesignerProps) {
    const { model, rpcClients, goToSource } = props;

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
        commonRpcClient.deleteSource({ position: resource.position });
    };
    const handleResourceFormSave = async (content: string, config: Resource, resourcePosition?: NodePosition) => {
        const position = model.closeBraceToken.position;
        position.endColumn = 0;
        commonRpcClient.updateSource({ position: resourcePosition ? resourcePosition : position, source: content });
    };

    // Callbacks for service form
    const handleServiceEdit = () => {
        setServiceFormOpen(true);
    };
    const handleServiceFormClose = () => {
        setServiceFormOpen(false);
    };
    const handleServiceFormSave = async (service: Service) => {
        const content = updateServiceDecl({BASE_PATH: service.path, PORT: `${service.port}`, SERVICE_TYPE: "http"});
        commonRpcClient.updateSource({ position: service.position, source: content });
    };

    const handleGoToSource = (resource: Resource) => {
        if (goToSource) {
            goToSource(resource);
        } else {
            commonRpcClient.goToSource({ position: resource.position });
        }
    };

    useEffect(() => {
        const fetchService = async () => {
            setServiceConfig(await getService(model, serviceDesignerRpcClient));
        };
        fetchService();
    }, [model]);

    const addNameRecord = async (source: string) => {
        const position = model.closeBraceToken.position;
        position.startColumn = position.endColumn;
        commonRpcClient.updateSource({ position: position, source });
    };

    return (
        <div data-testid="service-design-view">
            <ServiceDesigner
                model={serviceConfig}
                goToSource={handleGoToSource}
                onResourceEdit={handleResourceEdit}
                onResourceDelete={handleResourceDelete}
                onServiceEdit={handleServiceEdit}
                onResourceAdd={handleResourceFormOpen}
            />
            {isResourceFormOpen &&
                <ResourceForm
                    isOpen={isResourceFormOpen}
                    isBallerniaExt={isParentBallerinaExt}
                    resourceConfig={serviceConfig?.resources.length > 0 ? editingResource : undefined}
                    onSave={handleResourceFormSave}
                    onClose={handleResourceFormClose} 
                    addNameRecord={addNameRecord}
                    serviceEndPosition={{
                        startLine: model.closeBraceToken.position.endLine,
                        startColumn: model.closeBraceToken.position.endColumn,
                        endLine: model.closeBraceToken.position.endLine,
                        endColumn: model.closeBraceToken.position.endColumn
                    }}
                    commonRpcClient={commonRpcClient}
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
    )
}
