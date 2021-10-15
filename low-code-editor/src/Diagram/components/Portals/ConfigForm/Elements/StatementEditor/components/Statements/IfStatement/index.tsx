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
import React, { ReactNode, useContext } from "react";

import { STNode } from "@ballerina/syntax-tree"

import * as c from "../../../constants";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind } from "../../../utils";
import { statementEditorStyles } from "../../ViewContainer/styles";

interface IfStatementProps {
    model: STNode
    isRoot: boolean
    component: ReactNode
}

export function IfStatement(props: IfStatementProps) {
    const { model, isRoot, component } = props;

    const overlayClasses = statementEditorStyles();
    const suggestionCtx = useContext(SuggestionsContext);

    const onClickOnRootExpression = (event: any) => {
        event.stopPropagation()
        suggestionCtx.expressionHandler(model, false, { expressionSuggestions: getSuggestionsBasedOnExpressionKind(c.DEFAULT_BOOL) })
    };

    return (
        isRoot ? (
            <span>
                <span className={`${overlayClasses.expressionBlock} ${overlayClasses.expressionBlockDisabled}`}>
                    {"if"}
                </span>
                <button
                    className={overlayClasses.expressionElement}
                    onClick={onClickOnRootExpression}
                >
                    {component}
                </button>
                <span className={`${overlayClasses.expressionBlock} ${overlayClasses.expressionBlockDisabled}`}>
                    &nbsp;{"{"}
                    <br/>
                    &nbsp;&nbsp;&nbsp;{"..."}
                    <br/>
                    {"} "}
                    <button className={overlayClasses.addNewExpressionButton}> + </button>
                    {" else {"}
                    <br/>
                    &nbsp;&nbsp;&nbsp;{"..."}
                    <br/>
                    {"}"}
                </span>
            </span>
        ) : <span>{component}</span>
    );
}
