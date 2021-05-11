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
import React from 'react';

import { STNode } from "@ballerina/syntax-tree";

import { FieldViewState } from "../../../viewstate";
import { DataPoint } from '../../DataPoint';

interface ValueTypeProps {
    model: STNode;
    isMain?: boolean;
}

export function ValueType(props: ValueTypeProps) {
    const { model, isMain } = props;
    const viewState: FieldViewState = model.dataMapperViewState as FieldViewState;

    let name: string = viewState.name;
    const type: string = viewState.type;

    const dataPoints: JSX.Element[] = [];
    const regexPattern = new RegExp(/^"(\w+)\"$/);

    if (regexPattern.test(name)) {
        const matchedVal = regexPattern.exec(name);
        name = matchedVal[1];
    }

    if (viewState.sourcePointViewState) {
        dataPoints.push(<DataPoint dataPointViewState={viewState.sourcePointViewState} onClick={() => { }} />)
    }

    if (viewState.targetPointViewState) {
        dataPoints.push(<DataPoint dataPointViewState={viewState.targetPointViewState} onClick={() => { }} />)
    }

    return (
        <g>
            <text
                x={viewState.bBox.x}
                y={viewState.bBox.y}
                fontFamily="Verdana"
                fontSize="15"
                fontWeight={isMain ? 'bold' : null}
                fill="blue"
            >
                {`${name}: ${type}`}
            </text>
            {dataPoints}
        </g>
    );
}
