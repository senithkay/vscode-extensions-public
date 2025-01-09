/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { VisualizerLocation, NodePosition, Type } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { TypeDiagram as TypeDesignDiagram } from "@wso2-enterprise/type-diagram";
import { RecordEditor } from "../RecordEditor/RecordEditor";

interface TypeDiagramProps {
    selectedTypeId?: string;
}

export function TypeDiagram(props: TypeDiagramProps) {
    const [selectedTypeId, setSelectedTypeId] = React.useState<string | undefined>(props.selectedTypeId);
    const { rpcClient } = useRpcContext();
    const commonRpcClient = rpcClient.getCommonRpcClient();
    const [visualizerLocation, setVisualizerLocation] = React.useState<VisualizerLocation>();
    const [isTypeCreatorOpen, setIsTypeCreatorOpen] = React.useState<boolean>(false);
    const [typesModel, setTypesModel] = React.useState<Type[]>(undefined);

    useEffect(() => {
        if (rpcClient) {
            rpcClient.getVisualizerLocation().then((value) => {
                setVisualizerLocation(value);
            });
        }
    }, [rpcClient]);

    useEffect(() => {
        getComponentModel();
    }, [visualizerLocation]);


    const getComponentModel = async () => {
        if (!rpcClient || !visualizerLocation?.metadata?.recordFilePath) {
            return;
        }
        const response = await rpcClient.getBIDiagramRpcClient().getTypes({ filePath: visualizerLocation?.metadata?.recordFilePath });
        setTypesModel(response.types);
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
        // return response.types;
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

    const onTypeSelected = (typeId: string) => {
        console.log(typeId);
        setSelectedTypeId(typeId);
    }

    const onTypeEditorClosed = () => {
        setSelectedTypeId(undefined);
    }

    return (
        <>
            <TypeDesignDiagram
                typeModel={typesModel}
                selectedRecordId={selectedTypeId}
                showProblemPanel={showProblemPanel}
                addNewType={addNewType}
                goToSource={goToSource}
                onTypeSelected={onTypeSelected}
            />
            <RecordEditor
                isRecordEditorOpen={!!selectedTypeId}
                onClose={onTypeEditorClosed}
                rpcClient={rpcClient}
                width="400px"
                recordId={selectedTypeId}
            />
        </>
    );
}
