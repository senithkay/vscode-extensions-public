/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext, useEffect, useState } from "react";
import { DiagramEngine, PortModelAlignment } from "@projectstorm/react-diagrams";
import { CellBounds, CellModel } from "./CellModel";
import { CellLinkModel } from "../CellLink/CellLinkModel";
import { CellNode, TopPortCircle, Connector, LeftPortCircle, RightPortCircle, BottomPortWrapper, Circle } from "./styles";
import { DiagramContext } from "../../DiagramContext/DiagramContext";
import { CellPortWidget } from "../CellPort/CellPortWidget";
import { getCellPortId } from "./cell-util";
import { MAIN_CELL_DEFAULT_HEIGHT } from "../../../resources";

interface CellWidgetProps {
    node: CellModel;
    engine: DiagramEngine;
}

export function CellWidget(props: CellWidgetProps) {
    const { node, engine } = props;
    const { collapsedMode, setSelectedNodeId, setFocusedNodeId } = useContext(DiagramContext);
    const [, setSelectedLink] = useState<CellLinkModel>(undefined);
    const [, setCollapsibleStatus] = useState<boolean>(collapsedMode);
    const [cellHeight, setCellHeight] = useState<number>(MAIN_CELL_DEFAULT_HEIGHT);

    useEffect(() => {
        resizeCellHeight();
        node.registerListener({
            SELECT: (event: any) => {
                setSelectedLink(event.cell as CellLinkModel);
            },
            UNSELECT: () => {
                setSelectedLink(undefined);
            },
        });
    }, [node]);

    useEffect(() => {
        setCollapsibleStatus(collapsedMode);
    }, [collapsedMode]);

    // @ts-ignore
    const handleOnHeaderWidgetClick = () => {
        setSelectedNodeId(node.getID());
        setFocusedNodeId(undefined);
    };

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
            <svg width={height} height={height}>
                <polygon points={points} />
            </svg>
        );
    };

    const resizeCellHeight = () => {
        const conCount = node.connectorNodes?.length;
        if (conCount && conCount * 100 + 40 > (MAIN_CELL_DEFAULT_HEIGHT * 40) / 100) {
            setCellHeight(((conCount * 100 + 40) * 100) / 40);
        }
    };

    return (
        <CellNode height={cellHeight}>
            {generateOctagonSVG(cellHeight)}

            <TopPortCircle>
                <CellPortWidget port={node.getPort(getCellPortId(node.getID(), CellBounds.NorthBound, PortModelAlignment.TOP))} engine={engine} />
                <CellPortWidget port={node.getPort(getCellPortId(node.getID(), CellBounds.NorthBound, PortModelAlignment.BOTTOM))} engine={engine} />
            </TopPortCircle>

            <LeftPortCircle>
                <CellPortWidget port={node.getPort(getCellPortId(node.getID(), CellBounds.WestBound, PortModelAlignment.LEFT))} engine={engine} />
                <CellPortWidget port={node.getPort(getCellPortId(node.getID(), CellBounds.WestBound, PortModelAlignment.RIGHT))} engine={engine} />
            </LeftPortCircle>

            <RightPortCircle>
                <CellPortWidget port={node.getPort(getCellPortId(node.getID(), CellBounds.EastBound, PortModelAlignment.LEFT))} engine={engine} />
                <CellPortWidget port={node.getPort(getCellPortId(node.getID(), CellBounds.EastBound, PortModelAlignment.RIGHT))} engine={engine} />
            </RightPortCircle>

            <BottomPortWrapper>
                {node.connectorNodes?.map((connectorNode) => {
                    return (
                        <Connector key={connectorNode.getID()}>
                            <Circle>
                                <CellPortWidget
                                    port={node.getPort(getCellPortId(node.getID(), CellBounds.SouthBound, PortModelAlignment.TOP, connectorNode.getID()))}
                                    engine={engine}
                                />
                                <CellPortWidget
                                    port={node.getPort(getCellPortId(node.getID(), CellBounds.SouthBound, PortModelAlignment.BOTTOM, connectorNode.getID()))}
                                    engine={engine}
                                />
                            </Circle>
                        </Connector>
                    );
                })}
            </BottomPortWrapper>
        </CellNode>
    );
}
