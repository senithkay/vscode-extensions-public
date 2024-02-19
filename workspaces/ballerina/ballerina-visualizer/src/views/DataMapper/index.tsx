/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DataMapperView } from "@wso2-enterprise/data-mapper-view";
import React, { useEffect, useMemo, useState } from "react";
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";
import { SyntaxTreeResponse, STModification, NodePosition, HistoryEntry } from "@wso2-enterprise/ballerina-core";
import { useSyntaxTreeFromRange } from "../../Hooks";
import { FunctionDefinition, ModulePart, STKindChecker } from "@wso2-enterprise/syntax-tree";
import { RecordEditorWrapper, StatementEditorComponentProps } from "@wso2-enterprise/record-creator";
import { URI } from "vscode-uri";

interface DataMapperProps {
    filePath: string;
    model: FunctionDefinition;
}

export function DataMapper(props: DataMapperProps) {
    const { filePath, model } = props;
    const { rpcClient } = useVisualizerContext();
    const langServerRpcClient = rpcClient.getLangServerRpcClient();
    const libraryBrowserRPCClient = rpcClient.getLibraryBrowserRPCClient();
    const recordCreatorRpcClient = rpcClient.getRecordCreatorRpcClient();

    const applyModifications = async (modifications: STModification[]) => {
        const langServerRPCClient = rpcClient.getLangServerRpcClient();
        const { parseSuccess, source: newSource } = await langServerRPCClient?.stModify({
            astModifications: modifications,
            documentIdentifier: {
                uri: URI.file(filePath).toString()
            }
        });
        if (parseSuccess) {
            await langServerRPCClient.updateFileContent({
                content: newSource,
                fileUri: filePath
            });
        }
    };

    const goToFunction = async (entry: HistoryEntry) => {
        rpcClient.getVisualizerRpcClient().addToHistory(entry);
    };

    const renderRecordPanel = (props: { closeAddNewRecord: (createdNewRecord?: string) => void } & StatementEditorComponentProps) => {
        return (
            <RecordEditorWrapper
                isDataMapper={true}
                onCancel={props.closeAddNewRecord}
                recordCreatorRpcClient={recordCreatorRpcClient}
                {...props}
            />
        );
    };

    return (
        <DataMapperView
            fnST={model}
            filePath={filePath}
            langServerRpcClient={langServerRpcClient}
            libraryBrowserRpcClient={libraryBrowserRPCClient}
            applyModifications={applyModifications}
            goToFunction={goToFunction}
                renderRecordPanel={renderRecordPanel}
        />
    );
};
