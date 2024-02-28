/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { NodeWidgetProps, BaseNodeWidget } from "../BaseNodeWidget";
import { TextInput } from "../../../TextInput";
import { Expression } from "../../../../utils/types";

export function IfNodeWidget(props: NodeWidgetProps) {
    const { model } = props;
    const nodeProperties = model.node.nodeProperties;

    const handleOnChange = (expression: Expression) => {
        console.log(">>> expression changed", expression);
    };

    return (
        <BaseNodeWidget {...props}>
            <TextInput expression={nodeProperties.condition} onChange={handleOnChange} />
        </BaseNodeWidget>
    );
}
