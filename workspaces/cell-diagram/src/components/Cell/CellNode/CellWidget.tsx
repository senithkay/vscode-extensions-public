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

interface CellWidgetProps {
    node: CellModel;
    engine: DiagramEngine;
}

export function CellWidget(props: CellWidgetProps) {
    const { node, engine } = props;
    const { collapsedMode, selectedNodeId, setHasDiagnostics, setSelectedNodeId, focusedNodeId, setFocusedNodeId } = useContext(DiagramContext);
    const [selectedLink, setSelectedLink] = useState<CellLinkModel>(undefined);
    const [isCollapsed, setCollapsibleStatus] = useState<boolean>(collapsedMode);

    const displayName: string = node.getID().slice(node.getID().lastIndexOf(":") + 1);

    useEffect(() => {
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

    const handleOnHeaderWidgetClick = () => {
        setSelectedNodeId(node.getID());
        setFocusedNodeId(undefined);
    };

    return (
        <CellNode isSelected={node.getID() === selectedNodeId || node.isNodeSelected(selectedLink, node.getID())} isFocused={node.getID() === focusedNodeId}>
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
