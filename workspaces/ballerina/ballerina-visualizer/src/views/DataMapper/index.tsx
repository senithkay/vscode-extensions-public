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
import { URI } from "vscode-uri";

interface DataMapperProps {
    filePath: string;
    fnLocation: NodePosition;
}

export function DataMapper(props: DataMapperProps) {
    const { filePath, fnLocation } = props;
    const [rerender, setRerender] = useState(false);
    const [position, setPosition] = useState<NodePosition>(fnLocation);
    const { data, isFetching } = useSyntaxTreeFromRange(position, filePath, rerender);
    const { rpcClient } = useVisualizerContext();
    const langServerRpcClient = rpcClient.getLangServerRpcClient();
    const libraryBrowserRPCClient = rpcClient.getLibraryBrowserRPCClient();
    const [mapperData, setMapperData] = useState<SyntaxTreeResponse>(data);

    useEffect(() => {
        setPosition(fnLocation);
    }, [fnLocation]);

    useEffect(() => {
        if (!isFetching) {
            setMapperData(data);
        }
    }, [isFetching, data]);

    rpcClient.onFileContentUpdate(() => {
        setRerender(prevState => !prevState);
    });

    const syntaxTree = mapperData?.syntaxTree as FunctionDefinition;
    let fnName = syntaxTree?.functionName.value;

    const applyModifications = async (modifications: STModification[]) => {
        const langServerRPCClient = rpcClient.getLangServerRpcClient();
        const { parseSuccess, source: newSource, syntaxTree } = await langServerRPCClient?.stModify({
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

            const modPart = syntaxTree as ModulePart;
            const fns = modPart.members.filter((mem) =>
                STKindChecker.isFunctionDefinition(mem)
            ) as FunctionDefinition[];

            if (modifications.length === 1 && modifications[0].type === "FUNCTION_DEFINITION_SIGNATURE") {
                fnName = modifications[0].config.NAME;
            }

            const st = fns.find((mem) => mem.functionName.value === fnName);
            setPosition(st.position);
            setRerender(prevState => !prevState);
        }
    };

    const goToFunction = async (entry: HistoryEntry) => {
        rpcClient.getVisualizerRpcClient().addToHistory(entry);
    };

    const view = useMemo(() => {
        if (!mapperData) {
            return <div>DM Loading...</div>;
        }
        return (
            <DataMapperView
                fnST={syntaxTree as FunctionDefinition}
                filePath={filePath}
                langServerRpcClient={langServerRpcClient}
                libraryBrowserRpcClient={libraryBrowserRPCClient}
                applyModifications={applyModifications}
                goToFunction={goToFunction}
            />
        );
    }, [mapperData]);

    return view;
};
