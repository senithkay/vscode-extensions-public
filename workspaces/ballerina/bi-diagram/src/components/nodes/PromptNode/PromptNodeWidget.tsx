/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { DiagramEngine, PortWidget } from "@projectstorm/react-diagrams-core";
import {
    DRAFT_NODE_BORDER_WIDTH,
    NODE_BORDER_WIDTH,
    NODE_PADDING,
    PROMPT_NODE_HEIGHT,
    PROMPT_NODE_WIDTH,
} from "../../../resources/constants";
import { Button, Icon, Item, TextArea, ThemeColors } from "@wso2-enterprise/ui-toolkit";
import NodeIcon from "../../NodeIcon";
import { useDiagramContext } from "../../DiagramContext";
import { PromptNodeModel } from "./PromptNodeModel";
import { ELineRange } from "@wso2-enterprise/ballerina-core";
import { DiagnosticsPopUp } from "../../DiagnosticsPopUp";
import { nodeHasError } from "../../../utils/node";
import { cloneDeep } from "lodash";

export namespace NodeStyles {
    export type NodeStyleProp = {
        disabled: boolean;
        hovered: boolean;
        hasError: boolean;
        isActiveBreakpoint?: boolean;
    };
    export const Node = styled.div<NodeStyleProp>`
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        width: ${PROMPT_NODE_WIDTH}px;
        min-height: ${PROMPT_NODE_HEIGHT}px;
        padding: ${NODE_PADDING}px;
        background-color: ${(props: NodeStyleProp) =>
            props?.isActiveBreakpoint ? ThemeColors.DEBUGGER_BREAKPOINT_BACKGROUND : ThemeColors.SURFACE_DIM};
        color: ${ThemeColors.ON_SURFACE};
        opacity: ${(props: NodeStyleProp) => (props.disabled ? 0.7 : 1)};
        border: ${(props: NodeStyleProp) => (props.disabled ? DRAFT_NODE_BORDER_WIDTH : NODE_BORDER_WIDTH)}px;
        border-style: ${(props: NodeStyleProp) => (props.disabled ? "dashed" : "solid")};
        border-color: ${(props: NodeStyleProp) =>
            props.hasError ? ThemeColors.ERROR : props.hovered && !props.disabled ? ThemeColors.PRIMARY : ThemeColors.OUTLINE_VARIANT};
        border-radius: 10px;
    `;

    export const Header = styled.div<{}>`
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 2px;
        width: 100%;
        padding: 8px;
        cursor: pointer;
    `;

    export const ActionButtonGroup = styled.div`
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        gap: 2px;
    `;

    export const MenuButton = styled(Button)`
        border-radius: 5px;
    `;

    export const ErrorIcon = styled.div`
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: ${ThemeColors.ERROR};
    `;

    export const TopPortWidget = styled(PortWidget)`
        margin-top: -3px;
    `;

    export const BottomPortWidget = styled(PortWidget)`
        margin-bottom: -2px;
    `;

    export const StyledText = styled.div`
        font-size: 14px;
    `;

    export const Icon = styled.div`
        padding: 4px;
        svg {
            fill: ${ThemeColors.ON_SURFACE};
        }
    `;

    export const Title = styled(StyledText)`
        max-width: ${PROMPT_NODE_WIDTH - 80}px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: "GilmerMedium";
    `;

    export const Description = styled(StyledText)`
        max-width: ${PROMPT_NODE_WIDTH - 80}px;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: monospace;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        color: ${ThemeColors.ON_SURFACE};
        opacity: 0.7;
        white-space: normal;
        font-size: 12px;
        line-height: 14px;
        max-height: 28px;
    `;

    export const Row = styled.div`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    `;

    export const Body = styled.div`
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        width: 100%;
    `;

    export const ButtonGroup = styled.div`
        display: flex;
        width: 100%;
        justify-content: flex-end;
        align-items: center;
        gap: 8px;
    `;

    export const Editor = styled.div`
        width: 100%;
        flex-grow: 1;
        color: ${ThemeColors.ON_SURFACE};
        background-color: ${ThemeColors.SURFACE};
        border: 1px solid ${ThemeColors.OUTLINE_VARIANT};
        border-radius: 10px;
        padding: ${NODE_PADDING}px;
        cursor: not-allowed;
    `;

    export const Hr = styled.hr`
        width: 100%;
    `;

    export const Footer = styled(StyledText)`
        display: flex;
        align-items: center;
        gap: 8px;
    `;
}

export interface PromptNodeWidgetProps {
    model: PromptNodeModel;
    engine: DiagramEngine;
}

export interface NodeWidgetProps extends Omit<PromptNodeWidgetProps, "children"> {}

