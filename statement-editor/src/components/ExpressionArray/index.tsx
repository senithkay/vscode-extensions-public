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

import { ArrayType, EXPR_CONSTRUCTOR, MAPPING_CONSTRUCTOR } from "../../constants";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { NewExprAddButton } from "../Button/NewExprAddButton";
import { ExpressionComponent } from "../Expression";
import { TokenComponent } from "../Token";

export interface ExpressionArrayProps {
    expressions: STNode[];
    modifiable?: boolean;
    arrayType?: ArrayType
}

export function ExpressionArrayComponent(props: ExpressionArrayProps) {
    const { expressions, modifiable, arrayType } = props;

    const {
        modelCtx: {
            updateModel,
            setNewQueryPos
        }
    } = useContext(StatementEditorContext);

    const addNewExpression = (model: STNode) => {
        const newPosition: NodePosition = {
            ...model.position,
            startLine: model.position.endLine,
            startColumn: model.position.endColumn
        }
        if (ArrayType.INTERMEDIATE_CLAUSE){
            setNewQueryPos(newPosition);
        } else {
            const template = arrayType === ArrayType.MAPPING_CONSTRUCTOR ? MAPPING_CONSTRUCTOR : EXPR_CONSTRUCTOR;
            const newField = `,\n${template}`;
            updateModel(newField, newPosition);
        }
    };

    return (
        <>
            { expressions.map((expression: STNode, index: number) => {
                return (STKindChecker.isCommaToken(expression))
                ? (
                     <TokenComponent key={index} model={expression} />
                ) : (
                    <>
                        <ExpressionComponent
                            key={index}
                            model={expression}
                        />
                        {modifiable && (
                            <NewExprAddButton
                                model={expression}
                                onClick={addNewExpression}
                                classNames={"modifiable"}
                            />
                        )}
                    </>
                )
            })}
        </>
    );
}
