/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { BranchIcon, CallIcon, CodeIcon, SendIcon } from "../../resources";
import { NodeKind } from "../../utils/types";
import { ReturnIcon } from "../../resources/icons/nodes/ReturnIcon";

interface NodeIconProps {
    type: NodeKind;
}

export default function NodeIcon(props: NodeIconProps) {
    const { type } = props;

    switch (type) {
        case "IF":
            return <BranchIcon />;
        case "EXPRESSION":
            return <CodeIcon />;
        case "HTTP_API_GET_CALL":
        case "HTTP_API_POST_CALL":
            return <CallIcon />;
        case "RETURN":
            return <ReturnIcon />;
        default:
            return <CodeIcon />;
    }
}
