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
import { ResourceForm } from "./components/ResourceForm//ResourceForm";
import { ServiceDeclaration, STKindChecker, ResourceAccessorDefinition, NodePosition } from "@wso2-enterprise/syntax-tree";
import { Typography, Codicon } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import ResourceAccordion from "./ResourceAccordion";
import { ServiceDesignerRpcClient } from "@wso2-enterprise/ballerina-rpc-client";
import { getResourceInfo } from "./utils/utils";
import { ResourceInfo } from "./definitions";

interface ServiceDesignerProps {
    model: ServiceDeclaration;
    rpcClient: ServiceDesignerRpcClient;
    showDiagram: (position: NodePosition) =>  void;
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

export function ServiceDesigner(props: ServiceDesignerProps) {
    const { model, rpcClient, showDiagram } = props;
    const [resources, setResources] = useState<JSX.Element[]>([]);

    const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(false);
    const [typeCompletions, setTypeCompletions] = useState<string[]>([]);

    const [editingResource, setEditingResource] = useState<ResourceInfo>();

    let servicePath = "";

    model.absoluteResourcePath.forEach((pathSegment) => {
        servicePath += pathSegment.value;
    });

    const handleOnClose = () => {
        setIsSidePanelOpen(false);
        setEditingResource(undefined);
    };
    const handleOnClick = () => {
        setIsSidePanelOpen(true);
    };
    const handleResourceEdit = async (resource: ResourceAccessorDefinition) => {
        const resourceInfo = await getResourceInfo(resource, rpcClient);
        setEditingResource(resourceInfo);
        setIsSidePanelOpen(true);
    };

    const fetchTypes = async () => {
        const types = await rpcClient.getKeywordTypes();
        setTypeCompletions(types.completions.map(type => type.insertText));
    }

    useEffect(() => {
        const resourceList: JSX.Element[] = [];
        model?.members.forEach(async (member) => {
            if (STKindChecker.isResourceAccessorDefinition(member)) {
                const startPosition = member.position?.startLine + ":" + member.position?.startColumn;
                const resourceInfo = await getResourceInfo(member, rpcClient);
                resourceList.push(
                    <div data-start-position={startPosition} >
                        <ResourceAccordion rpcClient={rpcClient} resourceInfo={resourceInfo} onEditResource={handleResourceEdit} model={member as ResourceAccessorDefinition} showDiagram={showDiagram} />
                    </div>
                );
            }
        });
        setResources(resourceList);
        fetchTypes();
    }, [model]);

    const handleServiceConfig = () => {
        // Handle service config form
    };

    const applyModifications = async (source: string, updatePosition?: NodePosition) => {
        const position = model.closeBraceToken.position;
        position.endColumn = 0;
        await rpcClient.createResource({ position: updatePosition ? updatePosition : position, source });
    };

    const addNameRecord = async (source: string) => {
        const position = model.closeBraceToken.position;
        position.startColumn = position.endColumn;
        await rpcClient.createResource({ position: position, source });
    };

    // let serviceType = "";
    let portNumber = "";

    if (STKindChecker.isExplicitNewExpression(model.expressions[0])) {
        if (
            STKindChecker.isQualifiedNameReference(
                model.expressions[0].typeDescriptor
            )
        ) {
            // serviceType = model.expressions[0].typeDescriptor.modulePrefix.value.toUpperCase();
            const listeningOnText = model.expressions[0].source;
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

    const emptyView = (
        <Typography variant="h3" sx={{ textAlign: "center"}}>
            No resources found. Add a new resource.
        </Typography>
    );

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
                    applyModifications={applyModifications}
                    onClose={handleOnClose} 
                    addNameRecord={addNameRecord}
                    typeCompletions={typeCompletions}
                />
            }
        </div>
    )
}
