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

export function ServiceDesignerView() {
    const { rpcClient } = useVisualizerContext();
    const [serviceModel, setServiceModel] = React.useState<Service>(null);
    const [doUri, setDocUri] = React.useState<string>("");

    useEffect(() => {
        if (rpcClient) {
            rpcClient.getVisualizerState().then((state) => {
                setDocUri(state.documentUri);
                rpcClient.getMiDiagramRpcClient().getSyntaxTree({ documentUri: state.documentUri }).then((res) => {
                    const st = res.syntaxTree.api;
                    const resources: Resource[] = [];
                    st.resource.forEach((resource: any) => {
                        const value: Resource = {
                            methods: resource.methods,
                            path: resource.uriTemplate,
                        }
                        resources.push(value);
                    })
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
                })
            });
        }
    }, [rpcClient]);

    const openDiagram = (resource: Resource) => {
        const resourceIndex = serviceModel.resources.findIndex((res) => res === resource);
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Diagram, documentUri: doUri, identifier: resourceIndex.toString() } })
    }

    return (
        <>
            {serviceModel && <ServiceDesigner model={serviceModel} goToSource={openDiagram} />}
        </>
    );
}
