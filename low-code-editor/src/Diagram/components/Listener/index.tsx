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
import React from 'react'

import { STNode, ListenerDeclaration } from "@ballerina/syntax-tree";
import cn from "classnames";

import { ListenerViewState } from "../../view-state/listener";
import "./style.scss";

export interface ListenerProps {
    model: STNode;
}

export function ListenerC(props: ListenerProps) {
    const { model } = props;

    const statements: React.ReactNode[] = [];
    const classes = cn("statement");
    const listenerModel: ListenerDeclaration = model as ListenerDeclaration;

    const viewState: ListenerViewState = listenerModel.viewState;
    const listenerName = listenerModel.variableName.value;
    const listenerPort = listenerModel.initializer.parenthesizedArgList.source.slice(1, -1);
    const rectProps = {
        x: viewState.bBox.cx,
        y: viewState.bBox.cy,
        width: 100,
        height: 100,
    };

    const label = {
        x: viewState.bBox.cx + rectProps.width/4,
        y: viewState.bBox.cy + rectProps.height/2
    };

    const textProps = {
        x: viewState.bBox.cx + rectProps.width + 10,
        y: viewState.bBox.cy + rectProps.height/2
    };

    return (
        <g>
            <g className={classes}>
                <g>
                    <g>
                        <rect className={"service-rect"} {...rectProps} />
                        <text className={"service-rect"} {...label}> HTTP </text>
                        <text className={"service-rect"} {...textProps}> {listenerName} | {listenerPort} </text>
                    </g>
                </g>
            </g>
        </g>
    );
}

export const Listener = ListenerC;
