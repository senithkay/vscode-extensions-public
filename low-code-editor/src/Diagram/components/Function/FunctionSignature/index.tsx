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
import React from 'react';

import { FunctionDefinition, IdentifierToken, STKindChecker } from "@ballerina/syntax-tree";

import { FunctionViewState } from '../../../view-state';

interface FunctionSignatureProps {
    model: FunctionDefinition;
}

export function FunctionSignature(props: FunctionSignatureProps) {
    const { model } = props;
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

        functionSignature.parameters.forEach(param => {
            if (STKindChecker.isRequiredParam(param)) {
                if (param.annotations.length === 0) {
                    
                }
            }
        })

        component.push((
            <>
                <svg
                    x={rectProps.x + 10}
                    y={rectProps.y + 10}
                    height={32}
                    width={74}
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    xmlSpace="preserve"
                >
                    <rect
                        className={'resource-badge'}
                        height={32}
                        width={74}
                        rx={4}
                        x={0}
                        y={0}
                    />
                    <text className={'resource-badge-text'} x={"50%"} y={"50%"} dy={'.3em'} textAnchor={'middle'} >
                        {functionName.value.toUpperCase()}
                    </text>
                </svg>
                <text x={rectProps.x + 74 + 20} y={rectProps.y + 30}>{pathConstruct}</text>
            </>
            // <text></text>
        ))
    } else {

    }





    return (
        <>
            <rect
                className={'function-rect'}
                {...rectProps}
                height={50}
            />
            {component}
        </>
    )
}
