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
import React from "react";

import {STNode} from "@ballerina/syntax-tree";

import {getExpressionTypeComponent} from "../../utils";
import {SuggestionItem} from "../../utils/utils";
import {VariableStatement} from "../Statements/VariableStatement";

interface ExpressionComponentProps {
    model: STNode
    callBack: (suggestions: SuggestionItem[], model: STNode, operator: boolean) => void
    isRoot: boolean
}

export function ExpressionComponent(props: ExpressionComponentProps) {
    const {model, callBack, isRoot} = props;

    const component = getExpressionTypeComponent(model, callBack);

    return (
        // <IfStatement
        //     model={model}
        //     callBack={callBack}
        //     isRoot={isRoot}
        //     component={component}
        // />
        <VariableStatement
            model={model}
            callBack={callBack}
            isRoot={isRoot}
            component={component}
        />
    );
}
