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
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import MonacoEditor, { EditorDidMount } from "react-monaco-editor";

import { FormHelperText } from "@material-ui/core";
import debounce from "lodash.debounce";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { CompletionItemKind, InsertTextFormat } from "monaco-languageclient";

import grammar from "../../../../../../ballerina.monarch.json";
import { TooltipCodeSnippet } from "../../../../../../components/Tooltip";
import { PrimitiveBalType } from "../../../../../../ConfigurationSpec/types";
import { Context } from "../../../../../../Contexts/Diagram";
import { CompletionParams, CompletionResponse, ExpressionEditorLangClientInterface, TextEdit } from "../../../../../../Definitions";
import { useStyles as useFormStyles } from "../../forms/style";
import { FormElementProps } from "../../types";
import { ExpressionEditorHint, HintType } from "../ExpressionEditorHint";
import { ExpressionEditorLabel } from "../ExpressionEditorLabel";

import { acceptedKind, COLLAPSE_WIDGET_ID, EDITOR_MAXIMUM_CHARACTERS, EXPAND_EDITOR_MAXIMUM_CHARACTERS, EXPAND_WIDGET_ID, TRIGGER_CHARACTERS } from "./constants";
import "./style.scss";
import {
    addImportModuleToCode,
    addQuotesChecker,
    addToStringChecker,
    addToTargetLine,
    addToTargetPosition,
    checkIfStringExist,
    createContentWidget,
    createSortText,
    diagnosticCheckerExp,
    getDiagnosticMessage,
    getFilteredDiagnostics,
    getInitialValue,
    getRandomInt,
    getTargetPosition,
    getValueWithoutSemiColon,
    transformFormFieldTypeToString,
    truncateDiagnosticMsg,
    typeCheckerExp
} from "./utils";

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
    autoClosingOvertype: "always",
    hover: {
        enabled: false
    }
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
    hideTextLabel?: boolean;
    changed?: boolean;
    subEditor?: boolean;
    editPosition?: any;
}

