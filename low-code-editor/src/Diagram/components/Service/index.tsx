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
import React from "react"

import { ExplicitNewExpression, ServiceDeclaration, STNode } from "@ballerina/syntax-tree";

import { getSTComponents } from "../../utils";
import { ServiceViewState } from "../../view-state/service";
import { PlusButton } from "../Plus";

import { ServiceHeaderSVG } from "./ServiceHeaderSVG";
import "./style.scss";

export const DEFAULT_SERVICE_WIDTH: number = 500;

export interface ServiceProps {
    model: STNode;
}

export function Service(props: ServiceProps) {
    const { model } = props;

    const pluses: React.ReactNode[] = [];
    const serviceModel: ServiceDeclaration = model as ServiceDeclaration;
    const children = getSTComponents(serviceModel.members);

    const viewState: ServiceViewState = serviceModel.viewState;
    const rectProps = {
        x: viewState.bBox.cx,
        y: viewState.bBox.cy,
        width: viewState.bBox.w,
        height: viewState.bBox.h,
    };

    const drafts: React.ReactNode[] = [];
    // if (bodyViewState.draft) {
    //     drafts = getDraftComponent(bodyViewState, state, insertComponentStart);
    // }

    for (const plusView of viewState.plusButtons) {
        pluses.push(<PlusButton viewState={plusView} initPlus={false} />)
    }

    let listener = "";
    serviceModel.expressions.forEach((expression, index) => {
        listener = (index === 0) ? expression.source?.trim() : `${listener}, ${expression.source?.trim()}`;
    });

    let absolutePath = "";
    serviceModel.absoluteResourcePath.forEach((path) => {
        absolutePath += path.value;
    });

    let serviceType = "";
    if ((serviceModel.expressions[0] as ExplicitNewExpression).typeDescriptor.source === "http:Listener") {
        serviceType = "HTTP";
    }

    return (
        <g className="service">
            <rect className="service-rect" {...rectProps} />
            <ServiceHeaderSVG
                x={viewState.bBox.x}
                y={viewState.bBox.y}
                w={viewState.bBox.w}
                type={serviceType}
                path={absolutePath}
                listener={listener}
            />
            {children}
            {pluses}
        </g>
    );
}

