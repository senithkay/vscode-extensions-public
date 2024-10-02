/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { useDiagramContext } from "../../DiagramContext";
import { BaseNodeWidget, BaseNodeWidgetProps } from "./BaseNodeWidget";
import { BaseNodeSTWidget } from "./BaseNodeSTWidget";
import { BaseNodeCompactWidget } from "./BaseNodeCompactWidget";
import { BaseNodeAssignWidget } from "./BaseNodeAssignWidget";

export function BaseNodeWrapper(props: BaseNodeWidgetProps) {
    const { flowNodeStyle } = useDiagramContext();

    switch (flowNodeStyle) {
        case "only-assignments":
            return <BaseNodeAssignWidget {...props} />;
        case "ballerina-statements":
            return <BaseNodeSTWidget {...props} />;
        case "compact":
            return <BaseNodeCompactWidget {...props} />;
        case "default":
        default:
            return <BaseNodeWidget {...props} />;
    }
}
