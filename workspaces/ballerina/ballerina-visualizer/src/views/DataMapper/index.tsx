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
import { SyntaxTreeResponse, STModification, VisualizerLocation } from "@wso2-enterprise/ballerina-core";
import { useSyntaxTreeFromRange } from "../../Hooks";
import { FunctionDefinition, ModulePart, STKindChecker } from "@wso2-enterprise/syntax-tree";
import { URI } from "vscode-uri";

export function DataMapper() {
    const [rerender, setRerender] = useState(false);
    const { data, isFetching } = useSyntaxTreeFromRange(rerender);
    const { rpcClient } = useVisualizerContext();
    const langServerRpcClient = rpcClient.getLangServerRpcClient();
    const libraryBrowserRPCClient = rpcClient.getLibraryBrowserRPCClient();
    const [mapperData, setMapperData] = useState<SyntaxTreeResponse>(data);

    const [context, setContext] = React.useState<VisualizerLocation>();

    useEffect(() => {
        if (rpcClient) {
            rpcClient.getVisualizerContext().then((value) => {
                setContext(value);
            });
        }
    }, [rpcClient]);
    
    useEffect(() => {
        if (!isFetching) {
            setMapperData(data);
        }
    }, [isFetching, data]);

    const syntaxTree = mapperData?.syntaxTree as FunctionDefinition;
    const fnName = syntaxTree?.functionName.value;

    const applyModifications = async (modifications: STModification[]) => {
        const langServerRPCClient = rpcClient.getLangServerRpcClient();
        const visualizerRPCClient = rpcClient.getVisualizerRpcClient();
        const filePath = context.documentUri;
        const { parseSuccess, source: newSource, syntaxTree } = await langServerRPCClient?.stModify({
            astModifications: modifications,
            documentIdentifier: {
                uri: URI.file(filePath).toString()
            }
        });
        if (parseSuccess) {
            // TODO: Handle this in extension specific code
            await langServerRPCClient.updateFileContent({
                content: newSource,
                fileUri: filePath
            });

            const modPart = syntaxTree as ModulePart;
            const fns = modPart.members.filter((mem) =>
                STKindChecker.isFunctionDefinition(mem)
            ) as FunctionDefinition[];
            const st = fns.find((mem) => mem.functionName.value === fnName);
            await visualizerRPCClient.openView({
                view: "DataMapper",
                documentUri: filePath,
                position: st.position
            });
            setRerender(prevState => !prevState);
        }
    };

    const view = useMemo(() => {
        if (!mapperData || context.documentUri) {
            return <div>DM Loading...</div>;
        }
        return (
            <DataMapperView
                fnST={syntaxTree as FunctionDefinition}
                filePath={context.documentUri}
                langServerRpcClient={langServerRpcClient}
                libraryBrowserRpcClient={libraryBrowserRPCClient}
                applyModifications={applyModifications}
            />
        );
    }, [mapperData]);

    return view;
};
