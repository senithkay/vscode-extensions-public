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
// tslint:disable: jsx-no-multiline-js  jsx-wrap-multiline
import React, { ReactNode, useContext, useState } from "react"

import { ServiceDeclaration, STNode } from "@ballerina/syntax-tree";

import { getSTComponents } from "../../utils";
import { BlockViewState } from "../../view-state";
import { ServiceViewState } from "../../view-state/service";

import "./style.scss";

export interface ServiceProps {
    blockViewState?: BlockViewState;
    model: STNode;
}

export function Service(props: ServiceProps) {
    const { model } = props;

    const pluses: React.ReactNode[] = [];
    const serviceModel: ServiceDeclaration = model as ServiceDeclaration;
    const children = getSTComponents(serviceModel.members);

    const viewState: ServiceViewState = serviceModel.viewState;

    // const x: number = viewState.foreachHead.cx;
    // const y: number = viewState.foreachHead.cy - (viewState.foreachHead.h / 2) - (FOREACH_SHADOW_OFFSET / 2);

    const drafts: React.ReactNode[] = [];
    // if (bodyViewState.draft) {
    //     drafts = getDraftComponent(bodyViewState, state, insertComponentStart);
    // }

    // for (const plusView of modelForeach.blockStatement.viewState.plusButtons) {
    //     pluses.push(<PlusButton viewState={plusView} model={modelForeach.blockStatement} initPlus={false} />)
    // }

    return (
        <g className={"service-wrapper"}>
            <g>
                <line
                    x1={viewState.wrapper.cx}
                    y1={viewState.wrapper.cy}
                    x2={viewState.wrapper.cx + (viewState.bBox.w * 2)}
                    y2={viewState.wrapper.cy}
                />
                <line
                    x1={viewState.wrapper.cx + (viewState.bBox.w * 2)}
                    y1={viewState.wrapper.cy}
                    x2={viewState.wrapper.cx + (viewState.bBox.w * 2)}
                    y2={viewState.wrapper.cy + viewState.wrapper.h}
                />
                <line
                    x1={viewState.wrapper.cx + (viewState.bBox.w * 2)}
                    y1={viewState.wrapper.cy + viewState.wrapper.h}
                    x2={viewState.wrapper.cx}
                    y2={viewState.wrapper.cy + viewState.wrapper.h}
                />
                <line
                    x1={viewState.wrapper.cx}
                    y1={viewState.wrapper.cy + viewState.wrapper.h}
                    x2={viewState.wrapper.cx}
                    y2={viewState.wrapper.cy}
                />
                {children}
                {/*{pluses}*/}
            </g>
        </g>
    );
}

