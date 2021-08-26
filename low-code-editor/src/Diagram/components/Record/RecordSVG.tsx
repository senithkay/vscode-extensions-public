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

import {ModuleVarDecl, ServiceDeclaration, STNode} from "@ballerina/syntax-tree";

import { getSTComponents } from "../../utils";
import { BlockViewState } from "../../view-state";
import {ModuleMemberViewState} from "../../view-state/module-member";
import { ServiceViewState } from "../../view-state/service";
import { PlusButton } from "../Plus";

import "./style.scss";

export const RECORD_HEIGHT: number = 49;
export const RECORD_WIDTH: number = 452;

export const RECORD_TYPE_WIDTH: number = 80;
export const RECORD_TYPE_HEIGHT: number = 32;
export const RECORD_TYPE_PADDING_TOP: number = 8.5;
export const RECORD_TYPE_PADDING_LEFT: number = 8.5;

export const RECORD_TYPE_TEXT_PADDING_TOP: number = 20;
export const RECORD_TYPE_TEXT_PADDING_LEFT: number = 15;

export const RECORD_NAME_TEXT_PADDING_TOP: number = 20;
export const RECORD_NAME_TEXT_PADDING_LEFT: number = 15;

export interface RecordSVGProps {
    x: number;
    y: number;
    h: number;
    w: number;
    type: string;
    name: string;
}

export function RecordSVG(props: RecordSVGProps) {
    const { x, y, h, w, type, name } = props;

    const rectProps = { x, y, width: w, height: h };

    const typeRectProps = { x: (x + RECORD_TYPE_PADDING_LEFT), y: (y + RECORD_TYPE_PADDING_TOP),
                            width: RECORD_TYPE_WIDTH, height: RECORD_TYPE_HEIGHT };

    const typeTextProps = { x: (typeRectProps.x + RECORD_TYPE_TEXT_PADDING_LEFT),
                            y: (typeRectProps.y + RECORD_TYPE_TEXT_PADDING_TOP) };

    const nameTextProps = { x: (typeRectProps.x + typeRectProps.width + RECORD_NAME_TEXT_PADDING_LEFT),
                            y: (typeRectProps.y + RECORD_NAME_TEXT_PADDING_TOP) };

    return (
        <g>
            <rect className="record-rect" {...rectProps} />
            <rect className="record-type-rect" {...typeRectProps} />
            <text className="record-type-text" {...typeTextProps} >
                {type}
            </text>
            <text className="record-attribute-text" {...nameTextProps} >
                {name}
            </text>
        </g>
    );
}
