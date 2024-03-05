/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext } from "react";
import { Dropdown } from "@wso2-enterprise/ui-toolkit";
import { NodeWidgetProps, NodeStyles, BaseNodeWidget } from "../BaseNodeWidget";
import { DiagramContext } from "../../../DiagramContext";
import { TextInput } from "../../../TextInput";
import { Expression, Node } from "../../../../utils/types";

export function HttpActionNodeWidget(props: NodeWidgetProps) {
    const { model } = props;
    const { flow, onNodeUpdate } = useContext(DiagramContext);

    const globalClients = flow.clients.filter((client) => client.scope === "GLOBAL");
    const dropdownItems = globalClients.map((client) => {
        return {
            id: client.id,
            content: client.value,
            value: client.value,
        };
    });
    const nodeProperties = model.node.nodeProperties;

    const handleOnChange = (expression: Expression) => {
        if (expression.label === "Variable") {
            nodeProperties.variable = expression;
        } else if (expression.label === "Path") {
            nodeProperties.path = expression;
        }

        const updatedNode: Node = { ...model.node, nodeProperties: { ...nodeProperties } };
        onNodeUpdate(updatedNode);

    };

    const handleDropdownChange = (value: string) => {
        nodeProperties.client.value = value;
        const updatedNode: Node = { ...model.node, nodeProperties: { ...nodeProperties } };
        onNodeUpdate(updatedNode);
    }

    return (
        <BaseNodeWidget {...props}>
            <NodeStyles.Row>
                <NodeStyles.StyledText>{nodeProperties.client.label} </NodeStyles.StyledText>
                <Dropdown
                    id={`${model.node.id}-clients-dropdown`}
                    value={nodeProperties.client.value.toString()}
                    items={dropdownItems}
                    sx={{ width: 166, marginBottom: 2 }}
                    onChange={handleDropdownChange}
                ></Dropdown>
            </NodeStyles.Row>
            <TextInput expression={nodeProperties.path} onChange={handleOnChange} />
            <TextInput expression={nodeProperties.targetType} onChange={handleOnChange} />
            <TextInput expression={nodeProperties.variable} onChange={handleOnChange} />
        </BaseNodeWidget>
    );
}
