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
import React, { useContext } from "react";

import { FunctionCall } from "@wso2-enterprise/syntax-tree";

import { EXPR_CONSTRUCTOR, FUNCTION_CALL } from "../../../constants";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { NewExprAddButton } from "../../Button/NewExprAddButton";
import { ExpressionArrayComponent } from "../../ExpressionArray";
import { InputEditor, InputEditorProps } from "../../InputEditor";
import { TokenComponent } from "../../Token";

interface FunctionCallProps {
    model: FunctionCall;
}

export function FunctionCallComponent(props: FunctionCallProps) {
    const { model } = props;
    const {
        modelCtx: {
            updateModel,
            hasRestArg
        }
    } = useContext(StatementEditorContext);

    const isOnPlaceholder = (model.source === FUNCTION_CALL);

    const inputEditorProps: InputEditorProps = {
        model: isOnPlaceholder ? model : model.functionName,
        notEditable: isOnPlaceholder ? false : true
    }

    const addNewExpression = () => {
        const isEmpty = model.arguments.length === 0;
        const expr = isEmpty ? EXPR_CONSTRUCTOR : `, ${EXPR_CONSTRUCTOR}`;
        const newPosition = isEmpty ? {
            ...model.closeParenToken.position,
            endColumn: model.closeParenToken.position.startColumn
        } : {
            startLine: model.arguments[model.arguments.length - 1].position.endLine,
            startColumn: model.arguments[model.arguments.length - 1].position.endColumn,
            endLine: model.closeParenToken.position.startLine,
            endColumn: model.closeParenToken.position.startColumn
        }
        updateModel(expr, newPosition);
    };
    return (
        <>
            <InputEditor {...inputEditorProps} />
            {!isOnPlaceholder &&
                <>
                    <TokenComponent model={model.openParenToken} />
                    <ExpressionArrayComponent expressions={model.arguments} />
                    {hasRestArg && (<NewExprAddButton model={model} onClick={addNewExpression}/>)}
                    <TokenComponent model={model.closeParenToken} />
                </>
            }
        </>
    );
}
