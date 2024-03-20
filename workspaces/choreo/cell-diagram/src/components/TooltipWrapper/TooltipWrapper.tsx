/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Tooltip } from "@wso2-enterprise/ui-toolkit";
import React from "react";
import { Colors } from "../../resources";

interface TooltipWrapperProps {
    visible: boolean;
    content: string;
    children: React.ReactNode;
}

const TooltipWrapper: React.FC<TooltipWrapperProps> = ({ visible, content, children }) => {
    if (visible && content) {
        return (
            <Tooltip
                content={content}
                sx={{ backgroundColor: Colors.SURFACE, border: `1px solid ${Colors.SURFACE_DIM}`, borderRadius: 0 }}
            >
                {children}
            </Tooltip>
        );
    }

    return <>{children}</>;
};

export default TooltipWrapper;
