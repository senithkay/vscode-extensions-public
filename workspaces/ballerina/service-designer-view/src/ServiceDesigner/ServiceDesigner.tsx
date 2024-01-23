/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { ServiceDeclaration, STKindChecker, NodePosition } from "@wso2-enterprise/syntax-tree";
import { Typography, Codicon } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { ServiceDesignerRpcClient } from "@wso2-enterprise/ballerina-rpc-client";
import { getService, updateServiceDecl } from "./utils/utils";
import { Resource, Service } from "./definitions";
import ResourceAccordion from "./components/ResourceAccordion/ResourceAccordion";
import { ServiceForm } from "./components/ServiceForm/ServiceForm";

interface ServiceDesignerProps {
    // Model of the service. Please send a ServiceDeclaration object in using ballerina and a ResourceInfo[] in other scenarios,
    // Send a empty ResourceInfo object if you want to create a new resource, in editing send the current resource info
    model?: ServiceDeclaration | Service;
    // RPC client to communicate with the backend for ballerina
    rpcClient?: ServiceDesignerRpcClient;
    // Types to be shown in the autocomplete of respose
    typeCompletions?: string[];
    // Callback to send the position of the resource to navigae to code
    goToSource?: (position: NodePosition) =>  void;
    // Callback to send the resource back to the parent component
    onResourceSave?: (resource: Resource) =>  void;
    // Callback to send the resource back to the parent component
    onResourceDelete?: (resource: Resource) =>  void;
    // Callback to send the service back to the parent component
    onServiceSave?: (service: Service) =>  void;
}

// Define ResourceInfo[] as the default model
const defaultService: Service = {
    path: "",
    port: 0,
    resources: []
}

const ServiceHeader = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 40;
    width: 100%;
    box-shadow: inset 0 -1px 0 0 var(--vscode-foreground);
    align-items: center;
`;

const ResourceListHeader = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 40;
    width: 100%;
    align-items: center;
`;

const emptyView = (
    <Typography variant="h3" sx={{ textAlign: "center"}}>
        No resources found. Add a new resource.
    </Typography>
);

export function ServiceDesigner(props: ServiceDesignerProps) {
    const { model = defaultService, typeCompletions = [], rpcClient, goToSource, onResourceSave, onResourceDelete } = props;
    const [resources, setResources] = useState<JSX.Element[]>([]);

    const [isResourceFormOpen, setResourceFormOpen] = useState<boolean>(false);
    const [isServiceFormOpen, setServiceFormOpen] = useState<boolean>(false);
    const [types, setTypes] = useState<string[]>(typeCompletions);

    const [editingResource, setEditingResource] = useState<Resource>();

    let ballerinaServiceModel = model as ServiceDeclaration;
    if (!STKindChecker.isServiceDeclaration(ballerinaServiceModel)) {
        ballerinaServiceModel = undefined;
    }
    const [balServiceConfig, setServiceConfig] = useState<Service>(!ballerinaServiceModel ? model as Service : undefined);

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

    const handleServiceEdit = () => {
        setServiceFormOpen(true);
    };
    const handleServiceFormClose = () => {
        setServiceFormOpen(false);
    };
    const handleServiceFormSave = async (service: Service) => {
        const content = updateServiceDecl({BASE_PATH: service.path, PORT: `${service.port}`, SERVICE_TYPE: "http"});
        await rpcClient.createResource({ position: service.position, source: content });
    };

    const fetchTypes = async () => {
        const types = await rpcClient?.getKeywordTypes();
        setTypes(types?.completions.map(type => type.insertText));
    };

    useEffect(() => {
        const resourceList: JSX.Element[] = [];
        const fetchResources = async () => {
            const service = (ballerinaServiceModel && ballerinaServiceModel.members) ? await getService(ballerinaServiceModel, rpcClient) : model as Service;
            if (ballerinaServiceModel) {
                setServiceConfig(service);
            }
            service.resources.forEach((resource, i) => {
                resourceList.push(
                    <ResourceAccordion
                        key={i}
                        rpcClient={rpcClient}
                        resource={resource}
                        onEditResource={handleResourceEdit}
                        modelPosition={resource.position}
                        onDeleteResource={onResourceDelete}
                        goToSource={goToSource} 
                    />
                );
            });
            setResources(resourceList);
        };
        fetchResources();
        if (types.length === 0) {
            fetchTypes();
        }
    }, [model, types.length]);

    const handleResourceFormSave = async (content: string, config: Resource, updatePosition?: NodePosition) => {
        if (ballerinaServiceModel) {
            const position = ballerinaServiceModel.closeBraceToken.position;
            position.endColumn = 0;
            await rpcClient.createResource({ position: updatePosition ? updatePosition : position, source: content });
        } else {
            onResourceSave && onResourceSave(config);
        }
    };

    const addNameRecord = async (source: string) => {
        const position = ballerinaServiceModel.closeBraceToken.position;
        position.startColumn = position.endColumn;
        await rpcClient.createResource({ position: position, source });
    };

    return (
        <div data-testid="service-design-view">
            <ServiceHeader>
                <Typography sx={{ marginBlockEnd: 10 }} variant="h3">Service {balServiceConfig ? balServiceConfig.path : (model as Service).path } </Typography>
                <Typography sx={{ marginBlockEnd: 10 }} variant="h4">Listening on port {balServiceConfig ? balServiceConfig.port : (model as Service).port }</Typography>
                <VSCodeButton appearance="icon" title="Edit Service" onClick={handleServiceEdit}>
                    <Codicon name="settings-gear" />
                </VSCodeButton>
            </ServiceHeader>
            <ResourceListHeader>
                <Typography sx={{ marginBlockEnd: 10 }} variant="h3">Available resources </Typography>
                <VSCodeButton appearance="primary" title="Edit Service" onClick={handleResourceFormOpen}>
                    <Codicon name="add" sx={{ marginRight: 5 }} /> Resource
                </VSCodeButton>
            </ResourceListHeader>
            <>
                {resources?.length > 0 ? resources : emptyView}
            </>
            {isResourceFormOpen &&
                <ResourceForm
                    isOpen={isResourceFormOpen}
                    resourceConfig={resources?.length > 0 ? editingResource : undefined}
                    onSave={handleResourceFormSave}
                    onClose={handleResourceFormClose} 
                    addNameRecord={addNameRecord}
                    isBallerina={!!ballerinaServiceModel}
                    typeCompletions={types}
                />
            }
            {isServiceFormOpen &&
                <ServiceForm
                    isOpen={isServiceFormOpen}
                    serviceConfig={ballerinaServiceModel ? balServiceConfig : model as Service}
                    onSave={handleServiceFormSave}
                    onClose={handleServiceFormClose} 
                />
            }
        </div>
    )
}
