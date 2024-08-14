/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { ApiIcon, DatabaseIcon, HttpIcon } from "../../resources";
import { FlowNode } from "../../utils/types";

interface ConnectorIconProps {
    node: FlowNode;
}

export default function ConnectorIcon(props: ConnectorIconProps) {
    const { node } = props;

    const databaseClients = ["mysql", "postgres", "sqlite", "mssql", "oracle", "redis", "cassandra", "mongodb"];

    if (databaseClients.includes(node.codedata.module)) {
        return <DatabaseIcon />;
    }
    if (node.codedata.module === "http") {
        return <HttpIcon />;
    }
    
    return < ApiIcon />;
}
