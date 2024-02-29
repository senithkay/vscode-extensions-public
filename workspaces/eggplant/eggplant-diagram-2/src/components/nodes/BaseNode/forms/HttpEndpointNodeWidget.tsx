/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { NodeWidgetProps, BaseNodeWidget, NodeStyles } from "../BaseNodeWidget";
import { TextInput } from "../../../TextInput";
import { Expression } from "../../../../utils/types";
import { Dropdown } from "@wso2-enterprise/ui-toolkit";

export function HttpEndpointNodeWidget(props: NodeWidgetProps) {
    const { model } = props;
    const nodeProperties = model.node.nodeProperties;
    const dropdownItems = [{
        id: "GET",
        content: "GET",
        value: "GET",
    }, {
        id: "POST",
        content: "POST",
        value: "POST",
    }, {
        id: "PUT",
        content: "PUT",
        value: "PUT",
    }, {
        id: "DELETE",
        content: "DELETE",
        value: "DELETE",
    }];

    const handleOnChange = (expression: Expression) => {
        console.log(">>> expression changed", expression);
    };

    return (
        <BaseNodeWidget {...props}>
            <NodeStyles.Row>
                <NodeStyles.StyledText>{nodeProperties.method.label} </NodeStyles.StyledText>
                <Dropdown
                    id={`${model.node.id}-method-dropdown`}
                    value={nodeProperties.method.value.toString().toUpperCase()}
                    items={dropdownItems}
                    sx={{ width: 166, marginBottom: 2 }}
                    onChange={(e) => {}}
                ></Dropdown>
            </NodeStyles.Row>
            <TextInput expression={nodeProperties.path} onChange={handleOnChange} />
        </BaseNodeWidget>
    );
}
