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
import { ConditionNodeModel } from "./ConditionNodeModel";
import { Colors } from "../../../resources/constants";

namespace S {
    export const Node = styled.div<{}>`
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
    `;
}

interface CallNodeWidgetProps {
    node: ConditionNodeModel;
    engine: DiagramEngine;
}

export function ConditionNodeWidget(props: CallNodeWidgetProps) {
    const { node, engine } = props;
    return (
        <S.Node>
            <PortWidget port={node.getPort("in")!} engine={engine} />
            <svg width="56" height="56" viewBox="0 0 56 56">
                <rect
                    x="8"
                    y="8"
                    width="40"
                    height="40"
                    rx="5"
                    ry="5"
                    fill={Colors.SURFACE_BRIGHT}
                    stroke={Colors.OUTLINE_VARIANT}
                    strokeWidth={2}
                    transform="rotate(45 28 28)"
                />
            </svg>
            <PortWidget port={node.getPort("out")!} engine={engine} />
        </S.Node>
    );
}
