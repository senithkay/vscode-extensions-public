// tslint:disable: no-implicit-dependencies
import React from "react";

import { STModification } from "@wso2-enterprise/ballerina-core";
import { LangClientRpcClient, LibraryBrowserRpcClient, useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";




export interface StatementEditorComponentProps {
    label: string;
    initialSource: string;
    currentFile?: {
        content: string,
        path: string,
        size: number
    };
    applyModifications: (modifications: STModification[]) => void;
    onCancel: () => void;
    onClose: () => void;
    syntaxTree: STNode;
    targetPosition: NodePosition;
    config: any;
}
function StatementEditorC(props: StatementEditorComponentProps) {
    const { rpcClient } = useRpcContext();
    const langServerRpcClient = rpcClient.getLangClientRpcClient();
    const libraryBrowserRPCClient = rpcClient.getLibraryBrowserRPCClient();

    const {
        label,
        initialSource,
        syntaxTree,
        currentFile,
        applyModifications,
        onCancel,
        onClose,
        targetPosition,
        config
    } = props;

    const stmtEditorComponent = StatementEditorWrapper(
        {
            formArgs: { formArgs: {
                targetPosition: targetPosition,
                } },
            config: config,
            onWizardClose: onClose,
            syntaxTree: syntaxTree,
            stSymbolInfo: null,
            langServerRpcClient: langServerRpcClient,
            libraryBrowserRpcClient: libraryBrowserRPCClient,
            label: label,
            initialSource:  initialSource,
            applyModifications,
            currentFile: {
                ...currentFile,
                content: currentFile.content,
                originalContent: currentFile.content
            },
            onCancel
        }
    );

    return  stmtEditorComponent;
}

export const StatementEditorComponent = React.memo(StatementEditorC);
