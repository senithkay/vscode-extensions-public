/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React from 'react';

import { FunctionDefinition, IdentifierToken, RequiredParam, STKindChecker } from "@ballerina/syntax-tree";
import classNames from 'classnames';

import { FunctionViewState } from '../../../view-state';

interface FunctionSignatureProps {
    model: FunctionDefinition;
    onExpandClick: () => void;
}

export function FunctionSignature(props: FunctionSignatureProps) {
    const { model, onExpandClick } = props;
    const viewState: FunctionViewState = model.viewState as FunctionViewState;

    const component: JSX.Element[] = [];

    const rectProps = {
        x: viewState.bBox.cx,
        y: viewState.bBox.cy,
        width: viewState.bBox.w,
        height: viewState.bBox.h,
    };

    if (STKindChecker.isResourceAccessorDefinition(model)) {
        const functionSignature = model.functionSignature;
        const functionName: IdentifierToken = model.functionName as IdentifierToken;

        let pathConstruct = '';

        model.relativeResourcePath.forEach(resourceMember => {
            switch (resourceMember.kind) {
                case 'IdentifierToken':
                case 'SlashToken':
                    pathConstruct += resourceMember.value;
                    break;
                default:
                    pathConstruct += resourceMember.source;
            }
        });

        const queryParamComponents: JSX.Element[] = [];
        const otherParamComponents: JSX.Element[] = [];

        functionSignature.parameters
            .filter((param) => STKindChecker.isRequiredParam(param)
                && (STKindChecker.isStringTypeDesc(param.typeName) || STKindChecker.isIntTypeDesc(param.typeName)
                    || STKindChecker.isBooleanTypeDesc(param.typeName) || STKindChecker.isFloatTypeDesc(param.typeName)
                    || STKindChecker.isDecimalTypeDesc(param.typeName)))
            .forEach((param: RequiredParam, i) => {
                queryParamComponents.push((
                    <>
                        {i !== 0 ? '&' : ''}
                        {param.paramName.value}
                        <span ><sub>{(param.typeName as any)?.name?.value}</sub></span>
                    </>
                ));
            });

        functionSignature.parameters
            .filter((param) => STKindChecker.isRequiredParam(param)
                && !(STKindChecker.isStringTypeDesc(param.typeName) || STKindChecker.isIntTypeDesc(param.typeName)
                    || STKindChecker.isBooleanTypeDesc(param.typeName) || STKindChecker.isFloatTypeDesc(param.typeName)
                    || STKindChecker.isDecimalTypeDesc(param.typeName)))
            .forEach((param: RequiredParam, i) => {
                otherParamComponents.push(
                    <span>{param.source}</span>
                )
            });

        component.push((
            <div
                className={
                    classNames(
                        'function-signature',
                        STKindChecker.isResourceAccessorDefinition(model) ? model.functionName.value : ''
                    )
                }
            >
                <div className={'param-container'} >
                    <div
                        className={
                            classNames(
                                'resource-badge',
                                STKindChecker.isResourceAccessorDefinition(model) ? model.functionName.value : ''
                            )
                        }
                    >
                        <p className={'text'}>{model.functionName.value.toUpperCase()}</p>
                    </div>
                    <p className={'path-text'} >{pathConstruct}{queryParamComponents.length > 0 ? '?' : ''}{queryParamComponents}</p>
                </div>
                <div className={'param-container'} >
                    <p className={'path-text'} >{otherParamComponents}</p>
                </div>
                <div >
                    <p onClick={onExpandClick} className={'path-text'} >expand</p>
                </div>
            </div>
        ));
    } else {
        const functionSignature = model.functionSignature;
        const functionName: IdentifierToken = model.functionName as IdentifierToken;

        const params: JSX.Element[] = [];
        functionSignature.parameters
            .forEach((param: RequiredParam, i) => {
                params.push(
                    <tspan dx={i > 0 ? 10 : 0}>{param.source}</tspan>
                )
            })

        component.push((
            <div
                className={
                    classNames(
                        'function-signature',
                        STKindChecker.isResourceAccessorDefinition(model) ? model.functionName.value : ''
                    )
                }
            >
                <p className={'path-text'}>{functionName.value}</p>
            </div>
        ));
    }

    return (
        <>
            {component}
        </>
    )
}
