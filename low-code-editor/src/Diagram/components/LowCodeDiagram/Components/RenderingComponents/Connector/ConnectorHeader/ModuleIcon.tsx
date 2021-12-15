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

import { BallerinaModule } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STNode } from "@wso2-enterprise/syntax-tree";

import { DefaultConnectorIcon } from "../Icon/DefaultConnectorIcon";

export interface ModuleIconProps {
    model?: STNode;
    cx?: number;
    cy?: number;
    width?: number;
    balModule?: BallerinaModule;
    scale?: number;
}

export function ModuleIcon(props: ModuleIconProps) {
    const { model, cx, cy, width, balModule, scale } = props;
    const balCentralCdn = "https://bcentral-packageicons.azureedge.net/images";
    const iconWidth = width || 36;

    const marginError = iconWidth / 8;
    const module = model?.typeData?.typeSymbol?.moduleID;
    let iconUrl = "";

    const [showDefaultIcon, setShowDefaultIcon] = useState(false);

    if (module) {
        iconUrl = `${balCentralCdn}/${module.orgName}_${module.moduleName}_${module.version}.png`;
    } else if (balModule) {
        iconUrl = `${balCentralCdn}/${balModule.package.organization}_${balModule.moduleName}_${balModule.package.version}.png`;
    }

    const handleLoadingError = () => {
        setShowDefaultIcon(true);
    };

    const moduleIcon = (
        <svg x={cx} y={cy} width={iconWidth} height={iconWidth} xmlns="http://www.w3.org/2000/svg">
            <image href={iconUrl} height={iconWidth} width={iconWidth} onError={handleLoadingError} />
        </svg>
    );

    const balModuleIcon = (
        <img
            src={iconUrl}
            alt={balModule?.moduleName}
            style={{ width: "auto", height: "100%", maxWidth: 56 * scale, maxHeight: 56 * scale }}
            onError={handleLoadingError}
        />
    );

    return (
        <>
            {!showDefaultIcon && module && moduleIcon}
            {!showDefaultIcon && balModule && balModuleIcon}
            {showDefaultIcon && balModule && (<DefaultConnectorIcon scale={scale} />)}
            {showDefaultIcon && module && (<DefaultConnectorIcon cx={cx - marginError} cy={cy - marginError} width={iconWidth} scale={0.5} />)}
        </>
    );
}
