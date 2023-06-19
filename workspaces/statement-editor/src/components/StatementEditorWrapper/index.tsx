/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
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
import { getPartialSTForExpression, getPartialSTForModuleMembers, getPartialSTForStatement, sendDidOpen } from "../../utils/ls-utils";
import { StmtEditorUndoRedoManager } from "../../utils/undo-redo";
import { StatementEditor } from "../StatementEditor";
import { useStatementEditorStyles } from '../styles';

export interface LowCodeEditorProps {
    getLangClient: () => Promise<ExpressionEditorLangClientInterface>;
    applyModifications: (modifications: STModification[]) => void;
    updateFileContent: (content: string, skipForceSave?: boolean, filePath?: string) => Promise<boolean>;
    currentFile: {
        content: string,
        path: string,
        size: number,
        originalContent?: string
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
    onWizardClose: (typeName?: string) => void;
    onCancel: () => void;
    syntaxTree: STNode;
    stSymbolInfo: STSymbolInfo;
    importStatements?: string[];
    experimentalEnabled?: boolean;
    isConfigurableStmt?: boolean;
    isModuleVar?: boolean;
    runBackgroundTerminalCommand?: (command: string) => Promise<CommandResponse>;
    isExpressionMode?: boolean;
    mappingCounstructor ?: string;
    modelTargetSource?: NodePosition;
    ballerinaVersion?: string;
    isCodeServerInstance?: boolean;
    openExternalUrl?: (url: string) => Promise<boolean>;
}

export interface StatementEditorWrapperProps extends LowCodeEditorProps {
    label: string;
    initialSource: string;
    extraModules?: Set<string>;
    isHeaderHidden?: boolean;
    skipSemicolon?: boolean;
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
        updateFileContent,
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
        isExpressionMode,
        skipSemicolon,
        ballerinaVersion,
        isCodeServerInstance,
        openExternalUrl,
        isHeaderHidden
    } = props;

    const {
        formArgs: {
            targetPosition: targetPosition
        }
    } = formArgs;

    const [editors, setEditors] = useState<EditorModel[]>([]);
    const [editor, setEditor] = useState<EditorModel>();
    const [activeEditorId, setActiveEditorId] = useState<number>(0);

    useEffect(() => {
        (async () => {
            let model = null;
            let hasIncorrectSyntax = false;
            if (initialSource) {
                const partialST =
                    isConfigurableStmt || isModuleVar
                        ? await getPartialSTForModuleMembers({ codeSnippet: initialSource.trim() }, getLangClient)
                        : (isExpressionMode ? await getPartialSTForExpression({codeSnippet: initialSource.trim()}, getLangClient)
                        : await getPartialSTForStatement({ codeSnippet: initialSource.trim()}, getLangClient));

                if (!partialST.syntaxDiagnostics.length || config.type === CUSTOM_CONFIG_TYPE) {
                    model = partialST;
                } else {
                    hasIncorrectSyntax = true
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
                hasIncorrectSyntax
            };

            setEditors((prevEditors: EditorModel[]) => {
                return [...prevEditors, newEditor];
            });
        })();
    }, [targetPosition.startLine]);

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
                            updateFileContent={updateFileContent}
                            currentFile={currentFile}
                            library={library}
                            importStatements={importStatements}
                            syntaxTree={syntaxTree}
                            stSymbolInfo={stSymbolInfo}
                            extraModules={extraModules}
                            experimentalEnabled={experimentalEnabled}
                            runBackgroundTerminalCommand={runBackgroundTerminalCommand}
                            isExpressionMode={isExpressionMode}
                            skipSemicolon={skipSemicolon}
                            ballerinaVersion={ballerinaVersion}
                            isCodeServerInstance={isCodeServerInstance}
                            openExternalUrl={openExternalUrl}
                            isHeaderHidden={isHeaderHidden}
                        />
                    </>
                )}
        </FormControl>
    )
}
