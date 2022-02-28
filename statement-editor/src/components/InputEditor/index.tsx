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
    CompletionParams,
    CompletionResponse,
    ExpressionEditorLangClientInterface,
    getDiagnosticMessage,
    getFilteredDiagnostics
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
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
import * as monaco from "monaco-editor";

import * as c from "../../constants";
import { SuggestionItem, VariableUserInputs } from "../../models/definitions";
import { InputEditorContext } from "../../store/input-editor-context";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { SuggestionsContext } from "../../store/suggestions-context";
import { sortSuggestions } from "../../utils";
import {
    addImportStatements,
    addStatementToTargetLine,
    getDiagnostics,
    sendDidChange,
    sendDidClose,
    sendDidOpen
} from "../../utils/ls-utils";
import { useStatementEditorStyles } from "../styles";

import {
    acceptedCompletionKindForExpressions, acceptedCompletionKindForTypes, EXPR_SCHEME, FILE_SCHEME
} from "./constants";

export interface InputEditorProps {
    model?: STNode;
    statementType: any;
    diagnosticHandler: (diagnostics: string) => void;
    userInputs: VariableUserInputs;
    isTypeDescriptor: boolean;
    isToken?: boolean;
    classNames?: string;
}

export function InputEditor(props: InputEditorProps) {

    const [isEditing, setIsEditing] = useState(false);
    const [inputEditorState, setInputEditorState] = useState({
        name: undefined,
        content: undefined,
        uri: undefined,
        diagnostic: [],
    });

    const { model, diagnosticHandler, userInputs, isTypeDescriptor, isToken, classNames } = props;

    const stmtCtx = useContext(StatementEditorContext);
    const inputEditorCtx = useContext(InputEditorContext);
    const { expressionHandler } = useContext(SuggestionsContext);
    const {
        modelCtx: {
            initialSource
        },
        currentFile,
        getLangClient,
        modules: {
            modulesToBeImported
        }
    } = stmtCtx;
    const fileURI = monaco.Uri.file(currentFile.path).toString().replace(FILE_SCHEME, EXPR_SCHEME);

    const statementEditorClasses = useStatementEditorStyles();

    let literalModel: StringLiteral | NumericLiteral | SimpleNameReference | QualifiedNameReference;
    let originalValue: any;
    let kind: any;

    if (!model) {
        originalValue = initialSource ? initialSource : '';
    } else if (STKindChecker.isStringLiteral(model)) {
        literalModel = model as StringLiteral;
        kind = c.STRING_LITERAL;
        originalValue = literalModel.literalToken.value;
    } else if (STKindChecker.isNumericLiteral(model)) {
        literalModel = model as NumericLiteral;
        kind = c.NUMERIC_LITERAL;
        originalValue = literalModel.literalToken.value;
    } else if (STKindChecker.isIdentifierToken(model)) {
        originalValue = model.value;
    } else if (STKindChecker.isSimpleNameReference(model)) {
        literalModel = model as SimpleNameReference;
        kind = c.SIMPLE_NAME_REFERENCE;
        originalValue = literalModel.name.value;
    } else if (STKindChecker.isQualifiedNameReference(model)) {
        literalModel = model as QualifiedNameReference;
        kind = c.QUALIFIED_NAME_REFERENCE;
        originalValue = `${literalModel.modulePrefix.value}${literalModel.colon.value}${literalModel.identifier.value}`;
    } else if (STKindChecker.isBooleanLiteral(model)) {
        literalModel = model as BooleanLiteral;
        kind = c.BOOLEAN_LITERAL;
        originalValue = literalModel.literalToken.value;
    } else if ((STKindChecker.isStringTypeDesc(model)
        || STKindChecker.isBooleanTypeDesc(model)
        || STKindChecker.isDecimalTypeDesc(model)
        || STKindChecker.isFloatTypeDesc(model)
        || STKindChecker.isIntTypeDesc(model)
        || STKindChecker.isJsonTypeDesc(model)
        || STKindChecker.isVarTypeDesc(model))) {
        originalValue = model.name.value;
    } else if (isToken) {
        originalValue = model.value;
    } else {
        originalValue = model.source;
    }

    const [userInput, setUserInput] = useState<string>(originalValue);
    const [prevUserInput, setPrevUserInput] = useState<string>(userInput);


    const targetPosition = stmtCtx.formCtx.formModelPosition;
    const textLabel = userInputs && userInputs.formField ? userInputs.formField : "modelName"
    const varName = userInputs && userInputs.varName ? userInputs.varName : "temp_" + (textLabel).replace(/[^A-Z0-9]+/ig, "");
    const varType = userInputs ? userInputs.selectedType : 'string';
    const isCustomTemplate = false;
    let currentContent = stmtCtx.modelCtx.statementModel ? stmtCtx.modelCtx.statementModel.source : "";

    const placeHolders: string[] = ['EXPRESSION', 'TYPE_DESCRIPTOR'];

    useEffect(() => {
        if (isEditing) {
            handleOnFocus(currentContent).then();
        }
    }, [isEditing]);

    useEffect(() => {
        handleDiagnostic();
    }, [inputEditorState.diagnostic]);

    useEffect(() => {
        setUserInput(originalValue);
        handleOnFocus(currentContent).then(() => {
            handleContentChange(currentContent).then();
        });
    }, [originalValue]);

    useEffect(() => {
        if (userInput === '') {
            setIsEditing(true);
        }
    }, [userInput]);

    const handleOnFocus = async (currentStatement: string) => {
        let initContent: string = await addStatementToTargetLine(
            currentFile.content, targetPosition, currentStatement, getLangClient);

        if (modulesToBeImported.size > 0) {
            initContent = await addImportStatements(initContent, Array.from(modulesToBeImported) as string[]);
        }

        inputEditorState.name = userInputs && userInputs.formField ? userInputs.formField : "modelName";
        inputEditorState.content = initContent;
        inputEditorState.uri = fileURI;
        sendDidOpen(inputEditorState.uri, currentFile.content, getLangClient).then();
        sendDidChange(inputEditorState.uri, inputEditorState.content, getLangClient).then();
    }

    const handleDiagnostic = () => {
        const hasDiagnostic = !!inputEditorState.diagnostic.length;

        stmtCtx.statementCtx.validateStatement(!hasDiagnostic);

        // TODO: Need to obtain the default value as a prop
        if (!placeHolders.some(word => currentContent.includes(word))) {
            diagnosticHandler(getDiagnosticMessage(inputEditorState.diagnostic, varType))
        }
    }

    const handleContentChange = async (currentStatement: string, currentCodeSnippet?: string) => {
        if (currentStatement.slice(-1) !== ';') {
            currentStatement += ';';
        }
        let initContent: string = await addStatementToTargetLine(
            currentFile.content, targetPosition, currentStatement, getLangClient);

        if (modulesToBeImported.size > 0) {
            initContent = await addImportStatements(initContent, Array.from(modulesToBeImported) as string[]);
        }

        inputEditorState.name = userInputs && userInputs.formField ? userInputs.formField : "modelName";
        inputEditorState.content = initContent;
        inputEditorState.uri = fileURI;
        sendDidChange(inputEditorState.uri, inputEditorState.content, getLangClient).then();
        const diagResp = await getDiagnostics(inputEditorState.uri, getLangClient);
        setInputEditorState((prevState) => {
            return {
                ...prevState,
                diagnostic: diagResp[0]?.diagnostics ?
                    getFilteredDiagnostics(diagResp[0]?.diagnostics, isCustomTemplate) :
                    []
            };
        });
        currentContent = currentStatement;

        if (isEditing) {
            await getContextBasedCompletions(currentCodeSnippet != null ? currentCodeSnippet : userInput);
        }
    }

    const handleOnOutFocus = async () => {
        inputEditorState.name = userInputs && userInputs.formField ? userInputs.formField : "modelName";
        inputEditorState.content = currentFile.content;
        inputEditorState.uri = fileURI;

        sendDidClose(inputEditorState.uri, getLangClient).then();
    }

    // TODO: To be removed with expression editor integration
    const getContextBasedCompletions = async (codeSnippet: string) => {
        const completionParams: CompletionParams = {
            textDocument: {
                uri: inputEditorState?.uri
            },
            context: {
                triggerKind: 1
            },
            position: {
                character: model ? (targetPosition.startColumn + (model.position.startColumn) + codeSnippet.length) :
                    (targetPosition.startColumn + codeSnippet.length),
                line: targetPosition.startLine
            }
        }

        // CodeSnippet is split to get the suggestions for field-access-expr (expression.field-name)
        const splitCodeSnippet = codeSnippet.split('.');

        getLangClient().then((langClient: ExpressionEditorLangClientInterface) => {
            langClient.getCompletion(completionParams).then((values: CompletionResponse[]) => {
                const filteredCompletionItem: CompletionResponse[] = values.filter((completionResponse: CompletionResponse) => (
                    (!completionResponse.kind ||
                        (isTypeDescriptor ?
                            acceptedCompletionKindForTypes.includes(completionResponse.kind) :
                            acceptedCompletionKindForExpressions.includes(completionResponse.kind)
                        )
                    ) &&
                    completionResponse.label !== varName.trim() &&
                    !(completionResponse.label.includes("main")) &&
                    (splitCodeSnippet.some((element) => (
                        ((completionResponse.label.toLowerCase()).includes(element.toLowerCase()))
                    )
                    ))
                ));

                filteredCompletionItem.sort(sortSuggestions)

                const variableSuggestions: SuggestionItem[] = filteredCompletionItem.map((obj) => {
                    return { value: obj.label, kind: obj.detail, suggestionType: obj.kind }
                });

                if (isTypeDescriptor) {
                    expressionHandler(model, false, true, { typeSuggestions: variableSuggestions });
                } else {
                    expressionHandler(model, false, false, { variableSuggestions });
                }
            });
        });
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
        debouncedContentChange(updatedStatement, newValue);
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
            stmtCtx.modelCtx.updateModel(userInput, model ? model.position : targetPosition);
            expressionHandler(model, false, false, { expressionSuggestions: [] });

            const ignore = handleOnOutFocus();
        }
        getContextBasedCompletions(userInput);
    }

    return isEditing ?
        (
            <ClickAwayListener
                mouseEvent="onMouseDown"
                touchEvent="onTouchStart"
                onClickAway={handleEditEnd}
            >
                <input
                    value={placeHolders.indexOf(userInput) > -1 ? "" : userInput}
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
                {placeHolders.indexOf(userInput) > -1 ? "<add-expression>" : userInput}
            </span>
        );
}
