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
import React, { useContext, useState } from 'react';

import { PrimitiveBalType } from '@wso2-enterprise/ballerina-low-code-edtior-commons';

import { updatePropertyStatement } from '../../../../../../../utils/modification-util';
import { DeleteSVG } from '../../../../../Components/DiagramActions/DeleteBtn/DeleteSVG';
import { Context as DataMapperContext } from '../../context/DataMapperViewContext';
import { PADDING_OFFSET } from '../../util/data-mapper-position-visitor';
import { ConnectionViewState } from '../../viewstate';

interface MappingArrowProps {
    connectionViewstate: ConnectionViewState;
    keyId: string;
    mouseEventHub?: any;
    disableEdit?: boolean
}

export function MappingArrow(props: MappingArrowProps) {
    const { state: { dispatchMutations } } = useContext(DataMapperContext);
    const { connectionViewstate: connection, keyId, disableEdit } = props;
    const [isCursorInProximity, setIsCursorInProximity] = useState<boolean>(false);

    const x1 = connection.x1 + PADDING_OFFSET;
    const x2 = connection.x2 - (PADDING_OFFSET + 40)
    const y1 = connection.y1;
    const y2 = connection.y2;

    // midpoint calculation (delete btn positionj)
    const midPointX = (x1 + x2) / 2;
    const midPointY = (y1 + y2) / 2;

    const handleOnMouseOverArrow = (evt: any) => {
        evt.stopPropagation();
        setIsCursorInProximity(true);
    }

    const handleOnMouseExitArrow = (evt: any) => {
        evt.stopPropagation();
        setIsCursorInProximity(false);
    }

    const handleDeleteBtnClick = () => {
        let statement = '';

        switch (connection.targetType) {
            case PrimitiveBalType.String:
                statement = '""';
                break;
            case PrimitiveBalType.Int:
                statement = '0';
                break;
            case PrimitiveBalType.Float:
                statement = '0';
                break;
            case PrimitiveBalType.Boolean:
                statement = 'false';
                break;
            case PrimitiveBalType.Union:
                if (connection.targetUnionType === 'int|float') {
                    statement = '0';
                }
                break;
            case PrimitiveBalType.Json:
                statement = '""';
            default:
            // ignored
        }

        const modificationStatement = updatePropertyStatement(statement, connection.targetPosition);
        dispatchMutations([modificationStatement]);
    }

    return (
        <g data-testid={'datamapper-mapping-arrow'} onMouseOver={handleOnMouseOverArrow} onMouseLeave={handleOnMouseExitArrow} >
            <line
                x1={connection.x1 + PADDING_OFFSET}
                x2={connection.x2 - (PADDING_OFFSET + 40)}
                y1={connection.y1}
                y2={connection.y2}
                className="connect-line"
                markerEnd="url(#arrowhead)"
            />
            <line
                x1={connection.x1 + PADDING_OFFSET}
                x2={connection.x2 - (PADDING_OFFSET + 40)}
                y1={connection.y1}
                y2={connection.y2}
                className="connect-line"
                style={{
                    strokeWidth: 10,
                    opacity: 0
                }}
            />
            {!disableEdit && isCursorInProximity && (
                <g data-testid={'datamapper-mapping-arrow-delete-btn'} id='arrow-delete-icon' className={'delete-icon-show'} onClick={handleDeleteBtnClick} >
                    <DeleteSVG x={midPointX} y={midPointY - 10} />
                </g>
            )}
        </g>
    )
}
