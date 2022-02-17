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

import { Tooltip } from '@wso2-enterprise/ballerina-low-code-edtior-commons';

import { FieldViewState } from '../../../viewstate';
import { DataPoint } from '../../DataPoint';

interface ConstantProps {
    viewState: FieldViewState;
    offSetCorrection: number;
}


export function Constant(props: ConstantProps) {
    const { viewState, offSetCorrection } = props

    const dataPoints: JSX.Element[] = [];

    if (viewState.sourcePointViewState) {
        dataPoints.push(
            <DataPoint
                dataPointViewState={viewState.sourcePointViewState}
                disableEdit={true}
            />
        );
    }

    return (
        <g id="constant-wrapper" >
            <rect
                render-order="-1"
                x={viewState.bBox.x - offSetCorrection}
                y={viewState.bBox.y - 15}
                height={viewState.bBox.h}
                width={viewState.bBox.w}
                className="data-wrapper"
            />
            <text
                render-order="1"
                x={viewState.bBox.x}
                y={viewState.bBox.y + 10}
                height="50"
            >
                {
                    !(viewState.value.length > 20) ?
                        (
                            <tspan className="key-para"> {viewState.value}  </tspan>
                        ) : (
                            <Tooltip
                                arrow={true}
                                placement="top-start"
                                title={viewState.value}
                                inverted={false}
                                interactive={true}
                            >
                                <tspan className="key-value">
                                    {`${viewState.value}`.slice(0, 20) + '...'}
                                </tspan>
                            </Tooltip>

                        )
                }
            </text>
            {dataPoints}
        </g>
    )
}
