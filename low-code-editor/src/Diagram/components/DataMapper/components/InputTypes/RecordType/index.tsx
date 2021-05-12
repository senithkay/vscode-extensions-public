/*
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
// tslint:disable: no-empty
// tslint:disable: jsx-no-lambda
// tslint:disable: jsx-no-multiline-js
// tslint:disable: no-console
import React, { useContext } from 'react';

import { RecordTypeDesc, STNode } from '@ballerina/syntax-tree';

import { DefaultConfig } from '../../../../../../../../low-code-editor/src/Diagram/visitors/default';
import { Context as DiagramContext } from '../../../../../../Contexts/Diagram';
import { getDataMapperComponent } from '../../../util';
import { DEFAULT_OFFSET } from '../../../util/data-mapper-position-visitor';
import { FieldViewState, SourcePointViewState, TargetPointViewState } from '../../../viewstate';
import { DataPoint } from '../../DataPoint';
import "../style.scss";

interface RecordTypeProps {
    model: STNode;
    isMain?: boolean;
    onDataPointClick?: (dataPointVS: SourcePointViewState | TargetPointViewState) => void;
}

export function RecordType(props: RecordTypeProps) {
    const { state: { currentApp } } = useContext(DiagramContext);
    const { model, isMain, onDataPointClick } = props;

    const viewState: FieldViewState = model.dataMapperViewState as FieldViewState;
    const name = viewState.name;
    const typeInfo = viewState.typeInfo;

    const type = typeInfo.moduleName === currentApp.name ? typeInfo.name : `${typeInfo.moduleName}:${typeInfo.name}`;

    const fields: JSX.Element[] = [];
    const dataPoints: JSX.Element[] = [];

    if (model.dataMapperTypeDescNode) {
        const typeDescNode = model.dataMapperTypeDescNode as RecordTypeDesc;
        typeDescNode.fields.forEach((field: any) => {
            const fieldVS = field.dataMapperViewState
            fields.push(getDataMapperComponent(fieldVS.type, { model: field, onDataPointClick }));
        })
    }

    if (viewState.sourcePointViewState) {
        dataPoints.push(<DataPoint dataPointViewState={viewState.sourcePointViewState} onClick={onDataPointClick} />)
    }

    if (viewState.targetPointViewState) {
        dataPoints.push(<DataPoint dataPointViewState={viewState.targetPointViewState} onClick={onDataPointClick} />)
    }

    return (

        <g id="RecodWrapper" className="my-class">
            <rect render-order="-1" x={isMain ? viewState.bBox.x - 10 : viewState.bBox.x - (10 + DEFAULT_OFFSET)} y={viewState.bBox.y - 15} height="30" className="data-wrapper" />
            {/* <line
                x1={isMain ? viewState.bBox.x : viewState.bBox.x - (DEFAULT_OFFSET)}
                y1={viewState.bBox.y + 20}
                x2={isMain ? viewState.bBox.x + 190 : viewState.bBox.x + 150}
                y2={viewState.bBox.y + 20}
                strokeWidth="1"
                stroke="#d8dbe3"
            /> */}
            <g render-order="1" className="test">
                {isMain ?
                    (
                        <text render-order="1" x={viewState.bBox.x} y={viewState.bBox.y + 10} height="50" >
                            <tspan className="key-value"> {`${name}:`} </tspan>
                            <tspan className="value-para"> {`${type}`}  </tspan>
                        </text>
                    )
                    :
                    (
                        <text render-order="1" x={viewState.bBox.x} y={viewState.bBox.y + DefaultConfig.dotGap} height="50" >
                            <tspan className="value-para"> {`${name}:`} </tspan>
                            <tspan className="value-para"> {`${type}`}  </tspan>
                        </text>
                    )
                }
            </g>

            {fields}
            {fields.length === 0 && dataPoints}
        </g>
    );
}