export function PromptNodeWidget(props: PromptNodeWidgetProps) {
    const { model, engine } = props;
    const {
        projectPath,
        goToSource,
        openView,
        onNodeSave
    } = useDiagramContext();

    const [isHovered, setIsHovered] = useState(false);
    const [editable, setEditable] = useState(false);
    const [bodyTextTemplate, setBodyTextTemplate] = useState("");
    const hasBreakpoint = model.hasBreakpoint();
    const isActiveBreakpoint = model.isActiveBreakpoint();

    const handleOnClick = async (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.metaKey) {
            // Handle action when cmd key is pressed
            onGoToSource();
        }
    };

    const handleSave = () => {
        const clonedNode = cloneDeep(model.node);
        clonedNode.properties['prompt'].value = `\`${bodyTextTemplate}\``;
        clonedNode.codedata.node = "NP_FUNCTION_DEFINITION";
        onNodeSave?.(clonedNode);
        toggleEditable();
    };

    const onGoToSource = () => {
        goToSource?.(model.node);
    };

    const openDataMapper = () => {
        if (!model.node.properties?.view?.value) {
            return;
        }
        const { fileName, startLine, endLine } = model.node.properties.view.value as ELineRange;
        openView &&
            openView(projectPath + "/" + fileName, {
                startLine: startLine.line,
                startColumn: startLine.offset,
                endLine: endLine.line,
                endColumn: endLine.offset,
            });
    };

    const viewFunction = () => {
        if (!model.node.properties?.view?.value) {
            return;
        }
        const { fileName, startLine, endLine } = model.node.properties.view.value as ELineRange;
        openView &&
            openView(projectPath + "/" + fileName, {
                startLine: startLine.line,
                startColumn: startLine.offset,
                endLine: endLine.line,
                endColumn: endLine.offset,
            });
    };

    const toggleEditable = () => {
        setEditable(!editable);
    };

    const handleBodyTextChange = (value: string) => {
        setBodyTextTemplate(value);
    };

    const menuItems: Item[] = [
        { id: "goToSource", label: "Source", onClick: () => onGoToSource() },
    ];

    if (model.node.codedata.node === "DATA_MAPPER_DEFINITION") {
        menuItems.splice(1, 0, {
            id: "openDataMapper",
            label: "View",
            onClick: () => {
                openDataMapper();
            },
        });
    }

    if (model.node.codedata.node === "FUNCTION_CALL") {
        menuItems.splice(1, 0, {
            id: "viewFunction",
            label: "View",
            onClick: () => {
                viewFunction();
            },
        });
    }

    const hasError = nodeHasError(model.node);

    useEffect(() => {
        const prompt = model.node.properties?.['prompt']?.value;
        if (!prompt) {
            setBodyTextTemplate("");
        } else {
            const promptWithoutQuotes = prompt.replace(/^`|`$/g, "");
            setBodyTextTemplate(promptWithoutQuotes);
        }
    }, [model.node.properties]);

    return (
        <NodeStyles.Node
            hovered={isHovered}
            disabled={model.node.suggested}
            hasError={hasError}
            isActiveBreakpoint={isActiveBreakpoint}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {hasBreakpoint && (
                <div
                    style={{
                        position: "absolute",
                        left: -5,
                        width: 15,
                        height: 15,
                        borderRadius: "50%",
                        backgroundColor: "red",
                    }}
                />
            )}
            <NodeStyles.TopPortWidget port={model.getPort("in")!} engine={engine} />
            <NodeStyles.Row>
                <NodeStyles.Icon onClick={handleOnClick}>
                    <NodeIcon type={model.node.codedata.node} size={24} />
                </NodeStyles.Icon>
                <NodeStyles.Row>
                    <NodeStyles.Header onClick={handleOnClick}>
                        <NodeStyles.Title>Prompt</NodeStyles.Title>
                    </NodeStyles.Header>
                    <NodeStyles.ActionButtonGroup>
                        {hasError && <DiagnosticsPopUp node={model.node} />}
                    </NodeStyles.ActionButtonGroup>
                </NodeStyles.Row>
                {!editable && (
                    <NodeStyles.Icon>
                        <Icon
                            name="bi-edit"
                            onClick={toggleEditable}
                            sx={{
                                fontSize: 20,
                                width: 20,
                                height: 20
                            }}
                        />
                    </NodeStyles.Icon>
                )}
            </NodeStyles.Row>
            <NodeStyles.Body>
                <TextArea
                    value={bodyTextTemplate}
                    onTextChange={handleBodyTextChange}
                    disabled={!editable}
                    rows={12}
                />
            </NodeStyles.Body>
            {editable && (
                <NodeStyles.ButtonGroup>
                    <Button appearance="secondary" onClick={toggleEditable}>
                        Cancel
                    </Button>
                    <Button appearance="primary" onClick={handleSave}>
                        Save
                    </Button>
                </NodeStyles.ButtonGroup>
            )}
            <NodeStyles.BottomPortWidget port={model.getPort("out")!} engine={engine} />
        </NodeStyles.Node>
    );
}
