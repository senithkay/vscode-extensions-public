/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef } from "react";

import { DiagramEngine, PortModel } from "@projectstorm/react-diagrams";

import { CtrlClickHandler } from "../../../CtrlClickHandler";
import { GraphqlBasePortWidget } from "../../../Port/GraphqlBasePortWidget";
import { RecordIcon } from "../../../resources/assets/icons/RecordIcon";
import { HeaderName, NodeHeader } from "../../../resources/styles/styles";
import { getFormattedPosition } from "../../../utils/common-util";
import { RecordNodeModel } from "../RecordNodeModel";

import { RecordHeaderMenu } from "./RecordHeaderMenu";

interface RecordHeadProps {
    engine: DiagramEngine;
    node: RecordNodeModel;
}

export function RecordHeadWidget(props: RecordHeadProps) {
    const { engine, node } = props;
    const headPorts = useRef<PortModel[]>([]);

    const displayName: string = node.recordObject.name;

    useEffect(() => {
        headPorts.current.push(node.getPortFromID(`left-${node.getID()}`));
        headPorts.current.push(node.getPortFromID(`right-${node.getID()}`));
    }, [node]);

    return (
        <CtrlClickHandler
            filePath={node.recordObject?.position?.filePath}
            position={node.recordObject?.position && getFormattedPosition(node.recordObject.position)}
        >
            <NodeHeader data-testid={`record-head-${displayName}`}>
                <RecordIcon />
                <GraphqlBasePortWidget
                    port={node.getPort(`left-${node.getID()}`)}
                    engine={engine}
                />
                <HeaderName>{displayName}</HeaderName>
                {/* <RecordHeaderMenu location={node.recordObject.position} nodeName={displayName} /> */}
                <GraphqlBasePortWidget
                    port={node.getPort(`right-${node.getID()}`)}
                    engine={engine}
                />
                <GraphqlBasePortWidget
                    port={node.getPort(`top-${node.getID()}`)}
                    engine={engine}
                />
            </NodeHeader>
        </CtrlClickHandler>
    );
}
