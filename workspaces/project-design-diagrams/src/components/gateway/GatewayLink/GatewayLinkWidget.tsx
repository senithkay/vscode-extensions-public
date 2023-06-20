/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useState } from 'react';
import { DiagramEngine } from "@projectstorm/react-diagrams";
import { Colors } from "../../../resources";
import { GatewayLinkModel } from "./GatewayLinkModel";

interface WidgetProps {
    engine: DiagramEngine;
    link: GatewayLinkModel;
}

export function GatewayLinkWidget(props: WidgetProps) {
    const {link, engine} = props;

    const [isVisible, setIsVisible] = useState<boolean>(true);

    useEffect(() => {
        link.initLinks(engine);
    });

    useEffect(() => {
        link.registerListener({
            'updateVisibility': (evt: any) => {
                setIsVisible(!evt.hide);
            }
        });
    }, [link]);

    return (
        <>
            {(isVisible) ? (
                <g>
                    <polygon
                        points={link.getArrowHeadPoints()}
                        fill={Colors.GATEWAY}
                        opacity={0.5}
                    />

                    <path
                        id={link.getID()}
                        cursor={'pointer'}
                        d={link.getCurvePath()}
                        fill='none'
                        pointerEvents='all'
                        stroke={Colors.GATEWAY}
                        strokeWidth={1}
                        opacity={0.8}
                    />
                </g>
            ) : null}
        </>
    );
}
