/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js no-empty jsx-curly-spacing
import React, { useContext, useState } from "react";
import MonacoEditor, { EditorDidMount } from "react-monaco-editor";

import { FormHelperText } from "@material-ui/core";
import debounce from "lodash.debounce";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { CompletionItemKind, Diagnostic, InsertTextFormat } from "monaco-languageclient";

import grammar from "../../../../../../ballerina.monarch.json";
import { Context } from "../../../../../../Contexts/Diagram";
import { CompletionParams, CompletionResponse } from "../../../../../../Definitions";
import { useStyles as useFormStyles } from "../../forms/style";
import { FormElementProps } from "../../types";
import { useStyles as useTextInputStyles } from "../TextField/style";
import { TooltipIcon } from "../Tooltip";

import { acceptedKind } from "./constants";
import "./style.scss";
import { addToTargetLine, addToTargetPosition, diagnosticCheckerExp, getInitialValue, getTargetPosition } from "./utils";

function getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
}

const MONACO_OPTIONS: monaco.editor.IEditorConstructionOptions = {
    scrollbar: {
        vertical: 'hidden',
        horizontal: 'hidden'
    },
    overviewRulerLanes: 0,
    autoIndent: "full",
    automaticLayout: true,
    contextmenu: true,
    lineNumbers: "off",
    fontFamily: "\"Droid Sans Mono\", Monaco, monospace",
    fontSize: 12,
    lineHeight: 24,
    hideCursorInOverviewRuler: true,
    matchBrackets: "always",
    minimap: {
        enabled: false,
    },
    readOnly: false,
    glyphMargin: false,
    wordWrap: 'off',
    lineNumbersMinChars: 0,
    overviewRulerBorder: false,
    lineDecorationsWidth: 0,
    folding: false,
    scrollBeyondLastLine: false,
    scrollBeyondLastColumn: 0,
    find: { addExtraSpaceOnTop: false, autoFindInSelection: 'never', seedSearchStringFromSelection: false },
    autoClosingBrackets: "always",
    autoClosingQuotes: "always",
    autoClosingOvertype: "always"
};

monaco.editor.defineTheme('exp-theme', {
    base: 'vs',
    inherit: true,
    rules: [
        { token: '', foreground: '#8D91A3' },
        { token: 'keyword', foreground: '#0095FF' },
        { token: 'entity.name.function', foreground: '#8D91A3' },
        { token: 'variable.parameter', foreground: '#8D91A3' },
        { token: 'type', foreground: '#05A26B' },
        { token: 'string', foreground: '#FF9D52' },
        { token: 'keyword.operator', foreground: '#0095FF' }
    ],
    colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': "#8D91A3",
        'editor.errorForeground': '#EA4C4D',
        'editorCursor.foreground': '#3C4141',
        // 'editor.lineHighlightBackground': '#FAFAFC',
        'editor.lineHighlightBackground': '#FFFFFF',
        'editorLineNumber.foreground': '#8D91A3',
        'editor.selectionBackground': '#D0E5FD',
        // 'editor.inactiveSelectionBackground': '#F4F5F9',
        'editor.inactiveSelectionBackground': '#FFFFFF',
        'peekViewEditor.background': '#333',
        'editorGutter.background': '#F7F8FB',
        'editor.wordHighlightBackground': '#333333',
        'editorLineNumber.activeForeground': '#FFFFFF',
        'editorLineNumber.activeBackground': '#5567d5',

    }
});

const BALLERINA_EXPR = "ballerina-exp";

export interface ExpressionEditorProps {
    validate?: (field: string, isInvalid: boolean) => void;
    clearInput?: boolean;
    tooltipTitle?: any;
    tooltipActionText?: string;
    tooltipActionLink?: string;
    interactive?: boolean;
}

export interface ExpressionEditorState {
    name?: string;
    content?: string;
    uri?: string;
    diagnostic?: Diagnostic[];
}

