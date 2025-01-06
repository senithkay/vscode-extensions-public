/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { VisualizerLocation, ComponentModels, NodePosition } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { TypeDiagram as TypeDesignDiagram } from "@wso2-enterprise/type-diagram";
import { RecordEditor } from "../RecordEditor/RecordEditor";

interface TypeDiagramProps {
    selectedRecordId?: string;
}

export function TypeDiagram(props: TypeDiagramProps) {
    const { selectedRecordId } = props;
    const { rpcClient } = useRpcContext();
    const langRpcClient = rpcClient.getLangClientRpcClient();
    const commonRpcClient = rpcClient.getCommonRpcClient();
    const [visualizerLocation, setVisualizerLocation] = React.useState<VisualizerLocation>();
    const [isTypeCreatorOpen, setIsTypeCreatorOpen] = React.useState<boolean>(false);

    useEffect(() => {
        if (rpcClient) {
            rpcClient.getVisualizerLocation().then((value) => {
                setVisualizerLocation(value);
            });
        }
    }, [rpcClient]);


    const getComponentModel = async () => {
        if (!rpcClient || !visualizerLocation?.metadata?.recordFilePath) {
            return;
        }
        const response = await rpcClient.getBIDiagramRpcClient().getTypes({ filePath: visualizerLocation?.metadata?.recordFilePath });
        console.log(response);
        // -        rpcClient.getBIDiagramRpcClient().getTypes({ filePath: visualizerLocation?.metadata?.recordFilePath }).then((response: any) => {
        //     -            console.log(response);
        //     -            // @ts-ignore
        //     -            response.types.forEach((type) => {
        //     -                console.log(type);
        //     -                rpcClient.getBIDiagramRpcClient().getType({ filePath: type.codedata.lineRange.fileName, linePosition: type.codedata.lineRange.startLine }).then((typeResponse: any) => {
        //     -                    console.log(typeResponse);
        //     -                });
        //     -            });
        //     -        });
        // const response: ComponentModels = await langRpcClient.getPackageComponentModels({ documentUris: [visualizerLocation.metadata.recordFilePath] });
        return response.types;
    };

    const showProblemPanel = async () => {
        if (!rpcClient) {
            return;
        }
        await commonRpcClient.executeCommand({ commands: ['workbench.action.problems.focus'] });
    }

    const addNewType = async () => {
        setIsTypeCreatorOpen(true);
    }

    const goToSource = async (filePath: string, position: NodePosition) => {
        if (!rpcClient) {
            return;
        }
        rpcClient.getCommonRpcClient().goToSource({ filePath, position });

    };

    return (
        <>
            <TypeDesignDiagram
                getComponentModel={getComponentModel}
                selectedRecordId={selectedRecordId}
                showProblemPanel={showProblemPanel}
                addNewType={addNewType}
                goToSource={goToSource}
            />
            <RecordEditor
                isRecordEditorOpen={isTypeCreatorOpen}
                onClose={() => setIsTypeCreatorOpen(false)}
                rpcClient={rpcClient}
                width="400px"
                recordId={selectedRecordId}
            />
        </>
    );
}
