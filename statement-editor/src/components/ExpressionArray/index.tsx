/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { MAPPING_CONSTRUCTOR } from "../../constants";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { generateExpressionTemplate } from "../../utils/utils";
import { ExpressionComponent } from "../Expression";
import { TokenComponent } from "../Token";

export interface ExpressionArrayProps {
    expressions: STNode[];
    modifiable?: boolean;
}

export function ExpressionArrayComponent(props: ExpressionArrayProps) {
    const { expressions, modifiable } = props;

    const {
        modelCtx: {
            updateModel,
        }
    } = useContext(StatementEditorContext);

    const addNewExpression = (model: STNode) => {
        const template = generateExpressionTemplate(MAPPING_CONSTRUCTOR);
        const newField = STKindChecker.isCommaToken(model) ? `\n${template},` : `,\n${template}`;
        let position: NodePosition = {
            ...model.position,
            startColumn: model.position.endColumn
        };
        if (STKindChecker.isSpecificField(model)) {
            position = {
                ...model.valueExpr.position,
                startColumn: model.valueExpr.position.endColumn
            }
        }
        updateModel(newField, position);
    };

    return (
        <>
        {
            expressions.map((expression: STNode, index: number) => {
                if (modifiable) {
                    return (STKindChecker.isCommaToken(expression)) ? (
                        <TokenComponent key={index} model={expression} addNewExpr={addNewExpression} />
                    ) : (
                        (index < expressions.length - 1) ? (
                                <ExpressionComponent
                                    key={index}
                                    model={expression}
                                />
                            ) :
                            (
                                <ExpressionComponent
                                    key={index}
                                    model={expression}
                                    addNewExpr={addNewExpression}
                                />
                            )
                    )
                }
                return (STKindChecker.isCommaToken(expression)) ? (
                    <TokenComponent key={index} model={expression} />
                ) : (
                    <ExpressionComponent
                        key={index}
                        model={expression}
                    />
                )
            })
        }
        </>
    );
}
