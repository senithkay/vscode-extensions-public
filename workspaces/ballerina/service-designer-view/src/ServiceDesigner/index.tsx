/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import { ResourceForm } from "./components/ResourceForm//ResourceForm";
import { ServiceDeclaration } from "@wso2-enterprise/syntax-tree";

interface ServiceDesignerProps {
    st: ServiceDeclaration
}

export function ServiceDesigner(props: ServiceDesignerProps) {
    const { st } = props;
    const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(false);

    const handleOnClose = () => {
        setIsSidePanelOpen(false);
    };
    const handleOnClick = () => {
        setIsSidePanelOpen(true);
    };

    return (
        <div data-testid="service-design-view">
           <h2 onClick={handleOnClick}>Hello Service Designer - {st?.value}</h2>
           {isSidePanelOpen && <ResourceForm isOpen={isSidePanelOpen} onClose={handleOnClose} />}
        </div>
    )
}
