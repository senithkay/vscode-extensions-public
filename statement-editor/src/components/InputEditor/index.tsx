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
import React, { useContext, useEffect, useState } from "react";

import { ClickAwayListener } from "@material-ui/core";
import {
    BooleanLiteral,
    NumericLiteral,
    QualifiedNameReference,
    SimpleNameReference,
    STKindChecker,
    STNode,
    StringLiteral
} from "@wso2-enterprise/syntax-tree";
import debounce from "lodash.debounce";

import * as c from "../../constants";
import { InputEditorContext } from "../../store/input-editor-context";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { SuggestionsContext } from "../../store/suggestions-context";
import { useStatementEditorStyles } from "../styles";

import {
    INPUT_EDITOR_PLACE_HOLDERS
} from "./constants";

export interface InputEditorProps {
    model?: STNode;
    isToken?: boolean;
    classNames?: string;
}

export function InputEditor(props: InputEditorProps) {

    const { model, isToken, classNames } = props;

    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            initialSource,
            updateModel,
            handleChange
        },
        formCtx: {
            formModelPosition: targetPosition
        }
    } = stmtCtx;

    const inputEditorCtx = useContext(InputEditorContext);

    const { expressionHandler } = useContext(SuggestionsContext);

    const statementEditorClasses = useStatementEditorStyles();

    const [originalValue, kind] = React.useMemo(() => {
        let literalModel: StringLiteral | NumericLiteral | SimpleNameReference | QualifiedNameReference;
        let source: string;
        let nodeKind: string;

        if (!model) {
            source = initialSource ? initialSource : '';
        } else if (STKindChecker.isStringLiteral(model)) {
            literalModel = model as StringLiteral;
            nodeKind = c.STRING_LITERAL;
            source = literalModel.literalToken.value;
        } else if (STKindChecker.isNumericLiteral(model)) {
            literalModel = model as NumericLiteral;
            nodeKind = c.NUMERIC_LITERAL;
            source = literalModel.literalToken.value;
        } else if (STKindChecker.isIdentifierToken(model)) {
            source = model.value;
        } else if (STKindChecker.isSimpleNameReference(model)) {
            literalModel = model as SimpleNameReference;
            nodeKind = c.SIMPLE_NAME_REFERENCE;
            source = literalModel.name.value;
        } else if (STKindChecker.isQualifiedNameReference(model)) {
            literalModel = model as QualifiedNameReference;
            nodeKind = c.QUALIFIED_NAME_REFERENCE;
            source = `${literalModel.modulePrefix.value}${literalModel.colon.value}${literalModel.identifier.value}`;
        } else if (STKindChecker.isBooleanLiteral(model)) {
            literalModel = model as BooleanLiteral;
            nodeKind = c.BOOLEAN_LITERAL;
            source = literalModel.literalToken.value;
        } else if ((STKindChecker.isStringTypeDesc(model)
            || STKindChecker.isBooleanTypeDesc(model)
            || STKindChecker.isDecimalTypeDesc(model)
            || STKindChecker.isFloatTypeDesc(model)
            || STKindChecker.isIntTypeDesc(model)
            || STKindChecker.isJsonTypeDesc(model)
            || STKindChecker.isVarTypeDesc(model))) {
            source = model.name.value;
        } else if (isToken) {
            source = model.value;
        } else {
            source = model.source;
        }
        return [source, nodeKind];
    }, [model]);

    const [isEditing, setIsEditing] = useState(false);
    const [userInput, setUserInput] = useState<string>(originalValue);
    const [prevUserInput, setPrevUserInput] = useState<string>(userInput);

    useEffect(() => {
        if (userInput === '') {
            setIsEditing(true);
        }
    }, [userInput]);

    const handleContentChange = async (currentStatement: string) => {
        handleChange(currentStatement);
    }

    const inputEnterHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" || event.key === "Tab") {
            handleEditEnd();
        } else if (event.key === "Escape") {
            setIsEditing(false);
            // reset input editor value to original value
            changeInput(prevUserInput);
        }
    };

    function addExpressionToTargetPosition(currentStmt: string, targetLine: number, targetColumn: number, codeSnippet: string, endColumn?: number): string {
        if (model && STKindChecker.isIfElseStatement(stmtCtx.modelCtx.statementModel)) {
            const splitStatement: string[] = currentStmt.split(/\n/g) || [];
            splitStatement.splice(targetLine, 1,
                splitStatement[targetLine].slice(0, targetColumn) + codeSnippet + splitStatement[targetLine].slice(endColumn || targetColumn));
            return splitStatement.join('\n');
        }
        return currentStmt.slice(0, targetColumn) + codeSnippet + currentStmt.slice(endColumn || targetColumn);
    }

    const inputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        changeInput(event.target.value);
    };

    const changeInput = (newValue: string) => {
        const currentStatement = stmtCtx.modelCtx.statementModel ? stmtCtx.modelCtx.statementModel.source : "";
        setUserInput(newValue);
        inputEditorCtx.onInputChange(newValue);
        const updatedStatement = addExpressionToTargetPosition(
            currentStatement,
            model ? model.position.startLine : 0,
            model ? model.position.startColumn : 0,
            newValue ? newValue : "",
            model ? model.position.endColumn : 0
        );
        debouncedContentChange(updatedStatement);
    }

    const debouncedContentChange = debounce(handleContentChange, 500);

    const handleDoubleClick = () => {
        if (!isToken){
            setIsEditing(true);
        }
    };

    const handleEditEnd = () => {
        setIsEditing(false);
        setPrevUserInput(userInput);
        if (userInput !== "") {
            updateModel(userInput, model ? model.position : targetPosition, true);
            // expressionHandler(model, false, false, { expressionSuggestions: [] });
        }
    }

    return isEditing ?
        (
            <ClickAwayListener
                mouseEvent="onMouseDown"
                touchEvent="onTouchStart"
                onClickAway={handleEditEnd}
            >
                <input
                    value={INPUT_EDITOR_PLACE_HOLDERS.has(userInput) ? "" : userInput}
                    className={statementEditorClasses.inputEditorTemplate + ' ' + classNames}
                    onKeyDown={inputEnterHandler}
                    onInput={inputChangeHandler}
                    size={userInput.length}
                    autoFocus={true}
                    style={{ maxWidth: userInput === '' ? '10px' : 'fit-content' }}
                    spellCheck="false"
                />
            </ClickAwayListener>
        ) : (
            <span
                className={statementEditorClasses.inputEditorTemplate + ' ' + classNames}
                onDoubleClick={handleDoubleClick}
            >
                {INPUT_EDITOR_PLACE_HOLDERS.has(userInput) ? INPUT_EDITOR_PLACE_HOLDERS.get(userInput) : userInput}
            </span>
        );
}
