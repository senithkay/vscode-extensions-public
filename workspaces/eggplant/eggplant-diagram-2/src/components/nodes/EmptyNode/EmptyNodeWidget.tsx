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
import { EmptyNodeModel } from "./EmptyNodeModel";
import { Colors } from "../../../resources/constants";

namespace S {
    export const Node = styled.div<{}>`
        display: flex;
        justify-content: center;
        align-items: center;
        width: 140px;
        height: 16px;
    `;

    export type CircleStyleProp = {
        show: boolean;
    };
    export const Circle = styled.div<CircleStyleProp>`
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        width: ${(props: CircleStyleProp) => (props.show ? 8 : 0)}px;
        height: ${(props: CircleStyleProp) => (props.show ? 8 : 0)}px;
        border: 2px solid ${(props: CircleStyleProp) => (props.show ? Colors.PRIMARY : "transparent")};
        border-radius: 50%;
    `;

    export const TopPortWidget = styled(PortWidget)`
        margin-top: -2px;
    `;

    export const BottomPortWidget = styled(PortWidget)`
        margin-bottom: -2px;
    `;
}

interface EmptyNodeWidgetProps {
    node: EmptyNodeModel;
    engine: DiagramEngine;
}

export function EmptyNodeWidget(props: EmptyNodeWidgetProps) {
    const { node, engine } = props;

    return (
        <S.Node>
            <S.Circle show={node.isVisible()}>
                <S.TopPortWidget port={node.getPort("in")!} engine={engine} />
                <S.BottomPortWidget port={node.getPort("out")!} engine={engine} />
            </S.Circle>
        </S.Node>
    );
}
