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
import React, { useContext, useEffect, useRef, useState } from 'react';

import { Tooltip } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { LocalVarDecl, MappingConstructor, RecordTypeDesc, STKindChecker, STNode } from '@wso2-enterprise/syntax-tree';
import classNames from 'classnames';

import { Context as DiagramContext } from '../../../../../../../../../Contexts/Diagram';
import { DefaultConfig } from '../../../../../../../../../Diagram/visitors/default';
import { DeleteSVG } from '../../../../../../Components/DiagramActions/DeleteBtn/DeleteSVG';
import { getDataMapperComponent, hasReferenceConnections } from '../../../util';
import { DEFAULT_OFFSET } from '../../../util/data-mapper-position-visitor';
import { FieldViewState, SourcePointViewState, TargetPointViewState } from '../../../viewstate';
import { DataPoint } from '../../DataPoint';
import "../style.scss";

interface RecordTypeProps {
    model: STNode;
    isMain?: boolean;
    isTarget?: boolean;
    onDataPointClick?: (dataPointVS: SourcePointViewState | TargetPointViewState) => void;
    offSetCorrection: number;
    removeInputType?: (model: STNode) => void;
}

export function RecordType(props: RecordTypeProps) {
    const { model, isMain, onDataPointClick, offSetCorrection, isTarget, removeInputType } = props;
    const svgTextRef = useRef(null);
    const hasConnections = hasReferenceConnections(model);

    const [isMouseOver, setIsMouseOver] = useState(false);
    const [textWidth, setTextWidth] = useState(0);

    const viewState: FieldViewState = model.dataMapperViewState as FieldViewState;
    const name = viewState.name;
    const typeInfo = viewState.typeInfo;
    let type;

    if (!viewState.hasInlineRecordDescription) {
        type = `${typeInfo.moduleName}:${typeInfo.name}`;
    }

    const fields: JSX.Element[] = [];
    const dataPoints: JSX.Element[] = [];

    let hasMappinConstructor = false;

    if (STKindChecker.isLocalVarDecl(model)) {
        hasMappinConstructor = STKindChecker.isMappingConstructor(model.initializer);
    } else if (STKindChecker.isAssignmentStatement(model)) {
        hasMappinConstructor = STKindChecker.isMappingConstructor(model.expression);
    } else if (STKindChecker.isSpecificField(model)) {
        hasMappinConstructor = STKindChecker.isMappingConstructor(model.valueExpr);
    }

    if (hasMappinConstructor) {
        let mappingConstructorNode: MappingConstructor;
        if (STKindChecker.isLocalVarDecl(model)) {
            mappingConstructorNode = model.initializer as MappingConstructor;
        } else if (STKindChecker.isAssignmentStatement(model)) {
            mappingConstructorNode = model.expression as MappingConstructor;
        } else if (STKindChecker.isSpecificField(model)) {
            mappingConstructorNode = model.valueExpr as MappingConstructor;
        }

        mappingConstructorNode.fields
            .filter(field => !STKindChecker.isCommaToken(field))
            .forEach(field => {
                const fieldVS = field.dataMapperViewState
                fields.push(getDataMapperComponent(
                    fieldVS.type,
                    { model: field, onDataPointClick, offSetCorrection: offSetCorrection + DEFAULT_OFFSET }
                ));
            });
    } else {
        if (model.dataMapperTypeDescNode) {
            const typeDescNode = model.dataMapperTypeDescNode as RecordTypeDesc;
            typeDescNode.fields.forEach((field: any) => {
                const fieldVS = field.dataMapperViewState
                fields.push(getDataMapperComponent(fieldVS.type,
                    { model: field, onDataPointClick, offSetCorrection: offSetCorrection + DEFAULT_OFFSET }));
            })
        } else if (viewState.hasInlineRecordDescription) {
            if (STKindChecker.isLocalVarDecl(model)) {
                const typedBindingPattern = (model as LocalVarDecl).typedBindingPattern;
                const typeDescNode = typedBindingPattern.typeDescriptor;

                if (STKindChecker.isRecordTypeDesc(typeDescNode)) {
                    typeDescNode.fields.forEach((field: any) => {
                        const fieldVS = field.dataMapperViewState
                        fields.push(getDataMapperComponent(
                            fieldVS.type,
                            { model: field, onDataPointClick, offSetCorrection: offSetCorrection + DEFAULT_OFFSET }
                        ));
                    });
                }
            } else if (STKindChecker.isRecordField(model)) {
                const typeName = model.typeName;
                if (STKindChecker.isRecordTypeDesc(typeName)) {
                    typeName.fields.forEach((field: any) => {
                        const fieldVS = field.dataMapperViewState
                        fields.push(getDataMapperComponent(
                            fieldVS.type,
                            { model: field, onDataPointClick, offSetCorrection: offSetCorrection + DEFAULT_OFFSET }
                        ));
                    });
                }
            }
        }
    }


    if (viewState.sourcePointViewState) {
        dataPoints.push(<DataPoint dataPointViewState={viewState.sourcePointViewState} onClick={onDataPointClick} />);
    }

    if (viewState.targetPointViewState) {
        dataPoints.push(<DataPoint dataPointViewState={viewState.targetPointViewState} onClick={onDataPointClick} />);
    }

    useEffect(() => {
        if (!isTarget && svgTextRef.current) {
            setTextWidth(svgTextRef.current.getComputedTextLength())
        }
    }, []);

    const handleOnRectangleHover = (evt: any) => {
        if (isMain) {
            setIsMouseOver(true);
        }
    }

    const handleOnMouseOut = (evt: any) => {
        if (isMain) {
            setIsMouseOver(false)
        }
    }

    const handleOnDeleteClick = (evt: any) => {
        if (!hasConnections && !isTarget) {
            removeInputType(model);
        }
    }

    const isNameTooLong = `${name}: ${type}${viewState.isOptionalType ? '?' : ''}`.length > 20;

    return (

        <g
            data-testid={'datamapper-variable-wrapper'}
            id="RecodWrapper"
            className="my-class"
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
            <g render-order="1" className="test">
                {isMain ?
                    (
                        <>
                            <text
                                render-order="1"
                                x={viewState.bBox.x}
                                y={viewState.bBox.y + 10}
                                height="50"
                                width={100}
                                ref={svgTextRef}
                                style={{ textOverflow: 'ellipsis' }}
                            >
                                {!isNameTooLong ?
                                    (
                                        <>
                                            <tspan className="key-value"> {`${name}`} </tspan>
                                            {
                                                type && (
                                                    <tspan className="value-para">
                                                        {`: ${type}${viewState.isOptionalType ? '?' : ''}`}
                                                    </tspan>
                                                )
                                            }
                                        </>
                                    ) :
                                    (
                                        <Tooltip
                                            arrow={true}
                                            placement="top-start"
                                            title={`${name}: ${type}${viewState.isOptionalType ? '?' : ''}`}
                                            inverted={false}
                                            interactive={true}
                                        >
                                            <tspan className="key-value">
                                                {`${name}: ${type}${viewState.isOptionalType ? '?' : ''}`
                                                    .slice(0, 20) + "..."}
                                            </tspan>
                                        </Tooltip>
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
                        <text
                            render-order="1"
                            x={viewState.bBox.x}
                            y={viewState.bBox.y + DefaultConfig.dotGap}
                            height="50"
                        >
                            {
                                isNameTooLong ? (
                                    <Tooltip
                                        arrow={true}
                                        placement="top-start"
                                        title={`${name}: ${type}${viewState.isOptionalType ? '?' : ''}`}
                                        inverted={false}
                                        interactive={true}
                                    >
                                        <tspan className="value-para">
                                            {`${name}${type ? `: ${type}${viewState.isOptionalType ? '?' : ''}` : ''}`
                                                .slice(0, 20) + "..."}
                                        </tspan>
                                    </Tooltip>
                                ) : (
                                    <tspan className="value-para">
                                        {`${name}${type ? `: ${type}${viewState.isOptionalType ? '?' : ''}` : ''}`}
                                    </tspan>
                                )
                            }
                        </text>
                    )
                }
            </g>
            {fields}
            {fields.length === 0 && dataPoints}
        </g>
    );
}

