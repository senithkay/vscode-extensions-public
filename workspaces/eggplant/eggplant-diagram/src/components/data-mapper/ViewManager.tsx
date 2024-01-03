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
import { useSyntaxTreeFromRange } from "./../../Hooks"
import { FunctionDefinition, ModulePart, NodePosition, STKindChecker } from "@wso2-enterprise/syntax-tree";
import { URI } from "vscode-uri";
import { css, Global } from '@emotion/react';

interface DataMapperViewManagerProps {
    filePath: string;
    fnLocation: NodePosition;
    onClose: () => void;
}

const globalStyles = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`;

export function DataMapperViewManager(props: DataMapperViewManagerProps) {
    const { filePath, fnLocation, onClose } = props;
    const [rerender, setRerender] = useState(false);
    const { data, isFetching } = useSyntaxTreeFromRange(fnLocation , filePath, rerender);
    const { eggplantRpcClient, viewLocation } = useVisualizerContext();
    const langServerRpcClient = eggplantRpcClient.getLangServerRpcClient();
    const [mapperData, setMapperData] = useState<BallerinaSTModifyResponse>(data);

    useEffect(() => {
        if (!isFetching) {
            setMapperData(data);
        }
    }, [isFetching, data]);

    const syntaxTree = mapperData?.syntaxTree as FunctionDefinition;
    const fnName = syntaxTree?.functionName.value;

    const applyModifications = async (modifications: STModification[]) => {
        const filePath = viewLocation.location.fileName;
        const { parseSuccess, source: newSource, syntaxTree } = await langServerRpcClient?.stModify({
            astModifications: modifications,
            documentIdentifier: {
                uri: URI.file(filePath).toString()
            }
        });
        if (parseSuccess) {
            // TODO: Handle this in extension specific code
            await langServerRpcClient.updateFileContent({
                content: newSource,
                fileUri: filePath
            });

            const modPart = syntaxTree as ModulePart;
            const fns = modPart.members.filter((mem) =>
                STKindChecker.isFunctionDefinition(mem)
            ) as FunctionDefinition[];
            const st = fns.find((mem) => mem.functionName.value === fnName);
            // TODO: Update the state machine
            setRerender(prevState => !prevState);
        }
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
                    filePath={"/Users/madusha/temp1124/sample1215/main.bal"}
                    langServerRpcClient={langServerRpcClient}
                    applyModifications={applyModifications}
                    onClose={onClose}
                />
            </>
        );
      }, [mapperData]);

    return view;
};
