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
    fallbackIcon?: React.ReactNode;
}

export function ConnectorIcon(props: ConnectorIconProps): React.ReactElement {
    const { node, fallbackIcon } = props;
    const [imageError, setImageError] = React.useState(false);

    const databaseClients = ["mysql", "postgres", "sqlite", "mssql", "oracle", "redis", "cassandra", "mongodb"];
    if (node.metadata.icon && isValidUrl(node.metadata.icon) && !imageError) {
        return (
            <img 
                src={node.metadata.icon} 
                alt={node.codedata.module} 
                style={{ width: "24px" }} 
                onError={() => setImageError(true)}
            />
        );
    }

    if (fallbackIcon && imageError) {
        return <>{fallbackIcon}</>;
    }
    
    if (databaseClients.includes(node.codedata.module)) {
        return <DatabaseIcon />;
    }
    if (node.codedata.module === "http") {
        return <HttpIcon />;
    }

    return <ApiIcon />;
}

export default ConnectorIcon;

function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}
