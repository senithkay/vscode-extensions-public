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
// tslint:disable: ordered-imports
import React, { useContext, useEffect, useState } from "react";
import { FormHelperText } from "@material-ui/core";
import MonacoEditor, { EditorDidMount } from "react-monaco-editor";

import { Context } from "../../../../../../Contexts/Diagram";

import debounce from "lodash.debounce";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { CompletionItemKind, InsertTextFormat } from "monaco-languageclient";

import { CompletionParams, CompletionResponse, ExpressionEditorLangClientInterface } from "../../../../../../Definitions";
import grammar from "../../../../../../ballerina.monarch.json";
import { useStyles as useFormStyles } from "../../forms/style";
import { FormElementProps } from "../../types";
import { useStyles as useTextInputStyles } from "../TextField/style";
import { TooltipIcon } from "../Tooltip";

import { acceptedKind, COLLAPSE_WIDGET_ID, EXPAND_WIDGET_ID } from "./constants";
import "./style.scss";
import {
    addImportModuleToCode,
    addToTargetLine,
    addToTargetPosition,
    createContentWidget,
    diagnosticCheckerExp,
    getInitialValue,
    getTargetPosition,
    transformFormFieldTypeToString
} from "./utils";
import { PrimitiveBalType } from "../../../../../../ConfigurationSpec/types";

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
        'editor.lineHighlightBackground': '#FFFFFF',
        'editorLineNumber.foreground': '#8D91A3',
        'editor.selectionBackground': '#D0E5FD',
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
    focus?: boolean;
    revertFocus?: () => void;
    statementType?: PrimitiveBalType | any;
    customTemplate?: {
        defaultCodeSnippet: string;
        targetColumn: number;
    }
    expandDefault?: boolean;
    revertClearInput?: () => void;
}

