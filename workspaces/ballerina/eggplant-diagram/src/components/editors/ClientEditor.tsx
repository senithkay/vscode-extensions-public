/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext } from "react";
import { DiagramContext } from "../DiagramContext";
import { Dropdown } from "@wso2-enterprise/ui-toolkit";
import { EditorProps } from "./EditorFactory";

export function ClientEditor(props: EditorProps) {
    const { property, onChange, parentId, index } = props;
    const { flow } = useContext(DiagramContext);

    const globalClients = flow.connections;
    const dropdownItems = globalClients.map((connection) => {
        return {
            id: connection.id,
            content: connection.metadata.label,
            value: connection.metadata.label,
        };
    });

    const handleOnChange = (value: string) => {
        onChange({ ...property, value });
    };

    return ( <Dropdown
                id={parentId + index}
                value={property.value ? property.value.toString() : ""}
                items={dropdownItems}
                sx={{ width: 165.5, marginBottom: 2 }}
                onValueChange={handleOnChange}
            ></Dropdown>);
}
