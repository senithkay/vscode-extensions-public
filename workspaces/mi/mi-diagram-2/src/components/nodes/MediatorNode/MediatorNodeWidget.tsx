/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import styled from "@emotion/styled";
import { DiagramEngine, PortWidget } from "@projectstorm/react-diagrams-core";
import { MediatorNodeModel } from "./MediatorNodeModel";
import { Colors } from "../../../resources/constants";

namespace S {
    export const Node = styled.div<{}>`
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        min-width: 100px;
        height: 50px;
        padding: 0 8px;
        border: 2px solid ${Colors.OUTLINE_VARIANT};
        border-radius: 10px;
        background-color: ${Colors.SURFACE_BRIGHT};
        color: ${Colors.ON_SURFACE};
    `;
}

interface CallNodeWidgetProps {
    node: MediatorNodeModel;
    engine: DiagramEngine;
}

export function MediatorNodeWidget(props: CallNodeWidgetProps) {
    const { node, engine } = props;
    return (
        <S.Node>
            <PortWidget port={node.getPort("in")!} engine={engine} />
            <div>
                <div>{node.stNode.tag}</div>
                <div>{/* Your icon here */}</div>
            </div>
            <PortWidget port={node.getPort("out")!} engine={engine} />
        </S.Node>
    );
}
