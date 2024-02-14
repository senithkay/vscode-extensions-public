/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useMemo } from "react";

import { NodePosition, RecordTypeDesc, STNode, TypeDefinition } from "@wso2-enterprise/syntax-tree";

import { createPropertyStatement } from "./utils";

import { CreateRecord } from "./CreateRecord";
import { RecordModel, StatementEditorComponentProps } from "./types";
import { UndoRedoManager } from "./components/UndoRedoManager";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { Context } from "./Context";
import { useBallerinaVersion, useFullST } from "./Hooks";
import { FormContainer } from "./style";
import { RecordCreatorRpcClient } from "@wso2-enterprise/ballerina-rpc-client";

export interface RecordEditorProps extends StatementEditorComponentProps {
    recordCreatorRpcClient: RecordCreatorRpcClient;
    model?: RecordTypeDesc | TypeDefinition;
    isDataMapper?: boolean;
    onCancel: (createdNewRecord?: string) => void;
    onSave: (typeDesc: string, recModel: RecordModel) => void;
    showHeader?: boolean;
}

const undoRedoManager = new UndoRedoManager();

export function RecordEditor(props: RecordEditorProps) {
    const {
        model,
        isDataMapper,
        onCancel,
        showHeader,
        expressionInfo,
        langServerRpcClient,
        libraryBrowserRpcClient,
        recordCreatorRpcClient,
        currentFile,
        applyModifications,
        onCancelStatementEditor,
        onClose,
        importStatements,
        currentReferences,
    } = props;
    const {
        ballerinaVersion,
        isFetching: isFetchingBallerinaVersion,
        isError: isErrorBallerinaVersion,
    } = useBallerinaVersion(langServerRpcClient);
    const {
        fullST,
        isFetching: isFetchingFullST,
        isError: isErrorFullST,
    } = useFullST(currentFile.path, langServerRpcClient);

    const createModelSave = (recordString: string, pos: NodePosition) => {
        undoRedoManager.updateContent(currentFile.path, currentFile.content);
        undoRedoManager.addModification(currentFile.content);
        applyModifications([createPropertyStatement(recordString, expressionInfo.valuePosition, false)]);
        if (isDataMapper) {
            onCancel(recordString);
        }
    };

    const stmtEditorComponent = StatementEditorWrapper({
        formArgs: {
            formArgs: {
                targetPosition: expressionInfo.valuePosition,
            },
        },
        config: {
            type: "Custom",
            model: null,
        },
        onWizardClose: onClose,
        syntaxTree: null,
        stSymbolInfo: null,
        langServerRpcClient: langServerRpcClient,
        libraryBrowserRpcClient: libraryBrowserRpcClient,
        label: expressionInfo.label,
        initialSource: expressionInfo.value,
        applyModifications,
        currentFile: {
            ...currentFile,
            content: currentFile.content,
            originalContent: currentFile.content,
        },
        onCancel: onCancelStatementEditor,
        isExpressionMode: true,
        importStatements,
        currentReferences,
    });

    const contextValue = useMemo(() => {
        if (isFetchingBallerinaVersion || isFetchingFullST) {
            return undefined;
        }

        return {
            props: {
                expressionInfo,
                langServerRpcClient,
                libraryBrowserRpcClient,
                recordCreatorRpcClient,
                currentFile,
                importStatements,
                currentReferences,
                ballerinaVersion,
                fullST,
            },
            api: {
                applyModifications,
                onCancelStatementEditor,
                onClose,
            },
        };
    }, [isFetchingBallerinaVersion, isFetchingFullST]);

    return (
        <Context.Provider value={contextValue}>
            {!isFetchingBallerinaVersion && !isErrorBallerinaVersion && !isFetchingFullST && !isErrorFullST && (
                <>
                    {model ? (
                        // Edit existing record
                        <FormContainer>{stmtEditorComponent}</FormContainer>
                    ) : (
                        // Create new record
                        <CreateRecord
                            onCancel={onCancel}
                            onSave={createModelSave}
                            targetPosition={expressionInfo.valuePosition}
                            isDataMapper={isDataMapper}
                            undoRedoManager={undoRedoManager}
                            showHeader={showHeader}
                        />
                    )}
                </>
            )}
        </Context.Provider>
    );
}
