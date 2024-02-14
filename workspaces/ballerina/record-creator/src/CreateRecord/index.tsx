/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useContext, useState } from "react";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { RecordConfigTypeSelector } from "../RecordConfigTypeSelector";
import { RecordFromJson } from "../RecordFromJson";
import { RecordFromXml } from "../RecordFromXml";
import { Context } from "../Context";
import { STModification } from "@wso2-enterprise/ballerina-core";
import { UndoRedoManager } from "../components/UndoRedoManager";
import { isSupportedSLVersion } from "../components/FormComponents/Utils";
import { FormContainer } from "../style";

enum ConfigState {
    STATE_SELECTOR,
    EDIT_CREATED,
    CREATE_FROM_SCRATCH,
    IMPORT_FROM_JSON,
    IMPORT_FROM_XML,
}

export interface CreateRecordProps {
    targetPosition?: NodePosition;
    isDataMapper?: boolean;
    undoRedoManager?: UndoRedoManager;
    onCancel: (createdNewRecord?: string) => void;
    onSave: (recordString: string, modifiedPosition: NodePosition) => void;
    showHeader?: boolean;
}

export function CreateRecord(props: CreateRecordProps) {
    const { targetPosition, isDataMapper, undoRedoManager, showHeader, onSave, onCancel } = props;
    const {
        props: {
            expressionInfo,
            langServerRpcClient,
            libraryBrowserRpcClient,
            currentFile,
            importStatements,
            ballerinaVersion
        },
        api: { applyModifications, onCancelStatementEditor, onClose },
    } = useContext(Context);

    const [editorState, setEditorState] = useState<ConfigState>(ConfigState.STATE_SELECTOR);

    const handleCreateNewClick = () => {
        setEditorState(ConfigState.CREATE_FROM_SCRATCH);
    };

    const handleImportJSONClick = () => {
        setEditorState(ConfigState.IMPORT_FROM_JSON);
    };

    const handleImportXMLClick = () => {
        setEditorState(ConfigState.IMPORT_FROM_XML);
    };

    const handleImportJsonSave = (value: string, pos: NodePosition) => {
        onSave(value, pos);
    };

    const handleImportXmlSave = (value: string, pos: NodePosition) => {
        onSave(value, pos);
    };

    const handleModifyDiagram = (mutations: STModification[]) => {
        applyModifications(mutations);
        if (isDataMapper) {
            onCancel(mutations[0].config.STATEMENT);
        }
    };

    const statementEditor = StatementEditorWrapper({
        label: expressionInfo.label,
        initialSource: expressionInfo.value,
        formArgs: {
            formArgs: {
                targetPosition: expressionInfo.valuePosition,
            },
        },
        config: { type: "RecordEditor" },
        onWizardClose: onClose,
        onCancel: onCancelStatementEditor,
        currentFile: {
            ...currentFile,
            content: currentFile.content,
            originalContent: currentFile.content,
        },
        langServerRpcClient: langServerRpcClient,
        libraryBrowserRpcClient: libraryBrowserRpcClient,
        applyModifications: handleModifyDiagram,
        syntaxTree: null,
        stSymbolInfo: null,
        importStatements,
        isModuleVar: true,
        isHeaderHidden: isDataMapper,
    });

    const checkBallerinVersion = () => {
        if (ballerinaVersion) {
            return isSupportedSLVersion(ballerinaVersion, 220172);
        }
        return false;
    };

    return (
        <FormContainer data-testid="record-form">
            <>
                {editorState === ConfigState.STATE_SELECTOR && (
                    <RecordConfigTypeSelector
                        onImportFromJson={handleImportJSONClick}
                        onImportFromXml={checkBallerinVersion() ? handleImportXMLClick : null}
                        onCreateNew={handleCreateNewClick}
                        onCancel={onCancel}
                        isDataMapper={isDataMapper}
                    />
                )}
                {editorState === ConfigState.IMPORT_FROM_JSON && (
                    <RecordFromJson
                        undoRedoManager={undoRedoManager}
                        targetPosition={targetPosition}
                        onCancel={onCancel}
                        onSave={handleImportJsonSave}
                        isHeaderHidden={showHeader ? false : isDataMapper}
                    />
                )}
                {editorState === ConfigState.IMPORT_FROM_XML && (
                    <RecordFromXml
                        undoRedoManager={undoRedoManager}
                        targetPosition={targetPosition}
                        onCancel={onCancel}
                        onSave={handleImportXmlSave}
                        isHeaderHidden={showHeader ? false : isDataMapper}
                    />
                )}
                {editorState === ConfigState.CREATE_FROM_SCRATCH && <>{statementEditor}</>}
            </>
        </FormContainer>
    );
}
