/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
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
