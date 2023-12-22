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
import { BallerinaSTModifyResponse, STModification } from "@wso2-enterprise/ballerina-core";
import { useSyntaxTreeFromRange } from "./../Hooks"
import { FunctionDefinition, ModulePart, STKindChecker } from "@wso2-enterprise/syntax-tree";
import { URI } from "vscode-uri";


export function DataMapperOverlay() {
    const [rerender, setRerender] = useState(false);
    const { data, isFetching } = useSyntaxTreeFromRange(rerender);
    const { ballerinaRpcClient, viewLocation } = useVisualizerContext();
    const langServerRpcClient = ballerinaRpcClient.getLangServerRpcClient();
    const [mapperData, setMapperData] = useState<BallerinaSTModifyResponse>(data);

    useEffect(() => {
        if (!isFetching) {
            setMapperData(data);
        }
    }, [isFetching, data]);

    const syntaxTree = mapperData?.syntaxTree as FunctionDefinition;
    const fnName = syntaxTree?.functionName.value;

    const applyModifications = async (modifications: STModification[]) => {
        const langServerRPCClient = ballerinaRpcClient.getLangServerRpcClient();
        const visualizerRPCClient = ballerinaRpcClient.getVisualizerRpcClient();
        const filePath = viewLocation.location.fileName;
        const { parseSuccess, source: newSource, syntaxTree } = await visualizerRPCClient?.stModify({
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
            await visualizerRPCClient.updateVisualizerView({
                view: "DataMapper",
                location: {
                    fileName: filePath,
                    position: st.position
                }
            });
            setRerender(prevState => !prevState);
        }
    };

    const view = useMemo(() => {
        if (!mapperData || !viewLocation?.location) {
          return <div>DM Loading...</div>;
        }
        return (
            <DataMapperView
                fnST={syntaxTree as FunctionDefinition}
                filePath={viewLocation.location.fileName}
                langServerRpcClient={langServerRpcClient}
                applyModifications={applyModifications}
            />
        );
      }, [mapperData]);

    return view;
};
