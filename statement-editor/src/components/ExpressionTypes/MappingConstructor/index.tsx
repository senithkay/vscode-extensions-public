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
import React, { ReactNode, useContext } from "react";

import { MappingConstructor, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { MAPPING_CONSTRUCTOR } from "../../../constants";
import { VariableUserInputs } from "../../../models/definitions";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { generateExpressionTemplate } from "../../../utils/utils";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../ViewContainer/styles";

interface MappingConstructorProps {
    model: MappingConstructor
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function MappingConstructorComponent(props: MappingConstructorProps) {
    const { model, userInputs, diagnosticHandler } = props;

    const overlayClasses = useStatementEditorStyles();

    const {
        modelCtx: {
            updateModel,
        }
    } = useContext(StatementEditorContext);

    const fields: (ReactNode | string)[] = [];


    model.fields.forEach((expression: STNode) => {
        if (STKindChecker.isCommaToken(expression)) {
            fields.push(expression.value);
        } else {
            const expr: ReactNode = <ExpressionComponent
                model={expression}
                isRoot={false}
                userInputs={userInputs}
                diagnosticHandler={diagnosticHandler}
                isTypeDescriptor={false}
            />;
            fields.push(expr)
        }
    });


    const fieldsComponent = (
        <span>
                {
                    fields.map((expr: ReactNode | string, index: number) => (
                        (typeof expr === 'string') ?
                            (
                                <span
                                    key={index}
                                    className={
                                        `${overlayClasses.expressionBlock} ${overlayClasses.expressionBlockDisabled}`
                                    }
                                >
                                    {expr}
                                </span>
                            ) :
                            (
                                <button
                                    key={index}
                                    className={overlayClasses.expressionElement}
                                >
                                    {expr}
                                </button>
                            )
                    ))
                }
            </span>
    );

    const onClickOnPlusIcon = () => {
        let newField: string;
        if (model.fields.length !== 0) {
            newField = ", " + generateExpressionTemplate(MAPPING_CONSTRUCTOR) + " }";
            updateModel(newField, model.closeBrace.position);
        } else {
            newField = generateExpressionTemplate(MAPPING_CONSTRUCTOR) + " }";
            updateModel(newField, model.closeBrace.position);
        }
    };

    return (
        <span>
            <span
                className={`${overlayClasses.expressionBlock} ${overlayClasses.expressionBlockDisabled}`}
            >
                {model.openBrace.value}
            </span>
            {fieldsComponent}
            <button
                className={overlayClasses.plusIconBorder}
                onClick={onClickOnPlusIcon}
            >
                +
            </button>
            <span
                className={`${overlayClasses.expressionBlock} ${overlayClasses.expressionBlockDisabled}`}
            >
                {model.closeBrace.value}
            </span>
        </span>
    );
}
