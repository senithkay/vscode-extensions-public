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

import { STNode } from "@wso2-enterprise/syntax-tree";
import debounce from "lodash.debounce";

import { InputEditorContext } from "../../store/input-editor-context";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { isPositionsEquals } from "../../utils";
import { EXPR_PLACEHOLDER, STMT_PLACEHOLDER, TYPE_DESC_PLACEHOLDER } from "../../utils/expressions";
import { ModelType, StatementEditorViewState } from "../../utils/statement-editor-viewstate";
import { useStatementEditorStyles } from "../styles";

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

    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            initialSource,
            statementModel,
            updateModel,
            handleChange
        },
        formCtx: {
            formModelPosition: targetPosition
        }
    } = stmtCtx;

    const inputEditorCtx = useContext(InputEditorContext);

    const statementEditorClasses = useStatementEditorStyles();

    const originalValue = React.useMemo(() => {
        let source: string;

        if (!model) {
            source = initialSource ? initialSource : '';
        } else if (model?.value) {
            source = model.value;
        } else {
            source = model.source;
        }

        return source;
    }, [model]);

    const [isEditing, setIsEditing] = useState(false);
    const [userInput, setUserInput] = useState<string>(originalValue);
    const [prevUserInput, setPrevUserInput] = useState<string>(userInput);

    const placeHolder = useMemo(() => {
        const trimmedInput = userInput.trim();
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
        if (userInput === '') {
            setIsEditing(true);
        }
    }, [userInput]);

    const inputEnterHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" || event.key === "Tab") {
            handleEditEnd();
        } else if (event.key === "Escape") {
            setIsEditing(false);
            // reset input editor value to original value
            changeInput(prevUserInput);
        }
    };

    const inputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        changeInput(event.target.value);
    };

    const changeInput = (newValue: string) => {
        if (!newValue) {
            if (isPositionsEquals(statementModel.position, model.position)) {
                // placeholder for empty custom statements
                newValue = STMT_PLACEHOLDER;
            } else {
                newValue = (model.viewState as StatementEditorViewState).modelType === ModelType.TYPE_DESCRIPTOR
                    ? TYPE_DESC_PLACEHOLDER : EXPR_PLACEHOLDER;
            }
        }
        setUserInput(newValue);
        inputEditorCtx.onInputChange(newValue);
        debouncedContentChange(newValue, true);
    }

    const debouncedContentChange = debounce(handleChange, 500);

    const handleDoubleClick = () => {
        if (!notEditable){
            setIsEditing(true);
        }
    };

    const handleEditEnd = () => {
        setIsEditing(false);
        setPrevUserInput(userInput);
        if (userInput !== "") {
            updateModel(userInput, model ? model.position : targetPosition);
        }
    }

    return isEditing ?
        (
            <>
                <input
                    value={INPUT_EDITOR_PLACEHOLDERS.has(userInput.trim()) ? "" : userInput}
                    className={statementEditorClasses.inputEditorTemplate + ' ' + classNames}
                    onKeyDown={inputEnterHandler}
                    onInput={inputChangeHandler}
                    size={userInput.length}
                    autoFocus={true}
                    style={{ maxWidth: userInput === '' ? '10px' : 'fit-content' }}
                    spellCheck="false"
                />
            </>
        ) : (
            <span
                className={statementEditorClasses.inputEditorTemplate + ' ' + classNames}
                onDoubleClick={handleDoubleClick}
            >
                {placeHolder}
            </span>
        );
}
