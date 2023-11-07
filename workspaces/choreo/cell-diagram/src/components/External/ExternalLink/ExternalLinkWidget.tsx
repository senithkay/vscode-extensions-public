/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { DiagramEngine } from "@projectstorm/react-diagrams";
import { ExternalLinkModel } from "./ExternalLinkModel";
import { Colors, EXTERNAL_LINK } from "../../../resources";

interface WidgetProps {
    engine: DiagramEngine;
    link: ExternalLinkModel;
}

export function ExternalLinkWidget(props: WidgetProps) {
    const { link } = props;

    const [isSelected, setIsSelected] = useState<boolean>(false);

    useEffect(() => {
        const listener = link.registerListener({
            SELECT: selectPath,
            UNSELECT: unselectPath,
        });
        return () => {
            link.deregisterListener(listener);
        };
    }, [link]);

    const selectPath = () => {
        setIsSelected(true);
        link.selectLinkedNodes();
    };

    const unselectPath = () => {
        setIsSelected(false);
        link.resetLinkedNodes();
    };

    return (
        <g className={EXTERNAL_LINK}>
            <polygon points={link.getArrowHeadPoints()} fill={isSelected ? Colors.PRIMARY_SELECTED : Colors.NODE_BORDER} />
            <path
                id={link.getID()}
                d={link.getCurvePath()}
                cursor={"pointer"}
                fill={"none"}
                onMouseLeave={unselectPath}
                onMouseOver={selectPath}
                pointerEvents={"all"}
                stroke={isSelected ? Colors.PRIMARY_SELECTED : Colors.NODE_BORDER}
                strokeWidth={2}
            />
        </g>
    );
}
