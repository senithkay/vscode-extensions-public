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
import { Item } from "@wso2-enterprise/ui-toolkit";
import { Position } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { AddAPIFormProps, AddResourceForm } from "../Forms/AddResourceForm";
import { getXML } from "../../utils/template-engine/mustache-templates/templateUtils";
import { APIData, APIWizardProps } from "../Forms/APIform";
import { View, ViewHeader, ViewContent } from "../../components/View";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { Codicon } from "@wso2-enterprise/ui-toolkit";
import { SERVICE } from "../../constants";



interface ServiceDesignerProps {
    syntaxTree: any;
    documentUri: string;
}
export function ServiceDesignerView({ syntaxTree, documentUri }: ServiceDesignerProps) {
    const { rpcClient } = useVisualizerContext();
    const [serviceModel, setServiceModel] = React.useState<Service>(null);
    const [isResourceFormOpen, setResourceFormOpen] = React.useState<boolean>(false);
    const [serviceData, setServiceData] = React.useState<APIData>(null);
    const [resourceBodyRange, setResourceBodyRange] = React.useState<any>(null);

    const enrichResources = (resources: Resource[], deleteStartPosition: Position): Resource[] => {
        return resources.map((resource) => {
            const goToSourceAction: Item = { id: "go-to-source", label: "Go to Source", onClick: () => highlightCode(resource, true) };
            const deleteAction: Item = { id: "delete", label: "Delete", onClick: () => handleResourceDelete(resource, resources, deleteStartPosition) };
            const moreActions: Item[] = [goToSourceAction, deleteAction];
            return {
                ...resource,
                additionalActions: moreActions,
            }
        })
    }

    useEffect(() => {
        const st = syntaxTree;

        // Set metadata for the service
        const serviceData: APIData = {
            apiName: st.name,
            apiContext: st.context,
            version: st.version,
            range: {
                start: st.range.startTagRange.start,
                end: st.range.startTagRange.end
            }
        }
        setServiceData(serviceData);

        // Create service model
        const resources: Resource[] = [];
        const items: Item[] = []; // More actions for resources
        st.resource.forEach((resource: any) => {
            const value: Resource = {
                methods: resource.methods,
                path: resource.uriTemplate || resource.urlMapping,
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
        const enrichedResources: Resource[] = enrichResources(resources, st.range.startTagRange.end);
        setResourceBodyRange({
            start: st.range.startTagRange.end,
            end: st.range.endTagRange.start
        });
        const model: Service = {
            path: st.context,
            resources: enrichedResources,
            position: {
                startLine: st.range.startTagRange.start.line,
                startColumn: st.range.startTagRange.start.character,
                endLine: st.range.endTagRange.end.line,
                endColumn: st.range.endTagRange.end.character
            }
        }
        setServiceModel(model);
    }, [syntaxTree, documentUri]);

    const highlightCode = (resource: Resource, force?: boolean) => {
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
            force: force
        });
    }

    const openDiagram = (resource: Resource) => {
        const resourceIndex = serviceModel.resources.findIndex((res) => res === resource);
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.ResourceView, documentUri: documentUri, identifier: resourceIndex.toString() } })
    }

    const handleResourceAdd = () => {
        setResourceFormOpen(true);
    };

    const handleCancel = () => {
        setResourceFormOpen(false);
    };

    const handleCreateAPI = ({ methods, uriTemplate, urlMapping }: AddAPIFormProps) => {
        const formValues = {
            methods: Object
                .keys(methods)
                .filter((method) => methods[method as keyof typeof methods])
                .map(method => method.toUpperCase())
                .join(" "), // Extract selected methods and create string containing the methods for the XML
            uri_template: uriTemplate,
            url_mapping: urlMapping,
        };

        const xml = getXML(SERVICE.ADD_RESOURCE, formValues);
        rpcClient.getMiDiagramRpcClient().applyEdit({
            text: xml,
            documentUri: documentUri,
            range: {
                start: {
                    line: resourceBodyRange.end.line,
                    character: resourceBodyRange.end.character,
                },
                end: {
                    line: resourceBodyRange.end.line,
                    character: resourceBodyRange.end.character,
                },
            },
        });
        setResourceFormOpen(false);
    };

    const handleResourceDelete = (resource: Resource, resourceList: Resource[], deleteStartPosition: Position) => {
        const position: Position = deleteStartPosition;
        const resourceIndex = resourceList.findIndex((res) => res === resource);
        let startPosition;
        // Selecting the start position as the end position of the previous XML tag
        if (resourceIndex === 0) {
            startPosition = {
                line: position.line,
                character: position.character,
            };
        } else {
            startPosition = {
                line: resourceList[resourceIndex - 1].position.endLine,
                character: resourceList[resourceIndex - 1].position.endColumn,
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

    const handleResourceClick = (resource: Resource) => highlightCode(resource);

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
                <View>
                    <ViewHeader title="Service Designer" codicon="globe" onEdit={handleServiceEdit}>
                        <VSCodeButton appearance="primary" title="Edit Service" onClick={handleResourceAdd}>
                            <Codicon name="add" sx={{ marginRight: 5 }} /> Resource
                        </VSCodeButton>
                    </ViewHeader>
                    <ViewContent padding>
                        <ServiceDesigner
                            model={serviceModel}
                            disableServiceHeader={true}
                            onResourceImplement={openDiagram}
                            onResourceClick={handleResourceClick}
                        />
                    </ViewContent>
                </View>
            )}
            <AddResourceForm
                isOpen={isResourceFormOpen}
                onCancel={handleCancel}
                onCreate={handleCreateAPI}
            />
        </>
    );
}
