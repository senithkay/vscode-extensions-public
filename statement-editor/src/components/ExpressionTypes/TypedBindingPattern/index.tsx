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
// tslint:disable: jsx-no-multiline-js
import React, { ReactNode, useContext } from "react";

import { TypedBindingPattern } from "@wso2-enterprise/syntax-tree";

import { SuggestionItem } from "../../../models/definitions";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { SuggestionsContext } from "../../../store/suggestions-context";
import {
    addStatementToTargetLine,
    getContextBasedCompletions
} from "../../../utils/ls-utils";
import { ExpressionComponent } from "../../Expression";

interface TypedBindingPatternProps {
    model: TypedBindingPattern;
    isElseIfMember: boolean;
}

export function TypedBindingPatternComponent(props: TypedBindingPatternProps) {
    const { model, isElseIfMember } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const { expressionHandler } = useContext(SuggestionsContext);
    const { currentFile, getLangClient } = stmtCtx;
    const targetPosition = stmtCtx.formCtx.formModelPosition;
    const fileURI = `expr://${currentFile.path}`;

    const onClickOnTypeBindingPatter = async (event: any) => {
        event.stopPropagation();
        expressionHandler(model.bindingPattern, false, false, {
            expressionSuggestions: [],
            typeSuggestions: [],
            variableSuggestions: []
        });
    };

    const bindingPatternComponent: ReactNode = (
        <ExpressionComponent
            model={model.bindingPattern}
            isElseIfMember={isElseIfMember}
            isTypeDescriptor={false}
            onSelect={onClickOnTypeBindingPatter}
            deleteConfig={{exprNotDeletable: true}}
        />
    );

    const onClickOnType = async (event: any) => {
        event.stopPropagation();

        const content: string = await addStatementToTargetLine(
            currentFile.content, targetPosition, stmtCtx.modelCtx.statementModel.source, getLangClient);

        const completions: SuggestionItem[] = await getContextBasedCompletions(
            fileURI, content, targetPosition, model.typeDescriptor.position,
            true, isElseIfMember, model.typeDescriptor.source, getLangClient);

        expressionHandler(model.typeDescriptor, false, true, {
            expressionSuggestions: [],
            typeSuggestions: completions,
            variableSuggestions: []
        });
    };

    const typeDescriptorComponent: ReactNode = (
        <ExpressionComponent
            model={model.typeDescriptor}
            isElseIfMember={isElseIfMember}
            isTypeDescriptor={true}
            onSelect={onClickOnType}
            classNames="type-descriptor"
            deleteConfig={{defaultExprDeletable: true}}
        />
    );

    return (
        <span>
            {typeDescriptorComponent}
            {bindingPatternComponent}
        </span>
    );
}
