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
import { NodeWidgetProps, NodeStyles, BaseNodeWidget } from "../BaseNodeWidget";

export function HttpEndpointNodeWidget(props: NodeWidgetProps) {
    const { model } = props;

    return (
        <BaseNodeWidget {...props}>
            <NodeStyles.Row>
                <NodeStyles.StyledText>Method </NodeStyles.StyledText>
                <TextField value={model.node.nodeProperties.method.value.toString()} />
            </NodeStyles.Row>
            <NodeStyles.Row>
                <NodeStyles.StyledText>Path </NodeStyles.StyledText>
                <TextField value={model.node.nodeProperties.path.value.toString()} />
            </NodeStyles.Row>
        </BaseNodeWidget>
    );
}
