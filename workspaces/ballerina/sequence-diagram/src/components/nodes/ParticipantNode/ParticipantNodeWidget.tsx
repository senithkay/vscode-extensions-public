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
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { ParticipantNodeModel } from "./ParticipantNodeModel";
import {
    Colors,
    PARTICIPANT_NODE_WIDTH,
    PARTICIPANT_NODE_HEIGHT,
    PARTICIPANT_TAIL_MIN_HEIGHT,
    BORDER_WIDTH,
} from "../../../resources/constants";

namespace ParticipantNodeStyles {
    export const Node = styled.div`
        display: flex;
        flex-direction: column;
        align-items: center;
    `;

    export const Head = styled.div`
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-width: ${PARTICIPANT_NODE_WIDTH}px;
        min-height: ${PARTICIPANT_NODE_HEIGHT}px;
        border: ${BORDER_WIDTH}px solid ${Colors.OUTLINE_VARIANT};
        border-radius: 30px;
        background-color: ${Colors.SURFACE_DIM};
        color: ${Colors.ON_SURFACE};
        font-size: 12px;
    `;

    export const Title = styled.div`
        max-width: ${PARTICIPANT_NODE_WIDTH - 50}px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: "GilmerMedium";
    `;
}

interface ParticipantNodeWidgetProps {
    node: ParticipantNodeModel;
    engine: DiagramEngine;
}

export function ParticipantNodeWidget(props: ParticipantNodeWidgetProps) {
    const { node, engine } = props;

    const maxHeight = Math.max(PARTICIPANT_TAIL_MIN_HEIGHT, node.height);

    return (
        <ParticipantNodeStyles.Node>
            <ParticipantNodeStyles.Head>
                <ParticipantNodeStyles.Title>{node.participant.name}</ParticipantNodeStyles.Title>
            </ParticipantNodeStyles.Head>
            <svg height={maxHeight} width="10">
                <line
                    x1="5"
                    y1="0"
                    x2="5"
                    y2={maxHeight}
                    style={{
                        strokeWidth: 2,
                        strokeDasharray: "8,8",
                        stroke: Colors.OUTLINE_VARIANT,
                    }}
                />
            </svg>
        </ParticipantNodeStyles.Node>
    );
}
