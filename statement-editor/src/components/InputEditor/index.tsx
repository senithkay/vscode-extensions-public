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
import React, { useContext, useEffect, useMemo, useState } from "react";

import { ClickAwayListener } from "@material-ui/core";
import { STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import debounce from "lodash.debounce";

import { DEFAULT_INTERMEDIATE_CLAUSE } from "../../constants";
import { InputEditorContext } from "../../store/input-editor-context";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { isPositionsEquals } from "../../utils";
import { EXPR_PLACEHOLDER, STMT_PLACEHOLDER, TYPE_DESC_PLACEHOLDER } from "../../utils/expressions";
import { ModelType, StatementEditorViewState } from "../../utils/statement-editor-viewstate";
import { useStatementRendererStyles } from "../styles";

import {
    INPUT_EDITOR_PLACEHOLDERS
} from "./constants";

export interface InputEditorProps {
    model?: STNode;
    classNames?: string;
    notEditable?: boolean;
}

export function InputEditor(props: InputEditorProps) {

    const { model, classNames, notEditable } = props;

    const {
        modelCtx: {
            initialSource,
            statementModel,
            updateModel,
            handleChange,
            hasSyntaxDiagnostics,
            currentModel
        },
        targetPosition,
    } = useContext(StatementEditorContext);

    const inputEditorCtx = useContext(InputEditorContext);

    const statementRendererClasses = useStatementRendererStyles();

    const originalValue = React.useMemo(() => {
        let source: string;

        if (!model) {
            source = initialSource ? initialSource : '';
        } else if (model?.value) {
            source = model.value;
        } else {
            source = model.source;
        }

        return source.trim();
    }, [model]);

    const [isEditing, setIsEditing] = useState(false);
    const [userInput, setUserInput] = useState<string>(originalValue);
    const [prevUserInput, setPrevUserInput] = useState<string>(userInput);

    const placeHolder = useMemo(() => {
        const trimmedInput = !!userInput ? userInput.trim() : EXPR_PLACEHOLDER;
        if (statementModel && INPUT_EDITOR_PLACEHOLDERS.has(trimmedInput)) {
            if (isPositionsEquals(statementModel.position, model.position)) {
                // override the placeholder when the statement is empty
                return INPUT_EDITOR_PLACEHOLDERS.get(STMT_PLACEHOLDER);
            } else {
                return INPUT_EDITOR_PLACEHOLDERS.get(trimmedInput);
            }
        } else {
            return trimmedInput;
        }
    }, [userInput]);

    useEffect(() => {
        setUserInput(originalValue);
    }, [originalValue]);

    useEffect(() => {
        if (currentModel.model && isPositionsEquals(currentModel.model.position, model.position)){
            setIsEditing(currentModel.isEntered ? currentModel.isEntered : false);
        }
    }, [currentModel]);

    useEffect(() => {
        if (userInput === '') {
            setIsEditing(true);
        }
    }, [userInput]);

    useEffect(() => {
        const suggestion = inputEditorCtx.suggestionInput
        if (hasSyntaxDiagnostics) {
            setIsEditing(false);
            if (currentModel.model === model && suggestion) {
                setUserInput(suggestion);
            }
        } else {
            setUserInput(originalValue)
        }
    }, [hasSyntaxDiagnostics]);

    const inputEnterHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" || event.key === "Tab") {
            handleEditEnd();
        } else if (event.key === "Escape") {
            setIsEditing(false);
            // reset input editor value to original value
            changeInput(prevUserInput);
        }
    };

    const clickAwayHandler = (event: any) => {
        if (!event.path[0].className.includes("suggestion")){
            handleEditEnd();
        }
        setIsEditing(false);
    };


    const inputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        changeInput(event.target.value);
    };

    const changeInput = (newValue: string) => {
        let input = newValue;
        if (!newValue) {
            if (isPositionsEquals(statementModel.position, model.position)) {
                // placeholder for empty custom statements
                input = STMT_PLACEHOLDER;
            } else {
                input = (model.viewState as StatementEditorViewState).modelType === ModelType.TYPE_DESCRIPTOR
                    ? TYPE_DESC_PLACEHOLDER : EXPR_PLACEHOLDER;
            }
        }
        setUserInput(input);
        inputEditorCtx.onInputChange(input);
        inputEditorCtx.onSuggestionSelection('');
        debouncedContentChange(newValue, true);
    }

    const debouncedContentChange = debounce(handleChange, 500);

    const handleDoubleClick = () => {
        if (!notEditable && !hasSyntaxDiagnostics) {
            setIsEditing(true);
        } else if (!notEditable && hasSyntaxDiagnostics && (currentModel.model === model)) {
            setIsEditing(true);
        }
    };

    const handleEditEnd = () => {
        setPrevUserInput(userInput);
        if (userInput !== "") {
            let input = userInput
            // Remove semicolon
            if (userInput.includes(";") && !STKindChecker.isLocalVarDecl(model)) {
                input = userInput.replace(/(;)(?=(?:[^"]|"[^"]*")*$)/g, "");
                setUserInput(input);
            }
            // Replace empty interpolation with placeholder value
            const codeSnippet = input.replaceAll('${}', "${" + EXPR_PLACEHOLDER + "}");
            originalValue === DEFAULT_INTERMEDIATE_CLAUSE ? updateModel(codeSnippet, model ? model.parent.parent.position : targetPosition) :
            updateModel(codeSnippet, model ? model.position : targetPosition);
        }
        setIsEditing(false);
    }

    return isEditing ?
        (
            <ClickAwayListener  mouseEvent="onMouseDown" onClickAway={clickAwayHandler}>
                <input
                    data-testid="input-editor"
                    value={INPUT_EDITOR_PLACEHOLDERS.has(userInput) ? "" : userInput}
                    className={statementRendererClasses.inputEditorTemplate + ' ' + classNames}
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
                data-testid="input-editor-span"
                className={statementRendererClasses.inputEditorTemplate + ' ' + classNames}
                onDoubleClick={handleDoubleClick}
            >
                {placeHolder}
            </span>
        );
}
