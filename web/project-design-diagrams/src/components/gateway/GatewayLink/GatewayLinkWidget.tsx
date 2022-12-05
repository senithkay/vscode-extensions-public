/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
import React, {useEffect} from 'react';
import { GatewayLinkModel } from './GatewayLinkModel';
import { DiagramEngine } from "@projectstorm/react-diagrams";
import {Colors} from "../../../resources";

interface WidgetProps {
    engine: DiagramEngine;
    link: GatewayLinkModel;
}

export function GatewayLinkWidget(props: WidgetProps) {
    const {link, engine} = props;

    useEffect(() => {
        link.initLinks(engine);
    });

    return (
        <>
            <g>
                <polygon
                    points={link.getArrowHeadPoints()}
                    fill={Colors.GATEWAY}
                />

                <path
                    id={link.getID()}
                    cursor={'pointer'}
                    d={link.getCurvePath()}
                    fill='none'
                    pointerEvents='all'
                    // onMouseLeave={onMouseLeave}
                    // onMouseMove={e => callingFunction ? setPosition({ x: e.pageX, y: e.pageY }) : {}}
                    // onMouseOver={onMouseOver}
                    stroke={Colors.GATEWAY}
                    strokeWidth={1}
                />
            </g>
        </>
    );
}
