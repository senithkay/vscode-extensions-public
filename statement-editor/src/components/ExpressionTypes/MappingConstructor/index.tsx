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
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import React, { useContext } from "react";

import { MappingConstructor } from "@wso2-enterprise/syntax-tree";

import { MAPPING_CONSTRUCTOR } from "../../../constants";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { generateExpressionTemplate } from "../../../utils/utils";
import { NewExprAddButton } from "../../Button/NewExprAddButton";
import { ExpressionArrayComponent } from "../../ExpressionArray";
import { TokenComponent } from "../../Token";

interface MappingConstructorProps {
    model: MappingConstructor;
}

export function MappingConstructorComponent(props: MappingConstructorProps) {
    const { model } = props;

    const {
        modelCtx: {
            updateModel,
        }
    } = useContext(StatementEditorContext);

    const isSingleLine = model.position.startLine === model.position.endLine;
    const isEmpty = model.fields.length === 0;

    const addNewExpression = () => {
        const expressionTemplate = generateExpressionTemplate(MAPPING_CONSTRUCTOR);
        const newField = isEmpty ? `${expressionTemplate} }` : `,\n${expressionTemplate} }`;
        updateModel(newField, model.closeBrace.position);
    };

    return (
        <>
            <TokenComponent model={model.openBrace} />
            <ExpressionArrayComponent expressions={model.fields} modifiable={!isSingleLine} />
            {(isEmpty || isSingleLine) && (<NewExprAddButton model={model} onClick={addNewExpression} />)}
            <TokenComponent model={model.closeBrace} />
        </>
    );
}
