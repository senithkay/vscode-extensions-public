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
import { ReferenceNodeModel } from "./ReferenceNodeModel";
import { Colors } from "../../../resources/constants";
import { STNode } from "@wso2-enterprise/mi-syntax-tree/src";
import { Button, ClickAwayListener, Menu, MenuItem, Popover, Tooltip } from "@wso2-enterprise/ui-toolkit";
import { MoreVertIcon } from "../../../resources";
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import SidePanelContext from "../../sidePanel/SidePanelContexProvider";
import { getSVGIcon } from "../../../resources/icons/mediatorIcons/icons";
import { EVENT_TYPE, GetDefinitionResponse, MACHINE_VIEW } from "@wso2-enterprise/mi-core";

namespace S {
    export type NodeStyleProp = {
        selected: boolean;
        hovered: boolean;
        hasError: boolean;
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
            props.hasError ? Colors.ERROR : props.selected ? Colors.SECONDARY : props.hovered ? Colors.SECONDARY : Colors.OUTLINE_VARIANT};
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
        & img {
            height: 25px;
            width: 25px;
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

    interface TagProps {
        selectable: boolean;
    };

    export const NodeText = styled.div<TagProps>`
        max-width: 100px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        &:hover {
            text-decoration: ${(props: TagProps) => props.selectable ? "underline" : "none"};
            color: ${(props: TagProps) => props.selectable ? Colors.SECONDARY : Colors.ON_SURFACE};
    `;
}
interface ReferenceNodeWidgetProps {
    node: ReferenceNodeModel;
    engine: DiagramEngine;
    onClick?: (node: STNode) => void;
}

export function ReferenceNodeWidget(props: ReferenceNodeWidgetProps) {
    const { node, engine } = props;
    const [isHovered, setIsHovered] = React.useState(false);
    const visualizerContext = useVisualizerContext();
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
    const sidePanelContext = React.useContext(SidePanelContext);
    const { rpcClient } = useVisualizerContext();
    const hasDiagnotics = node.hasDiagnotics();
    const tooltip = hasDiagnotics ? node.getDiagnostics().map(diagnostic => diagnostic.message).join("\n") : undefined;
    const [definition, setDefinition] = useState<GetDefinitionResponse>(undefined);

    const getDefinition = async () => {
        const text = await rpcClient.getMiDiagramRpcClient().getTextAtRange({
            documentUri: node.documentUri,
            range: node.stNode.range.startTagRange,
        });

        const regex = /\s*key\s*=\s*(['"])(.*?)\1/;
        const match = text.text.match(regex);
        const keyPart = match[0].split("=")[0];
        const valuePart = match[0].split("=")[1];
        const keyLines = keyPart.split("\n");
        const valueLines = valuePart.split("\n");
        const offsetBeforeKey = (text.text.split(match[0])[0]).length;

        let charPosition = 0

        if (keyLines.length > 1) {
            charPosition = keyLines[keyLines.length - 1].length + valueLines[valueLines.length - 1].length;
        }
        if (valueLines.length > 1) {
            charPosition = valueLines[valueLines.length - 1].length;
        }
        const definitionPosition = {
            line: node.stNode.range.startTagRange.start.line + keyLines.length - 1 + valueLines.length - 1,
            character: keyLines.length > 1 || valueLines.length > 1 ?
                charPosition :
                node.stNode.range.startTagRange.start.character + offsetBeforeKey + match[0].length,
        };

        const definition = await rpcClient.getMiDiagramRpcClient().getDefinition({
            document: {
                uri: node.documentUri,
            },
            position: definitionPosition
        });
        if (definition) setDefinition(definition);
    }
    getDefinition();

    const handleOnClickMenu = (event: any) => {
        setIsPopoverOpen(!isPopoverOpen);
        setPopoverAnchorEl(event.currentTarget);
        event.stopPropagation();
    };

    const handleOnDelete = () => {
        rpcClient.getMiDiagramRpcClient().applyEdit({
            documentUri: node.documentUri,
            range: { start: node.stNode.range.startTagRange.start, end: node.stNode.range.endTagRange.end },
            text: "",
        });
    };

    const handleDeleleClick = () => {
        handleOnDelete();
        setIsPopoverOpen(false); // Close the popover after action
    }

    const handlePopoverClose = () => {
        setIsPopoverOpen(false);
    }

    const onClickTag = async (e: any) => {
        e.stopPropagation();
        // go to the diagram view of the selected mediator
        if (definition && definition.uri) {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.Diagram,
                    documentUri: definition.uri
                }
            });
        }
    }

    return (
        <div >
            <Tooltip content={!isPopoverOpen ? tooltip : ""} position={'bottom'} containerPosition={'absolute'}>
                <S.Node
                    selected={node.isSelected()}
                    hasError={hasDiagnotics}
                    hovered={isHovered}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={(e) => node.onClicked(e, node, rpcClient, sidePanelContext, visualizerContext)}
                >
                    <S.TopPortWidget port={node.getPort("in")!} engine={engine} />
                    <S.Header>
                        <S.IconContainer>{getSVGIcon(node.referenceName)}</S.IconContainer>
                        <S.NodeText onClick={onClickTag} selectable={definition !== undefined}>{node.referenceName}</S.NodeText>
                        {isHovered && (
                            <S.StyledButton appearance="icon" onClick={handleOnClickMenu}>
                                <MoreVertIcon />
                            </S.StyledButton>
                        )}
                    </S.Header>
                    <S.BottomPortWidget port={node.getPort("out")!} engine={engine} />
                </S.Node>
            </Tooltip>
            <Popover
                anchorEl={popoverAnchorEl}
                open={isPopoverOpen}
                sx={{
                    backgroundColor: Colors.SURFACE,
                    marginLeft: "30px",
                    padding: 0
                }}
            >
                <ClickAwayListener onClickAway={handlePopoverClose}>
                    <Menu>
                        <MenuItem key={'delete-btn'} item={{ label: 'Delete', id: "delete", onClick: handleDeleleClick }} />
                    </Menu>
                </ClickAwayListener>
            </Popover>

        </div >
    );
}
