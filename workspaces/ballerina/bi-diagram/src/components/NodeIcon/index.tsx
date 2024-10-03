/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import {
    BombIcon,
    BranchIcon,
    BreakIcon,
    CallIcon,
    CodeIcon,
    CommentIcon,
    ContinueIcon,
    LockIcon,
    LoopIcon,
    PlusIcon,
    StopIcon,
    TransformIcon,
} from "../../resources";
import { NodeKind } from "../../utils/types";
import { ReturnIcon } from "../../resources/icons/nodes/ReturnIcon";
import { VarIcon } from "../../resources/icons/nodes/VarIcon";
import { SecurityIcon } from "../../resources/icons/nodes/SecurityIcon";

interface NodeIconProps {
    type: NodeKind;
}

export function NodeIcon(props: NodeIconProps) {
    const { type } = props;

    switch (type) {
        case "IF":
            return <BranchIcon />;
        case "EXPRESSION":
            return <CodeIcon />;
        case "ACTION_CALL":
            return <CallIcon />;
        case "RETURN":
            return <ReturnIcon />;
        case "NEW_DATA":
        case "UPDATE_DATA":
            return <VarIcon />;
        case "WHILE":
            return <LoopIcon />;
        case "BREAK":
            return <BreakIcon />;
        case "CONTINUE":
            return <ContinueIcon />;
        case "STOP":
            return <StopIcon />;
        case "ERROR_HANDLER":
            return <SecurityIcon />;
        case "PANIC":
            return <BombIcon />;
        case "LOCK":
            return <LockIcon />;
        case "TRANSACTION":
            return <TransformIcon />;
        case "NEW_CONNECTION":
            return <PlusIcon />;
        case "COMMENT":
            return <CommentIcon />;
        
        default:
            return <CodeIcon />;
    }
}

export default NodeIcon;
