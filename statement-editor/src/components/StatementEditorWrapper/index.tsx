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

import {
    ExpressionEditorLangClientInterface,
    LibraryDataResponse,
    LibraryDocResponse,
    LibrarySearchResponse,
    STModification
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";
import * as monaco from "monaco-editor";

import { CUSTOM_CONFIG_TYPE } from "../../constants";
import { EditorModel } from "../../models/definitions";
import { StatementEditorWrapperContextProvider } from "../../store/statement-editor-wrapper-context";
import { getUpdatedSource } from "../../utils";
import { getPartialSTForModuleMembers, getPartialSTForStatement, sendDidOpen } from "../../utils/ls-utils";
import { StmtEditorUndoRedoManager } from "../../utils/undo-redo";
import { EXPR_SCHEME, FILE_SCHEME } from "../InputEditor/constants";
import { StatementEditor } from "../StatementEditor";

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
    syntaxTree: STNode;
    importStatements?: string[];
    experimentalEnabled?: boolean;
}

export interface StatementEditorWrapperProps extends LowCodeEditorProps {
    label: string;
    initialSource: string;
    formArgs: any;
    config: {
        type: string;
        model?: STNode;
    };
    validForm?: boolean;
    onWizardClose: () => void;
    onCancel: () => void;
    handleStatementEditorChange?: (partialModel: STNode) => void;
    onStmtEditorModelChange?: (partialModel: STNode) => void;
    handleStmtEditorToggle?: () => void;
}

export function StatementEditorWrapper(props: StatementEditorWrapperProps) {
    const {
        label,
        initialSource,
        formArgs,
        config,
        onCancel,
        onWizardClose,
        onStmtEditorModelChange,
        getLangClient,
        applyModifications,
        library,
        currentFile,
        syntaxTree,
        importStatements,
        experimentalEnabled,
        handleStmtEditorToggle
    } = props;

    const {
        formArgs : {
            targetPosition : targetPosition
        }
    } = formArgs;

    const fileURI = monaco.Uri.file(currentFile.path).toString().replace(FILE_SCHEME, EXPR_SCHEME);

    const [editors, setEditors] = useState<EditorModel[]>([]);
    const [editor, setEditor] = useState<EditorModel>();
    const [activeEditorId, setActiveEditorId] = useState<number>(0);

    const switchEditor = (index: number) => {
        setEditor(editors[index]);
        setActiveEditorId(index);
    };

    const updateEditor = (index: number, newContent: EditorModel) => {
        setEditors((prevEditors: EditorModel[]) => {
            prevEditors[index] = newContent;
            return prevEditors;
        });
    };

    const dropLastEditor = () => {
        setEditors((prevEditors: EditorModel[]) => {
            return prevEditors.slice(0, -1);
        });
    };

    const addConfigurable = async (newLabel: string, newPosition: NodePosition, newSource: string) => {
        const partialST = await getPartialSTForModuleMembers(
            {codeSnippet: newSource.trim()}, getLangClient);

        const newEditor: EditorModel = {
            label: newLabel,
            model: !partialST.syntaxDiagnostics.length ? partialST : null,
            source: newSource,
            position: newPosition,
            undoRedoManager: new StmtEditorUndoRedoManager(),
            isConfigurableStmt: true
        };
        setEditors((prevEditors: EditorModel[]) => {
            return [...prevEditors, newEditor];
        });
    };

    useEffect(() => {
        if (config.type !== CUSTOM_CONFIG_TYPE) {
            (async () => {
                let model = null;
                const updatedContent = await getUpdatedSource(initialSource.trim(), currentFile.content,
                    targetPosition);

                await sendDidOpen(fileURI, updatedContent, getLangClient);

                const partialST = await getPartialSTForStatement(
                    { codeSnippet: initialSource.trim() }, getLangClient);

                if (!partialST.syntaxDiagnostics.length) {
                    model = partialST;
                }

                const newEditor: EditorModel = {
                    label,
                    model,
                    source: initialSource,
                    position: targetPosition,
                    undoRedoManager: new StmtEditorUndoRedoManager()
                };

                setEditors((prevEditors: EditorModel[]) => {
                    return [...prevEditors, newEditor];
                });

            })();
        }
    }, []);

    useEffect(() => {
        const editorIndex = editors.length - 1;
        setEditor(editors[editorIndex]);
        setActiveEditorId(editorIndex);
    }, [editors]);

    return (
        editor
            ? (
                <>
                    <StatementEditorWrapperContextProvider
                        config={config}
                        formArgs={formArgs}
                        switchEditor={switchEditor}
                        updateEditor={updateEditor}
                        dropLastEditor={dropLastEditor}
                        addConfigurable={addConfigurable}
                        activeEditorId={activeEditorId}
                        editors={editors}
                        getLangClient={getLangClient}
                        applyModifications={applyModifications}
                        currentFile={currentFile}
                        library={library}
                        importStatements={importStatements}
                        syntaxTree={syntaxTree}
                        experimentalEnabled={experimentalEnabled}
                        handleStmtEditorToggle={handleStmtEditorToggle}
                    >
                        <StatementEditor
                            editor={editor}
                            onWizardClose={onWizardClose}
                            onCancel={onCancel}
                            onStmtEditorModelChange={onStmtEditorModelChange}
                        />
                    </StatementEditorWrapperContextProvider>
                </>
            )
            : (
                <></>
            )
    )
}
