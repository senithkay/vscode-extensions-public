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
import { ServiceDeclaration, NodePosition } from "@wso2-enterprise/syntax-tree";
import { ServiceDesigner } from "@wso2-enterprise/service-designer";
import { ServiceDesignerRpcClient } from "@wso2-enterprise/ballerina-rpc-client";
import { getService, updateServiceDecl } from "./utils/utils";
import { Resource, Service } from "./definitions";
import { ServiceForm } from "./components/ServiceForm/ServiceForm";

interface ServiceDesignerProps {
    // Model of the service. This is the ST of the service
    model?: ServiceDeclaration;
    // RPC client to communicate with the backend for ballerina
    rpcClient?: ServiceDesignerRpcClient;
    // Types to be shown in the autocomplete of respose
    typeCompletions?: string[];
    // Callback to send the position of the resource to navigae to code
    goToSource?: (position: NodePosition) =>  void;
}

export function ServiceDesignerView(props: ServiceDesignerProps) {
    const { model, typeCompletions = [], rpcClient, goToSource } = props;

    const [serviceConfig, setServiceConfig] = useState<Service>();

    const [isResourceFormOpen, setResourceFormOpen] = useState<boolean>(false);
    const [isServiceFormOpen, setServiceFormOpen] = useState<boolean>(false);
    const [types, setTypes] = useState<string[]>(typeCompletions);

    const [editingResource, setEditingResource] = useState<Resource>();

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
        rpcClient.deleteResource({ position: resource.position });
    };
    const handleResourceFormSave = async (content: string, config: Resource, resourcePosition?: NodePosition) => {
        const position = model.closeBraceToken.position;
        position.endColumn = 0;
        rpcClient.createResource({ position: resourcePosition ? resourcePosition : position, source: content });
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
        rpcClient.createResource({ position: service.position, source: content });
    };

    const fetchTypes = async () => {
        const types = await rpcClient?.getKeywordTypes();
        setTypes(types?.completions.map(type => type.insertText));
    };

    useEffect(() => {
        const fetchService = async () => {
            setServiceConfig(await getService(model, rpcClient));
        };
        fetchService();
        if (types.length === 0) {
            fetchTypes();
        }
    }, [model, types.length]);

    const addNameRecord = async (source: string) => {
        const position = model.closeBraceToken.position;
        position.startColumn = position.endColumn;
        rpcClient.createResource({ position: position, source });
    };

    return (
        <div data-testid="service-design-view">
            <ServiceDesigner
                model={serviceConfig}
                goToSource={goToSource}
                onResourceEdit={handleResourceEdit}
                onResourceDelete={handleResourceDelete}
                onServiceEdit={handleServiceEdit}
                onResourceAdd={handleResourceFormOpen}
            />
            {isResourceFormOpen &&
                <ResourceForm
                    isOpen={isResourceFormOpen}
                    resourceConfig={serviceConfig?.resources.length > 0 ? editingResource : undefined}
                    onSave={handleResourceFormSave}
                    onClose={handleResourceFormClose} 
                    addNameRecord={addNameRecord}
                    typeCompletions={types}
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
