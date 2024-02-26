/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { TextField } from "@wso2-enterprise/ui-toolkit";
import { MoreVertIcon } from "../../../resources";
import { BaseNodeWidgetProps, NodeStyles } from "./BaseNodeWidget";

export function HttpEndpointNodeWidget(props: BaseNodeWidgetProps) {
    const { model, engine, onClick } = props;
    const [isHovered, setIsHovered] = React.useState(false);

    const handleOnClick = () => {
        onClick && onClick(model.node);
    };

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
            <NodeStyles.Body>
                <NodeStyles.Row>
                    <NodeStyles.StyledText>Method </NodeStyles.StyledText>
                    <TextField value={model.node.method.value.toString()} />
                </NodeStyles.Row>
                <NodeStyles.Row>
                    <NodeStyles.StyledText>Path </NodeStyles.StyledText>
                    <TextField value={model.node.path.value.toString()} />
                </NodeStyles.Row>
            </NodeStyles.Body>
            <NodeStyles.BottomPortWidget port={model.getPort("out")!} engine={engine} />
        </NodeStyles.Node>
    );
}
