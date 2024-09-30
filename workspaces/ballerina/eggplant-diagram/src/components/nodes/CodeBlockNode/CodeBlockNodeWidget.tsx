/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
/** @jsxImportSource @emotion/react */
import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { css, keyframes } from "@emotion/react";
import { DiagramEngine, PortWidget } from "@projectstorm/react-diagrams-core";
import { CodeBlockNodeModel } from "./CodeBlockNodeModel";
import {
    Colors,
    EMPTY_NODE_WIDTH,
    NODE_BORDER_WIDTH,
    NODE_PADDING,
    POPUP_BOX_HEIGHT,
    POPUP_BOX_WIDTH,
} from "../../../resources/constants";
import { useDiagramContext } from "../../DiagramContext";
import AddCommentPopup from "../../AddCommentPopup";

namespace S {
    export type DottedBoxStyleProp = {
        height: number;
        width: number;
    };

    export const DottedBox = styled.div<DottedBoxStyleProp>`
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: ${(props: DottedBoxStyleProp) => (props.width)}px;
        height: ${(props: DottedBoxStyleProp) => (props.height)}px;
        border: 2px dashed ${Colors.PRIMARY};
        pointer-events: none;
        border-radius: 20px;
    `;
}

interface CodeBlockNodeWidgetProps {
    node: CodeBlockNodeModel;
    engine: DiagramEngine;
}

export function CodeBlockNodeWidget(props: CodeBlockNodeWidgetProps) {
    const { node } = props;

    return (
        <S.DottedBox
            width={node.boxWidth}
            height={node.boxHeight}
        />
    );
}