export function ExpressionEditor(props: FormElementProps<ExpressionEditorProps>) {
    const { state } = useContext(Context);

    const {
        diagnostics: mainDiagnostics,
        targetPosition: targetPositionDraft,
        currentFile,
        currentApp,
        langServerURL,
        getExpressionEditorLangClient,
        syntaxTree,
    } = state;

    const [expressionEditorState, setExpressionEditorState] = useState({
        name: undefined,
        content: undefined,
        uri: undefined,
        diagnostic: [],
    });

    const [disposableTriggers] = useState([]);

    const {
        index,
        defaultValue,
        model,
        onChange,
        customProps,
    } = props;
    const { validate, statementType, customTemplate, focus, expandDefault, clearInput, revertClearInput, changed, subEditor, editPosition } = customProps;
    const targetPosition = editPosition ? editPosition : getTargetPosition(targetPositionDraft, syntaxTree);
    const [invalidSourceCode, setInvalidSourceCode] = useState(false);
    const [expand, setExpand] = useState(expandDefault || false);
    const [superExpand, setSuperExpand] = useState(false);
    const [addCheck, setAddCheck] = useState(false);
    const [cursorOnEditor, setCursorOnEditor] = useState(false);

    const textLabel = model && model.displayName ? model.displayName : model.name;
    const varName = "temp_" + (textLabel).replace(/[^A-Z0-9]+/ig, "");
    const varType = transformFormFieldTypeToString(model);
    const initalValue = getInitialValue(defaultValue, model);
    const defaultCodeSnippet = customTemplate ? (customTemplate.defaultCodeSnippet || "") : varType + " " + varName + " = ;";
    const snippetTargetPosition = customTemplate?.targetColumn || defaultCodeSnippet.length;
    const isCustomTemplate = !!customTemplate;
    const formClasses = useFormStyles();
    const monacoRef: React.MutableRefObject<MonacoEditor> = React.useRef<MonacoEditor>(null);
    const [stringCheck, setStringCheck] = useState(checkIfStringExist(varType));
    const [needQuotes, setNeedQuotes] = useState(false);
    const [needToString, setNeedToString] = useState(false);

    const validExpEditor = () => {
        if (monacoRef.current?.editor?.getModel()?.getValue()) {
            model.value = monacoRef.current?.editor?.getModel()?.getValue();
            if (onChange) {
                onChange(monacoRef.current?.editor?.getModel()?.getValue());
            }
        }
        validate(model.name, false);
        if (monacoRef.current) {
            monaco.editor.setModelMarkers(monacoRef.current.editor.getModel(), 'expression editor', []);
        }
    }

    const notValidExpEditor = (message: string, updateState: boolean = true) => {
        const currentContent = monacoRef.current ? monacoRef.current?.editor?.getModel()?.getValue() : model.value;
        if (model.optional === true && (currentContent === undefined || currentContent === "") && !invalidSourceCode) {
            validExpEditor();
        } else {
            validate(model.name, true);
            setNeedQuotes(addQuotesChecker(expressionEditorState.diagnostic));
            setNeedToString(addToStringChecker(expressionEditorState.diagnostic))
            if (monacoRef.current) {
                monaco.editor.setModelMarkers(monacoRef.current.editor.getModel(), 'expression editor', [{
                    startLineNumber: 1,
                    startColumn: 1,
                    endLineNumber: 2,
                    endColumn: 1000,
                    message,
                    severity: monaco.MarkerSeverity.Error
                }]);
                if (updateState) {
                    setExpressionEditorState({
                        ...expressionEditorState,
                        diagnostic: [{
                            message,
                            code: ""
                        }]
                    })
                }
            }
        }
    }

    // FIXME: Uncomment this once the ballerinaSymbol/type request is enabled in LS
    // const handleTypeInfo = (typeInfo: string[]) => {
    //     if (typeInfo && typeInfo.length > 1 && typeInfo.includes("error")) {
    //         // expression can resolve to an error
    //         setAddCheck(true)
    //     } else {
    //         setAddCheck(false)
    //     }
    // }

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
                    notValidExpEditor(getDiagnosticMessage(expressionEditorState.diagnostic, varType), false);
                }
            } else {
                if (monacoRef.current) {
                    validExpEditor();
                }
            }

            // Suggest to add check depending on the diagnostic message
            if (monacoRef.current) {
                setAddCheck(typeCheckerExp(expressionEditorState.diagnostic, varName, varType))
            }
        }
    }

    const disposeAllTriggers = () => {
        while (disposableTriggers.length > 0) {
            const disposable: monaco.IDisposable = disposableTriggers.pop();
            disposable.dispose();
        }
    }

    const setDefaultTooltips = () => {
        // add default tooltip if not given by explicitly
        if (textLabel && model && !(customProps?.tooltipTitle || model?.tooltip) && model?.description) {
            model.tooltip = model.description.substring(model.description.indexOf('-') + 1).trim();
        }
    }

    useEffect(() => {
        disposeAllTriggers();

        if (monacoRef.current) {
            // Check if string is selected
            setStringCheck(checkIfStringExist(varType))

            // event emitted when the text inside this editor gained focus (i.e. cursor starts blinking)
            disposableTriggers.push(monacoRef.current.editor.onDidFocusEditorText(async () => {
                setCursorOnEditor(true);
                handleOnFocus(monacoRef.current.editor.getModel().getValue(), monacoRef.current.editor.getModel().getEOL());
            }));

            // event emitted when the content of the editor has changed
            disposableTriggers.push(monacoRef.current.editor.onDidChangeModelContent((event: monaco.editor.IModelContentChangedEvent) => {
                const lastPressedKey = event.changes && event.changes.length > 0 && event.changes[0].text;
                notValidExpEditor("Please wait for validation");

                if (monacoRef.current.editor.getModel().getValue().includes(monacoRef.current.editor.getModel().getEOL())) {
                    // Trim EOL chars onPasteEvent
                    const trimmedContent = monacoRef.current.editor.getModel().getValue().replace(monacoRef.current.editor.getModel().getEOL(), "");
                    monacoRef.current.editor.getModel().setValue(trimmedContent);
                    return;
                }

                debouncedContentChange(monacoRef.current.editor.getModel().getValue(), monacoRef.current.editor.getModel().getEOL(), lastPressedKey);
            }));

            // event emitted when the text inside this editor lost focus (i.e. cursor stops blinking)
            disposableTriggers.push(monacoRef.current.editor.onDidBlurEditorText(() => {
                handleOnOutFocus();
            }));

            // completion of expression Editor
            disposableTriggers.push(monaco.languages.registerCompletionItemProvider(BALLERINA_EXPR, {
                provideCompletionItems(): monaco.Thenable<monaco.languages.CompletionList> {
                    if (monacoRef.current.editor.hasTextFocus()) {
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
                                const completionItems: monaco.languages.CompletionItem[] = []
                                if (model?.customAutoComplete) {
                                    const completionItemCustom: monaco.languages.CompletionItem[] = Array.from(model.customAutoComplete).map((customCompletion: string, order: number) => {
                                        return {
                                            range: null,
                                            label: customCompletion,
                                            kind: monaco.languages.CompletionItemKind.Enum,
                                            insertText: customCompletion,
                                            sortText: `0${createSortText(order)}`
                                        }
                                    })
                                    completionItems.push(...completionItemCustom);
                                }
                                if (model.aiSuggestion) {
                                    const completionItemAI: monaco.languages.CompletionItem = {
                                        preselect: true,
                                        range: null,
                                        label: model.aiSuggestion,
                                        kind: 1 as CompletionItemKind,
                                        insertText: model.aiSuggestion,
                                        sortText: '1'
                                    }
                                    completionItems.push(completionItemAI);
                                }
                                if (varType === "boolean") {
                                    const completionItemTemplate: monaco.languages.CompletionItem = {
                                        preselect: true,
                                        range: null,
                                        label: 'true',
                                        kind: monaco.languages.CompletionItemKind.Keyword,
                                        insertText: 'true',
                                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.KeepWhitespace,
                                        sortText: '2'
                                    }
                                    const completionItemTemplate1: monaco.languages.CompletionItem = {
                                        range: null,
                                        label: 'false',
                                        kind: monaco.languages.CompletionItemKind.Keyword,
                                        insertText: 'false',
                                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.KeepWhitespace,
                                        sortText: '2'
                                    }
                                    completionItems.push(completionItemTemplate);
                                    completionItems.push(completionItemTemplate1);
                                }

                                const filteredCompletionItem: CompletionResponse[] = values.filter((completionResponse: CompletionResponse) => (
                                    (!completionResponse.kind || acceptedKind.includes(completionResponse.kind as CompletionItemKind)) &&
                                    completionResponse.label !== varName &&
                                    completionResponse.label !== model.aiSuggestion &&
                                    !(completionResponse.label.includes("main") && completionResponse.detail === "Function")
                                ));
                                const lsCompletionItems: monaco.languages.CompletionItem[] = filteredCompletionItem.map((completionResponse: CompletionResponse, order: number) => {
                                    if (completionResponse.kind === CompletionItemKind.Field && completionResponse.additionalTextEdits) {
                                        return {
                                            range: null,
                                            label: completionResponse.label,
                                            detail: completionResponse.detail,
                                            kind: completionResponse.kind as CompletionItemKind,
                                            insertText: completionResponse.insertText,
                                            insertTextFormat: completionResponse.insertTextFormat as InsertTextFormat,
                                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                            sortText: createSortText(order),
                                            documentation: completionResponse.documentation,
                                            command: {
                                                id: monacoRef.current.editor.addCommand(0, (_, args: TextEdit[]) => {
                                                    if (args.length > 0) {
                                                        const startColumn =  args[0].range.start.character - snippetTargetPosition + 2
                                                        const endColumn =  args[0].range.end.character - snippetTargetPosition + 2
                                                        const edit: monaco.editor.IIdentifiedSingleEditOperation[] = [{
                                                            text: args[0].newText,
                                                            range: new monaco.Range(1, startColumn, 1, endColumn)
                                                        }];
                                                        monacoRef.current.editor.executeEdits("completion-edit", edit)
                                                    }
                                                }, ''),
                                                title: "completion-edit",
                                                arguments: [completionResponse.additionalTextEdits]
                                            }
                                        }
                                    } else {
                                        return {
                                            range: null,
                                            label: completionResponse.label,
                                            detail: completionResponse.detail,
                                            kind: completionResponse.kind as CompletionItemKind,
                                            insertText: completionResponse.insertText,
                                            insertTextFormat: completionResponse.insertTextFormat as InsertTextFormat,
                                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                            sortText: createSortText(order),
                                            documentation: completionResponse.documentation
                                        }
                                    }
                                });
                                completionItems.push(...lsCompletionItems);

                                if (completionItems.length > 0) {
                                    completionItems[0] = { ...completionItems[0], preselect: true }
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
            if (monacoRef.current) {
                const editorModel = monacoRef.current.editor.getModel();
                if (editorModel) {
                    editorModel.setValue("");

                    // update the change of the field
                    model.value = "";
                    if (onChange) {
                        onChange("");
                    }

                    revertClearInput()
                }
            }
        }
    }, [clearInput]);

    useEffect(() => {
        handleDiagnostic();
    }, [expressionEditorState.diagnostic])

    useEffect(() => {
        if (monacoRef.current && changed !== undefined) {
            const editorModel = monacoRef.current.editor.getModel();
            if (editorModel && model.value) {
                editorModel.setValue(model.value);
                validateAndRevert(model.value, monacoRef.current.editor.getModel().getEOL());
            }
        }
    }, [changed]);

    useEffect(() => {
        if (expandDefault !== undefined) {
            setExpand(expandDefault)
        }
    }, [expandDefault]);

    // Use this function to validate the expression editor from another component. File content will revert after validating
    const validateAndRevert = async (currentContent: string, EOL: string) => {
        let initContent: string = null;
        if (model.optional === true && (currentContent === undefined || currentContent === "")) {
            // No need to send didChange with the template because this is an optional field and empty content is allowed.
            return
        } else {
            const newCodeSnippet: string = addToTargetPosition(defaultCodeSnippet, (snippetTargetPosition - 1), currentContent);
            initContent = addToTargetLine(atob(currentFile.content), targetPosition.line, newCodeSnippet, EOL);
            initContent = addImportModuleToCode(initContent, model);
        }

        expressionEditorState.name = model.name;
        expressionEditorState.content = initContent;
        expressionEditorState.uri = monaco.Uri.file(currentApp?.workingFile).toString();

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

        await getExpressionEditorLangClient(langServerURL).then(async (langClient: ExpressionEditorLangClientInterface) => {
            await langClient.diagnostics({
                documentIdentifier: {
                    uri: expressionEditorState.uri,
                }
            }).then((diagResp: any) => {
                setExpressionEditorState({
                    ...expressionEditorState,
                    diagnostic: diagResp[0]?.diagnostics ? getFilteredDiagnostics(diagResp[0]?.diagnostics, isCustomTemplate) : []
                })
            });
        });

        // Revert the file content
        expressionEditorState.content = atob(currentFile.content);

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

    // ExpEditor start
    const handleOnFocus = async (currentContent: string, EOL: string) => {
        let initContent: string = null;
        if (model.optional === true && (currentContent === undefined || currentContent === "")) {
            // No need to send didChange with the template because this is an optional field and empty content is allowed.
            // Replacing the templates lenght with space char to get the LS completions correctly
            const newCodeSnippet: string = " ".repeat(snippetTargetPosition);
            initContent = addToTargetLine(atob(currentFile.content), targetPosition.line, newCodeSnippet, EOL);
            initContent = addImportModuleToCode(initContent, model);
        } else {
            const newCodeSnippet: string = addToTargetPosition(defaultCodeSnippet, (snippetTargetPosition - 1), currentContent);
            initContent = addToTargetLine(atob(currentFile.content), targetPosition.line, newCodeSnippet, EOL);
            initContent = addImportModuleToCode(initContent, model);
        }

        expressionEditorState.name = model.name;
        expressionEditorState.content = initContent;
        expressionEditorState.uri = monaco.Uri.file(currentApp?.workingFile).toString();

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

        await getExpressionEditorLangClient(langServerURL).then(async (langClient: ExpressionEditorLangClientInterface) => {
            await langClient.diagnostics({
                documentIdentifier: {
                    uri: expressionEditorState.uri,
                }
            }).then((diagResp: any) => {
                setExpressionEditorState({
                    ...expressionEditorState,
                    diagnostic: diagResp[0]?.diagnostics ? getFilteredDiagnostics(diagResp[0]?.diagnostics, isCustomTemplate) : []
                })
            });
        });

        // FIXME: Uncomment this once the ballerinaSymbol/type request is enabled in LS
        // await getExpressionEditorLangClient(langServerURL).then(async (langClient: ExpressionEditorLangClientInterface) => {
        //     const offset = varType.length + 1;
        //     await langClient.getType({
        //         documentIdentifier: {
        //             uri: expressionEditorState.uri,
        //         },
        //         position: {
        //             line: targetPosition.line,
        //             offset
        //         }
        //     }).then((resp: any) => {
        //         const typeInfo: string[] = (resp as ExpressionTypeResponse).types;
        //         handleTypeInfo(typeInfo);
        //     });
        // });

        const lastCharacter = currentContent.length > 0 && currentContent.charAt(currentContent.length - 1)
        if ((currentContent === "" || TRIGGER_CHARACTERS.includes(lastCharacter)) && monacoRef.current.editor.hasTextFocus()) {
            monacoRef.current.editor.trigger('exp_editor', 'editor.action.triggerSuggest', {})
        }
    }

    // ExpEditor onChange
    const handleContentChange = async (currentContent: string, EOL: string, lastPressedKey: string) => {
        if (expressionEditorState?.name === model.name && monacoRef.current && monacoRef.current.editor.hasTextFocus()) {
            let newModel: string = null;
            if (model.optional === true && (currentContent === undefined || currentContent === "")) {
                // No need to send didChange with the template because this is an optional field and empty content is allowed.
                // Replacing the templates lenght with space char to get the LS completions correctly
                const newCodeSnippet: string = " ".repeat(snippetTargetPosition);
                newModel = addToTargetLine(atob(currentFile.content), targetPosition.line, newCodeSnippet, EOL);
                newModel = addImportModuleToCode(newModel, model);
            } else {
                // set the new model for the file
                const newCodeSnippet: string = addToTargetPosition(defaultCodeSnippet, (snippetTargetPosition - 1), currentContent);
                newModel = addToTargetLine(atob(currentFile.content), targetPosition.line, newCodeSnippet, EOL);
                newModel = addImportModuleToCode(newModel, model);
            }

            expressionEditorState.name = model.name;
            expressionEditorState.content = newModel;
            expressionEditorState.uri = expressionEditorState?.uri;

            // update the change of the field
            model.value = monacoRef.current.editor.getModel().getValue();
            if (onChange) {
                onChange(monacoRef.current.editor.getModel().getValue());
            }

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

            await getExpressionEditorLangClient(langServerURL).then(async (langClient: ExpressionEditorLangClientInterface) => {
                await langClient.diagnostics({
                    documentIdentifier: {
                        uri: expressionEditorState.uri,
                    }
                }).then((diagResp: any) => {
                    setExpressionEditorState({
                        ...expressionEditorState,
                        diagnostic: diagResp[0]?.diagnostics ? getFilteredDiagnostics(diagResp[0]?.diagnostics, isCustomTemplate) : []
                    })
                });
            });

            // FIXME: Uncomment this once the ballerinaSymbol/type request is enabled in LS
            // await getExpressionEditorLangClient(langServerURL).then(async (langClient: ExpressionEditorLangClientInterface) => {
            //     const offset = varType.length + 1;
            //     await langClient.getType({
            //         documentIdentifier: {
            //             uri: expressionEditorState.uri,
            //         },
            //         position: {
            //             line: targetPosition.line,
            //             offset
            //         }
            //     }).then((resp: any) => {
            //         const typeInfo: string[] = (resp as ExpressionTypeResponse).types;
            //         handleTypeInfo(typeInfo);
            //     });
            // });

            if ((currentContent === "" || TRIGGER_CHARACTERS.includes(lastPressedKey)) && monacoRef.current.editor.hasTextFocus()) {
                monacoRef.current.editor.trigger('exp_editor', 'editor.action.triggerSuggest', {})
            }

            if ((currentContent.length >= EDITOR_MAXIMUM_CHARACTERS) && monacoRef.current.editor.hasTextFocus()) {
                setExpand(true);
                if (currentContent.length >= EXPAND_EDITOR_MAXIMUM_CHARACTERS) {
                    setSuperExpand(true);
                }
            }
        }
    }
    const debouncedContentChange = debounce(handleContentChange, 500);

    // ExpEditor close
    const handleOnOutFocus = async () => {
        // remove additional semicolon if present
        const monacoModel = monacoRef?.current?.editor.getModel();
        if (monacoModel){
            const currentContent = monacoModel.getValue();
            // Remove semicolon only if the content ends with a semicolon and if its not a custom template
            if (currentContent.endsWith(';') && !isCustomTemplate){
                const contentWithoutSemiColon = getValueWithoutSemiColon(currentContent);
                model.value = contentWithoutSemiColon;
                if (onChange){
                    onChange(contentWithoutSemiColon);
                }
            }
        }

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

            setCursorOnEditor(false);
            if (subEditor) {
                monaco.editor.setModelMarkers(monacoRef.current.editor.getModel(), 'expression editor', []);
            }
        }
    }

    const handleEditorMount: EditorDidMount = (monacoEditor, { languages, editor }) => {
        languages.register({ id: BALLERINA_EXPR });
        languages.setLanguageConfiguration(BALLERINA_EXPR, {
            autoClosingPairs: [{
                open: "'",
                close: "'"
            }, {
                open: '"',
                close: '"'
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

        const MONACO_URI_INMEMO = monaco.Uri.file('inmemory://' + varName + getRandomInt(100000) + '.bal');
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

        // Disabling certain key events
        monacoEditor.onKeyDown((event: monaco.IKeyboardEvent) => {
            const { keyCode, ctrlKey, metaKey } = event;
            if ([36, 37].includes(keyCode) && (metaKey || ctrlKey)) {
                // Disabling ctrl/cmd + (f || g)
                event.stopPropagation();
            }
            const suggestWidgetStatus = (monacoEditor as any)._contentWidgets["editor.widget.suggestWidget"].widget.state;
            // When suggest widget is open => suggestWidgetStatus = 3
            if (keyCode === monaco.KeyCode.Tab && suggestWidgetStatus !== 3){
                event.stopPropagation();
            }
        });
    }

    const addCheckToExpression = () => {
        if (monacoRef.current) {
            const editorModel = monacoRef.current.editor.getModel();
            if (editorModel) {
                editorModel.setValue("check " + editorModel.getValue());
                monacoRef.current.editor.focus();
            }
        }
    }

    const addDoubleQuotesToExpresssion = () => {
        if (monacoRef.current) {
            const editorModel = monacoRef.current.editor.getModel();
            if (editorModel) {
                const editorContent = editorModel.getValue();
                const startQuote = editorContent.trim().startsWith("\"") ? "" : "\"";
                const endQuote = editorContent.trim().endsWith("\"") ? "" : "\"";
                editorModel.setValue(startQuote + editorContent + endQuote);
                monacoRef.current.editor.focus();
            }
        }
    }

    const addToStringToExpression = () => {
        if (monacoRef.current) {
            const editorModel = monacoRef.current.editor.getModel();
            if (editorModel) {
                const editorContent = editorModel.getValue();
                editorModel.setValue(`(${editorContent}).toString()`);
                monacoRef.current.editor.focus();
            }
        }
    }

    setDefaultTooltips();

    return (
        <>
            <ExpressionEditorLabel {...props} />
            <div className="exp-container" style={{ height: expand ? (superExpand ? '200px' : '100px') : '32px' }}>
                <div className="exp-absolute-wrapper">
                    <div className="exp-editor" style={{ height: expand ? (superExpand ? '200px' : '100px') : '32px' }} >
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
                        <>
                            {!(subEditor && cursorOnEditor) && <Diagnostic message={mainDiagnostics[0]?.message} />}
                            <FormHelperText className={formClasses.invalidCode}><FormattedMessage id="lowcode.develop.elements.expressionEditor.invalidSourceCode.errorMessage" defaultMessage="Error occurred in the code-editor. Please fix it first to continue." /></FormHelperText>
                        </>
                    ) : addCheck ?
                        (
                            <ExpressionEditorHint type={HintType.ADD_CHECK} onClickHere={addCheckToExpression}/>
                        ) : expressionEditorState.name === model?.name && expressionEditorState.diagnostic && getDiagnosticMessage(expressionEditorState.diagnostic, varType) ?
                        (
                                <>
                                    {!(subEditor && cursorOnEditor)  && <Diagnostic message={getDiagnosticMessage(expressionEditorState.diagnostic, varType)} />}
                                    {stringCheck && needToString && monacoRef.current && (
                                        <ExpressionEditorHint type={HintType.ADD_TO_STRING} onClickHere={addToStringToExpression}/>
                                    )}
                                    {stringCheck && needQuotes && monacoRef.current ?
                                        (monacoRef.current.editor.getModel().getValue() === "") ? (
                                            <ExpressionEditorHint type={HintType.ADD_DOUBLE_QUOTES_EMPTY} onClickHere={addDoubleQuotesToExpresssion}/>
                                        ) : (
                                            <ExpressionEditorHint type={HintType.ADD_DOUBLE_QUOTES} onClickHere={addDoubleQuotesToExpresssion} editorContent={monacoRef.current.editor.getModel().getValue()}/>
                                        ) : null
                                    }
                                </>
                            ) : null
            }
        </>
    );
}

function Diagnostic(props: {message: string}) {
    const { message } = props
    const formClasses = useFormStyles();

    return (
        <TooltipCodeSnippet content={message} placement="right" arrow={true}>
            <FormHelperText className={formClasses.invalidCode} data-testid='expr-diagnostics'>{truncateDiagnosticMsg(message)}</FormHelperText>
        </TooltipCodeSnippet>
    )
}

export default ExpressionEditor;
