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
import { CellNode, TopPortCircle, LeftPortCircle, BottomPortsWrapper, DotWrapper, Dot, IconWrapper, TopIconWrapper, RightPortsWrapper } from "./styles";
import { CellPortWidget } from "../CellPort/CellPortWidget";
import { getCellPortId, getRoundedOctagonSVG } from "./cell-util";
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

    const generateRoundedOctagonSVG = (diagramHeight: number) => {
        const sideLength = (diagramHeight * 4.14) / 10;
        const { width, height, path } = getRoundedOctagonSVG(sideLength, sideLength * 0.08);
        return (
            <svg width={width} height={height} id={MAIN_CELL} transform={`rotate(${45 / 2})`}>
                <path d={path} />
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
            {generateRoundedOctagonSVG(cellHeight)}

            <TopPortCircle>
                <TopIconWrapper>
                    <GatewayIcon />
                    {/* <i className="fw-sync-alt-round"></i> */}
                </TopIconWrapper>
                <CellPortWidget port={node.getPort(getCellPortId(node.getID(), CellBounds.NorthBound, PortModelAlignment.TOP))} engine={engine} />
                <CellPortWidget port={node.getPort(getCellPortId(node.getID(), CellBounds.NorthBound, PortModelAlignment.BOTTOM))} engine={engine} />
            </TopPortCircle>

            <LeftPortCircle>
                <IconWrapper>
                    <GatewayIcon />
                    {/* <i className="fw-sync-alt-round"></i> */}
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
                                    port={node.getPort(
                                        getCellPortId(node.getID(), CellBounds.EastBound, PortModelAlignment.LEFT, connectionNode.connection.id)
                                    )}
                                    engine={engine}
                                />
                                <CellPortWidget
                                    port={node.getPort(
                                        getCellPortId(node.getID(), CellBounds.EastBound, PortModelAlignment.RIGHT, connectionNode.connection.id)
                                    )}
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
                                    port={node.getPort(
                                        getCellPortId(node.getID(), CellBounds.SouthBound, PortModelAlignment.TOP, connectorNode.connection.id)
                                    )}
                                    engine={engine}
                                />
                                <CellPortWidget
                                    port={node.getPort(
                                        getCellPortId(node.getID(), CellBounds.SouthBound, PortModelAlignment.BOTTOM, connectorNode.connection.id)
                                    )}
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
