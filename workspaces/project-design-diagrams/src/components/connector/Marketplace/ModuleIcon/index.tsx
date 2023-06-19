/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import React, { useState } from "react";
import { BallerinaConstruct } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { DefaultConnectorIcon } from "../icons";

export interface ModuleIconProps {
    module: BallerinaConstruct;
}

function ModuleIcon(props: ModuleIconProps) {
    const { module } = props;

    const [showDefaultIcon, setShowDefaultIcon] = useState(false);

    const iconWidth = 42;

    const handleLoadingError = () => {
        setShowDefaultIcon(true);
    };

    return (
        <div>
            {!showDefaultIcon && (
                <img
                    src={module.icon}
                    alt={module?.moduleName}
                    style={{ width: "100%", height: "auto", maxWidth: iconWidth, maxHeight: iconWidth }}
                    onError={handleLoadingError}
                />
            )}
            {showDefaultIcon && <DefaultConnectorIcon />}
        </div>
    );
}

export default ModuleIcon;
