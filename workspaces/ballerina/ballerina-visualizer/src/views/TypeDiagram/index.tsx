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
import { Button, Codicon, ProgressRing, ThemeColors, View, ViewContent } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { Colors } from "../../resources/constants";

const HeaderContainer = styled.div`
    align-items: center;
    color: ${ThemeColors.ON_SURFACE};
    display: flex;
    flex-direction: row;
    font-family: GilmerBold;
    font-size: 16px;
    height: 50px;
    justify-content: space-between;
    min-width: 350px;
    padding-inline: 10px;
    width: calc(100vw - 20px);
`;

export const Title: React.FC<any> = styled.div`
    color: ${ThemeColors.ON_SURFACE};
`;

interface TypeDiagramProps {
    selectedTypeId?: string;
}

export function TypeDiagram(props: TypeDiagramProps) {
    const { selectedTypeId } = props;
    const { rpcClient } = useRpcContext();
    const commonRpcClient = rpcClient.getCommonRpcClient();
    const [visualizerLocation, setVisualizerLocation] = React.useState<VisualizerLocation>();
    const [isTypeCreatorOpen, setIsTypeCreatorOpen] = React.useState<boolean>(false);
    const [typesModel, setTypesModel] = React.useState<Type[]>(undefined);
    const [editingTypeId, setEditingTypeId] = React.useState<string | undefined>(undefined);

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

    const onTypeEdit = (typeId: string) => {
        console.log(typeId);
        setEditingTypeId(typeId);
    }

    const onTypeEditorClosed = () => {
        setEditingTypeId(undefined);
    }

    const Header = () => (
        <HeaderContainer>
            <Title>Type Diagram</Title>
            <Button
                appearance="primary"
                onClick={addNewType}
                tooltip="Add New Type"
            >
                <Codicon name="add" sx={{ marginRight: 5 }} /> Add Type
            </Button>
        </HeaderContainer>
    );

    return (
        <>
            <View>
                <Header />
                <ViewContent>
                    {typesModel ? (
                        <TypeDesignDiagram
                            typeModel={typesModel}
                            selectedRecordId={selectedTypeId}
                            showProblemPanel={showProblemPanel}
                            goToSource={goToSource}
                            onTypeEdit={onTypeEdit}
                        />
                    ) : (
                        <ProgressRing color={Colors.PRIMARY} />
                    )}
                </ViewContent>
            </View>
            <RecordEditor
                isRecordEditorOpen={!!editingTypeId}
                onClose={onTypeEditorClosed}
                rpcClient={rpcClient}
                width="400px"
                recordId={editingTypeId}
            />
        </>
    );
}
