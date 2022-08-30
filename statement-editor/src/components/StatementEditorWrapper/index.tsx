/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useEffect, useState } from 'react';

import { FormControl } from '@material-ui/core';
import {
    CommandResponse,
    ExpressionEditorLangClientInterface, KeyboardNavigationManager,
    LibraryDataResponse,
    LibraryDocResponse,
    LibrarySearchResponse,
    STModification,
    STSymbolInfo
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";
import * as monaco from "monaco-editor";

import { CUSTOM_CONFIG_TYPE } from "../../constants";
import { EditorModel } from "../../models/definitions";
import { getPartialSTForModuleMembers, getPartialSTForStatement, sendDidOpen } from "../../utils/ls-utils";
import { StmtEditorUndoRedoManager } from "../../utils/undo-redo";
import { EXPR_SCHEME, FILE_SCHEME } from "../InputEditor/constants";
import { StatementEditor } from "../StatementEditor";
import { useStatementEditorStyles } from '../styles';

export interface LowCodeEditorProps {
    getLangClient: () => Promise<ExpressionEditorLangClientInterface>;
    applyModifications: (modifications: STModification[]) => void;
    currentFile: {
        content: string,
        path: string,
        size: number
    };
    library: {
        getLibrariesList: (kind?: string) => Promise<LibraryDocResponse>;
        getLibrariesData: () => Promise<LibrarySearchResponse>;
        getLibraryData: (orgName: string, moduleName: string, version: string) => Promise<LibraryDataResponse>;
    };
    formArgs: any;
    config: {
        type: string;
        model?: STNode;
    };
    onWizardClose: () => void;
    onCancel: () => void;
    syntaxTree: STNode;
    stSymbolInfo: STSymbolInfo;
    importStatements?: string[];
    experimentalEnabled?: boolean;
    isConfigurableStmt?: boolean;
    isModuleVar?: boolean;
    runBackgroundTerminalCommand?: (command: string) => Promise<CommandResponse>;
    isCodeServerInstance?: boolean;
}

export interface StatementEditorWrapperProps extends LowCodeEditorProps {
    label: string;
    initialSource: string;
    extraModules?: Set<string>;
}

export function StatementEditorWrapper(props: StatementEditorWrapperProps) {
    const overlayClasses = useStatementEditorStyles();
    const {
        label,
        initialSource,
        formArgs,
        config,
        onCancel,
        onWizardClose,
        getLangClient,
        applyModifications,
        library,
        currentFile,
        syntaxTree,
        stSymbolInfo,
        importStatements,
        experimentalEnabled,
        isConfigurableStmt,
        isModuleVar,
        extraModules,
        runBackgroundTerminalCommand,
        isCodeServerInstance
    } = props;

    const {
        formArgs: {
            targetPosition: targetPosition
        }
    } = formArgs;

    const fileURI = monaco.Uri.file(currentFile.path).toString().replace(FILE_SCHEME, EXPR_SCHEME);

    const [editors, setEditors] = useState<EditorModel[]>([]);
    const [editor, setEditor] = useState<EditorModel>();
    const [activeEditorId, setActiveEditorId] = useState<number>(0);

    useEffect(() => {
        (async () => {
            let model = null;
            if (initialSource) {
                await sendDidOpen(fileURI, currentFile.content, getLangClient);

                const partialST =
                    isConfigurableStmt || isModuleVar
                        ? await getPartialSTForModuleMembers({ codeSnippet: initialSource.trim() }, getLangClient)
                        : await getPartialSTForStatement({ codeSnippet: initialSource.trim() }, getLangClient);

                if (!partialST.syntaxDiagnostics.length || config.type === CUSTOM_CONFIG_TYPE) {
                    model = partialST;
                }
            }
            const newEditor: EditorModel = {
                label,
                model,
                source: initialSource,
                position: targetPosition,
                isConfigurableStmt,
                isModuleVar,
                undoRedoManager: new StmtEditorUndoRedoManager(),
            };

            setEditors((prevEditors: EditorModel[]) => {
                return [...prevEditors, newEditor];
            });
        })();
    }, [initialSource]);

    useEffect(() => {
        if (!!editors.length) {
            const lastEditorIndex = editors.length - 1;
            switchEditor(lastEditorIndex);
        }
    }, [editors]);

    const switchEditor = (index: number) => {
        const switchedEditor = editors[index];
        setEditor({
            ...switchedEditor
        });
        setActiveEditorId(index);
    };

    const updateEditor = (index: number, newContent: EditorModel) => {
        setEditors((prevEditors: EditorModel[]) => {
            prevEditors[index] = newContent;
            return prevEditors;
        });
    };

    const dropLastEditor = (offset: number = 0) => {
        setEditors((prevEditors: EditorModel[]) => {
            const remainingEditors = prevEditors.slice(0, -1);
            remainingEditors.map((e: EditorModel) => {
                e.position = {
                    ...e.position,
                    startLine: e.position.startLine + ((e.isExistingStmt || !e.isConfigurableStmt) && offset),
                    endLine: e.position.endLine + ((e.isExistingStmt || !e.isConfigurableStmt) && offset)
                };
            });
            return remainingEditors;
        });
    };

    const addConfigurable = async (newLabel: string, newPosition: NodePosition,
                                   newSource: string, isExistingStmt: boolean = false) => {
        const partialST = await getPartialSTForModuleMembers(
            {codeSnippet: newSource.trim()}, getLangClient);

        const newEditor: EditorModel = {
            label: newLabel,
            model: !partialST.syntaxDiagnostics.length ? partialST : null,
            source: newSource,
            position: newPosition,
            undoRedoManager: new StmtEditorUndoRedoManager(),
            isConfigurableStmt: true,
            isExistingStmt
        };
        setEditors((prevEditors: EditorModel[]) => {
            return [...prevEditors, newEditor];
        });
    };

    React.useEffect(() => {
        const client = KeyboardNavigationManager.getClient();
        return () => {
            client.resetMouseTrapInstance();
        }
    }, []);

    return (
        <FormControl data-testid="property-form">
            {!editor && (
                <div className={overlayClasses.mainStatementWrapper} data-testid="statement-editor-loader">
                    <div className={overlayClasses.loadingWrapper}>Loading statement editor...</div>
                </div>
            )}
            {editor && (
                    <>
                        <StatementEditor
                            editor={editor}
                            editorManager={{
                                switchEditor,
                                updateEditor,
                                dropLastEditor,
                                addConfigurable,
                                activeEditorId,
                                editors
                            }}
                            onWizardClose={onWizardClose}
                            onCancel={onCancel}
                            config={config}
                            formArgs={formArgs}
                            getLangClient={getLangClient}
                            applyModifications={applyModifications}
                            currentFile={currentFile}
                            library={library}
                            importStatements={importStatements}
                            syntaxTree={syntaxTree}
                            stSymbolInfo={stSymbolInfo}
                            extraModules={extraModules}
                            experimentalEnabled={experimentalEnabled}
                            runBackgroundTerminalCommand={runBackgroundTerminalCommand}
                            isCodeServerInstance={isCodeServerInstance}
                        />
                    </>
                )}
        </FormControl>
    )
}
