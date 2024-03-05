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
import { BaseNodeModel } from "./BaseNodeModel";
import { Colors, NODE_HEIGHT, NODE_WIDTH } from "../../../resources/constants";
import { Button, Dropdown, TextField, Tooltip } from "@wso2-enterprise/ui-toolkit";
import { MoreVertIcon } from "../../../resources";
import { Expression, Node, NodePropertyKey } from "../../../utils/types";
import { generateEditor } from "../../editors/EditorFactory";

export namespace NodeStyles {
    export type NodeStyleProp = {
        selected: boolean;
        hovered: boolean;
    };
    export const Node = styled.div<NodeStyleProp>`
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        min-width: ${NODE_WIDTH}px;
        min-height: ${NODE_HEIGHT}px;
        padding: 0 8px;
        border: 1.5px solid
            ${(props: NodeStyleProp) =>
                props.selected ? Colors.PRIMARY : props.hovered ? Colors.PRIMARY : Colors.OUTLINE_VARIANT};
        border-radius: 10px;
        background-color: ${Colors.SURFACE_DIM};
        color: ${Colors.ON_SURFACE};
        /* cursor: pointer; */
    `;

    export const Header = styled.div<{}>`
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding: 8px;
        border-bottom: 1px solid ${Colors.OUTLINE_VARIANT};
    `;

    export const StyledButton = styled(Button)`
        border-radius: 5px;
        position: absolute;
        right: 6px;
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

    export const Title = styled(StyledText)`
        max-width: ${NODE_WIDTH - 50}px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: "GilmerMedium";
    `;

    export const Body = styled.div`
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding: 8px;
    `;

    export const Row = styled.div`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    `;

    export const Hr = styled.hr`
        width: 100%;
    `;
}

interface BaseNodeWidgetProps {
    children: React.ReactNode;
    model: BaseNodeModel;
    engine: DiagramEngine;
    onClick?: (node: Node) => void;
}

export interface NodeWidgetProps extends Omit<BaseNodeWidgetProps, "children"> {}

export function BaseNodeWidget(props: BaseNodeWidgetProps) {
    const { children, model, engine, onClick } = props;
    const [isHovered, setIsHovered] = React.useState(false);

    const handleOnClick = () => {
        onClick && onClick(model.node);
    };

    const handleOnChange = (key: NodePropertyKey, expression: Expression) => {
        model.node.nodeProperties[key] = expression;
    };

    const id = model.node.id;
    const required:React.JSX.Element[] = [];
    const opt:React.JSX.Element[] = [];
    let index = 0;
    for (const [key, expression] of Object.entries(model.node.nodeProperties)) {
        const el  = (
            <NodeStyles.Row key={key}>
                <Tooltip
                    content={expression.documentation}
                    sx={{
                        fontFamily: "GilmerRegular",
                        fontSize: "12px",
                    }}
                >
                    <NodeStyles.StyledText>{expression.label}</NodeStyles.StyledText>
                </Tooltip>
                {generateEditor(key, expression, id, index++, handleOnChange.bind(null, key as NodePropertyKey))}
            </NodeStyles.Row>
        );
        (expression.optional ? opt : required).push(el);
    }


    return (
        <NodeStyles.Node
            selected={model.isSelected()}
            hovered={isHovered}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <NodeStyles.TopPortWidget port={model.getPort("in")!} engine={engine} />
            <NodeStyles.Header>
                <NodeStyles.Title>{model.node.label || model.node.kind}</NodeStyles.Title>
                <NodeStyles.StyledButton appearance="icon" onClick={handleOnClick}>
                    <MoreVertIcon />
                </NodeStyles.StyledButton>
            </NodeStyles.Header>
            {/* todo: generate dynamic form with node attributes */}
            <NodeStyles.Body>
                {required}
                {opt.length > 0 && <NodeStyles.Hr />}
                {opt}
                {children}
            </NodeStyles.Body>
            <NodeStyles.BottomPortWidget port={model.getPort("out")!} engine={engine} />
        </NodeStyles.Node>
    );
}
