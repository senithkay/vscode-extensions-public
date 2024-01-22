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
import { ServiceDeclaration, STKindChecker, ResourceAccessorDefinition, NodePosition } from "@wso2-enterprise/syntax-tree";
import { Typography, Codicon } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { ServiceDesignerRpcClient } from "@wso2-enterprise/ballerina-rpc-client";
import { getResource } from "./utils/utils";
import { Resource, Service } from "./definitions";
import ResourceAccordion from "./components/ResourceAccordion/ResourceAccordion";

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
    // Callback to send the resource info back to the parent component
    onResourceSave?: (resource: Resource) =>  void;
    // Callback to send the resource info back to the parent component
    onResourceDelete?: (resource: Resource) =>  void;
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

    const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(false);
    const [types, setTypes] = useState<string[]>(typeCompletions);

    const [editingResource, setEditingResource] = useState<Resource>();

    let servicePath = "";

    let serviceModel = model as ServiceDeclaration;
    if (!STKindChecker.isServiceDeclaration(serviceModel)) {
        serviceModel = undefined;
    }

    serviceModel?.absoluteResourcePath.forEach((pathSegment) => {
        servicePath += pathSegment.value;
    });

    const handleOnClose = () => {
        setIsSidePanelOpen(false);
        setEditingResource(undefined);
    };
    const handleOnClick = () => {
        setIsSidePanelOpen(true);
    };
    const handleResourceEdit = async (resource: Resource) => {
        setEditingResource(resource);
        setIsSidePanelOpen(true);
    };

    const fetchTypes = async () => {
        const types = await rpcClient?.getKeywordTypes();
        setTypes(types?.completions.map(type => type.insertText));
    }

    useEffect(() => {
        const resourceList: JSX.Element[] = [];
        const fetchResources = async () => {
            if (serviceModel && serviceModel.members) {
                let i = 0;
                for (const member of serviceModel.members) {
                    if (STKindChecker.isResourceAccessorDefinition(member)) {
                        const resource = await getResource(member, rpcClient);
                        resourceList.push(
                            <div>
                                <ResourceAccordion
                                    key={i}
                                    rpcClient={rpcClient}
                                    resource={resource}
                                    onEditResource={handleResourceEdit}
                                    modelPosition={(member as ResourceAccessorDefinition).position}
                                    onDeleteResource={onResourceDelete}
                                    goToSource={goToSource} 
                                />
                            </div>
                        );
                    }
                    i++;
                }
            } else {
                const serviceModel: Service = model as Service;
                serviceModel.resources.forEach((resource, i) => {
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
            }
            setResources(resourceList);
        };
        fetchResources();
        if (types.length === 0) {
            fetchTypes();
        }
    }, [model, types.length]);

    const handleServiceConfig = () => {
        // Handle service config form
    };

    const handleSave = async (content: string, config: Resource, updatePosition?: NodePosition) => {
        if (serviceModel) {
            const position = serviceModel.closeBraceToken.position;
            position.endColumn = 0;
            await rpcClient.createResource({ position: updatePosition ? updatePosition : position, source: content });
        } else {
            onResourceSave && onResourceSave(config);
        }
    };

    const addNameRecord = async (source: string) => {
        const position = serviceModel.closeBraceToken.position;
        position.startColumn = position.endColumn;
        await rpcClient.createResource({ position: position, source });
    };

    let portNumber = "";

    if (serviceModel && STKindChecker.isExplicitNewExpression(serviceModel?.expressions[0])) {
        if (
            STKindChecker.isQualifiedNameReference(
                serviceModel.expressions[0].typeDescriptor
            )
        ) {
            // serviceType = model.expressions[0].typeDescriptor.modulePrefix.value.toUpperCase();
            const listeningOnText = serviceModel.expressions[0].source;
            // Define a regular expression pattern to match the port number
            const pattern: RegExp = /\b(\d{4})\b/;

            // Use RegExp.exec to find the match in the input string
            const match: RegExpExecArray | null = pattern.exec(listeningOnText);

            // Check if a match is found and extract the port number
            if (match && match[1]) {
                portNumber = match[1];
                console.log("Port Number:", portNumber);
            }
        }
    }

    return (
        <div data-testid="service-design-view">
            <ServiceHeader>
                <Typography sx={{ marginBlockEnd: 10 }} variant="h3">Service {servicePath} </Typography>
                <Typography sx={{ marginBlockEnd: 10 }} variant="h4">Listening on port {portNumber}</Typography>
                <VSCodeButton appearance="icon" title="Edit Service" onClick={handleServiceConfig}>
                    <Codicon name="settings-gear" />
                </VSCodeButton>
            </ServiceHeader>
            <ResourceListHeader>
                <Typography sx={{ marginBlockEnd: 10 }} variant="h3">Available resources </Typography>
                <VSCodeButton appearance="primary" title="Edit Service" onClick={handleOnClick}>
                    <Codicon name="add" sx={{ marginRight: 5 }} /> Resource
                </VSCodeButton>
            </ResourceListHeader>
            <>
                {resources?.length > 0 ? resources : emptyView}
            </>
            {isSidePanelOpen &&
                <ResourceForm
                    isOpen={isSidePanelOpen}
                    resourceConfig={resources?.length > 0 ? editingResource : undefined}
                    onSave={handleSave}
                    onClose={handleOnClose} 
                    addNameRecord={addNameRecord}
                    isBallerina={!!serviceModel}
                    typeCompletions={types}
                />
            }
        </div>
    )
}