export function ExpressionEditor(props: FormElementProps<ExpressionEditorProps>) {
    const diagramContext = useContext(Context);
    const { state } = diagramContext;

    const {
        diagnostics: mainDiagnostics,
        targetPosition: targetPositionDraft,
        currentFile,
        currentApp,
        langServerURL,
        getExpressionEditorLangClient,
        syntaxTree,
    } = state;

    const [ expressionEditorState, setExpressionEditorState ] = useState({
        name: undefined,
        content: undefined,
        uri: undefined,
        diagnostic: [],
    });

    const [ disposableTriggers ] = useState([]);

    const {
        index,
        defaultValue,
        model,
        onChange,
        customProps
    } = props;
    const { validate, statementType, customTemplate, focus, expandDefault, clearInput, revertClearInput  } = customProps;
    const targetPosition = getTargetPosition(targetPositionDraft, syntaxTree);
    const [invalidSourceCode, setInvalidSourceCode] = useState(false);
    const [ expand, setExpand ] = useState(expandDefault || false);

    const textLabel = model && model.displayName ? model.displayName : model.name;
    const varName = "temp_" + (textLabel).replace(" ", "").replace("'", "");
    const varType = transformFormFieldTypeToString(model);
    const initalValue = getInitialValue(defaultValue, model?.value, varType.toString());
    const defaultCodeSnippet = customTemplate ? (customTemplate.defaultCodeSnippet || "") : varType + " " + varName + " = ;";
    const mockedCodeSnippet = "\n var tempVarTempVarTempVarAtEnd" + getRandomInt(1000) + " =  100;\n"; // FIXME: Remove this once compiler perf is improved for this case
    const snippetTargetPosition = customTemplate?.targetColumn || defaultCodeSnippet.length;
    const formClasses = useFormStyles();
    const textFieldClasses = useTextInputStyles();
    const monacoRef: React.MutableRefObject<MonacoEditor> = React.useRef<MonacoEditor>(null);

    const validExpEditor = () => {
        validate(model.name, false);
        if (monacoRef.current) {
            monaco.editor.setModelMarkers(monacoRef.current.editor.getModel(), 'expression editor', []);
        }
    }

    const notValidExpEditor = (message: string) => {
        const currentContent = monacoRef.current ? monacoRef.current?.editor?.getModel()?.getValue() : model.value;
        if (model.optional === true && (currentContent === undefined || currentContent === "") && !invalidSourceCode) {
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
        if (invalidSourceCode) {
            notValidExpEditor("Code has errors, please fix them first.");
        } else if (expressionEditorState?.name === model.name) {
            if (!expressionEditorState.diagnostic) {
                if (monacoRef.current) {
                    notValidExpEditor("Please wait for validation");
                }
            } else if (diagnosticCheckerExp(expressionEditorState.diagnostic)) {
                if (monacoRef.current) {
                    notValidExpEditor(expressionEditorState.diagnostic[0].message);
                }
            } else {
                if (monacoRef.current) {
                    validExpEditor();
                }
            }
        }
    }

    const disposeAllTriggers = () => {
        while (disposableTriggers.length > 0) {
            const disposable: monaco.IDisposable = disposableTriggers.pop();
            disposable.dispose();
        }
    }

    useEffect(() => {
        disposeAllTriggers();

        if (monacoRef.current) {
            // event emitted when the text inside this editor gained focus (i.e. cursor starts blinking)
            disposableTriggers.push(monacoRef.current.editor.onDidFocusEditorText(async () => {
                handleOnFocus(monacoRef.current.editor.getModel().getValue(), monacoRef.current.editor.getModel().getEOL(), monacoRef.current.editor);
            }));

            // event emitted when the content of the editor has changed
            disposableTriggers.push(monacoRef.current.editor.onDidChangeModelContent(() => {
                notValidExpEditor("Please wait for validation");

                if (monacoRef.current.editor.getModel().getValue().includes(monacoRef.current.editor.getModel().getEOL())) {
                    // Trim EOL chars onPasteEvent
                    const trimmedContent = monacoRef.current.editor.getModel().getValue().replace(monacoRef.current.editor.getModel().getEOL(), "");
                    monacoRef.current.editor.getModel().setValue(trimmedContent);
                    return;
                }

                debouncedContentChange(monacoRef.current.editor.getModel().getValue(), monacoRef.current.editor.getModel().getEOL());
            }));

            // event emitted when the text inside this editor lost focus (i.e. cursor stops blinking)
            disposableTriggers.push(monacoRef.current.editor.onDidBlurEditorText(() => {
                handleOnOutFocus();
            }));

            // completion of expression Editor
            disposableTriggers.push(monaco.languages.registerCompletionItemProvider(BALLERINA_EXPR, {
                provideCompletionItems(): monaco.Thenable<monaco.languages.CompletionList> {
                    if (expressionEditorState?.name === model.name) {
                        const completionParams: CompletionParams = {
                            textDocument: {
                                uri: expressionEditorState?.uri
                            },
                            context: {
                                triggerKind: 1
                            },
                            position: {
                                character: monacoRef.current.editor.getPosition().column - 1 + (snippetTargetPosition - 1),
                                line: targetPosition.line
                            }
                        }

                        return getExpressionEditorLangClient(langServerURL).then((langClient: ExpressionEditorLangClientInterface) => {
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
                        });
                    }
                },
            }));

            // event emitted when the editor has been disposed
            disposableTriggers.push(monacoRef.current.editor.onDidDispose(() => {
                monaco.editor.setTheme('choreoLightTheme');
                handleOnOutFocus();
                disposeAllTriggers();
            }));
        }
    }, [statementType]);

    useEffect(() => {
        // Programatically focus exp-editor
        if (focus && customProps?.revertFocus) {
            monacoRef.current.editor.focus();
            customProps.revertFocus();
        }
    }, [focus]);

    useEffect(() => {
        if (monacoRef.current) {
            const expandWidget: monaco.editor.IContentWidget = createContentWidget(EXPAND_WIDGET_ID);
            const collapseWidget: monaco.editor.IContentWidget = createContentWidget(COLLAPSE_WIDGET_ID);
            if (expand) {
                monacoRef.current.editor.updateOptions({
                    wordWrap: 'bounded'
                });
                monacoRef.current.editor.removeContentWidget(expandWidget);
                monacoRef.current.editor.addContentWidget(collapseWidget);
            } else {
                monacoRef.current.editor.updateOptions({
                    wordWrap: 'off'
                });
                monacoRef.current.editor.removeContentWidget(collapseWidget);
                monacoRef.current.editor.addContentWidget(expandWidget);
            }
        }
    }, [expand])

    useEffect(() => {
         // Programatically clear exp-editor
         if (clearInput && revertClearInput) {
            if (monacoRef.current){
                const editorModel = monacoRef.current.editor.getModel();
                if (editorModel) {
                editorModel.setValue("");
                revertClearInput()
            }
            }
        }
    }, [clearInput]);

    useEffect(() => {
        handleDiagnostic();
    }, [expressionEditorState.diagnostic])

    // ExpEditor start
    const handleOnFocus = async (currentContent: string, EOL: string, monacoEditor: monaco.editor.IStandaloneCodeEditor) => {
        let initContent: string = null;
        if (model.optional === true && (currentContent === undefined || currentContent === "")) {
            // No need to send didChange with the template because this is an optional field and empty content is allowed.
            // Replacing the templates lenght with space char to get the LS completions correctly
            const newCodeSnippet: string = " ".repeat(snippetTargetPosition) + "\n" + mockedCodeSnippet;
            initContent = addToTargetLine(atob(currentFile.content), targetPosition.line, newCodeSnippet, EOL);
            initContent = addImportModuleToCode(initContent, model, state);
        } else {
            const newCodeSnippet: string = addToTargetPosition(defaultCodeSnippet + mockedCodeSnippet, (snippetTargetPosition - 1), currentContent);
            initContent = addToTargetLine(atob(currentFile.content), targetPosition.line, newCodeSnippet, EOL);
            initContent = addImportModuleToCode(initContent, model, state);
        }

        expressionEditorState.name = model.name;
        expressionEditorState.content = initContent;
        expressionEditorState.uri = monaco.Uri.file(currentApp?.workingFile).toString();

        await getExpressionEditorLangClient(langServerURL).then((langClient: ExpressionEditorLangClientInterface) => {
            langClient.didChange({
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
        });

        getExpressionEditorLangClient(langServerURL).then((langClient: ExpressionEditorLangClientInterface) => {
            langClient.diagnostics({
                documentIdentifier: {
                    uri: expressionEditorState.uri,
                }
            }).then((diagResp: any) => {
                setExpressionEditorState({
                    ...expressionEditorState,
                    diagnostic: diagResp[0]?.diagnostics ? diagResp[0]?.diagnostics : []
                })
            });
        });

        // await dispatchExprEditorStart(expEditorState);
        if (currentContent === "" || currentContent.endsWith(".") || currentContent.endsWith(" ")) {
            monacoEditor.trigger('exp_editor', 'editor.action.triggerSuggest', {})
        }
    }

    // ExpEditor onChange
    const handleContentChange = async (currentContent: string, EOL: string) => {
        if (expressionEditorState?.name === model.name) {
            let newModel: string = null;
            if (model.optional === true && (currentContent === undefined || currentContent === "")) {
                // No need to send didChange with the template because this is an optional field and empty content is allowed.
                // Replacing the templates lenght with space char to get the LS completions correctly
                const newCodeSnippet: string = " ".repeat(snippetTargetPosition) + "\n" + mockedCodeSnippet;
                newModel = addToTargetLine(atob(currentFile.content), targetPosition.line, newCodeSnippet, EOL);
                newModel = addImportModuleToCode(newModel, model, state);
            } else {
                // set the new model for the file
                const newCodeSnippet: string = addToTargetPosition(defaultCodeSnippet + mockedCodeSnippet, (snippetTargetPosition - 1), currentContent);
                newModel = addToTargetLine(atob(currentFile.content), targetPosition.line, newCodeSnippet, EOL);
                newModel = addImportModuleToCode(newModel, model, state);
            }

            expressionEditorState.name = model.name;
            expressionEditorState.content = newModel;
            expressionEditorState.uri = expressionEditorState?.uri;

            // update the change of the field
            model.value = monacoRef.current.editor.getModel().getValue();
            if (onChange) {
                onChange(monacoRef.current.editor.getModel().getValue());
            }

            await getExpressionEditorLangClient(langServerURL).then((langClient: ExpressionEditorLangClientInterface) => {
                langClient.didChange({
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
            });

            getExpressionEditorLangClient(langServerURL).then((langClient: ExpressionEditorLangClientInterface) => {
                langClient.diagnostics({
                    documentIdentifier: {
                        uri: expressionEditorState.uri,
                    }
                }).then((diagResp: any) => {
                    setExpressionEditorState({
                        ...expressionEditorState,
                        diagnostic: diagResp[0]?.diagnostics ? diagResp[0]?.diagnostics : []
                    })
                });
            });

            if (currentContent === "" || currentContent.endsWith(".") || currentContent.endsWith(" ")) {
                monacoRef.current.editor.trigger('exp_editor', 'editor.action.triggerSuggest', {})
            }
        }
    }
    const debouncedContentChange = debounce(handleContentChange, 500);

    // ExpEditor close
    const handleOnOutFocus = async () => {
        if (expressionEditorState?.uri) {
            expressionEditorState.name = model.name;
            expressionEditorState.content = atob(currentFile.content);
            expressionEditorState.uri = expressionEditorState?.uri;

            await getExpressionEditorLangClient(langServerURL).then(async (langClient: ExpressionEditorLangClientInterface) => {
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
        setInvalidSourceCode(diagnosticCheckerExp(mainDiagnostics));

        const MONACO_URI_INMEMO = monaco.Uri.file('inmemory://' + varName + '.bal');
        const existingModel = editor.getModel(MONACO_URI_INMEMO);
        if (existingModel) {
            existingModel.dispose();
        }
        const currentModel = editor.createModel(initalValue, BALLERINA_EXPR, MONACO_URI_INMEMO);
        monacoEditor.setModel(currentModel);

        if (diagnosticCheckerExp(mainDiagnostics)) {
            notValidExpEditor("Code has errors, please fix them first.");
        } else {
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
        }

        // tslint:disable-next-line: no-bitwise
        const prohibitedKeyBindings: number[] = [monaco.KeyCode.Enter, monaco.KeyCode.Enter | monaco.KeyMod.CtrlCmd, monaco.KeyCode.Enter | monaco.KeyMod.Shift];
        prohibitedKeyBindings.forEach((bindings: number) => {
            monacoEditor.addCommand(bindings, () => {
                // Disable pressing enter except when suggestions drop down is visible
            }, '!suggestWidgetVisible')
        });

        // onClick of collapse and expand icons
        monacoEditor.onMouseDown((e: monaco.editor.IEditorMouseEvent) => {
            if (e.target?.detail === EXPAND_WIDGET_ID) {
                setExpand(true)
            } else if (e.target?.detail === COLLAPSE_WIDGET_ID) {
                setExpand(false)
            }
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
                                {(customProps?.tooltipTitle || model?.tooltip) &&
                                    (
                                        <div>
                                            <TooltipIcon
                                                title={customProps?.tooltipTitle || model?.tooltip}
                                                interactive={customProps?.interactive || true}
                                                actionText={customProps?.tooltipActionText}
                                                actionLink={customProps?.tooltipActionLink}
                                                arrow={true}
                                            />
                                        </div>
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
                            {(customProps?.tooltipTitle || model?.tooltip) &&
                                (
                                    <TooltipIcon
                                        title={model?.tooltip}
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
            <div className="exp-container" style={expand ? {height: '114px'} : {height: '32px'}}>
                <div className="exp-absolute-wrapper">
                    <div className="exp-editor" style={expand ? {height: '100px'} : {height: '32px'}} >
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
            {invalidSourceCode ?
                (
                    <FormHelperText className={formClasses.invalidCode}>{mainDiagnostics[0]?.message} (This error is in Code Editor. Please fix them first)</FormHelperText>
                ) : expressionEditorState.name === model?.name && expressionEditorState.diagnostic && expressionEditorState.diagnostic[0]?.message ?
                    (
                        <FormHelperText className={formClasses.invalidCode}>{expressionEditorState.diagnostic[0].message}</FormHelperText>
                    ) : null
            }
        </>
    );
}

export default ExpressionEditor;
