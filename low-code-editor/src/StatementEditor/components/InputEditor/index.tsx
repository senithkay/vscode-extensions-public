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

import { NumericLiteral, STNode, StringLiteral, traversNode } from "@ballerina/syntax-tree";
import debounce from "lodash.debounce";
import { monaco } from "react-monaco-editor";
import { Context } from "../../../Contexts/Diagram";
import { ExpressionEditorLangClientInterface } from "../../../Definitions";
import { addToTargetLine, addToTargetPosition, getDiagnosticMessage, getFilteredDiagnostics, getTargetPosition } from "../../../Diagram/components/Portals/ConfigForm/Elements/ExpressionEditor/utils";
import * as c from "../../constants";
import { ModelContext } from "../../store/model-context";
import { addExpression, SuggestionItem } from "../../utils/utils";
import { visitor as CodeGenVisitor } from "../Visitors/codeGenVisitor";
import { OnCancelContext } from "../../store/form-cancel-context";

export interface InputEditorProps {
    model: STNode,
    callBack: (suggestions: SuggestionItem[], model: STNode, operator: boolean) => void,
    statementType: any,
    diagnosticHandler: (diagnostics: string) => void
}

export function InputEditor(props: InputEditorProps) {
    const {
        state: { targetPosition: targetPositionDraft },
        props: {
            currentApp,
            currentFile,
            langServerURL,
            syntaxTree,
            diagnostics: mainDiagnostics,
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

    const { model, callBack, statementType, diagnosticHandler } = props;
    const modelCtx = useContext(ModelContext);
    const onCancelCtx = useContext(OnCancelContext);

    let literalModel: StringLiteral | NumericLiteral;
    let value: any;
    let kind: any;

    if (model.kind === "StringLiteral") {
        literalModel = model as StringLiteral;
        kind = c.STRING_LITERAL;
    } else {
        literalModel = model as NumericLiteral;
        kind = c.NUMERIC_LITERAL;
    }
    value = literalModel.literalToken.value;
    const defaultValue = useRef(value);

    const targetPosition = getTargetPosition(targetPositionDraft, syntaxTree);
    // TODO: Need to get the model-name from the input form
    const textLabel = "modelKind"
    const varName = "temp_" + (textLabel).replace(/[^A-Z0-9]+/ig, "");
    // TODO: Need to get the varType from the input form
    const varType = "int";
    const defaultCodeSnippet = varType + " " + varName + " = ;";
    const snippetTargetPosition = defaultCodeSnippet.length;
    const isCustomTemplate = false;

    // InputEditor start
    const handleOnFocus = async (currentContent: string, EOL: string) => {
        let initContent: string = null;
        const newCodeSnippet: string = addToTargetPosition(defaultCodeSnippet, (snippetTargetPosition - 1), currentContent);
        initContent = addToTargetLine((currentFile.content), targetPosition, newCodeSnippet, EOL);

        inputEditorState.name = "ModelName";
        inputEditorState.content = initContent;
        inputEditorState.uri = monaco.Uri.file(currentFile.path).toString();

        // tslint:disable-next-line:no-console
        console.log("=========HANDLE-ON-FOCUS-CONTENT", inputEditorState.content)

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
        // tslint:disable-next-line:no-console
        console.log("============HANDLING DIAGNOSTICS==============");

        // TODO: Need to obtain the default value as a prop
        return (
            <>
                {!CodeGenVisitor.getCodeSnippet().includes(' expression ') ?
                    diagnosticHandler(getDiagnosticMessage(inputEditorState.diagnostic, varType)) :
                    null}
            </>
        );
    }


    // InputEditor onChange
    const handleContentChange = async (currentContent: string, EOL: string) => {
        let newModel: string = null;
        const newCodeSnippet: string = addToTargetPosition(defaultCodeSnippet, (snippetTargetPosition - 1), currentContent);
        newModel = addToTargetLine((currentFile.content), targetPosition, newCodeSnippet, EOL);

        inputEditorState.name = "ModelName";
        inputEditorState.content = newModel;
        inputEditorState.uri = monaco.Uri.file(currentFile.path).toString();

        // tslint:disable-next-line:no-console
        console.log("=========HANDLE-ON-CHANGE-CONTENT", inputEditorState.content)

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

    // Revert file changes
    const revertContent = async () => {
        // tslint:disable-next-line:no-console
        console.log("==========REVERTING-CONTENT")
        if (inputEditorState?.uri) {
            inputEditorState.name = "modelName";
            inputEditorState.content = (currentFile.content);
            inputEditorState.uri = inputEditorState?.uri;

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

    if (onCancelCtx.onCancelled) {
        revertContent();
    }

    useEffect(() => {
        CodeGenVisitor.clearCodeSnippet();
        traversNode(modelCtx.statementModel, CodeGenVisitor);
        handleOnFocus(CodeGenVisitor.getCodeSnippet(), "");
    }, [statementType]);

    useEffect(() => {
        handleDiagnostic();
    }, [inputEditorState.diagnostic])

    const inputBlurHandler = () => {
        if (defaultValue.current !== "") {
            addExpression(model, kind, value);
            callBack([], model, false);

            CodeGenVisitor.clearCodeSnippet();
            traversNode(modelCtx.statementModel, CodeGenVisitor);
            handleContentChange(CodeGenVisitor.getCodeSnippet(), "")
        }
    };

    const inputEnterHandler = (event: React.KeyboardEvent<HTMLSpanElement>) => {
        if (event.code === "Enter" || event.code === "Tab") {
            addExpression(model, kind, event.currentTarget.textContent);
            callBack([], model, false);

            CodeGenVisitor.clearCodeSnippet();
            traversNode(modelCtx.statementModel, CodeGenVisitor);
            handleContentChange(CodeGenVisitor.getCodeSnippet(), "")
        }
    };


    const inputChangeHandler = (event: React.KeyboardEvent<HTMLSpanElement>) => {
        addExpression(model, kind, event.currentTarget.textContent ? event.currentTarget.textContent : "");
        callBack([], model, false);
        CodeGenVisitor.clearCodeSnippet();
        traversNode(modelCtx.statementModel, CodeGenVisitor);
        debouncedContentChange(CodeGenVisitor.getCodeSnippet(), "");
    };

    const debouncedContentChange = debounce(handleContentChange, 500);

    return (
        <span
            onKeyDown={inputEnterHandler}
            contentEditable={true}
            suppressContentEditableWarning={true}
            onBlur={inputBlurHandler}
            onInput={inputChangeHandler}
            dangerouslySetInnerHTML={{ __html: defaultValue.current }}
        />
    )
}