export default function ExpressionEditor(props: FormElementProps<ExpressionEditorProps>) {
    const { index, defaultValue, model, onChange, customProps } = props;
    const diagramContext = useContext(Context);
    const { state } = diagramContext;
    const { diagnostics: mainDiagnostics, targetPosition: targetPositionDraft, currentFile,
            currentApp, langClient, syntaxTree } = state;
    const { validate } = customProps;
    const targetPosition = getTargetPosition(targetPositionDraft, syntaxTree);
    const [validSourceCode, setValidSourceCode] = useState(false);

    const expressionEditorState: ExpressionEditorState = {
        name: undefined,
        content: undefined,
        uri: undefined,
        diagnostic: []
    }

    const textLabel = model && model.displayName ? model.displayName : model.name;
    const varName = "temp_" + (textLabel).replace(" ", "").replace("'", "");
    const varType = model.type ? model.type : "var";
    const initalValue = getInitialValue(defaultValue, model?.value, varType);
    const defaultCodeSnippet = varType + " " + varName + " = ;";
    const mockedCodeSnippet = "\n var tempVarTempVarTempVarAtEnd" + getRandomInt(1000) + " =  100;\n"; // FIXME: Remove this once compiler perf is improved for this case
    const formClasses = useFormStyles();
    const textFieldClasses = useTextInputStyles();
    const monacoRef: React.MutableRefObject<MonacoEditor> = React.useRef<MonacoEditor>(null);

    if (customProps?.clearInput) {
        if (monacoRef.current) {
            const editorModel = monacoRef.current.editor.getModel();

            if (editorModel) {
                editorModel.setValue("");
                customProps.clearInput = true;
            }
        }
    }

    const validExpEditor = () => {
        validate(model.name, false);
        if (monacoRef.current) {
            monaco.editor.setModelMarkers(monacoRef.current.editor.getModel(), 'expression editor', []);
        }
    }

    const notValidExpEditor = (message: string) => {
        const currentContent = monacoRef.current ? monacoRef.current?.editor?.getModel()?.getValue() : model.value;
        if (model.optional === true && (currentContent === undefined || currentContent === "")) {
            validExpEditor();
        } else {
            validate(model.name, true);
            if (monacoRef.current) {
                monaco.editor.setModelMarkers(monacoRef.current.editor.getModel(), 'expression editor', [{
                    startLineNumber: 1,
                    startColumn: 1,
                    endLineNumber: 2,
                    endColumn: 1000,
                    message,
                    severity: monaco.MarkerSeverity.Error
                }])
            }
        }
    }

    const handleDiagnostic = () => {
        if (expressionEditorState?.name === model.name) {
            const editorDiagnostics = expressionEditorState.diagnostic;
            if (!editorDiagnostics) {
                if (monacoRef.current) {
                    notValidExpEditor("Please wait for validation");
                }
            } else if (diagnosticCheckerExp(editorDiagnostics)) {
                if (monacoRef.current) {
                    notValidExpEditor(editorDiagnostics[0].message);
                }
            } else {
                if (monacoRef.current) {
                    validExpEditor();
                }
            }
        }
    }

    // ExpEditor start
    const handleOnFocus = async () => {
        const currentModel = monacoRef.current.editor.getModel();
        const currentContent = currentModel.getValue();
        const EOL = currentModel.getEOL();
        const monacoEditor = monacoRef.current.editor;
        const newCodeSnippet: string = addToTargetPosition(defaultCodeSnippet + mockedCodeSnippet, (defaultCodeSnippet.length - 1), currentContent);
        const initContent: string = addToTargetLine(atob(currentFile.content), targetPosition.line, newCodeSnippet, EOL);
        expressionEditorState.name = model.name;
        expressionEditorState.content = initContent;
        expressionEditorState.uri = monaco.Uri.file(currentApp?.workingFile).toString();

        await langClient.didChange({
            contentChanges: [
                {
                    text: expressionEditorState.content
                }
            ],
            textDocument: {
                uri: expressionEditorState.uri,
                version: 1
            }
        });
        // resetEditorFunctions();
        langClient.diagnostics({
            documentIdentifier: {
                uri: expressionEditorState.uri,
            }
        }).then((diagResp: any) => {
            expressionEditorState.diagnostic = diagResp[0]?.diagnostics ? diagResp[0]?.diagnostics : [];
            // resetEditorFunctions();
            handleDiagnostic();
        });

        if (currentContent === "" || currentContent.endsWith(".") || currentContent.endsWith(" ")) {
            monacoEditor.trigger('exp_editor', 'editor.action.triggerSuggest', {})
        }
    }

    // ExpEditor onChange
    const handleContentChange = async (currentContent: string, EOL: string) => {
        if (expressionEditorState.name === model.name) {
            // set the new model for the file
            const newCodeSnippet: string = addToTargetPosition(defaultCodeSnippet + mockedCodeSnippet, (defaultCodeSnippet.length - 1), currentContent);
            const newModel: string = addToTargetLine(atob(currentFile.content), targetPosition.line, newCodeSnippet, EOL);
            expressionEditorState.content = newModel;

            // update the change of the field
            model.value = currentContent;
            if (onChange) {
                onChange(currentContent);
            }

            await langClient.didChange({
                contentChanges: [
                    {
                        text: expressionEditorState.content
                    }
                ],
                textDocument: {
                    uri: expressionEditorState.uri,
                    version: 1
                }
            });
            // resetEditorFunctions();

            langClient.diagnostics({
                documentIdentifier: {
                    uri: expressionEditorState.uri,
                }
            }).then((diagResp: any) => {
                expressionEditorState.diagnostic = diagResp[0]?.diagnostics ? diagResp[0]?.diagnostics : [];
                // resetEditorFunctions();
                handleDiagnostic();
            });

            if (currentContent === "" || currentContent.endsWith(".") || currentContent.endsWith(" ")) {
                monacoRef.current.editor.trigger('exp_editor', 'editor.action.triggerSuggest', {})
            }
        }
    }
    const debouncedContentChange = debounce(handleContentChange, 500);

    // ExpEditor close
    const handleOnOutFocus = async () => {
        if (expressionEditorState.uri) {
            const expEditorState: ExpressionEditorState = {
                name: model.name,
                content: atob(currentFile.content),
                uri: expressionEditorState.uri
            }
            await langClient.didChange({
                contentChanges: [
                    {
                        text: expEditorState.content
                    }
                ],
                textDocument: {
                    uri: expEditorState.uri,
                    version: 1
                }
            });
        }
    }

    function getOnChangeListener() {
        return () => {
            notValidExpEditor("Please wait for validation");
            const currentModel = monacoRef.current.editor.getModel();
            if (currentModel.getValue().includes(currentModel.getEOL())) {
                // Trim EOL chars onPasteEvent
                const trimmedContent = currentModel.getValue().replace(currentModel.getEOL(), "");
                currentModel.setValue(trimmedContent);
                return;
            }

            debouncedContentChange(currentModel.getValue(), currentModel.getEOL());
        };
    }

    function getCompletionItemHandler() {
        const monacoEditor = monacoRef.current.editor;
        if (expressionEditorState.name === model.name) {
            const completionParams: CompletionParams = {
                textDocument: {
                    uri: expressionEditorState.uri
                },
                context: {
                    triggerKind: 1
                },
                position: {
                    character: monacoEditor.getPosition().column - 1 + (defaultCodeSnippet.length - 1),
                    line: targetPosition.line
                }
            }

            return langClient.getCompletion(completionParams).then((values: CompletionResponse[]) => {
                const filteredCompletionItem: CompletionResponse[] = values.filter((completionResponse: CompletionResponse) => (acceptedKind.includes(completionResponse.kind as CompletionItemKind) && completionResponse.label !== varName && completionResponse.label !== model.aiSuggestion && completionResponse.label !== "main()"))
                const completionItems: monaco.languages.CompletionItem[] = filteredCompletionItem.map((completionResponse: CompletionResponse) => {
                    return {
                        range: null,
                        label: completionResponse.label,
                        kind: completionResponse.kind as CompletionItemKind,
                        insertText: completionResponse.insertText,
                        insertTextFormat: completionResponse.insertTextFormat as InsertTextFormat,
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        sortText: 'c'
                    }
                });
                if (varType === "string") {
                    const completionItemTemplate: monaco.languages.CompletionItem = {
                        range: null,
                        label: 'Custom string template',
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        // tslint:disable-next-line: no-invalid-template-strings
                        insertText: '"${1:}"',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        sortText: 'b'
                    }
                    completionItems.push(completionItemTemplate);
                }
                if (varType === "boolean") {
                    const completionItemTemplate: monaco.languages.CompletionItem = {
                        range: null,
                        label: 'true',
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: 'true',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.KeepWhitespace,
                        sortText: 'b'
                    }
                    const completionItemTemplate1: monaco.languages.CompletionItem = {
                        range: null,
                        label: 'false',
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: 'false',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.KeepWhitespace,
                        sortText: 'b'
                    }
                    completionItems.push(completionItemTemplate);
                    completionItems.push(completionItemTemplate1);
                }
                if (model.aiSuggestion) {
                    const completionItemAI: monaco.languages.CompletionItem = {
                        range: null,
                        label: model.aiSuggestion,
                        kind: 1 as CompletionItemKind,
                        insertText: model.aiSuggestion,
                        sortText: 'a'
                    }
                    completionItems.push(completionItemAI);
                }
                const completionList: monaco.languages.CompletionList = {
                    incomplete: false,
                    suggestions: completionItems
                };
                return completionList;
            });

        }
    }

    const handleEditorMount: EditorDidMount = (monacoEditor, { languages, editor }) => {
        languages.register({ id: BALLERINA_EXPR });
        languages.setLanguageConfiguration(BALLERINA_EXPR, {
            autoClosingPairs: [{
                open: "'",
                close: "'"
            }, {
                open: "(",
                close: ")"
            }, {
                open: "{",
                close: "}"
            }, {
                open: "[",
                close: "]"
            }]
        });
        languages.setMonarchTokensProvider(BALLERINA_EXPR, {
            tokenizer: grammar as any,
        });

        // Block expression editor if there are diagnostics in the source code
        setValidSourceCode(diagnosticCheckerExp(mainDiagnostics));

        const MONACO_URI_INMEMO = monaco.Uri.file('inmemory://' + varName + '.bal');
        const existingModel = editor.getModel(MONACO_URI_INMEMO);
        if (existingModel) {
            existingModel.dispose();
        }
        const currentModel = editor.createModel(initalValue, BALLERINA_EXPR, MONACO_URI_INMEMO);
        monacoEditor.setModel(currentModel);

        // Invalidate/Validate code at init
        // we assume if that model.value is not null then its valid (during fetch)
        if (!initalValue || initalValue === "") {
            notValidExpEditor("Expression is Invalid");
        } else {
            // we forecfully set the string to "" when the value is empty. So we have to trigger onChange()
            model.value = initalValue;
            if (onChange) {
                onChange(initalValue);
            }
            validExpEditor();
        }

        // event emitted when the text inside this editor gained focus (i.e. cursor starts blinking)
        monacoEditor.onDidFocusEditorText(handleOnFocus);

        // event emitted when the text inside this editor lost focus (i.e. cursor stops blinking)
        monacoEditor.onDidBlurEditorText(() => {
            handleOnOutFocus();
        });

        // event emitted when the content of the editor has changed
        monacoEditor.onDidChangeModelContent(getOnChangeListener());

        // tslint:disable-next-line: no-bitwise
        const prohibitedKeyBindings: number[] = [monaco.KeyCode.Enter, monaco.KeyCode.Enter | monaco.KeyMod.CtrlCmd, monaco.KeyCode.Enter | monaco.KeyMod.Shift];
        prohibitedKeyBindings.forEach((bindings: number) => {
            monacoEditor.addCommand(bindings, () => {
                // Disable pressing enter except when suggestions drop down is visible
            }, '!suggestWidgetVisible')
        });

        // completion of expression Editor
        const { dispose: disposeCompProvider } = languages.registerCompletionItemProvider(BALLERINA_EXPR, {
            provideCompletionItems(): monaco.Thenable<monaco.languages.CompletionList> {
                return getCompletionItemHandler();
            },
        });
        // expressionEditorFunctionMap.completionItemProvider = disposeCompProvider;

        // event emitted when the editor has been disposed
        monacoEditor.onDidDispose(() => {
            monaco.editor.setTheme('choreoLightTheme')
            disposeCompProvider();
            handleOnOutFocus();
        })
    }
    return (
        <>
            {textLabel ?
                (model && model.optional ?
                    (
                        <div className={textFieldClasses.inputWrapper}>
                            <div className={textFieldClasses.inputWrapper}>
                                <div className={textFieldClasses.labelWrapper}>
                                    <FormHelperText className={formClasses.inputLabelForRequired}>{textLabel}</FormHelperText>
                                    <FormHelperText className={formClasses.optionalLabel}>Optional</FormHelperText>
                                </div>
                                {customProps?.tooltipTitle &&
                                    (
                                        <TooltipIcon
                                            title={customProps?.tooltipTitle}
                                            interactive={customProps?.interactive || true}
                                            actionText={customProps?.tooltipActionText}
                                            actionLink={customProps?.tooltipActionLink}
                                            arrow={true}
                                        />
                                    )
                                }
                            </div>
                        </div>
                    ) : (
                        <div className={textFieldClasses.inputWrapper}>
                            <div className={textFieldClasses.labelWrapper}>
                                <FormHelperText className={formClasses.inputLabelForRequired}>{textLabel}</FormHelperText>
                                <FormHelperText className={formClasses.starLabelForRequired}>*</FormHelperText>
                            </div>
                            {customProps?.tooltipTitle &&
                                (
                                    <TooltipIcon
                                        title={customProps?.tooltipTitle}
                                        interactive={customProps?.interactive || true}
                                        actionText={customProps?.tooltipActionText}
                                        actionLink={customProps?.tooltipActionLink}
                                        arrow={true}
                                    />
                                )
                            }
                        </div>
                    )
                ) : null
            }
            <div className="exp-container">
                <div className="exp-absolute-wrapper">
                    <div className="exp-editor">
                        <MonacoEditor
                            key={index}
                            theme='exp-theme'
                            ref={monacoRef}
                            language={BALLERINA_EXPR}
                            options={MONACO_OPTIONS}
                            editorDidMount={handleEditorMount}
                        />
                    </div>
                </div>
            </div>
            {validSourceCode ?
                (
                    <FormHelperText className={formClasses.invalidCode}>Code has errors, please fix them first.</FormHelperText>
                ) : null
            }
        </>
    );
}
