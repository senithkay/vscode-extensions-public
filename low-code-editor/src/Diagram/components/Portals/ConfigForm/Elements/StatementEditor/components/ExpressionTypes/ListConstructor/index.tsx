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
// tslint:disable: jsx-wrap-multiline jsx-no-multiline-js
import React, { ReactNode } from "react";

import { ListConstructor, STNode } from "@ballerina/syntax-tree";

import { VariableUserInputs } from "../../../models/definitions";
import { ExpressionComponent } from "../../Expression";
import {useStatementEditorStyles} from "../../ViewContainer/styles";

interface ListConstructorProps {
    model: ListConstructor
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function ListConstructorComponent(props: ListConstructorProps) {
    const { model, userInputs, diagnosticHandler } = props;

    const overlayClasses = useStatementEditorStyles();

    const expressions: (ReactNode)[] = [];

    model.expressions.forEach((expression: STNode) => {
        const expressionComponent: ReactNode = <ExpressionComponent
            model={expression}
            isRoot={false}
            userInputs={userInputs}
            diagnosticHandler={diagnosticHandler}
        />;
        expressions.push(expressionComponent)
    });

    return (
        <span>
            <span className={`${overlayClasses.expressionBlock} ${overlayClasses.expressionBlockDisabled}`}>
                &nbsp;{model.openBracket.value}
            </span>
            <span>
                {
                    expressions.map((expr: ReactNode, index: number) => (
                        <span
                            key={index}
                        >
                            {expr}
                        </span>
                    ))
                }
            </span>
            <span className={`${overlayClasses.expressionBlock} ${overlayClasses.expressionBlockDisabled}`}>
                &nbsp;{model.closeBracket.value}
            </span>
        </span>
    );
}
