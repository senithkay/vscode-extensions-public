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
import React from "react"

import {ModuleVarDecl, ServiceDeclaration, STNode} from "@ballerina/syntax-tree";

import { getSTComponents } from "../../utils";
import { BlockViewState } from "../../view-state";
import {ModuleMemberViewState} from "../../view-state/module-member";
import { ServiceViewState } from "../../view-state/service";
import { PlusButton } from "../Plus";

import "./style.scss";

export const SERVICE_HEADER_HEIGHT: number = 49;

export const SERVICE_TYPE_WIDTH: number = 80;
export const SERVICE_TYPE_HEIGHT: number = 32;
export const SERVICE_TYPE_PADDING_TOP: number = 8.5;
export const SERVICE_TYPE_PADDING_LEFT: number = 8.5;

export const SERVICE_TYPE_TEXT_PADDING_TOP: number = 20;
export const SERVICE_TYPE_TEXT_PADDING_LEFT: number = 15;

export const SERVICE_PATH_TEXT_PADDING_TOP: number = 20;
export const SERVICE_PATH_TEXT_PADDING_LEFT: number = 15;

export const SERVICE_LISTENER_AND_PATH_GAP: number = 100;

export interface ServiceHeaderSVGProps {
    x: number;
    y: number;
    w: number;
    type: string;
    path: string;
    listener: string;
}

export function ServiceHeaderSVG(props: ServiceHeaderSVGProps) {
    const { x, y, type, w, path, listener } = props;

    const typeRectProps = { x: (x + SERVICE_TYPE_PADDING_LEFT), y: (y + SERVICE_TYPE_PADDING_TOP),
                            width: SERVICE_TYPE_WIDTH, height: SERVICE_TYPE_HEIGHT };

    const typeTextProps = { x: (typeRectProps.x + SERVICE_TYPE_TEXT_PADDING_LEFT),
                            y: (typeRectProps.y + SERVICE_TYPE_TEXT_PADDING_TOP) };

    const pathTextProps = { x: (typeRectProps.x + typeRectProps.width + SERVICE_PATH_TEXT_PADDING_LEFT),
                            y: (typeRectProps.y + SERVICE_PATH_TEXT_PADDING_TOP) };

    const listenerTextProps = { x: (typeRectProps.x + typeRectProps.width + SERVICE_LISTENER_AND_PATH_GAP),
        y: (typeRectProps.y + SERVICE_PATH_TEXT_PADDING_TOP) };

    return (
        <g>
            <rect className={"service-type-rect"} {...typeRectProps} />
            <text className={"service-type-text"} {...typeTextProps} >
                {type}
            </text>
            <text className={"service-attribute-text"} {...pathTextProps} >
                {path}
            </text>
            <text className={"service-attribute-text"} {...listenerTextProps} >
                {`listening on: ` + listener}
            </text>
        </g>
    );
}
