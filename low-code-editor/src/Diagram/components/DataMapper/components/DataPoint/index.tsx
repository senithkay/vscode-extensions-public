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

import { DefaultConfig } from '../../../../../../../low-code-editor/src/Diagram/visitors/default';
import { DeleteSVG } from '../../../DiagramActions/DeleteBtn/DeleteSVG';
import { PADDING_OFFSET } from '../../util/data-mapper-position-visitor';
import { SourcePointViewState, TargetPointViewState } from "../../viewstate";
import "../InputTypes/style.scss";

import { ExpressionBoxSVG, EXPRESSION_BOX_SVG_HEIGHT } from './ExpressionBoxSVG';
import { MappingArrow } from './MappingArrow';

interface DataPointProps {
    dataPointViewState: SourcePointViewState | TargetPointViewState;
    onClick: (dataPointVS: SourcePointViewState | TargetPointViewState) => void;
    disableEdit?: boolean;
}

export function DataPoint(props: DataPointProps) {
    const { dataPointViewState, onClick, disableEdit } = props;
    const connections: JSX.Element[] = [];
    const dataPointElement: JSX.Element[] = [];

    const onDataPointClick = () => {
        if (disableEdit) {
            return;
        }

        onClick(dataPointViewState);
    }


    if (dataPointViewState instanceof SourcePointViewState) {
        (dataPointViewState as SourcePointViewState).connections.forEach((connection, i) => {
            const keyId = 'source-' + dataPointViewState.text.replace(/\./g, '-') + '-' + i;
            connections.push(
                <MappingArrow
                    connectionViewstate={connection}
                    keyId={keyId}
                    disableEdit={disableEdit}
                />
            );
        })
        dataPointElement.push((
            <>
                <g>
                    <circle
                        id="Oval-test"
                        cx={dataPointViewState.bBox.x + 100}
                        cy={dataPointViewState.bBox.y}
                        r="6"
                        fill="none"
                        stroke="#a6b3ff"
                        stroke-miterlimit="10"
                        stroke-width="1"
                        onClick={onDataPointClick}
                    />
                    <circle
                        id="Oval-2"
                        data-name="Oval"
                        cx={dataPointViewState.bBox.x + 100}
                        cy={dataPointViewState.bBox.y}
                        r="3"
                        fill="#5567d5"
                        onClick={onDataPointClick}
                    />
                </g>
            </>
        ))
    } else if (dataPointViewState instanceof TargetPointViewState) {
        dataPointElement.push((
            <>
                <rect
                    className="connector-wrapper"
                    x={dataPointViewState.bBox.x - 143}
                    y={dataPointViewState.bBox.y - ((EXPRESSION_BOX_SVG_HEIGHT / 2) + 1.5)}
                    width={88}
                    height={36}
                    rx={3}
                />
                <g>
                    <circle
                        id="Oval-test2"
                        cx={dataPointViewState.bBox.x + 85}
                        cy={dataPointViewState.bBox.y}
                        r="6"
                        fill="none"
                        stroke="#a6b3ff"
                        stroke-miterlimit="10"
                        stroke-width="1"
                        onClick={onDataPointClick}
                    />
                    <circle
                        id="Oval-2"
                        data-name="Oval"
                        cx={dataPointViewState.bBox.x + 85}
                        cy={dataPointViewState.bBox.y}
                        r="3"
                        fill="#5567d5"
                        onClick={onDataPointClick}
                    />
                </g>
                <ExpressionBoxSVG
                    x={dataPointViewState.bBox.x - 115}
                    y={dataPointViewState.bBox.y - (EXPRESSION_BOX_SVG_HEIGHT / 2)}
                    onClick={onDataPointClick}
                />
                <g>
                    <circle
                        id="Oval-test2"
                        cx={dataPointViewState.bBox.x - 125}
                        cy={dataPointViewState.bBox.y}
                        r="6"
                        fill="none"
                        stroke="#a6b3ff"
                        stroke-miterlimit="10"
                        stroke-width="1"
                        onClick={onDataPointClick}
                    />
                    <circle
                        id="Oval-2"
                        data-name="Oval"
                        cx={dataPointViewState.bBox.x - 125}
                        cy={dataPointViewState.bBox.y}
                        r="3"
                        fill="#5567d5"
                        onClick={onDataPointClick}
                    />
                </g>
                <line
                    x1={dataPointViewState.bBox.x - 65}
                    x2={dataPointViewState.bBox.x + 80 - DefaultConfig.dotGap}
                    y1={dataPointViewState.bBox.y}
                    y2={dataPointViewState.bBox.y}
                    className="connect-line"
                    markerEnd="url(#arrowhead)"
                />
                <g>
                    <circle
                        id="Oval"
                        cx={dataPointViewState.bBox.x - 70}
                        cy={dataPointViewState.bBox.y}
                        r="6"
                        fill="none"
                        stroke="#a6b3ff"
                        stroke-miterlimit="10"
                        stroke-width="1"
                    />
                    <circle
                        id="Oval-2"
                        data-name="Oval"
                        cx={dataPointViewState.bBox.x - 70}
                        cy={dataPointViewState.bBox.y}
                        r="3"
                        fill="#5567d5"
                    />
                </g>
            </>
        ))
    }



    return (
        <>
            {connections}
            {dataPointElement}
        </>
    )
}

