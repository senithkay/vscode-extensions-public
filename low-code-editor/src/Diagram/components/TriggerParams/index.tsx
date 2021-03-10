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
// tslint:disable: jsx-no-multiline-js jsx-wrap-multiline
import React from "react";
import { connect } from "react-redux";

import {FunctionDefinition, RequiredParam, STNode} from "@ballerina/syntax-tree";

import {PortalState} from "../../../types";
import {BlockViewState} from "../../view-state";
import {DefaultConfig} from "../../visitors/default";
import {START_SVG_HEIGHT_WITH_SHADOW} from "../Start/StartSVG";

import "./style.scss";
import {TriggerParamsSVG, TRIGGER_PARAMS_SVG_WIDTH_WITH_SHADOW} from "./TriggerParamsSVG";

export interface TriggerParamsProps {
    model?: STNode;
    blockViewState?: BlockViewState;
    syntaxTree: STNode;
}

export function TriggerParamsC(props: TriggerParamsProps) {
    const { model, blockViewState, syntaxTree } = props;

    const viewState = model.viewState;
    const cx = viewState.triggerParams.bBox.cx;
    const cy = viewState.triggerParams.bBox.cy;
    const modelTriggerParams: FunctionDefinition = syntaxTree as FunctionDefinition;
    let triggerParamsText = "";
    let funcParam;

    for (let i = 0; i <= modelTriggerParams?.functionSignature?.parameters?.length - 1; i++) {
        funcParam = modelTriggerParams?.functionSignature?.parameters[i] as RequiredParam
        if (funcParam.kind === "RequiredParam") {
            triggerParamsText = triggerParamsText + " " + funcParam?.paramName?.value + ",";
        }
    }

    const component: React.ReactElement = ((!model?.viewState.collapsed || blockViewState) &&
        (<TriggerParamsSVG
            x={(cx - (TRIGGER_PARAMS_SVG_WIDTH_WITH_SHADOW / 2))}
            y={(cy + START_SVG_HEIGHT_WITH_SHADOW) - (TRIGGER_PARAMS_SVG_WIDTH_WITH_SHADOW / 2) + DefaultConfig.dotGap * 2}
            text={triggerParamsText.slice(1, -1)}
        />)
    );

    return (
        <g className="trigger-params-wrapper" data-testid="trigger-params-block">
            {component}
        </g>
    );
}

const mapStateToProps = ({ diagramState }: PortalState) => {
    const { syntaxTree} = diagramState;
    return {
        syntaxTree
    }
};

export const TriggerParams = connect(mapStateToProps)(TriggerParamsC);
