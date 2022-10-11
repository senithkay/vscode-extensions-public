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
import React from "react";

import {
    FunctionDefinition,
    STKindChecker,
} from "@wso2-enterprise/syntax-tree";

import { ExprBodiedFuncComponent } from "./ExpressionBodiedFuction";
import { RegularFuncComponent } from "./RegularFunction";

export interface FunctionProps {
    model: FunctionDefinition;
    hideHeader?: boolean;
}

export function Function(props: FunctionProps) {
    const { model, hideHeader } = props;

    const isExpressionFuncBody: boolean = STKindChecker.isExpressionFunctionBody(
        model.functionBody
    );

    return (
        <>
            {isExpressionFuncBody ? (
                <ExprBodiedFuncComponent
                    model={model}
                />
            ) : (
                <RegularFuncComponent
                    model={model}
                    hideHeader={hideHeader}
                />
            )}
        </>
    );
}
