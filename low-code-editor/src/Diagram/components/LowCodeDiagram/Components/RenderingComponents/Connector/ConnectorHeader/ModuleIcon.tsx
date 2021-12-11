/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js
import React, { useState } from "react";

import { STNode } from "@wso2-enterprise/syntax-tree";

import { DefaultConnectorIcon } from "../Icon/DefaultConnectorIcon";

export interface ModuleIconProps {
    model: STNode;
    iconProps: React.SVGProps<SVGSVGElement>;
}

export function ModuleIcon(props: ModuleIconProps) {
    const { model, iconProps } = props;
    const balCentralCdn = "https://bcentral-packageicons.azureedge.net/images";
    const width = 36;

    const module = model.typeData?.typeSymbol?.moduleID;
    let iconUrl = "";

    const [showDefaultIcon, setShowDefaultIcon] = useState(false);

    if (module) {
        iconUrl = `${balCentralCdn}/${module.orgName}_${module.moduleName}_${module.version}.png`;
    }

    const handleLoadingError = () => {
        setShowDefaultIcon(true);
    };

    const moduleIcon = (
        <svg width={width} height={width} xmlns="http://www.w3.org/2000/svg" {...iconProps}>
            <image href={iconUrl} height={width} width={width} onError={handleLoadingError} />
        </svg>
    );

    return (
        <>
            {!showDefaultIcon && moduleIcon}
            {showDefaultIcon && <DefaultConnectorIcon transform="scale(0.5)" {...iconProps} viewBox="0 0 50 50" />}
        </>
    );
}
