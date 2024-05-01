/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DataMapperView } from "@wso2-enterprise/data-mapper-view";
import React from "react";
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";
import { STModification, HistoryEntry } from "@wso2-enterprise/ballerina-core";
import { FunctionDefinition } from "@wso2-enterprise/syntax-tree";
import { RecordEditor, StatementEditorComponentProps } from "@wso2-enterprise/record-creator";

interface DataMapperProps {
    filePath: string;
    model: FunctionDefinition;
    applyModifications: (modifications: STModification[]) => Promise<void>;
}

export function DataMapper(props: DataMapperProps) {
    const { filePath, model, applyModifications } = props;
    const { rpcClient } = useVisualizerContext();
    const langServerRpcClient = rpcClient.getLangServerRpcClient();
    const libraryBrowserRPCClient = rpcClient.getLibraryBrowserRPCClient();
    const recordCreatorRpcClient = rpcClient.getRecordCreatorRpcClient();

    const goToFunction = async (entry: HistoryEntry) => {
        rpcClient.getVisualizerRpcClient().addToHistory(entry);
    };

    const renderRecordPanel = (props: {
        closeAddNewRecord: (createdNewRecord?: string) => void,
        onUpdate: (updated: boolean) => void
    } & StatementEditorComponentProps) => {
        return (
            <RecordEditor
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
