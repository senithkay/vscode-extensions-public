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

import { LocalVarDecl, MappingConstructor, RecordTypeDesc, SpecificField, STKindChecker, STNode } from '@ballerina/syntax-tree';
import classNames from 'classnames';

import { DefaultConfig } from '../../../../../../../../low-code-editor/src/Diagram/visitors/default';
import { removeStatement } from '../../../../../../Diagram/utils/modification-util';
import { DraftUpdatePosition } from '../../../../../../Diagram/view-state/draft';
import { DeleteSVG } from '../../../../DiagramActions/DeleteBtn/DeleteSVG';
import { Context as DataMapperViewContext } from '../../../context/DataMapperViewContext';
import { getDataMapperComponent, hasReferenceConnections } from '../../../util';
import { DEFAULT_OFFSET } from '../../../util/data-mapper-position-visitor';
import { FieldViewState, SourcePointViewState, TargetPointViewState } from '../../../viewstate';
import { DraftFieldViewstate } from '../../../viewstate/draft-field-viestate';
import { AttributeTypeDraftButton } from '../../buttons/AttributeTypeDraftButton';
import { ObjectTypeDraftButton } from '../../buttons/ObjectTypeDraftButton';
import { DataPoint } from '../../DataPoint';
import { JsonFieldTypes } from '../../forms/DraftFieldForm';
import "../style.scss";

interface JsonTypeProps {
    model?: STNode;
    isMain?: boolean;
    onDataPointClick?: (dataPointVS: SourcePointViewState | TargetPointViewState) => void;
    onAddFieldButtonClick?: () => void;
    offSetCorrection: number;
    draftFieldViewstate?: DraftFieldViewstate;
    isTarget?: boolean;
    removeInputType?: (model: STNode) => void;
    commaPosition?: DraftUpdatePosition;
    isLastField?: boolean;
}

