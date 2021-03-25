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

import { RecordTypeDesc, STNode } from "@ballerina/syntax-tree";

import { SimpleBBox } from "../../../../../view-state";
import { getDataMapperComponent } from "../../../util";
import { TypeDescViewState } from "../../../viewstate";

interface RecordTypeProps {
    model: STNode;
    isMain?: boolean;
    handleSelection: (path: string, position: SimpleBBox) => void;
}

export function RecordType(props: RecordTypeProps) {
    const { isMain, handleSelection, model } = props;
    const viewState = model.dataMapperViewState as TypeDescViewState;

    const handleSelectionEvent = (path: string, position: SimpleBBox) => {
        handleSelection(`${viewState.name}${path.length ? `.${path}` : ''}`, position);
    }

    const handleOnClick = () => {
        handleSelectionEvent('', viewState.bBox);
    }

    const childComponents: any = [];

    if (model.dataMapperTypeDescNode) {
        switch (model.dataMapperTypeDescNode.kind) {
            case 'RecordTypeDesc':
                (model.dataMapperTypeDescNode as RecordTypeDesc).fields.forEach(field => {
                    childComponents.push(getDataMapperComponent(field.dataMapperViewState.type, {
                        handleSelection: handleSelectionEvent,
                        model: field
                    }));
                })
                break;
        }
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
                onClick={handleOnClick}
            >
                {`${viewState.name ? `${viewState.name}: ` : ''}${viewState.type}`}
            </text>
            {childComponents}
        </g>
    )
}
