/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import React, { useEffect, useState } from "react";

import { DiagramEngine } from "@projectstorm/react-diagrams";

import { MediatorLinkModel } from "./MediatorLinkModel";
import { Colors } from "../../resources/assets/Constants";

interface WidgetProps {
    engine: DiagramEngine,
    link: MediatorLinkModel
}

export function MediatorLinkWidget(props: WidgetProps) {
    const { link, engine } = props;

    const [isSelected, setIsSelected] = useState<boolean>(false);

    useEffect(() => {
        link.initLinks(engine);

        link.registerListener({
            'SELECT': selectPath,
            'UNSELECT': unselectPath
        });
    }, [link]);

    const selectPath = () => {
        link.selectLinkedNodes();
        setIsSelected(true);
    };

    const unselectPath = () => {
        link.resetLinkedNodes();
        setIsSelected(false);
    };


    return (
        <g>
            <polygon
                points={link.getArrowHeadPoints()}
                fill={isSelected ? Colors.PRIMARY_SELECTED : Colors.PRIMARY}
            />

            <path
                id={link.getID()}
                cursor={'pointer'}
                d={link.getCurvePath()}
                fill="none"
                pointerEvents="all"
                stroke={isSelected ? Colors.PRIMARY_SELECTED : Colors.PRIMARY}
                strokeWidth={1}
            />
        </g>
    );
}
