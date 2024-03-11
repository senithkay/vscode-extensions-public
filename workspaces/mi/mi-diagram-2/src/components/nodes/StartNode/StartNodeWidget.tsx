/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import styled from "@emotion/styled";
import { DiagramEngine, PortWidget } from "@projectstorm/react-diagrams-core";
import { StartNodeModel } from "./StartNodeModel";
import { Colors, SERVICE_DESIGNER, SequenceType } from "../../../resources/constants";
import { EditAPIFormProps, Method } from "../../Forms/EditResourceForm";
import SidePanelContext from "../../sidePanel/SidePanelContexProvider";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { getXML } from "../../../utils/template-engine/mustach-templates/templateUtils";

namespace S {
    export const Node = styled.div<{}>`
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
    `;

    export const StyledSvg = styled.svg`
        cursor: pointer;
    `;
}

interface CallNodeWidgetProps {
    node: StartNodeModel;
    engine: DiagramEngine;
}

export function StartNodeWidget(props: CallNodeWidgetProps) {
    const { node, engine } = props;
    const nodeType = node.getStNode().tag;
    const resource = node.getResource();
    const documentUri = node.getDocumentUri();
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [hovered, setHovered] = React.useState(false);
    const [resourceData, setResourceData] = React.useState<EditAPIFormProps>(null);

    useEffect(() => {
        if (resource) {
            const resourceData: EditAPIFormProps = {
                urlStyle: resource.uriTemplate ? "uri-template" : resource.urlMapping ? "url-mapping" : "none",
                uriTemplate: resource.uriTemplate,
                urlMapping: resource.urlMapping,
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
            }
            setResourceData(resourceData);
        }
    }, [resource])

    const onResourceEdit = (resourceData: EditAPIFormProps) => {
        const { uriTemplate, urlMapping, methods } = resourceData;
        const formValues = {
            methods: Object
                .keys(methods)
                .filter((method) => methods[method as keyof typeof methods])
                .map(method => method.toUpperCase())
                .join(" "), // Extract selected methods and create string containing the methods for the XML
            uri_template: uriTemplate,
            url_mapping: urlMapping,
        };

        const xml = getXML(SERVICE_DESIGNER.EDIT_RESOURCE, formValues);
        rpcClient.getMiDiagramRpcClient().applyEdit({
            text: xml,
            documentUri: documentUri,
            range: resource.range.startTagRange
        });
        sidePanelContext.setSidePanelState({ ...sidePanelContext, resourceData, isOpenResource: false });
    }

    const handleClick = () => {
        sidePanelContext.setSidePanelState({
            isOpenResource: true,
            resourceData: resourceData,
            onResourceEdit: onResourceEdit,
        });
    }

    const getSVGNode = (tag: SequenceType, uriTemplate?: string) => {
        switch (tag) {
            case SequenceType.IN_SEQUENCE:
                return (
                    <S.StyledSvg
                        onClick={handleClick}
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                        width="100"
                        height="40"
                        viewBox="0 0 100 40"
                    >
                        <path
                            fill={hovered ? Colors.SECONDARY : Colors.PRIMARY}
                            d="m20,0 h60 a20,20,0,0,1,0,40 h-60 a-20,-20,0,0,1,0,-40 z"
                        />
                        <path
                            fill={Colors.SURFACE_BRIGHT}
                            d="m20,2 h60 a18,18,0,0,1,0,36 h-60 a-18,-18,0,0,1,0,-36 z"
                        />
                        <text x="50%" y="50%" alignmentBaseline="middle" textAnchor="middle" fill={hovered ? Colors.SECONDARY : Colors.PRIMARY}>
                            {uriTemplate || "Start"}
                        </text>
                    </S.StyledSvg>
                );
            default:
                return (
                    <svg width="24" height="24" viewBox="0 0 32 32">
                        <circle cx="16" cy="16" r="10" fill={Colors.PRIMARY} />
                        <path
                            fill={Colors.PRIMARY}
                            d="M16 30a14 14 0 1 1 14-14a14.016 14.016 0 0 1-14 14m0-26a12 12 0 1 0 12 12A12.014 12.014 0 0 0 16 4"
                        />
                    </svg>
                );
        }
    }

    return (
        <S.Node>
            <PortWidget port={node.getPort("in")!} engine={engine} />
            {getSVGNode(nodeType as SequenceType, resource?.uriTemplate || resource?.urlMapping)}
            <PortWidget port={node.getPort("out")!} engine={engine} />
        </S.Node>
    );
}
