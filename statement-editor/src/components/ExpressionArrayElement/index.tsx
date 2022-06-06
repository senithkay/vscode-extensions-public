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

import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

import {
    ArrayType,
    DEFAULT_WHERE_INTERMEDIATE_CLAUSE,
    EXPR_CONSTRUCTOR,
    MAPPING_CONSTRUCTOR
} from "../../constants";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { NewExprAddButton } from "../Button/NewExprAddButton";


export interface ExpressionArrayelementProps {
    expression: STNode;
    children?: React.ReactElement[] | React.ReactElement;
    modifiable?: boolean;
    arrayType?: ArrayType;
    index: number;
    length: number;
    onMouseEnterCallback?: (e: React.MouseEvent, index: number) => void;
    isHovered: boolean

}

export function ExpressionArrayElementComponent(props: ExpressionArrayelementProps) {
    const { expression, children, modifiable, arrayType, index, length, onMouseEnterCallback, isHovered } = props;

    const {
        modelCtx: {
            updateModel,
        }
    } = useContext(StatementEditorContext);

    const addNewExpression = (model: STNode) => {
        const newPosition: NodePosition = {
            ...model.position,
            startLine: model.position.endLine,
            startColumn: model.position.endColumn
        }
        if (arrayType === ArrayType.INTERMEDIATE_CLAUSE){
            updateModel(`\n ${DEFAULT_WHERE_INTERMEDIATE_CLAUSE}`, newPosition);
        } else {
            const template = arrayType === ArrayType.MAPPING_CONSTRUCTOR ? MAPPING_CONSTRUCTOR : EXPR_CONSTRUCTOR;
            const newField = `,\n${template}`;
            updateModel(newField, newPosition);
        }
    };

    const onMouseEnter = (e: React.MouseEvent) => {
        onMouseEnterCallback(e, index)
    }


    return (
        <span onMouseEnter={onMouseEnter} >
            {children}
            {modifiable && (
                <>
                    <NewExprAddButton
                        model={expression}
                        onClick={addNewExpression}
                        classNames={(length !== index + 1 && arrayType === ArrayType.MAPPING_CONSTRUCTOR ? "modifiable" : "")
                                    + " "
                                    + (isHovered ? "view" : "hide")}
                    />
                    {arrayType === ArrayType.INTERMEDIATE_CLAUSE && (
                        <br/>
                    )}
                </>
            )}
        </span>

    );
}
