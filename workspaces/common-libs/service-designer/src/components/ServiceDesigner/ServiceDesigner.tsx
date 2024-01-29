/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { Typography, Codicon } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { Resource, Service } from "./../../definitions";
import ResourceAccordion from "../ResourceAccordion/ResourceAccordion";

interface ServiceDesignerProps {
    // Model of the service.
    model?: Service;
    // Callback to send the position of the resource to navigae to code
    goToSource?: (position: NodePosition) =>  void;
    // Callback to add a new resource
    onResourceAdd?: () =>  void;
    // Callback to send the Resource back to the parent component
    onResourceDelete?: (resource: Resource, position?: NodePosition) =>  void;
    // Callback to send the resource back to the parent component
    onResourceEdit?: (resource: Resource) =>  void;
    // Callback to send the service back to the parent component
    onServiceEdit?: (service: Service) =>  void;
}

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
    const { model = defaultService, goToSource, onResourceAdd, onResourceEdit, onResourceDelete, onServiceEdit } = props;
    const [resources, setResources] = useState<JSX.Element[]>([]);

    const handleResourceEdit = (resource: Resource) => {
        if (onResourceEdit) {
            onResourceEdit(resource);
        }
    };
    const handleResourceDelete = (resource: Resource, position?: NodePosition) => {
        if (onResourceDelete) {
            onResourceDelete(resource, position);
        }
    };
    const handleServiceEdit = () => {
        if (onServiceEdit) {
            onServiceEdit(model);
        }
    };

    useEffect(() => {
        const resourceList: JSX.Element[] = [];
        const fetchResources = async () => {
            model.resources.forEach((resource, i) => {
                resourceList.push(
                    <ResourceAccordion
                        key={i}
                        resource={resource}
                        onEditResource={handleResourceEdit}
                        modelPosition={resource.position}
                        onDeleteResource={handleResourceDelete}
                        goToSource={goToSource} 
                    />
                );
            });
            setResources(resourceList);
        };
        fetchResources();
    }, [model]);

    return (
        <div data-testid="service-design-view">
            <ServiceHeader>
                <Typography sx={{ marginBlockEnd: 10 }} variant="h3">Service /path </Typography>
                <Typography sx={{ marginBlockEnd: 10 }} variant="h4">Listening on port 8000</Typography>
                <VSCodeButton appearance="icon" title="Edit Service" onClick={handleServiceEdit}>
                    <Codicon name="settings-gear" />
                </VSCodeButton>
            </ServiceHeader>
            <ResourceListHeader>
                <Typography sx={{ marginBlockEnd: 10 }} variant="h3">Available resources </Typography>
                <VSCodeButton appearance="primary" title="Edit Service" onClick={onResourceAdd}>
                    <Codicon name="add" sx={{ marginRight: 5 }} /> Resource
                </VSCodeButton>
            </ResourceListHeader>
            <>
                {resources?.length > 0 ? resources : emptyView}
            </>
        </div>
    )
}
