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
// tslint:disable: jsx-no-multiline-js ordered-imports
import React, { useContext, useEffect, useRef, useState } from "react";

import {NumericLiteral, STKindChecker, STNode, StringLiteral, traversNode} from "@ballerina/syntax-tree";
import debounce from "lodash.debounce";
import { monaco } from "react-monaco-editor";
import { Context } from "../../../../../../../../Contexts/Diagram";
import { ExpressionEditorLangClientInterface } from "../../../../../../../../Definitions";
import { addToTargetLine, addToTargetPosition, getDiagnosticMessage, getFilteredDiagnostics, getTargetPosition } from "../../../ExpressionEditor/utils";
import * as c from "../../constants";
import { ModelContext } from "../../store/model-context";
import { addExpression } from "../../utils/utils";
import { visitor as CodeGenVisitor } from "../../visitors/code-gen-visitor";
import { FormContext } from "../../store/form-context";
import { SuggestionItem, VariableUserInputs } from "../../models/definitions";
import { statementEditorStyles } from "../ViewContainer/styles";

export interface InputEditorProps {
    model: STNode,
    expressionHandler: (suggestions: SuggestionItem[], model: STNode, operator: boolean) => void,
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
            ls: { getExpressionEditorLangClient }
        }
    } = useContext(Context);

    const [inputEditorState, setInputEditorState] = useState({
        name: undefined,
        content: undefined,
        uri: undefined,
        diagnostic: [],
    });

    const { model, expressionHandler, statementType, diagnosticHandler, userInputs } = props;

    const modelCtx = useContext(ModelContext);
    const formCtx = useContext(FormContext);

    const overlayClasses = statementEditorStyles();

    let literalModel: StringLiteral | NumericLiteral;
    let value: any;
    let kind: any;

    if (STKindChecker.isStringLiteral(model)) {
        literalModel = model as StringLiteral;
        kind = c.STRING_LITERAL;
    } else {
        literalModel = model as NumericLiteral;
        kind = c.NUMERIC_LITERAL;
    }
    value = literalModel.literalToken.value;
    const defaultValue = useRef(value);

    const targetPosition = getTargetPosition(targetPositionDraft, syntaxTree);
    const textLabel = userInputs && userInputs.formField ? userInputs.formField : "modelName"
    const varName = "temp_" + (textLabel).replace(/[^A-Z0-9]+/ig, "");
    const varType = userInputs.selectedType;
    const defaultCodeSnippet = varType + " " + varName + " = ;";
    const snippetTargetPosition = defaultCodeSnippet.length;
    const isCustomTemplate = false;

    useEffect(() => {
        CodeGenVisitor.clearCodeSnippet();
        traversNode(modelCtx.statementModel, CodeGenVisitor);
        const ignore = handleOnFocus(CodeGenVisitor.getCodeSnippet(), "");
    }, [statementType]);

    useEffect(() => {
        handleDiagnostic();
    }, [inputEditorState.diagnostic])

    const handleOnFocus = async (currentContent: string, EOL: string) => {
        let initContent: string;
        const newCodeSnippet: string = addToTargetPosition(defaultCodeSnippet, (snippetTargetPosition - 1), currentContent);
        initContent = addToTargetLine((currentFile.content), targetPosition, newCodeSnippet, EOL);

        inputEditorState.name = userInputs && userInputs.formField ? userInputs.formField : "modelName";
        inputEditorState.content = initContent;
        inputEditorState.uri = monaco.Uri.file(currentFile.path).toString();

        const langClient = await getExpressionEditorLangClient(langServerURL);
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
        const codeSnippet = CodeGenVisitor.getCodeSnippet();
        const hasDiagnostic = !inputEditorState.diagnostic.length // true if there are no diagnostics

        formCtx.onChange(codeSnippet);
        formCtx.validate(userInputs.formField, !hasDiagnostic, false);

        // TODO: Need to obtain the default value as a prop
        if (!CodeGenVisitor.getCodeSnippet().includes(' expression ')) {
            diagnosticHandler(getDiagnosticMessage(inputEditorState.diagnostic, varType))
        }
    }

    const handleContentChange = async (currentContent: string, EOL: string) => {
        let newModel: string;
        const newCodeSnippet: string = addToTargetPosition(defaultCodeSnippet, (snippetTargetPosition - 1), currentContent);
        newModel = addToTargetLine((currentFile.content), targetPosition, newCodeSnippet, EOL);

        inputEditorState.name = userInputs && userInputs.formField ? userInputs.formField : "modelName";
        inputEditorState.content = newModel;
        inputEditorState.uri = monaco.Uri.file(currentFile.path).toString();

        formCtx.onChange(currentContent);

        const langClient = await getExpressionEditorLangClient(langServerURL);
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

    const handleOnOutFocus = async () => {
        inputEditorState.name = userInputs && userInputs.formField ? userInputs.formField : "modelName";
        inputEditorState.content = currentFile.content;
        inputEditorState.uri = monaco.Uri.file(currentFile.path).toString();

        const langClient = await getExpressionEditorLangClient(langServerURL);
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
            formCtx.onChange("");

            await getExpressionEditorLangClient(langServerURL).then(async (langClient: ExpressionEditorLangClientInterface) => {
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

    if (formCtx.onCancel) {
        revertContent().then();
    }

    const inputBlurHandler = () => {
        if (defaultValue.current !== "") {
            addExpression(model, kind, value);
            expressionHandler([], model, false);

            const ignore = handleOnOutFocus();
        }
    };

    const inputEnterHandler = (event: React.KeyboardEvent<HTMLSpanElement>) => {
        if (event.code === "Enter" || event.code === "Tab") {
            addExpression(model, kind, event.currentTarget.textContent);
            expressionHandler([], model, false);

            CodeGenVisitor.clearCodeSnippet();
            traversNode(modelCtx.statementModel, CodeGenVisitor);
            const ignore = handleContentChange(CodeGenVisitor.getCodeSnippet(), "")
        }
    };

    const inputChangeHandler = (event: React.KeyboardEvent<HTMLSpanElement>) => {
        addExpression(model, kind, event.currentTarget.textContent ? event.currentTarget.textContent : "");
        expressionHandler([], model, false);
        CodeGenVisitor.clearCodeSnippet();
        traversNode(modelCtx.statementModel, CodeGenVisitor);
        debouncedContentChange(CodeGenVisitor.getCodeSnippet(), "");
    };

    const debouncedContentChange = debounce(handleContentChange, 500);

    return (
        <span
            className={overlayClasses.inputEditorTemplate}
            onKeyDown={inputEnterHandler}
            contentEditable={true}
            suppressContentEditableWarning={true}
            onBlur={inputBlurHandler}
            onInput={inputChangeHandler}
            dangerouslySetInnerHTML={{ __html: defaultValue.current }}
        />
    )
}
