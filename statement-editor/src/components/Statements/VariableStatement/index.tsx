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
import React, { ReactNode } from "react";

import { STNode } from "@wso2-enterprise/syntax-tree";

import * as c from "../../../constants";
import { SuggestionItem, VariableUserInputs } from "../../../models/definitions";
import { getSuggestionsBasedOnExpressionKind } from "../../../utils";
import { useStatementEditorStyles } from "../../ViewContainer/styles";

interface VariableStatementProps {
    model: STNode,
    expressionHandler: (suggestions: SuggestionItem[], model: STNode, operator: boolean) => void,
    isRoot: boolean,
    component: ReactNode,
    userInputs?: VariableUserInputs
}

export function VariableStatement(props: VariableStatementProps) {
    const {model, expressionHandler, isRoot, component, userInputs} = props;

    const overlayClasses = useStatementEditorStyles();

    const onClickOnRootExpression = (event: any) => {
        event.stopPropagation()
        // TODO:  Change this to get suggestions for given types
        expressionHandler(getSuggestionsBasedOnExpressionKind(c.DEFAULT_STRING), model, false)
    };

    let type: string = "var";
    let varName: string = "x";
    if (userInputs) {
        type = (userInputs.selectedType === "other") ? (userInputs.otherType === "" ? "var" : userInputs.otherType) : userInputs.selectedType;
        if (userInputs.varName){
            varName = userInputs.varName;
        }
    }

    return (
        isRoot ? (
            <span>
                <span className={`${overlayClasses.expressionBlock} ${overlayClasses.expressionBlockDisabled}`}>
                    {type + " " + varName + " = "}
                </span>
                <button
                    className={overlayClasses.expressionElement}
                    onClick={onClickOnRootExpression}
                >
                    {component}
                </button>
                <span className={`${overlayClasses.expressionBlock} ${overlayClasses.expressionBlockDisabled}`}>
                    {" ;"}
                </span>
            </span>
        ) : <span>{component}</span>
    );
}
