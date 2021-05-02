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

import { LocalVarDecl, MappingConstructor, RecordTypeDesc, SpecificField, STNode } from '@ballerina/syntax-tree';

import { getDataMapperComponent } from '../../../util';
import { InputVariableViewstate } from '../../../viewstate';

interface JsonTypeProps {
    model: STNode;
    isMain?: boolean;
}

export function JsonType(props: JsonTypeProps) {
    const { model, isMain } = props;

    const viewState: InputVariableViewstate = model.dataMapperViewState as InputVariableViewstate;
    let name = viewState.name;
    const type = viewState.type;

    const fields: JSX.Element[] = []

    switch (type) {
        case 'json':

            if (viewState.mappedConstructorInitializer) {
                const initializer: MappingConstructor = (model as LocalVarDecl).initializer as MappingConstructor;

                if (initializer) {
                    initializer.fields.filter(field => field.kind !== 'CommaToken').forEach(field => {
                        const fieldVS = field.dataMapperViewState;
                        fields.push(getDataMapperComponent(fieldVS.type, { model: field }));
                    });
                }

            } else if (model.dataMapperTypeDescNode) {
                // todo: handle from typedesc node when json sample is given for input
            }
            break;
        case 'map':
            const fieldModel: MappingConstructor = (model as SpecificField).valueExpr as MappingConstructor;

            const regexPattern = new RegExp(/^"(\w+)\"$/);

            if (regexPattern.test(name)) {
                const matchedVal = regexPattern.exec(name);
                name = matchedVal[1];
            }

            fieldModel.fields.filter(field => field.kind !== 'CommaToken').forEach(field => {
                const fieldVS = field.dataMapperViewState;
                fields.push(getDataMapperComponent(fieldVS.type, { model: field }));
            });
            break;
        default:
        // ignored
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
                {`${name}${type === 'map' ? '' : `: ${type}`}`}
            </text>
            {fields}
        </g>
    );
}
