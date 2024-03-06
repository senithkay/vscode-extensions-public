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
import { AddAPIFormProps, AddResourceForm, Method } from "../Forms/AddResourceForm";
import { TAB_SIZE, SERVICE_DESIGNER } from "../../constants";
import { getXML } from "../../utils/template-engine/mustache-templates/templateUtils";
import { APIData, APIWizardProps } from "../Forms/APIform";

interface ServiceDesignerProps {
    syntaxTree: any;
    documentUri: string;
}
export function ServiceDesignerView({ syntaxTree, documentUri }: ServiceDesignerProps) {
    const { rpcClient } = useVisualizerContext();
    const [serviceModel, setServiceModel] = React.useState<Service>(null);
    const [isResourceFormOpen, setResourceFormOpen] = React.useState<boolean>(false);
    const [serviceData, setServiceData] = React.useState<APIData>(null);
    const [resourceData, setResourceData] = React.useState<AddAPIFormProps>(null);
    const [resourceBodyRange, setResourceBodyRange] = React.useState<any>(null);

    useEffect(() => {
        const st = syntaxTree.api;

        // Set metadata for the service
        const serviceData: APIData = {
            apiName: st.name,
            apiContext: st.context,
            version: st.version,
            documentUri: documentUri,
            range: {
                start: st.range.startTagRange.start,
                end: st.range.startTagRange.end
            }
        }
        setServiceData(serviceData);

        // Create service model
        const resources: Resource[] = [];
        st.resource.forEach((resource: any, index: number) => {
            const value: Resource = {
                methods: resource.methods,
                path: resource.uriTemplate,
                position: {
                    startLine: resource.range.startTagRange.start.line,
                    startColumn: resource.range.startTagRange.start.character,
                    endLine: resource.range.endTagRange.end.line,
                    endColumn: resource.range.endTagRange.end.character
                },
                expandable: false
            }
            resources.push(value);
        })
        setResourceBodyRange({
            start: st.range.startTagRange.end,
            end: st.range.endTagRange.start
        });
        const model: Service = {
            path: st.context,
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

    const handleEditResource = (resource: Resource) => {
        setResourceData({
            position: resource.position,
            urlStyle: "none",
            methods: resource.methods
                .map(method => method.toLowerCase())
                .reduce<{ [K in Method]: boolean }>((acc, method) => ({ ...acc, [method]: true }), {
                    get: false,
                    post: false,
                    put: false,
                    delete: false,
                    patch: false,
                    head: false,
                    options: false,
                }), // Extract boolean values for each method
            protocol: {
                http: true,
                https: true,
            }, // Extract boolean values for each protocol
            uriTemplate: resource.path,
            urlMapping: resource.path
        });
        setResourceFormOpen(true);
    }

    const handleCancel = () => {
        setResourceFormOpen(false);
        setResourceData(null);
    };

    const handleCreateAPI = ({ position, methods, uriTemplate, urlMapping }: AddAPIFormProps) => {
        const formValues = {
            indentation: position ? undefined : " ".repeat(TAB_SIZE),
            methods: Object
                .keys(methods)
                .filter((method) => methods[method as keyof typeof methods])
                .map(method => method.toUpperCase())
                .join(" "), // Extract selected methods and create string containing the methods for the XML
            uri_template: uriTemplate,
            url_mapping: urlMapping,
        };

        const xml = getXML(SERVICE_DESIGNER.ADD_RESOURCE, formValues);
        rpcClient.getMiDiagramRpcClient().applyEdit({
            text: xml,
            documentUri: documentUri,
            range:  {
                start: {
                    line: position?.startLine || resourceBodyRange.end.line,
                    character: position?.startColumn || resourceBodyRange.end.character,
                },
                end: {
                    line: position?.endLine || resourceBodyRange.end.line,
                    character: position?.endColumn || resourceBodyRange.end.character,
                },
            },
        });
        setResourceFormOpen(false);
        setResourceData(null);
    };

    const handleResourceDelete = (resource: Resource) => {
        const resourceIndex = serviceModel.resources.findIndex((res) => res === resource);
        let startPosition;
        // Selecting the start position as the end position of the previous XML tag
        if (resourceIndex === 0) {
            startPosition = {
                line: resourceBodyRange.start.line,
                character: resourceBodyRange.start.character,
            };
        } else {
            startPosition = {
                line: serviceModel.resources[resourceIndex - 1].position.endLine,
                character: serviceModel.resources[resourceIndex - 1].position.endColumn,
            };
        }
        rpcClient.getMiDiagramRpcClient().applyEdit({
            text: "",
            documentUri: documentUri,
            range: {
                start: startPosition,
                end: {
                    line: resource.position.endLine,
                    character: resource.position.endColumn,
                },
            },
        });
    }

    const handleResourceClick = (resource: Resource) => {
        rpcClient.getMiDiagramRpcClient().highlightCode({
            range: {
                start: {
                    line: resource.position.startLine,
                    character: resource.position.startColumn,
                
                },
                end: {
                    line: resource.position.endLine,
                    character: resource.position.endColumn,
                },
            },
        });
    }

    const handleServiceEdit = () => {
        rpcClient.getMiVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.APIForm,
                documentUri: documentUri,
                customProps: { apiData: serviceData } as APIWizardProps
            }
        });
    }

    return (
        <>
            {serviceModel && (
                <ServiceDesigner
                    model={serviceModel}
                    onResourceAdd={handleResourceAdd}
                    onResourceDelete={handleResourceDelete}
                    onResourceImplement={openDiagram}
                    onResourceClick={handleResourceClick}
                    onServiceEdit={handleServiceEdit}
                />
            )}
            <AddResourceForm
                isOpen={isResourceFormOpen}
                resourceData={resourceData}
                handleCancel={handleCancel}
                handleCreateAPI={handleCreateAPI}
            />
        </>
    );
}
