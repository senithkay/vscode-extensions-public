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
import React from 'react';

import { LocalVarDecl, MappingConstructor, RecordTypeDesc, SpecificField, STNode } from '@ballerina/syntax-tree';

import { DefaultConfig } from '../../../../../../../../low-code-editor/src/Diagram/visitors/default';
import { getDataMapperComponent } from '../../../util';
import { DEFAULT_OFFSET } from '../../../util/data-mapper-position-visitor';
import { FieldViewState, SourcePointViewState, TargetPointViewState } from '../../../viewstate';
import { DataPoint } from '../../DataPoint';
import "../style.scss";

interface JsonTypeProps {
    model: STNode;
    isMain?: boolean;
    onDataPointClick?: (dataPointVS: SourcePointViewState | TargetPointViewState) => void;
    offSetCorrection: number;
}

export function JsonType(props: JsonTypeProps) {
    const { model, isMain, onDataPointClick, offSetCorrection } = props;

    const viewState: FieldViewState = model.dataMapperViewState as FieldViewState;
    let name = viewState.name;
    const type = viewState.type;

    const fields: JSX.Element[] = [];
    const dataPoints: JSX.Element[] = [];

    switch (type) {
        case 'json':

            if (viewState.hasMappedConstructorInitializer) {
                const initializer: MappingConstructor = (model as LocalVarDecl).initializer as MappingConstructor;

                if (initializer) {
                    initializer.fields.filter(field => field.kind !== 'CommaToken').forEach(field => {
                        const fieldVS = field.dataMapperViewState;
                        fields.push(getDataMapperComponent(fieldVS.type, { model: field, onDataPointClick, offSetCorrection: offSetCorrection + DEFAULT_OFFSET }));
                    });
                }
            } else if (model.dataMapperTypeDescNode) {
                // todo: handle from typedesc node when json sample is given for input
            }
            break;
        case 'mapconstructor':
            const fieldModel: MappingConstructor = (model as SpecificField).valueExpr as MappingConstructor;

            const regexPattern = new RegExp(/^"(\w+)\"$/);

            if (regexPattern.test(name)) {
                const matchedVal = regexPattern.exec(name);
                name = matchedVal[1];
            }

            fieldModel.fields.filter(field => field.kind !== 'CommaToken').forEach(field => {
                const fieldVS = field.dataMapperViewState;
                fields.push(getDataMapperComponent(fieldVS.type, { model: field, onDataPointClick, offSetCorrection: offSetCorrection + DEFAULT_OFFSET }));
            });
            break;
        default:
        // ignored
    }

    if (viewState.sourcePointViewState) {
        dataPoints.push(<DataPoint dataPointViewState={viewState.sourcePointViewState} onClick={onDataPointClick} />)
    }

    if (viewState.targetPointViewState) {
        dataPoints.push(<DataPoint dataPointViewState={viewState.targetPointViewState} onClick={onDataPointClick} />)
    }

    return (

        <g id="JsonWrapper" >
            <rect
                render-order="-1"
                x={viewState.bBox.x - offSetCorrection}
                y={viewState.bBox.y - 15}
                height={viewState.bBox.h}
                width={viewState.bBox.w}
                className="data-wrapper"
            />
            <g render-order="1">
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
            <g render-order="1" >
                <text
                    x={viewState.bBox.x + viewState.bBox.w - 40}
                    y={viewState.bBox.y + DefaultConfig.dotGap + 5}
                    height="50"
                >
                    <tspan className="plus-symbol"> + </tspan>
                </text>
            </g>
            {fields}
            {/* {dataPoints} */}
        </g>
    );
}
