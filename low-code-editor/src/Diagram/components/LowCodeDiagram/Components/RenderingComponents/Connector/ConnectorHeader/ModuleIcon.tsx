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

import { BallerinaConstruct } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { DefaultConnectorIcon, DefaultIconProps } from "../Icon/DefaultConnectorIcon";

export interface ModuleIconProps {
    node?: STNode;
    module?: BallerinaConstruct;
    cx?: number;
    cy?: number;
    width?: number;
    scale?: number;
}

export function ModuleIcon(props: ModuleIconProps) {
    const { node, module, cx, cy, width, scale } = props;
    const balCentralCdn = "https://bcentral-packageicons.azureedge.net/images";
    const iconWidth = width || 42;
    const marginError = iconWidth / 4;
    let iconUrl = "";
    let defaultProps: DefaultIconProps = { scale: scale || 1 };

    const [showDefaultIcon, setShowDefaultIcon] = useState(false);

    if (node && (STKindChecker.isLocalVarDecl(node) || STKindChecker.isModuleVarDecl(node))) {
        let moduleInfo = node.typedBindingPattern.typeDescriptor?.typeData.typeSymbol?.moduleID;
        if (STKindChecker.isArrayTypeDesc(node.typedBindingPattern.typeDescriptor)) {
            moduleInfo = node.typedBindingPattern.typeDescriptor?.typeData.typeSymbol?.memberTypeDescriptor.moduleID;
        }
        iconUrl = `${balCentralCdn}/${moduleInfo?.orgName}_${moduleInfo?.moduleName}_${moduleInfo?.version}.png`;
        defaultProps = {
            cx: cx - marginError,
            cy: cy - marginError,
            width: iconWidth,
            scale,
        };
    } else if (module && module.icon === "" && !showDefaultIcon) {
        setShowDefaultIcon(true);
    } else if (module) {
        iconUrl =
            module.icon ||
            module.package?.icon ||
            `${balCentralCdn}/${module.package.organization}_${module.moduleName}_${module.package.version}.png`;
    } else if (!showDefaultIcon) {
        setShowDefaultIcon(true);
    }

    const handleLoadingError = () => {
        setShowDefaultIcon(true);
    };

    const svgIcon = (
        <svg x={cx} y={cy} width={iconWidth} height={iconWidth} xmlns="http://www.w3.org/2000/svg">
            <image href={iconUrl} height={iconWidth} width={iconWidth} onError={handleLoadingError} />
        </svg>
    );

    const imageIcon = (
        <img
            src={iconUrl}
            alt={module?.moduleName}
            style={{ width: "100%", height: "auto", maxWidth: iconWidth, maxHeight: iconWidth }}
            onError={handleLoadingError}
        />
    );

    return (
        <>
            {!showDefaultIcon && node && svgIcon}
            {!showDefaultIcon && module && imageIcon}
            {showDefaultIcon && <DefaultConnectorIcon {...defaultProps} />}
        </>
    );
}
