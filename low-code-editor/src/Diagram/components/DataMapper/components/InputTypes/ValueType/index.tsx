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
import React, { useContext, useEffect, useRef, useState } from 'react';

import { STNode } from "@ballerina/syntax-tree";
import classNames from 'classnames';

import { DefaultConfig } from '../../../../../../../../low-code-editor/src/Diagram/visitors/default';
import { PrimitiveBalType } from '../../../../../../ConfigurationSpec/types';
import { removeStatement } from '../../../../../../Diagram/utils/modification-util';
import { DraftUpdatePosition } from '../../../../../../Diagram/view-state/draft';
import { DeleteSVG } from '../../../../DiagramActions/DeleteBtn/DeleteSVG';
import { Context as DataMapperContext } from '../../../context/DataMapperViewContext';
import { hasReferenceConnections } from '../../../util';
import { FieldViewState, SourcePointViewState, TargetPointViewState } from "../../../viewstate";
import { DataPoint } from '../../DataPoint';
import "../style.scss";

interface ValueTypeProps {
    model: STNode;
    isMain?: boolean;
    isTarget?: boolean;
    onDataPointClick?: (dataPointVS: SourcePointViewState | TargetPointViewState) => void;
    offSetCorrection: number;
    removeInputType?: (model: STNode) => void;
    isJsonField?: boolean;
    commaPosition?: DraftUpdatePosition;
    isLastField?: boolean;
}

export function ValueType(props: ValueTypeProps) {
    const { state: { dispatchMutations } } = useContext(DataMapperContext);
    const { model, isMain, onDataPointClick, offSetCorrection, removeInputType, isTarget, isJsonField, commaPosition, isLastField } = props;
    const viewState: FieldViewState = model.dataMapperViewState as FieldViewState;
    const svgTextRef = useRef(null);

    const [isMouseOver, setIsMouseOver] = useState(false);
    const [textWidth, setTextWidth] = useState(0);
    const hasConnections = hasReferenceConnections(model);

    const dataPoints: JSX.Element[] = [];

    let name: string = viewState.name;
    const type: string = viewState.type && viewState.type === PrimitiveBalType.Union ?
        viewState.unionType
        : viewState.type;

    const regexPattern = new RegExp(/^"(\w+)\"$/);

    if (regexPattern.test(name)) {
        const matchedVal = regexPattern.exec(name);
        name = matchedVal[1];
    }

    if (viewState.sourcePointViewState) {
        dataPoints.push(<DataPoint dataPointViewState={viewState.sourcePointViewState} onClick={onDataPointClick} />)
    }

    if (viewState.targetPointViewState) {
        dataPoints.push(<DataPoint dataPointViewState={viewState.targetPointViewState} onClick={onDataPointClick} />)
    }

    const handleOnDeleteClick = (evt: any) => {
        if (!hasConnections && !isTarget) {
            removeInputType(model);
        }
    }

    useEffect(() => {
        if (svgTextRef.current) {
            setTextWidth(svgTextRef.current.getComputedTextLength())
        }
    }, []);

    const handleOnRectangleHover = (evt: any) => {
        setIsMouseOver(true);
    }

    const handleOnMouseOut = (evt: any) => {
        setIsMouseOver(false)
    }

    const handleJsonFieldDelete = (evt: any) => {
        const modifications = []
        if (isLastField) {
            const draftUpdatePosition: DraftUpdatePosition = {
                startLine: commaPosition ? commaPosition.startLine : model.position?.startLine,
                endLine: model.position?.endLine,
                startColumn: commaPosition ? commaPosition.startColumn : model.position?.startColumn,
                endColumn: model.position?.endColumn
            }

            modifications.push(removeStatement(draftUpdatePosition));

        } else {

            const draftUpdatePosition: DraftUpdatePosition = {
                startLine: model.position?.startLine,
                endLine: commaPosition ? commaPosition.endLine : model.position?.endLine,
                startColumn: model.position?.startColumn,
                endColumn: commaPosition ? commaPosition.endColumn : model.position?.endColumn
            }

            modifications.push(removeStatement(draftUpdatePosition));
        }

        dispatchMutations(modifications);
    }

    const isNameTooLong = `${name}: ${type}${viewState.isOptionalType ? '?' : ''}`.length > 20;

    return (
        <g
            data-testid={'datamapper-variable-wrapper'}
            id="Value-wrapper"
            onMouseOver={handleOnRectangleHover}
            onMouseOut={handleOnMouseOut}
        >
            <rect
                data-testid={'datamapper-variable-rect'}
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
                        <>
                            <text
                                render-order="1"
                                x={viewState.bBox.x}
                                y={viewState.bBox.y + 10}
                                height="50"
                                ref={svgTextRef}
                            >
                                {!isNameTooLong ?
                                    (

                                        <>
                                            <tspan className="key-value"> {`${name}:`} </tspan>
                                            <tspan className="value-para">
                                                {`${type}${viewState.isOptionalType ? '?' : ''}`}
                                            </tspan>
                                        </>
                                    ) : (
                                        <tspan className="key-value">
                                            {`${name}: ${type}${viewState.isOptionalType ? '?' : ''}`
                                                .slice(0, 20) + '...'}
                                        </tspan>
                                    )
                                }
                            </text>
                            {!isTarget && (
                                <g
                                    data-testid={'datamapper-input-variable-remove-btn'}
                                    className={classNames('delete-icon-show', { disable: hasConnections })}
                                    style={{ display: isMouseOver ? 'block' : 'none' }}
                                    onClick={handleOnDeleteClick}
                                >
                                    <DeleteSVG x={viewState.bBox.x + textWidth + 5} y={viewState.bBox.y - 5} />
                                </g>
                            )}
                        </>
                    )
                    :
                    (
                        <>
                            <text
                                render-order="1"
                                x={viewState.bBox.x}
                                y={viewState.bBox.y + DefaultConfig.dotGap}
                                height="50"
                                ref={svgTextRef}
                            >
                                <tspan className="value-para">
                                    {
                                        !isNameTooLong ?
                                            `${name}: ${type}${viewState.isOptionalType ? '?' : ''}`
                                            : `${name}: ${type}${viewState.isOptionalType ? '?' : ''}`
                                                .slice(0, 20) + '...'
                                    }
                                </tspan>
                            </text>
                            {isTarget && isJsonField && (
                                <g
                                    className={classNames('delete-icon-show', { disable: hasConnections })}
                                    style={{ display: isMouseOver ? 'block' : 'none' }}
                                    onClick={handleJsonFieldDelete}
                                >
                                    <DeleteSVG x={viewState.bBox.x + textWidth + 5} y={viewState.bBox.y - 5} />
                                </g>
                            )}
                        </>
                    )
                }
            </g>
            {dataPoints}
        </g>

    );
}
