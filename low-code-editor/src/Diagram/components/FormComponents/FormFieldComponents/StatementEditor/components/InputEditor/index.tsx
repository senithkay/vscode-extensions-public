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
import { monaco } from "react-monaco-editor";

import {
    BooleanLiteral, NodePosition,
    NumericLiteral, QualifiedNameReference,
    SimpleNameReference,
    STKindChecker,
    STNode,
    StringLiteral} from "@ballerina/syntax-tree";
import debounce from "lodash.debounce";

import { Context } from "../../../../../../../Contexts/Diagram";
import { CompletionParams, CompletionResponse, ExpressionEditorLangClientInterface } from "../../../../../../../Definitions";
import { getDiagnosticMessage, getFilteredDiagnostics, getTargetPosition } from "../../../ExpressionEditor/utils";
import * as c from "../../constants";
import { SuggestionItem, VariableUserInputs } from "../../models/definitions";
import { InputEditorContext } from "../../store/input-editor-context";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { SuggestionsContext } from "../../store/suggestions-context";
import { getDataTypeOnExpressionKind, getExpressionSource, getPartialSTForStatement } from "../../utils";
import { useStatementEditorStyles } from "../ViewContainer/styles";

import { acceptedCompletionKind } from "./constants";

export interface InputEditorProps {
    model: STNode,
    statementType: any,
    diagnosticHandler: (diagnostics: string) => void,
    userInputs: VariableUserInputs
}

