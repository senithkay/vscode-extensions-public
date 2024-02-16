/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import styled from "@emotion/styled";
import { DiagramEngine, PortWidget } from "@projectstorm/react-diagrams-core";
import { MediatorNodeModel } from "./MediatorNodeModel";
import { Colors } from "../../../resources/constants";
import { STNode } from "@wso2-enterprise/mi-syntax-tree/src";
import { Button, Popover } from "@wso2-enterprise/ui-toolkit";
import { SendIcon, LogIcon, CodeIcon, MoreVertIcon } from "../../../resources";
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import SidePanelContext from "../../sidePanel/SidePanelContexProvider";
import { getDataFromXML } from "../../../utils/template-engine/mustach-templates/templateUtils";

namespace S {
    export type NodeStyleProp = {
        selected: boolean;
        hovered: boolean;
    };
    export const Node = styled.div<NodeStyleProp>`
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        min-width: 100px;
        max-width: 100px;
        height: 36px;
        padding: 0 8px;
        border: 2px solid
            ${(props: NodeStyleProp) =>
            props.selected ? Colors.SECONDARY : props.hovered ? Colors.SECONDARY : Colors.OUTLINE_VARIANT};
        border-radius: 10px;
        background-color: ${Colors.SURFACE_BRIGHT};
        color: ${Colors.ON_SURFACE};
        cursor: pointer;
    `;

    export const Header = styled.div<{}>`
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
    `;

    export const IconContainer = styled.div`
        padding: 0 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        & svg {
            height: 16px;
            width: 16px;
            fill: ${Colors.ON_SURFACE};
            stroke: ${Colors.ON_SURFACE};
        }
    `;

    export const StyledButton = styled(Button)`
        background-color: ${Colors.SURFACE};
        border-radius: 5px;
        position: absolute;
        right: 6px;
    `;

    export const TopPortWidget = styled(PortWidget)`
        margin-top: -3px;
    `;

    export const BottomPortWidget = styled(PortWidget)`
        margin-bottom: -3px;
    `;

    export const NodeText = styled.div`
        max-width: 100px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    `;
}

const getNodeIcon = (tag: string) => {
    switch (tag) {
        case "send":
            return <SendIcon />;
        case "log":
            return <LogIcon />;
        default:
            return <CodeIcon />;
    }
};

interface CallNodeWidgetProps {
    node: MediatorNodeModel;
    engine: DiagramEngine;
    onClick?: (node: STNode) => void;
}

export function MediatorNodeWidget(props: CallNodeWidgetProps) {
    const { node, engine, onClick } = props;
    const [isHovered, setIsHovered] = React.useState(false);
    const visualizerContext = useVisualizerContext();
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
    const sidePanelContext = React.useContext(SidePanelContext);

    const handleOnClickMenu = (event: any) => {
        setIsPopoverOpen(!isPopoverOpen);
        setPopoverAnchorEl(event.currentTarget);
        event.stopPropagation();
    };

    const handleOnClick = () => {
        if (node.isSelected()) {
            node.onClicked(visualizerContext);

            const formData = getDataFromXML(
                props.node.mediatorName,
                props.node.getStNode()
            );
            sidePanelContext.setSidePanelState({
                ...sidePanelContext,
                isOpen: true,
                operationName: props.node.mediatorName.toLowerCase(),
                nodeRange: node.stNode.range,
                isEditing: true,
                formValues: formData,
            });
        }
    };

    const handleOnDelete = () => {

    };

    return (
        <div>
            <S.Node
                selected={node.isSelected()}
                hovered={isHovered}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleOnClick}
            >
                <S.TopPortWidget port={node.getPort("in")!} engine={engine} />
                <S.Header>
                    <S.IconContainer>{getNodeIcon(node.stNode.tag)}</S.IconContainer>
                    <S.NodeText>{node.stNode.tag}</S.NodeText>
                    {isHovered && (
                        <S.StyledButton appearance="icon" onClick={handleOnClickMenu}>
                            <MoreVertIcon />
                        </S.StyledButton>
                    )}
                </S.Header>
                <S.BottomPortWidget port={node.getPort("out")!} engine={engine} />
            </S.Node>

            <Popover
                anchorEl={popoverAnchorEl}
                open={isPopoverOpen}
                sx={{
                    backgroundColor: Colors.SURFACE,
                    marginLeft: "30px",
                }}
            >
                <Button appearance="secondary" onClick={() => {
                    handleOnDelete();
                    setIsPopoverOpen(false); // Close the popover after action
                }}>Delete</Button>
            </Popover>

        </div >
    );
}
