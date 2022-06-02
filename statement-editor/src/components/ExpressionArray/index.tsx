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
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
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

    const [isHovered, setHovered] = React.useState(null);

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
        if (arrayType === ArrayType.INTERMEDIATE_CLAUSE){
            setNewQueryPos(newPosition);
        } else {
            const template = arrayType === ArrayType.MAPPING_CONSTRUCTOR ? MAPPING_CONSTRUCTOR : EXPR_CONSTRUCTOR;
            const newField = `,\n${template}`;
            updateModel(newField, newPosition);
        }
    };

    const onMouseEnter = (e: React.MouseEvent , index: number) => {
        setHovered(index);
        e.preventDefault();
    }

    const onMouseLeave = (e: React.MouseEvent) => {
        setHovered(null);
        e.preventDefault();
    }

    return (
        <span onMouseLeave={onMouseLeave}>
            { expressions.map((expression: STNode, index: number) => {
                return (STKindChecker.isCommaToken(expression))
                ? (
                     <TokenComponent key={index} model={expression} />
                ) : (
                    <span onMouseEnter={e => onMouseEnter(e, index)}>
                        <ExpressionComponent
                            key={index}
                            model={expression}
                        />
                        {modifiable && (
                            <>
                                <NewExprAddButton
                                    model={expression}
                                    onClick={addNewExpression}
                                    classNames={(expressions.length !== index + 1 && arrayType === ArrayType.MAPPING_CONSTRUCTOR ? "modifiable" : "")
                                                + " "
                                                + (isHovered === index ? "view" : "hide")}
                                />
                                {arrayType === ArrayType.INTERMEDIATE_CLAUSE && (
                                    <br/>
                                )}
                            </>
                        )}
                    </span>
                )
            })}
        </span>
    );
}
