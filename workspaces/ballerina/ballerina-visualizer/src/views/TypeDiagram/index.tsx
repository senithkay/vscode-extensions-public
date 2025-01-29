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
import { PanelContainer } from "@wso2-enterprise/ballerina-side-panel";
import { TypeEditor } from "@wso2-enterprise/type-editor";
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
    const [focusedNodeId, setFocusedNodeId] = React.useState<string | undefined>(undefined);

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

    rpcClient?.onProjectContentUpdated((state: boolean) => {
        if (state) {
            getComponentModel();
        }
    });

    useEffect(() => {
        setFocusedNodeId(undefined);
    }, [selectedTypeId]);


    const getComponentModel = async () => {
        if (!rpcClient || !visualizerLocation?.metadata?.recordFilePath) {
            return;
        }
        const response = await rpcClient.getBIDiagramRpcClient().getTypes({ filePath: visualizerLocation?.metadata?.recordFilePath });
        setTypesModel(response.types);
        console.log(response);
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

    const handleOnGoToSource = (node: Type) => {
        if (!rpcClient || !node.codedata.lineRange) {
            return;
        }
        const targetPosition: NodePosition = {
            startLine: node.codedata.lineRange?.startLine?.line,
            startColumn: node.codedata.lineRange?.startLine?.offset,
            endLine: node.codedata.lineRange?.endLine?.line,
            endColumn: node.codedata.lineRange?.endLine?.offset,
        };
        rpcClient.getCommonRpcClient().goToSource({ position: targetPosition });
    };

    const onTypeEdit = (typeId: string) => {
        console.log(typeId);
        setEditingTypeId(typeId);
    }

    const onTypeEditorClosed = () => {
        setEditingTypeId(undefined);
        setIsTypeCreatorOpen(false);
    }

    const onSwitchToTypeDiagram = () => {
        setFocusedNodeId(undefined);
    }

    const onFocusedNodeIdChange = (typeId: string) => {
        setFocusedNodeId(typeId);
        // if a type is already selected, then we need to update selected type
        if (selectedTypeId) {
            setEditingTypeId(typeId);
        }
    }

    const Header = () => (
        <HeaderContainer>
            {focusedNodeId ? (<Title>Focused Type View : {focusedNodeId}</Title>) : (<Title>Type Diagram</Title>)}
            {focusedNodeId ? (
                <Button
                    appearance="primary"
                    onClick={onSwitchToTypeDiagram}
                    tooltip="Switch to complete Type Diagram"
                >
                    <Codicon name="discard" sx={{ marginRight: 5 }} /> Switch to Type Diagram
                </Button>
            )
                :
                <Button
                    appearance="primary"
                    onClick={addNewType}
                    tooltip="Add New Type"
                >
                    <Codicon name="add" sx={{ marginRight: 5 }} /> Add Type
                </Button>
            }
        </HeaderContainer>
    );

    const findSelectedType = (typeId: string): Type => {
        if (!typeId) {
            return {
                name: "MyType",
                editable: true,
                metadata: {
                    label: "",
                    description: ""
                },
                codedata: {
                    lineRange: undefined,
                    node: "RECORD"
                },
                properties: {},
                members: {},
                includes: [] as string[]
            };
        }
        return typesModel.find((type: Type) => type.name === typeId);
    }

    const onTypeChange = async (type: Type) => {
        const name = type.name;
        const response = await rpcClient.getBIDiagramRpcClient().updateType({ filePath: visualizerLocation?.metadata?.recordFilePath, type, description: "" });
        setEditingTypeId(undefined);
    }

    return (
        <>
            <View>
                <Header />
                <ViewContent>
                    {typesModel ? (
                        <TypeDesignDiagram
                            typeModel={typesModel}
                            selectedNodeId={selectedTypeId}
                            focusedNodeId={focusedNodeId}
                            updateFocusedNodeId={onFocusedNodeIdChange}
                            showProblemPanel={showProblemPanel}
                            goToSource={handleOnGoToSource}
                            onTypeEdit={onTypeEdit}
                        />
                    ) : (
                        <ProgressRing color={Colors.PRIMARY} />
                    )}
                </ViewContent>
            </View>
            {/* Panel for editing and creating types */}
            {(editingTypeId || isTypeCreatorOpen) && (
                <PanelContainer title={editingTypeId ? `Edit Type` : "New Type"} show={true} onClose={onTypeEditorClosed}>
                    <TypeEditor type={findSelectedType(editingTypeId)} newType={editingTypeId ? false : true} rpcClient={rpcClient} onTypeChange={onTypeChange} />
                </PanelContainer>
            )}
        </>
    );
}
