/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { DiagramEngine, PortModelAlignment } from "@projectstorm/react-diagrams";
import { CellBounds, CellModel } from "./CellModel";
import { CellNode, TopPortCircle, LeftPortCircle, BottomPortsWrapper, DotWrapper, Dot, IconWrapper, RightPortsWrapper } from "./styles";
import { CellPortWidget } from "../CellPort/CellPortWidget";
import { getCellPortId } from "./cell-util";
import { MAIN_CELL } from "../../../resources";
import { GatewayIcon } from "../../../resources/assets/icons/GatewayIcon";

interface CellWidgetProps {
    node: CellModel;
    engine: DiagramEngine;
}

export function CellWidget(props: CellWidgetProps) {
    const { node, engine } = props;
    const [cellHeight, setCellHeight] = useState<number>(node.width);

    useEffect(() => {
        resizeCellHeight();
    }, [node]);

    useEffect(() => {
        resizeCellHeight();
    }, [node.width]);

    const generateOctagonSVG = (height: number) => {
        const points = [
            `${(height * 30) / 100},${0}`,
            `${(height * 70) / 100},${0}`,
            `${height},${(height * 30) / 100}`,
            `${height},${(height * 70) / 100}`,
            `${(height * 70) / 100},${height}`,
            `${(height * 30) / 100},${height}`,
            `${0},${(height * 70) / 100}`,
            `${0},${(height * 30) / 100}`,
        ].join(" ");

        return (
            <svg width={height} height={height} id={MAIN_CELL}>
                <polygon points={points} />
            </svg>
        );
    };

    const resizeCellHeight = () => {
        const conCount = node.connectorNodes?.length || 0;
        const connectorRowWidth = ((conCount * 100 + 40) * 100) / 40;
        setCellHeight(Math.max(connectorRowWidth, node.width));
        engine.repaintCanvas();
    };

    return (
        <CellNode height={cellHeight}>
            {generateOctagonSVG(cellHeight)}

            <TopPortCircle>
                <IconWrapper>
                    <GatewayIcon />
                </IconWrapper>
                <CellPortWidget port={node.getPort(getCellPortId(node.getID(), CellBounds.NorthBound, PortModelAlignment.TOP))} engine={engine} />
                <CellPortWidget port={node.getPort(getCellPortId(node.getID(), CellBounds.NorthBound, PortModelAlignment.BOTTOM))} engine={engine} />
            </TopPortCircle>

            <LeftPortCircle>
                <IconWrapper>
                    <GatewayIcon />
                </IconWrapper>
                <CellPortWidget port={node.getPort(getCellPortId(node.getID(), CellBounds.WestBound, PortModelAlignment.LEFT))} engine={engine} />
                <CellPortWidget port={node.getPort(getCellPortId(node.getID(), CellBounds.WestBound, PortModelAlignment.RIGHT))} engine={engine} />
            </LeftPortCircle>

            <RightPortsWrapper>
                {node.connectionNodes?.map((connectionNode) => {
                    return (
                        <DotWrapper key={connectionNode.getID()}>
                            <Dot>
                                <CellPortWidget
                                    port={node.getPort(getCellPortId(node.getID(), CellBounds.EastBound, PortModelAlignment.LEFT, connectionNode.getID()))}
                                    engine={engine}
                                />
                                <CellPortWidget
                                    port={node.getPort(getCellPortId(node.getID(), CellBounds.EastBound, PortModelAlignment.RIGHT, connectionNode.getID()))}
                                    engine={engine}
                                />
                            </Dot>
                        </DotWrapper>
                    );
                })}
            </RightPortsWrapper>
            <BottomPortsWrapper>
                {node.connectorNodes?.map((connectorNode) => {
                    return (
                        <DotWrapper key={connectorNode.getID()}>
                            <Dot>
                                <CellPortWidget
                                    port={node.getPort(getCellPortId(node.getID(), CellBounds.SouthBound, PortModelAlignment.TOP, connectorNode.getID()))}
                                    engine={engine}
                                />
                                <CellPortWidget
                                    port={node.getPort(getCellPortId(node.getID(), CellBounds.SouthBound, PortModelAlignment.BOTTOM, connectorNode.getID()))}
                                    engine={engine}
                                />
                            </Dot>
                        </DotWrapper>
                    );
                })}
            </BottomPortsWrapper>
        </CellNode>
    );
}
