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
import React, { useContext } from 'react';

import { RecordTypeDesc, STNode } from '@ballerina/syntax-tree';

import { Context as DiagramContext } from '../../../../../../Contexts/Diagram';
import { getDataMapperComponent } from '../../../util';
import { FieldViewState } from '../../../viewstate';
import { DataPoint } from '../../DataPoint';

interface RecordTypeProps {
    model: STNode;
    isMain?: boolean;
}

export function RecordType(props: RecordTypeProps) {
    const { state: { currentApp } } = useContext(DiagramContext);
    const { model, isMain } = props;

    const viewState: FieldViewState = model.dataMapperViewState as FieldViewState;
    const name = viewState.name;
    const typeInfo = viewState.typeInfo;

    const type = typeInfo.moduleName === currentApp.name ? typeInfo.name : `${typeInfo.moduleName}:${typeInfo.name}`;

    const fields: JSX.Element[] = [];
    const dataPoints: JSX.Element[] = [];

    if (model.dataMapperTypeDescNode) {
        const typeDescNode = model.dataMapperTypeDescNode as RecordTypeDesc;
        typeDescNode.fields.forEach(field => {
            const fieldVS = field.dataMapperViewState
            fields.push(getDataMapperComponent(fieldVS.type, { model: field }));
        })
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
            {fields}
            {dataPoints}
        </g>
    );
}
