/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

import React, { useEffect, useRef } from "react";

import { DiagramEngine, PortModel } from "@projectstorm/react-diagrams";
import { GraphqlQueryIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { GraphqlBasePortWidget } from "../../Port/GraphqlBasePortWidget";
import { HeaderName, NodeHeader } from "../../resources/styles/styles";

import { HierarchicalNodeModel } from "./HierarchicalNodeModel";

interface HierarchicalHeadProps {
    engine: DiagramEngine;
    node: HierarchicalNodeModel;
}

export function HierarchicalHeadWidget(props: HierarchicalHeadProps) {
    const { engine, node } = props;
    const headPorts = useRef<PortModel[]>([]);

    const displayName: string = node.resourceObject.name;

    useEffect(() => {
        headPorts.current.push(node.getPortFromID(`left-${node.getID()}`));
        headPorts.current.push(node.getPortFromID(`right-${node.getID()}`));
    }, [node]);

    return (
        <NodeHeader>
            <GraphqlQueryIcon/>
            <GraphqlBasePortWidget
                port={node.getPort(`left-${node.getID()}`)}
                engine={engine}
            />
            <HeaderName>{displayName}</HeaderName>

            <GraphqlBasePortWidget
                port={node.getPort(`right-${node.getID()}`)}
                engine={engine}
            />
            <GraphqlBasePortWidget
                port={node.getPort(`top-${node.getID()}`)}
                engine={engine}
            />
        </NodeHeader>
    );
}
