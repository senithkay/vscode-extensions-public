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
import React, { useContext } from "react";

import {
    FunctionBodyBlock,
    FunctionDefinition,
    ModulePart,
    ObjectMethodDefinition,
    ResourceAccessorDefinition,
    STKindChecker,
} from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../Context/diagram";
import { PlusButton } from "../../PlusButtons/Plus";

import {
    StartSVG,
    START_SVG_HEIGHT,
    START_SVG_WIDTH,
} from "./StartSVG";
import "./style.scss";

export interface StartButtonProps {
    model: FunctionDefinition | ModulePart | ObjectMethodDefinition | ResourceAccessorDefinition;
}

export function StartButton(props: StartButtonProps) {
    const {
        props: {
            isReadOnly,
        }
    } = useContext(Context);

    const { model } = props;

    const isFunctionKind = model && (STKindChecker.isResourceAccessorDefinition(model)
        || STKindChecker.isObjectMethodDefinition(model)
        || STKindChecker.isFunctionDefinition(model));

    const viewState = model.viewState;
    const cx = viewState.trigger.cx;
    const cy = viewState.trigger.cy;
    const plusView = viewState.initPlus;
    const initPlusAvailable = viewState.initPlus !== undefined;

    let block: FunctionBodyBlock;
    if (model && isFunctionKind) {
        block = model.functionBody as FunctionBodyBlock;
    }
    return (
        // hide edit button for triggers and expression bodied functions
        <g className="start-wrapper">
            <StartSVG
                x={cx - (START_SVG_WIDTH / 2)}
                y={cy - (START_SVG_HEIGHT / 2)}
                text="START"
            />
            {block && initPlusAvailable && !isReadOnly && <PlusButton viewState={plusView} model={block} initPlus={true} />}
        </g>
    );
}
