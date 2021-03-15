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

import { SimpleBBox } from "../../../../../view-state";
import { DataPointViewstate } from "../../../viewstate";

interface ValueTypeProps {
    viewState: DataPointViewstate;
    isMain?: boolean;
    handleSelection: (path: string, position: SimpleBBox) => void;
}

export function ValueType(props: ValueTypeProps) {
    const { viewState, isMain, handleSelection } = props;

    const name = viewState.name;
    const type = viewState.isArray ? viewState.collectionDataType : viewState.type;

    const handleSelectionEvent = () => {
        handleSelection(name ? name : '', viewState.bBox);
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
                onClick={handleSelectionEvent}
            >
                {`${name ? `${name}:` : ''} ${type}${viewState.isArray ? '[]' : ''}`}
            </text>
        </g>
    )
}
