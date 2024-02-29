/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { Resource, Service, ServiceDesigner } from "@wso2-enterprise/service-designer";
import { AddAPIFormProps, AddResourceForm } from "../Forms/AddResourceForm";
import { SERVICE_DESIGNER } from "../../constants";
import { getXML } from "../../utils/template-engine/mustache-templates/templateUtils";

interface ServiceDesignerProps {
    syntaxTree: any;
    documentUri: string;
}
export function ServiceDesignerView({ syntaxTree, documentUri }: ServiceDesignerProps) {
    const { rpcClient } = useVisualizerContext();
    const [serviceModel, setServiceModel] = React.useState<Service>(null);
    const [isResourceFormOpen, setResourceFormOpen] = React.useState<boolean>(false);
    const [apiInsertPosition, setApiInsertPosition] = React.useState<any>(null);

    useEffect(() => {
        const st = syntaxTree.api;
        const resources: Resource[] = [];
        st.resource.forEach((resource: any) => {
            const value: Resource = {
                methods: resource.methods,
                path: resource.uriTemplate,
            }
            resources.push(value);
        })
        setApiInsertPosition(st.range.endTagRange.start);
        const model: Service = {
            path: st.context,
            port: 0,
            resources: resources,
            position: {
                startLine: st.range.startTagRange.start.line,
                startColumn: st.range.startTagRange.start.character,
                endLine: st.range.endTagRange.end.line,
                endColumn: st.range.endTagRange.end.character
            }
        }
        setServiceModel(model);
    }, [syntaxTree, documentUri]);

    const openDiagram = (resource: Resource) => {
        const resourceIndex = serviceModel.resources.findIndex((res) => res === resource);
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Diagram, documentUri: documentUri, identifier: resourceIndex.toString() } })
    }

    const handleResourceAdd = () => {
        setResourceFormOpen(true);
    };

    const handleCancel = () => {
        setResourceFormOpen(false);
    };

    const handleCreateAPI = ({ methods, uri_template, url_mapping }: AddAPIFormProps) => {
        const formValues = {
            methods: methods.join(" "),
            uri_template,
            url_mapping,
        };

        const xml = getXML(SERVICE_DESIGNER.ADD_RESOURCE, formValues);
        rpcClient.getMiDiagramRpcClient().applyEdit({
            text: xml,
            documentUri: documentUri,
            range: {
                start: {
                    line: apiInsertPosition.line,
                    character: apiInsertPosition.character,
                },
                end: {
                    line: apiInsertPosition.line,
                    character: apiInsertPosition.character,
                },
            },
        });
        setResourceFormOpen(false);
    };

    return (
        <>
            {serviceModel && (
                <ServiceDesigner model={serviceModel} goToSource={openDiagram} onResourceAdd={handleResourceAdd} />
            )}
            <AddResourceForm
                isOpen={isResourceFormOpen}
                handleCancel={handleCancel}
                handleCreateAPI={handleCreateAPI}
            />
        </>
    );
}