export function JsonType(props: JsonTypeProps) {
    const { state: { dispatchMutations } } = useContext(DataMapperViewContext);
    const { model, isMain, onDataPointClick, offSetCorrection, onAddFieldButtonClick,
            isTarget, removeInputType, commaPosition, isLastField } = props;
    const svgTextRef = useRef(null);
    const hasConnections = hasReferenceConnections(model);

    const [isMouseOver, setIsMouseOver] = useState(false);
    const [textWidth, setTextWidth] = useState(0);

    const fields: JSX.Element[] = [];
    const dataPoints: JSX.Element[] = [];
    const drafts: JSX.Element[] = [];

    const handleAddFieldBtnClick = (fieldType: JsonFieldTypes) => {
        // viewState.test = true;
        const draftVS = new DraftFieldViewstate();
        draftVS.fieldType = fieldType;
        // draftVS.name = '';
        // draftVS.type = FieldDraftType.STRING;
        let expression: MappingConstructor;

        if (STKindChecker.isLocalVarDecl(model)) {
            if (model.initializer && STKindChecker.isMappingConstructor(model.initializer)) {
                expression = model.initializer;
            }
        } else if (STKindChecker.isAssignmentStatement(model)) {
            // TODO: handle assignment type
            if (model.expression && STKindChecker.isMappingConstructor(model.expression)) {
                expression = model.expression;
            }
        } else if (STKindChecker.isSpecificField(model)) {
            if (model.valueExpr && STKindChecker.isMappingConstructor(model.valueExpr)) {
                expression = model.valueExpr;
            }
        }

        if (expression) {
            const closeBracePosition = expression.closeBrace.position;

            draftVS.precededByComma = expression.fields.length > 0 ?
                STKindChecker.isCommaToken(expression.fields[expression.fields.length - 1]) :
                true

            draftVS.draftInsertPosition = {
                startLine: undefined,
                endLine: undefined,
                startColumn: undefined,
                endColumn: undefined
            };
            draftVS.draftInsertPosition.startLine = closeBracePosition.endLine;
            draftVS.draftInsertPosition.startColumn = closeBracePosition.endColumn - 1;
            draftVS.draftInsertPosition.endLine = closeBracePosition.endLine;
            draftVS.draftInsertPosition.endColumn = closeBracePosition.endColumn - 1;
        }

        viewState.draftViewState = draftVS;

        onAddFieldButtonClick();
    }

    const viewState: FieldViewState = model.dataMapperViewState as FieldViewState;
    let name = viewState.name;
    let type = viewState.type;

    switch (type) {
        case 'json':
            if (viewState.hasMappedConstructorInitializer) {
                const initializer: MappingConstructor = (model as LocalVarDecl).initializer as MappingConstructor;

                if (initializer) {
                    initializer.fields.forEach((field, i) => {
                        if (!STKindChecker.isCommaToken(field)) {
                            const fieldVS = field.dataMapperViewState;
                            let adjascentCommaPosition;

                            if (i < initializer.fields.length - 2) {
                                const adjascentElement = initializer.fields[i + 1];
                                if (STKindChecker.isCommaToken(adjascentElement)) {
                                    adjascentCommaPosition = adjascentElement.position;
                                }
                            } else if (i === initializer.fields.length - 1 && i !== 0) {
                                const adjascentElement = initializer.fields[i - 1];
                                if (STKindChecker.isCommaToken(adjascentElement)) {
                                    adjascentCommaPosition = adjascentElement.position;
                                }
                            }

                            fields.push(
                                getDataMapperComponent(
                                    fieldVS.type,
                                    {
                                        model: field,
                                        onDataPointClick,
                                        offSetCorrection: offSetCorrection + DEFAULT_OFFSET,
                                        onAddFieldButtonClick,
                                        isTarget,
                                        isJsonField: true,
                                        commaPosition: adjascentCommaPosition,
                                        isLastField: i === initializer.fields.length - 1
                                    }
                                )
                            );
                        }
                    });
                }
            } else if (model.dataMapperTypeDescNode) {
                // todo: handle from typedesc node when json sample is given for input
            }
            break;
        case 'mapconstructor':
            const fieldModel: MappingConstructor = (model as SpecificField).valueExpr as MappingConstructor;
            type = 'json';

            const regexPattern = new RegExp(/^"(\w+)\"$/);

            if (regexPattern.test(name)) {
                const matchedVal = regexPattern.exec(name);
                name = matchedVal[1];
            }

            fieldModel.fields.forEach((field, i) => {
                if (!STKindChecker.isCommaToken(field)) {
                    const fieldVS = field.dataMapperViewState;
                    let adjascentCommaPosition;

                    if (i < fieldModel.fields.length - 2) {
                        const adjascentElement = fieldModel.fields[i + 1];
                        if (STKindChecker.isCommaToken(adjascentElement)) {
                            adjascentCommaPosition = adjascentElement.position;
                        }
                    } else if (i === fieldModel.fields.length - 1 && i !== 0) {
                        const adjascentElement = fieldModel.fields[i - 1];
                        if (STKindChecker.isCommaToken(adjascentElement)) {
                            adjascentCommaPosition = adjascentElement.position;
                        }
                    }

                    fields.push(
                        getDataMapperComponent(
                            fieldVS.type,
                            {
                                model: field,
                                onDataPointClick,
                                offSetCorrection: offSetCorrection + DEFAULT_OFFSET,
                                onAddFieldButtonClick,
                                isTarget,
                                isJsonField: true,
                                fieldModel,
                                isLastField: i === fieldModel.fields.length - 1,
                                commaPosition: adjascentCommaPosition
                            }
                        )
                    );
                }
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

    const onDraftCancel = () => {
        viewState.draftViewState = null;
        onAddFieldButtonClick();
    }

    if (viewState.draftViewState) {
        drafts.push(getDataMapperComponent(
            "draft",
            {
                onDraftCancel,
                offSetCorrection,
                draftFieldViewState: viewState.draftViewState
            }
        ))
    }

    useEffect(() => {
        if (svgTextRef.current) {
            setTextWidth(svgTextRef.current.getComputedTextLength())
        }
    }, []);

    const handleOnRectangleHover = (evt: any) => {
        // if (isMain) {
        setIsMouseOver(true);
        // }
    }

    const handleOnMouseOut = (evt: any) => {
        // if (isMain) {
        setIsMouseOver(false)
        // }
    }

    const handleOnDeleteClick = (evt: any) => {
        if (!hasConnections && !isTarget) {
            removeInputType(model);
        }
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

    return (

        <g
            data-testid={'datamapper-variable-wrapper'}
            id="JsonWrapper"
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
                                <tspan className="key-value"> {`${name}:`} </tspan>
                                <tspan className="value-para"> {`${type}`}  </tspan>
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
                                <tspan className="value-para"> {`${name}:`} </tspan>
                                <tspan className="value-para"> {`${type}`}  </tspan>
                            </text>
                            {isTarget && (
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
            {isTarget && (
                <g render-order="1" >
                    <AttributeTypeDraftButton
                        x={viewState.bBox.x + viewState.bBox.w - 40 - offSetCorrection - 2}
                        y={viewState.bBox.y + DefaultConfig.dotGap + 5 - 14}
                        handleClick={handleAddFieldBtnClick}
                    />
                    <ObjectTypeDraftButton
                        x={viewState.bBox.x + viewState.bBox.w - 40 - offSetCorrection + 18}
                        y={viewState.bBox.y + DefaultConfig.dotGap + 5 - 14}
                        handleClick={handleAddFieldBtnClick}
                    />
                </g>
            )}
            {fields}
            {drafts}
            {/* {dataPoints} */}
        </g>
    );
}
