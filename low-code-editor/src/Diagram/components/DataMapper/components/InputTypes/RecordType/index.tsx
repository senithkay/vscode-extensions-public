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

import { RecordTypeDesc, STNode } from '@ballerina/syntax-tree';

import { getDataMapperComponent } from '../../../util';
import { InputVariableViewstate } from '../../../viewstate';

interface RecordTypeProps {
    model: STNode;
    isMain?: boolean;
}

export function RecordType(props: RecordTypeProps) {
    const { model, isMain } = props;

    const viewState: InputVariableViewstate = model.dataMapperViewState as InputVariableViewstate;
    const name = viewState.name;
    const typeInfo = viewState.typeInfo;

    const type = typeInfo.moduleName === '.' ? typeInfo.name : `${typeInfo.moduleName}:${typeInfo.name}`

    const fields: JSX.Element[] = []

    if (model.dataMapperTypeDescNode) {
        const typeDescNode = model.dataMapperTypeDescNode as RecordTypeDesc;
        typeDescNode.fields.forEach(field => {
            const fieldVS = field.dataMapperViewState
            fields.push(getDataMapperComponent(fieldVS.type, { model: field }));
        })
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
        </g>
    );
}
