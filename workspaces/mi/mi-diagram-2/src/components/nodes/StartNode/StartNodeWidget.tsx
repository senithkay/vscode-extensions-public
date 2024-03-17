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
import { StartNodeModel, StartNodeType } from "./StartNodeModel";
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
    node: StartNodeModel;
    engine: DiagramEngine;
}

export function StartNodeWidget(props: CallNodeWidgetProps) {
    const { node, engine } = props;
    const nodeType = node.getNodeType();
    const [hovered, setHovered] = React.useState(false);

    const getNamedStartNode = () => (
        <svg
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
            <path fill={Colors.SURFACE_BRIGHT} d="m20,2 h60 a18,18,0,0,1,0,36 h-60 a-18,-18,0,0,1,0,-36 z" />
            <text x="50%" y="50%" alignmentBaseline="middle" textAnchor="middle" fill={Colors.ON_SURFACE}>
                Start
            </text>
        </svg>
    );

    const getStartNode = () => (
        <svg width="24" height="24" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="10" fill={Colors.PRIMARY} />
            <path
                fill={Colors.PRIMARY}
                d="M16 30a14 14 0 1 1 14-14a14.016 14.016 0 0 1-14 14m0-26a12 12 0 1 0 12 12A12.014 12.014 0 0 0 16 4"
            />
        </svg>
    );

    const getSVGNode = () => {
        switch (nodeType) {
            case StartNodeType.IN_SEQUENCE:
                return getNamedStartNode();
            default:
                return getStartNode();
        }
    };

    return (
        <S.Node>
            <PortWidget port={node.getPort("in")!} engine={engine} />
            {getSVGNode()}
            <PortWidget port={node.getPort("out")!} engine={engine} />
        </S.Node>
    );
}
