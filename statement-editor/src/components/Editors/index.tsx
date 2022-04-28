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

import { StmtEditorStackItem } from "../../models/definitions";
import { StatementEditorWrapperContextProvider } from "../../store/statement-editor-wrapper-context";
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

export interface EditorsProps extends LowCodeEditorProps {
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
}

export function Editors(props: EditorsProps) {
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
        importStatements
    } = props;

    const {
        formArgs : {
            targetPosition : targetPosition
        }
    } = formArgs;

    const [editors, setEditors] = useState<StmtEditorStackItem[]>([]);
    const [editor, setEditor] = useState<StmtEditorStackItem>();
    const [activeEditorId, setActiveEditorId] = useState<number>(0);

    const switchEditor = (index: number) => {
        setEditor(editors[index]);
        setActiveEditorId(index);
    };

    const updateEditor = (index: number, newContent: StmtEditorStackItem) => {
        setEditors((prevEditors: StmtEditorStackItem[]) => {
            prevEditors[index] = newContent;
            return prevEditors;
        });
    };

    const dropLastEditor = () => {
        setEditors((prevEditors: StmtEditorStackItem[]) => {
            return prevEditors.slice(0, -1);
        });
    };

    const addConfigurable = (newLabel: string, newPosition: NodePosition, newSource: string) => {
        const newEditor: StmtEditorStackItem = {
            label: newLabel,
            position: newPosition,
            source: newSource,
            isConfigurableStmt: true
        };
        setEditors((prevEditors: StmtEditorStackItem[]) => {
            return [...prevEditors, newEditor];
        });
    };

    useEffect(() => {
        const newEditor: StmtEditorStackItem = {
            label,
            position: targetPosition,
            source: initialSource
        };
        setEditors((prevEditors: StmtEditorStackItem[]) => {
            return [...prevEditors, newEditor];
        });
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
