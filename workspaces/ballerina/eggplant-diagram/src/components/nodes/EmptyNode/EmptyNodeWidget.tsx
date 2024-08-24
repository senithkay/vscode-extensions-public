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
import { EmptyNodeModel } from "./EmptyNodeModel";
import { Colors, EMPTY_NODE_WIDTH } from "../../../resources/constants";
import { useDiagramContext } from "../../DiagramContext";

namespace S {
    export const Node = styled.div<{}>`
        display: flex;
        justify-content: center;
        align-items: center;
        width: ${EMPTY_NODE_WIDTH}px;
        height: ${EMPTY_NODE_WIDTH}px;
    `;

    export type CircleStyleProp = {
        show: boolean;
        clickable: boolean;
    };
    export const Circle = styled.div<CircleStyleProp>`
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: ${(props: CircleStyleProp) => (props.show ? 8 : 0)}px;
        height: ${(props: CircleStyleProp) => (props.show ? 8 : 0)}px;
        border: 2px solid ${(props: CircleStyleProp) => (props.show ? Colors.ON_SURFACE : "transparent")};
        background-color: ${(props: CircleStyleProp) => (props.show ? Colors.OUTLINE_VARIANT : "transparent")};
        border-radius: 50%;
        cursor: ${(props: CircleStyleProp) => (props.clickable ? "pointer" : "default")};
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
    const [isHovered, setIsHovered] = useState(false);
    const { onAddNode } = useDiagramContext();

    // useEffect(() => {
    //   if(isHovered){
    //     // send top node source and target link to make active
    //   }
    // }, [isHovered])
    
    const handleAddNode = () => {
        const topNode = node.getTopNode();
        if (!topNode) {
            console.error(">>> EmptyNodeWidget: handleAddNode: top node not found");
            return;
        }
        const target = node.getTarget();
        if (!target) {
            console.error(">>> EmptyNodeWidget: handleAddNode: target not found");
            return;
        }
        onAddNode(topNode, { startLine: target, endLine: target });
    };

    const linkColor = isHovered ? Colors.PRIMARY : Colors.ON_SURFACE;

    return (
        <S.Node onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <S.Circle show={node.isVisible()} clickable={node.showButton}>
                <S.TopPortWidget port={node.getPort("in")!} engine={engine} />
                {node.showButton && (
                    <div
                        css={css`
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            cursor: pointer;
                        `}
                        onClick={handleAddNode}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                            <path
                                fill={Colors.SURFACE_BRIGHT}
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                            />
                            <path
                                fill={linkColor}
                                d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m0 18a8 8 0 1 1 8-8a8 8 0 0 1-8 8m4-9h-3V8a1 1 0 0 0-2 0v3H8a1 1 0 0 0 0 2h3v3a1 1 0 0 0 2 0v-3h3a1 1 0 0 0 0-2"
                            />
                        </svg>
                    </div>
                )}
                <S.BottomPortWidget port={node.getPort("out")!} engine={engine} />
            </S.Circle>
        </S.Node>
    );
}
