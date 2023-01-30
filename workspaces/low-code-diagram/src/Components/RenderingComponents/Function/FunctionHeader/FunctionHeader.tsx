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
// tslint:disable: jsx-no-multiline-js
import React from "react";

import {
    STKindChecker,
} from "@wso2-enterprise/syntax-tree";

import { useFunctionContext } from "../../../../Context/Function";

import "./style.scss";


export function FunctionHeader() {
    const { functionNode } = useFunctionContext();

    const titleComponents: React.ReactElement[] = [];
    const argumentComponents: React.ReactElement[] = [];

    if (STKindChecker.isFunctionDefinition(functionNode)) {
        // TODO: handle general funciton
        titleComponents.push(
            <span>{functionNode.functionName.value}</span>
        );

        functionNode.functionSignature.parameters
            .forEach(param => {
                console.log('param >>>', param);
                if (STKindChecker.isRequiredParam(param)
                    || STKindChecker.isDefaultableParam(param)
                    || STKindChecker.isRestParam(param)) {

                    argumentComponents.push(
                        <div className={'argument-item'}>
                            <span className="type-name">{param.typeName.source.trim()}</span>
                            <span className="argument-name">{param.paramName.value}</span>
                        </div>
                    );
                }
            });
    } else if (STKindChecker.isResourceAccessorDefinition(functionNode)) {
        // TODO: handle resource function
    }

    return (
        <div id="function-header" className="header-container">
            <div className="title-container">{titleComponents}</div>
            <div className="argument-container">{argumentComponents}</div>
        </div>
    )
}