export function InputEditor(props: InputEditorProps) {
    const {
        state: { targetPosition: targetPositionDraft },
        props: {
            currentFile,
            langServerURL,
            syntaxTree,
        },
        api: {
            ls
        }
    } = useContext(Context);

    const [isEditing, setIsEditing] = useState(false);
    const [inputEditorState, setInputEditorState] = useState({
        name: undefined,
        content: undefined,
        uri: undefined,
        diagnostic: [],
    });

    const { model, statementType, diagnosticHandler, userInputs } = props;

    const inputEditorCtx = useContext(InputEditorContext);
    const stmtCtx = useContext(StatementEditorContext);
    const { expressionHandler } = useContext(SuggestionsContext);

    const [currentContent, setCurrentContent] = useState(stmtCtx.modelCtx.statementModel.source);

    const overlayClasses = useStatementEditorStyles();

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
    }
    const [userInput, setUserInput] = useState(value);

    const targetPosition = stmtCtx.formCtx.formModel && stmtCtx.formCtx.formModel.position ?
        stmtCtx.formCtx.formModel.position : getTargetPosition(targetPositionDraft, syntaxTree);
    const textLabel = userInputs && userInputs.formField ? userInputs.formField : "modelName"
    const varName = userInputs && userInputs.varName ? userInputs.varName : "temp_" + (textLabel).replace(/[^A-Z0-9]+/ig, "");
    const varType = userInputs ? userInputs.selectedType : 'string';
    const defaultCodeSnippet = varType + " " + varName + " = ;";
    const snippetTargetPosition = defaultCodeSnippet.length;
    const isCustomTemplate = false;

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
        handleContentChange(currentContent, "").then(() => {
            handleOnOutFocus().then();
        });
    }, [inputEditorCtx.userInput]);

    useEffect(() => {
        if (userInput === '') {
            setIsEditing(true);
        }
    }, [isEditing]);

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
        }, langServerURL, ls);
        return partialST.source;
    }

    const handleOnFocus = async (currentStatement: string, EOL: string) => {
        const initContent: string = await addStatementToTargetLine(currentFile.content, targetPosition, currentStatement);

        inputEditorState.name = userInputs && userInputs.formField ? userInputs.formField : "modelName";
        inputEditorState.content = initContent;
        inputEditorState.uri = monaco.Uri.file(currentFile.path).toString();

        const langClient = await ls.getExpressionEditorLangClient(langServerURL);
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
        const hasDiagnostic = !inputEditorState.diagnostic.length // true if there are no diagnostics

        stmtCtx.formCtx.onChange(getExpressionSource(stmtCtx.modelCtx.statementModel));
        stmtCtx.formCtx.validate('', !hasDiagnostic, false);

        // TODO: Need to obtain the default value as a prop
        if (!placeHolders.some(word => currentContent.includes(word))) {
            diagnosticHandler(getDiagnosticMessage(inputEditorState.diagnostic, varType))
        }
    }

    const handleContentChange = async (currentStatement: string, EOL: string) => {
        const initContent: string = await addStatementToTargetLine(currentFile.content, targetPosition, currentStatement);

        inputEditorState.name = userInputs && userInputs.formField ? userInputs.formField : "modelName";
        inputEditorState.content = initContent;
        inputEditorState.uri = monaco.Uri.file(currentFile.path).toString();

        stmtCtx.formCtx.onChange(getExpressionSource(stmtCtx.modelCtx.statementModel));

        const langClient = await ls.getExpressionEditorLangClient(langServerURL);
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
        setCurrentContent(currentStatement);
    }

    const handleOnOutFocus = async () => {
        inputEditorState.name = userInputs && userInputs.formField ? userInputs.formField : "modelName";
        inputEditorState.content = currentFile.content;
        inputEditorState.uri = monaco.Uri.file(currentFile.path).toString();

        stmtCtx.formCtx.onChange(getExpressionSource(stmtCtx.modelCtx.statementModel));

        const langClient = await ls.getExpressionEditorLangClient(langServerURL);
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
    }

    const revertContent = async () => {
        if (inputEditorState?.uri) {
            inputEditorState.name = userInputs && userInputs.formField ? userInputs.formField : "modelName";
            inputEditorState.content = (currentFile.content);
            inputEditorState.uri = inputEditorState?.uri;
            stmtCtx.formCtx.onChange("");

            await ls.getExpressionEditorLangClient(langServerURL).then(async (langClient: ExpressionEditorLangClientInterface) => {
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
                character: (codeSnippet.length + (snippetTargetPosition - 1)),
                line: targetPosition.startLine
            }
        }

        const acceptedDataType: string[] = getDataTypeOnExpressionKind(model.kind);

        ls.getExpressionEditorLangClient(langServerURL).then((langClient: ExpressionEditorLangClientInterface) => {
            langClient.getCompletion(completionParams).then((values: CompletionResponse[]) => {
                const filteredCompletionItem: CompletionResponse[] = values.filter((completionResponse: CompletionResponse) => (
                    (!completionResponse.kind || acceptedCompletionKind.includes(completionResponse.kind)) &&
                    ((varType === "string") ? completionResponse.detail === varType : acceptedDataType.includes(completionResponse.detail)) &&
                    completionResponse.label !== varName &&
                    ((completionResponse.label.replace(/["]+/g, '')).startsWith(codeSnippet)) &&
                    !(completionResponse.label.includes("main"))
                ));

                const variableSuggestions: SuggestionItem[] = filteredCompletionItem.map((obj) => {
                    return { value: obj.label, kind: obj.detail }
                });

                expressionHandler(model, false, { variableSuggestions });
            });
        });
    }

    if (stmtCtx.formCtx.onCancel) {
        revertContent().then();
    }

    const inputBlurHandler = () => {
        setIsEditing(false);
        if (userInput !== "") {
            stmtCtx.modelCtx.updateModel(userInput, model.position);
            expressionHandler(model, false, { expressionSuggestions: [] });

            const ignore = handleOnOutFocus();
        }
    };

    const inputEnterHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" || event.key === "Tab" || event.key === "Escape") {
            stmtCtx.modelCtx.updateModel(userInput, model.position);
            inputBlurHandler()
            getContextBasedCompletions(userInput);
        }
    };

    function addExpressionToTargetPosition(oldLine: string, targetColumn: number, codeSnippet: string, endColumn?: number): string {
        return oldLine.slice(0, targetColumn) + codeSnippet + oldLine.slice(endColumn || targetColumn);
    }

    const inputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const currentStatement = stmtCtx.modelCtx.statementModel.source;
        const updatedStatement = addExpressionToTargetPosition(currentStatement, model.position.startColumn + 1, event.target.value ? event.target.value : "", model.position.endColumn + 1);
        debouncedContentChange(updatedStatement, "");
        getContextBasedCompletions(event.target.value);
        setUserInput(event.target.value);
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
                className={overlayClasses.inputEditorTemplate}
                onKeyDown={inputEnterHandler}
                onBlur={inputBlurHandler}
                onInput={inputChangeHandler}
                autoFocus={true}
                style={{ maxWidth: userInput === '' ? '10px' : 'fit-content' }}
            />
        ) : (
            <div
                className={overlayClasses.inputEditorTemplate}
                onDoubleClick={handleDoubleClick}
                onBlur={handleEditEnd}
            >
                {userInput}
            </div>
        );
}
