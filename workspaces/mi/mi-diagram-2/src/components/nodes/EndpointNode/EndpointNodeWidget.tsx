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
import { EndpointNodeModel } from "./EndpointNodeModel";
import { Colors } from "../../../resources/constants";

namespace S {
    export const Node = styled.div<{}>`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    `;
}

interface CallNodeWidgetProps {
    node: EndpointNodeModel;
    engine: DiagramEngine;
}

export function EndpointNodeWidget(props: CallNodeWidgetProps) {
    const { node, engine } = props;
    return (
        <S.Node>
            <PortWidget port={node.getPort("in")!} engine={engine} />
            <svg width="50" height="50" viewBox="0 0 50 50">
                <circle
                    cx="25"
                    cy="25"
                    r="24"
                    fill={Colors.SURFACE_BRIGHT}
                    stroke={Colors.OUTLINE_VARIANT}
                    strokeWidth={2}
                />
            </svg>
        </S.Node>
    );
}
