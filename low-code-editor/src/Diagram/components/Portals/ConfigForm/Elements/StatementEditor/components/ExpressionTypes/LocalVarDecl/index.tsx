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
// tslint:disable: jsx-wrap-multiline
import React, {ReactNode} from "react";

import { LocalVarDecl, STKindChecker, STNode } from "@ballerina/syntax-tree";

import { VariableUserInputs } from "../../../models/definitions";
import { ExpressionComponent } from "../../Expression";
import {statementEditorStyles} from "../../ViewContainer/styles";

interface LocalVarDeclProps {
    model: STNode
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function LocalVarDeclC(props: LocalVarDeclProps) {
    const { model, userInputs, diagnosticHandler } = props;

    const overlayClasses = statementEditorStyles();

    let typedBindingPattern: STNode;
    let equalsToken: string;
    let initializer: STNode;
    let typedBindingComponent: ReactNode;
    let expressionComponent: ReactNode;

    if (STKindChecker.isLocalVarDecl(model)) {
        const localVarDeclModel = model as LocalVarDecl;
        typedBindingPattern = localVarDeclModel.typedBindingPattern;
        equalsToken = localVarDeclModel.equalsToken.value;
        initializer = localVarDeclModel.initializer;
        typedBindingComponent = <ExpressionComponent
            model={typedBindingPattern}
            isRoot={false}
            userInputs={userInputs}
            diagnosticHandler={diagnosticHandler}
        />;
        expressionComponent = <ExpressionComponent
            model={initializer}
            isRoot={false}
            userInputs={userInputs}
            diagnosticHandler={diagnosticHandler}
        />;
    }

    return (
        // <span>
        <button
            className={overlayClasses.expressionElement}
        >
            {typedBindingComponent}
            {equalsToken}
            {expressionComponent}
        </button>
        // </span>
    );
}
