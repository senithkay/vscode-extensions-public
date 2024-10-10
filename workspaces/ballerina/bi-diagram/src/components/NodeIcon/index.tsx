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
    EqualIcon,
    FunctionIcon,
    LockIcon,
    LoopIcon,
    PlusIcon,
    ReturnIcon,
    SecurityIcon,
    StopIcon,
    TransformIcon,
    VarIcon,
} from "../../resources";
import { NodeKind } from "../../utils/types";

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
        case "VARIABLE":
        case "NEW_DATA":
        case "UPDATE_DATA":
            return <VarIcon />;
        case "FOREACH":
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
        case "ASSIGN":
            return <EqualIcon />;
        case "FUNCTION":
        case "FUNCTION_CALL":
            return <FunctionIcon />;
        
        default:
            return <CodeIcon />;
    }
}

export default NodeIcon;
