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

import {
    CompletionParams,
    CompletionResponse,
    ExpressionEditorLangClientInterface,
    getDiagnosticMessage,
    getFilteredDiagnostics
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    BooleanLiteral,
    NodePosition,
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
import { getPartialSTForStatement } from "../../utils";
import { useStatementEditorStyles } from "../styles";

import {
    acceptedCompletionKindForExpressions, acceptedCompletionKindForTypes, EXPR_SCHEME, FILE_SCHEME
} from "./constants";

export interface InputEditorProps {
    model: STNode;
    statementType: any;
    diagnosticHandler: (diagnostics: string) => void;
    userInputs: VariableUserInputs;
    isTypeDescriptor: boolean;
}

export function InputEditor(props: InputEditorProps) {

    const [isEditing, setIsEditing] = useState(false);
    const [inputEditorState, setInputEditorState] = useState({
        name: undefined,
        content: undefined,
        uri: undefined,
        diagnostic: [],
    });

    const { model, statementType, diagnosticHandler, userInputs, isTypeDescriptor } = props;

    const stmtCtx = useContext(StatementEditorContext);
    const inputEditorCtx = useContext(InputEditorContext);
    const { expressionHandler } = useContext(SuggestionsContext);
    const { currentFile, getLangClient } = stmtCtx;
    const fileURI = monaco.Uri.file(currentFile.path).toString().replace(FILE_SCHEME, EXPR_SCHEME);

    const statementEditorClasses = useStatementEditorStyles();

    let literalModel: StringLiteral | NumericLiteral | SimpleNameReference | QualifiedNameReference;
    let value: any;
    let kind: any;

    if (STKindChecker.isStringLiteral(model)) {
        literalModel = model as StringLiteral;
        kind = c.STRING_LITERAL;
        value = literalModel.literalToken.value;
    } else if (STKindChecker.isNumericLiteral(model)) {
        literalModel = model as NumericLiteral;
        kind = c.NUMERIC_LITERAL;
        value = literalModel.literalToken.value;
    } else if (STKindChecker.isIdentifierToken(model)) {
        value = model.value;
    } else if (STKindChecker.isSimpleNameReference(model)) {
        literalModel = model as SimpleNameReference;
        kind = c.SIMPLE_NAME_REFERENCE;
        value = literalModel.name.value;
    } else if (STKindChecker.isQualifiedNameReference(model)) {
        literalModel = model as QualifiedNameReference;
        kind = c.QUALIFIED_NAME_REFERENCE;
        value = `${literalModel.modulePrefix.value}${literalModel.colon.value}${literalModel.identifier.value}`;
    } else if (STKindChecker.isBooleanLiteral(model)) {
        literalModel = model as BooleanLiteral;
        kind = c.BOOLEAN_LITERAL;
        value = literalModel.literalToken.value;
    } else if ((STKindChecker.isStringTypeDesc(model)
        || STKindChecker.isBooleanTypeDesc(model)
        || STKindChecker.isDecimalTypeDesc(model)
        || STKindChecker.isFloatTypeDesc(model)
        || STKindChecker.isIntTypeDesc(model)
        || STKindChecker.isJsonTypeDesc(model)
        || STKindChecker.isVarTypeDesc(model))) {
        value = model.name.value;
    } else {
        value = model.source;
    }

    const [userInput, setUserInput] = useState(value);

    const targetPosition = stmtCtx.formCtx.formModelPosition;
    const textLabel = userInputs && userInputs.formField ? userInputs.formField : "modelName"
    const varName = userInputs && userInputs.varName ? userInputs.varName : "temp_" + (textLabel).replace(/[^A-Z0-9]+/ig, "");
    const varType = userInputs ? userInputs.selectedType : 'string';
    const isCustomTemplate = false;
    let currentContent = stmtCtx.modelCtx.statementModel.source;

    const placeHolders: string[] = ['EXPRESSION', 'TYPE_DESCRIPTOR'];

    useEffect(() => {
        handleOnFocus(currentContent, "").then(() => {
            handleOnOutFocus().then();
        })
        getContextBasedCompletions(placeHolders.indexOf(userInput) > -1 ? "" : userInput);
    }, [statementType]);

    useEffect(() => {
        handleDiagnostic();
    }, [inputEditorState.diagnostic]);

    useEffect(() => {
        setUserInput(value);
        if (isEditing) {
            handleContentChange(currentContent).then(() => {
                handleOnOutFocus().then();
            });
        }
    }, [value]);

    useEffect(() => {
        if (userInput === '') {
            setIsEditing(true);
        }
    }, [isEditing, userInput]);

    async function addStatementToTargetLine(currentFileContent: string, position: NodePosition, currentStatement: string): Promise<string> {
        const modelContent: string[] = currentFileContent.split(/\n/g) || [];
        if (position?.startColumn && position?.endColumn && position?.endLine) {
            return getModifiedStatement(currentStatement, position);
        } else {
            modelContent.splice(position?.startLine, 0, currentStatement);
            return modelContent.join('\n');
        }
    }

    async function getModifiedStatement(codeSnippet: string, position: NodePosition): Promise<string> {
        const stModification = {
            startLine: position.startLine,
            startColumn: position.startColumn,
            endLine: position.endLine,
            endColumn: position.endColumn,
            newCodeSnippet: codeSnippet
        }
        const partialST: STNode = await getPartialSTForStatement({
            codeSnippet: currentFile.content,
            stModification
        }, getLangClient);
        return partialST.source;
    }

    const handleOnFocus = async (currentStatement: string, EOL: string) => {
        const initContent: string = await addStatementToTargetLine(currentFile.content, targetPosition, currentStatement);

        inputEditorState.name = userInputs && userInputs.formField ? userInputs.formField : "modelName";
        inputEditorState.content = initContent;
        inputEditorState.uri = fileURI;
        const langClient = await getLangClient();
        langClient.didOpen({
            textDocument: {
                uri: inputEditorState.uri,
                languageId: "ballerina",
                text: currentFile.content,
                version: 1
            }
        });
        langClient.didChange({
            contentChanges: [
                {
                    text: inputEditorState.content
                }
            ],
            textDocument: {
                uri: inputEditorState.uri,
                version: 1
            }
        });
        const diagResp = await langClient.getDiagnostics({
            documentIdentifier: {
                uri: inputEditorState.uri,
            }
        })
        setInputEditorState({
            ...inputEditorState,
            diagnostic: diagResp[0]?.diagnostics ? getFilteredDiagnostics(diagResp[0]?.diagnostics, isCustomTemplate) : []
        })
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
        const initContent: string = await addStatementToTargetLine(currentFile.content, targetPosition, currentStatement);

        inputEditorState.name = userInputs && userInputs.formField ? userInputs.formField : "modelName";
        inputEditorState.content = initContent;
        inputEditorState.uri = fileURI;
        const langClient = await getLangClient();
        langClient.didChange({
            contentChanges: [
                {
                    text: inputEditorState.content
                }
            ],
            textDocument: {
                uri: inputEditorState.uri,
                version: 1
            }
        });
        const diagResp = await langClient.getDiagnostics({
            documentIdentifier: {
                uri: inputEditorState.uri,
            }
        })
        setInputEditorState({
            ...inputEditorState,
            diagnostic: diagResp[0]?.diagnostics ? getFilteredDiagnostics(diagResp[0]?.diagnostics, isCustomTemplate) : []
        })
        currentContent = currentStatement;

        if (isEditing) {
            getContextBasedCompletions(currentCodeSnippet != null ? currentCodeSnippet : userInput);
        }
    }

    const handleOnOutFocus = async () => {
        inputEditorState.name = userInputs && userInputs.formField ? userInputs.formField : "modelName";
        inputEditorState.content = currentFile.content;
        inputEditorState.uri = fileURI;

        const langClient = await getLangClient();
        langClient.didClose({
            textDocument: {
                uri: inputEditorState.uri
            }
        });
    }

    const revertContent = async () => {
        if (inputEditorState?.uri) {
            inputEditorState.name = userInputs && userInputs.formField ? userInputs.formField : "modelName";
            inputEditorState.content = (currentFile.content);
            inputEditorState.uri = inputEditorState?.uri;

            await getLangClient().then(async (langClient: ExpressionEditorLangClientInterface) => {
                await langClient.didChange({
                    contentChanges: [
                        {
                            text: inputEditorState.content
                        }
                    ],
                    textDocument: {
                        uri: inputEditorState.uri,
                        version: 1
                    }
                });
            });
        }
    }

    const getContextBasedCompletions = async (codeSnippet: string) => {
        const completionParams: CompletionParams = {
            textDocument: {
                uri: inputEditorState?.uri
            },
            context: {
                triggerKind: 1
            },
            position: {
                character: (targetPosition.startColumn + (model.position.startColumn) + codeSnippet.length),
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

                const variableSuggestions: SuggestionItem[] = filteredCompletionItem.map((obj) => {
                    return { value: obj.label, kind: obj.detail }
                });

                if (isTypeDescriptor) {
                    expressionHandler(model, false, true, { typeSuggestions: variableSuggestions });
                } else {
                    expressionHandler(model, false, false, { variableSuggestions });
                }
            });
        });
    }

    if (stmtCtx.formCtx.onCancel) {
        revertContent().then();
    }

    const inputEnterHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" || event.key === "Tab" || event.key === "Escape") {
            setIsEditing(false);
            if (userInput !== "") {
                stmtCtx.modelCtx.updateModel(userInput, model.position);
                expressionHandler(model, false, false, { expressionSuggestions: [] });

                const ignore = handleOnOutFocus();
            }
            getContextBasedCompletions(userInput);
        }
    };

    function addExpressionToTargetPosition(currentStmt: string, targetLine: number, targetColumn: number, codeSnippet: string, endColumn?: number): string {
        if (STKindChecker.isIfElseStatement(stmtCtx.modelCtx.statementModel)) {
            const splitStatement: string[] = currentStmt.split(/\n/g) || [];
            splitStatement.splice(targetLine, 1,
                splitStatement[targetLine].slice(0, targetColumn) + codeSnippet + splitStatement[targetLine].slice(endColumn || targetColumn));
            return splitStatement.join('\n');
        }
        return currentStmt.slice(0, targetColumn) + codeSnippet + currentStmt.slice(endColumn || targetColumn);
    }

    const inputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const currentStatement = stmtCtx.modelCtx.statementModel.source;
        setUserInput(event.target.value);
        inputEditorCtx.onInputChange(event.target.value);
        const updatedStatement = addExpressionToTargetPosition(
            currentStatement,
            model.position.startLine,
            model.position.startColumn,
            event.target.value ? event.target.value : "",
            model.position.endColumn
        );
        debouncedContentChange(updatedStatement, event.target.value);
    };

    const debouncedContentChange = debounce(handleContentChange, 500);

    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    const handleEditEnd = () => {
        setIsEditing(false);
    }

    return isEditing ?
        (
            <input
                value={placeHolders.indexOf(userInput) > -1 ? "" : userInput}
                className={statementEditorClasses.inputEditorTemplate}
                onKeyDown={inputEnterHandler}
                onInput={inputChangeHandler}
                autoFocus={true}
                style={{ maxWidth: userInput === '' ? '10px' : 'fit-content' }}
            />
        ) : (
            <div
                className={statementEditorClasses.inputEditorTemplate}
                onDoubleClick={handleDoubleClick}
                onBlur={handleEditEnd}
            >
                {userInput}
            </div>
        );
}
