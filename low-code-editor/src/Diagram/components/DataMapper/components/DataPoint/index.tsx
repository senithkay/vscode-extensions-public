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
import React from 'react';

import { SourcePointViewState, TargetPointViewState } from "../../viewstate";
import "../InputTypes/style.scss";
// // tslint:disable-next-line: no-duplicate-imports
// import "../InputTypes/style.scss";

interface DataPointProps {
    dataPointViewState: SourcePointViewState | TargetPointViewState;
    onClick: (dataPointVS: SourcePointViewState | TargetPointViewState) => void;
}

export function DataPoint(props: DataPointProps) {
    const { dataPointViewState, onClick } = props;
    const connections: JSX.Element[] = [];

    if (dataPointViewState instanceof SourcePointViewState) {
        (dataPointViewState as SourcePointViewState).connections.forEach(connection => {
            connections.push(
                <g>
                    <line
                        x1={connection.x1 + 100}
                        x2={connection.x2 - 8 + 100}
                        y1={connection.y1}
                        y2={connection.y2}
                        className="connect-line"
                        markerEnd="url(#arrowhead)"
                    />
                </g>

            );
        })
    }

    const onDataPointClick = () => {
        onClick(dataPointViewState);
    }

    return (
        <>
            {connections}
            <circle
                cx={dataPointViewState.bBox.x + 100}
                cy={dataPointViewState.bBox.y}
                r={5}
                onClick={onDataPointClick}
                className="default-circle"
            />
            {/* <g>
                <circle id="Oval" cx={dataPointViewState.bBox.x + 100} cy={dataPointViewState.bBox.y} r="6" fill="none" stroke="#a6b3ff" stroke-miterlimit="10" stroke-width="1" />
                <circle id="Oval-2" data-name="Oval" cx={dataPointViewState.bBox.x + 100} cy={dataPointViewState.bBox.y} r="3" fill="#5567d5" />
            </g> */}

        </>
    )
}

