/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext } from "react";
import { Dropdown, TextField } from "@wso2-enterprise/ui-toolkit";
import { NodeWidgetProps, NodeStyles, BaseNodeWidget } from "../BaseNodeWidget";
import { DiagramContext } from "../../../DiagramContext";

export function HttpActionNodeWidget(props: NodeWidgetProps) {
    const { model } = props;
    const { flow } = useContext(DiagramContext);

    const globalClients = flow.clients.filter((client) => client.scope === "GLOBAL");
    const dropdownItems = globalClients.map((client) => {
        return {
            id: client.id,
            content: client.value,
            value: client.value,
        };
    });

    return (
        <BaseNodeWidget {...props}>
            <NodeStyles.Row>
                <NodeStyles.StyledText>Client </NodeStyles.StyledText>
                <Dropdown
                    id={`${model.node.id}-clients-dropdown`}
                    value={model.node.nodeProperties.client.value.toString()}
                    items={dropdownItems}
                    sx={{ width: 166, marginBottom: 2}}
                ></Dropdown>
            </NodeStyles.Row>
            <NodeStyles.Row>
                <NodeStyles.StyledText>Path </NodeStyles.StyledText>
                <TextField value={model.node.nodeProperties.path.value.toString()} />
            </NodeStyles.Row>
            <NodeStyles.Row>
                <NodeStyles.StyledText>Headers </NodeStyles.StyledText>
                <TextField value="" />
            </NodeStyles.Row>
        </BaseNodeWidget>
    );
}
