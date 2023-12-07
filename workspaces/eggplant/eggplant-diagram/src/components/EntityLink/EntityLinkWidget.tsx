/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { EntityLinkModel } from "./EntityLinkModel";
import { Colors } from "../../resources";

interface WidgetProps {
    link: EntityLinkModel;
}

export function EntityLinkWidget(props: WidgetProps) {
    const { link } = props;

    return (
        <g>
            <polygon points={link.getArrowHeadPoints()} fill={Colors.DEFAULT_TEXT} />
            <path
                id={link.getID()}
                d={link.getCurvePath()}
                fill={"none"}
                pointerEvents={"all"}
                stroke={Colors.DEFAULT_TEXT}
                strokeWidth={0.75}
            />
        </g>
    );
}
