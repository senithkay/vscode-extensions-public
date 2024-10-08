/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useEffect, useRef } from "react";

import { DiagramEngine, PortModel } from "@projectstorm/react-diagrams";

import { CtrlClickHandler } from "../../../CtrlClickHandler";
import { FilterNodeAndGoToSourceMenu } from "../../../NodeActionMenu/FilterNodeAndGoToSourceMenu";
import { NodeCategory } from "../../../NodeFilter";
import { GraphqlBasePortWidget } from "../../../Port/GraphqlBasePortWidget";
import { ServiceClassIcon } from "../../../resources/assets/icons/ServiceClassIcon";
import { HeaderName, InterfaceSubHeader, NodeHeader } from "../../../resources/styles/styles";
import { getFormattedPosition } from "../../../utils/common-util";
import { InterfaceNodeModel } from "../InterfaceNodeModel";

interface InterfaceHeadProps {
    engine: DiagramEngine;
    node: InterfaceNodeModel;
}

export function InterfaceHeadWidget(props: InterfaceHeadProps) {
    const { engine, node } = props;
    const headPorts = useRef<PortModel[]>([]);

    const displayName: string = node.interfaceObject.name;

    useEffect(() => {
        headPorts.current.push(node.getPortFromID(`left-${node.getID()}`));
        headPorts.current.push(node.getPortFromID(`right-${node.getID()}`));
    }, [node]);

    return (
        <CtrlClickHandler
            filePath={node.interfaceObject?.position?.filePath}
            position={node.interfaceObject?.position && getFormattedPosition(node.interfaceObject.position)}
        >
            <NodeHeader data-testid={`interface-head-${displayName}`}>
                <div>{"<<interface>>"}</div>
                <InterfaceSubHeader>
                    <ServiceClassIcon />
                    <GraphqlBasePortWidget
                        port={node.getPort(`left-${node.getID()}`)}
                        engine={engine}
                    />
                    <HeaderName>{displayName}</HeaderName>
                    {/* <FilterNodeAndGoToSourceMenu
                        location={node.interfaceObject?.position}
                        nodeType={{ name: displayName, type: NodeCategory.INTERFACE }}
                    /> */}
                    <GraphqlBasePortWidget
                        port={node.getPort(`right-${node.getID()}`)}
                        engine={engine}
                    />
                    <GraphqlBasePortWidget
                        port={node.getPort(`top-${node.getID()}`)}
                        engine={engine}
                    />
                </InterfaceSubHeader>
            </NodeHeader>
        </CtrlClickHandler>
    );
}
