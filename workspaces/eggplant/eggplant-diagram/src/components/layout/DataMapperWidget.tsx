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
import { useVisualizerContext } from "@wso2-enterprise/eggplant-rpc-client";
import { BallerinaSTModifyResponse, STModification } from "@wso2-enterprise/ballerina-core";
import { useSyntaxTreeFromRange } from "../../hooks/LangServer";
import { FunctionDefinition, ModulePart, NodePosition, STKindChecker } from "@wso2-enterprise/syntax-tree";
import { URI } from "vscode-uri";
import { css, Global } from '@emotion/react';

interface DataMapperWidgetProps {
    filePath: string;
    fnLocation: NodePosition;
    onFnChange: (position: NodePosition) => void;
}

const globalStyles = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`;

export function DataMapperWidget(props: DataMapperWidgetProps) {
    const { filePath, fnLocation, onFnChange } = props;
    const [rerender, setRerender] = useState(false);
    const { data, isFetching } = useSyntaxTreeFromRange(fnLocation , filePath, rerender);
    const { eggplantRpcClient, viewLocation } = useVisualizerContext();
    const langServerRpcClient = eggplantRpcClient.getLangServerRpcClient();
    const libraryBrowserRpcClient = eggplantRpcClient.getLibraryBrowserRpcClient();
    const [mapperData, setMapperData] = useState<BallerinaSTModifyResponse>(data);
    const [filePosition, setFilePosition] = useState<NodePosition>(null);

    useEffect(() => {
        if (!isFetching) {
            setMapperData(data);
        }
    }, [isFetching, data]);

    const syntaxTree = mapperData?.syntaxTree as FunctionDefinition;
    const fnName = syntaxTree?.functionName.value;

    const applyModifications = async (modifications: STModification[]) => {
        const { parseSuccess, source: newSource, syntaxTree } = await langServerRpcClient?.stModify({
            astModifications: modifications,
            documentIdentifier: {
                uri: URI.file(filePath).toString()
            }
        });
        if (parseSuccess) {
            await langServerRpcClient.updateFileContent({
                content: newSource,
                fileUri: filePath
            });

            const modPart = syntaxTree as ModulePart;
            const fns = modPart.members.filter((mem) =>
                STKindChecker.isFunctionDefinition(mem)
            ) as FunctionDefinition[];
            const newFnST = fns.find((mem) => mem.functionName.value === fnName);
            onFnChange(newFnST.position);
            setFilePosition(syntaxTree.position);
            setRerender(prevState => !prevState);
        }
    };

    const closeDataMapper = () => {
        if (filePosition) {
            eggplantRpcClient.getWebviewRpcClient().openVisualizerView({  
                position: {
                    startLine: filePosition.startLine ?? 0,
                    startColumn: filePosition.startColumn ?? 0,
                    endLine: filePosition.endLine ?? 0,
                    endColumn: filePosition.endColumn ?? 0
                }
            });
        }
        onFnChange(null);
    };

    const view = useMemo(() => {
        if (!mapperData) {
          return <div>DM Loading...</div>;
        }
        return (
            <>
                <Global styles={globalStyles} />
                <DataMapperView
                    fnST={syntaxTree}
                    filePath={filePath}
                    langServerRpcClient={langServerRpcClient}
                    libraryBrowserRpcClient={libraryBrowserRpcClient}
                    applyModifications={applyModifications}
                    onClose={closeDataMapper}
                />
            </>
        );
      }, [mapperData]);

    return view;
};
