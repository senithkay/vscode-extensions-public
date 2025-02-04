/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { GraphqlDesignServiceParams, GraphqlDesignService, VisualizerLocation, Type, NodePosition, GetGraphqlTypeResponse, GetGraphqlTypeRequest } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { GraphqlDesignDiagram } from "@wso2-enterprise/ballerina-graphql-design-diagram";
import { TypeDiagram as TypeDesignDiagram } from "@wso2-enterprise/type-diagram";
import { ProgressRing, ThemeColors, View, ViewContent } from "@wso2-enterprise/ui-toolkit";
import { Colors } from "../../resources/constants";
import styled from "@emotion/styled";
import { GraphqlServiceEditor } from "./GraphqlServiceEditor";
import { TypeEditor } from "@wso2-enterprise/type-editor";
import { PanelContainer } from "@wso2-enterprise/ballerina-side-panel";

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

const Title: React.FC<any> = styled.div`
    color: ${ThemeColors.ON_SURFACE};
`;


interface GraphQLDiagramProps {
    filePath: string;
    position: NodePosition;
}

export function GraphQLDiagram(props: GraphQLDiagramProps) {
    const { filePath, position } = props;
    const { rpcClient } = useRpcContext();
    // const [visualizerLocation, setVisualizerLocation] = useState<VisualizerLocation>();
    // const [graphqlModdel, setGraphqlModel] = useState<GraphqlDesignService>();
    const [graphqlTypeModel, setGraphqlTypeModel] = useState<GetGraphqlTypeResponse>();
    const [isServiceEditorOpen, setIsServiceEditorOpen] = useState<boolean>(false);
    const [isTypeEditorOpen, setIsTypeEditorOpen] = useState(false);
    const [editingType, setEditingType] = useState<Type>();

    // useEffect(() => {
    //     if (rpcClient) {
    //         rpcClient.getVisualizerLocation().then((value) => {
    //             setVisualizerLocation(value);
    //         });
    //     }
    // }, [rpcClient]);

    useEffect(() => {
        getGraphqlDesignModel();
    }, [position]);

    const getGraphqlDesignModel = async () => {
        if (!rpcClient) {
            return;
        }
        // const request: GraphqlDesignServiceParams = {
        //     filePath: visualizerLocation?.documentUri,
        //     startLine: { line: visualizerLocation?.position?.startLine, offset: visualizerLocation?.position?.startColumn },
        //     endLine: { line: visualizerLocation?.position?.endLine, offset: visualizerLocation?.position?.endColumn }
        // }

        // const response: GraphqlDesignService = await rpcClient.getGraphqlDesignerRpcClient().getGraphqlModel(request);

        const typeModelRequest: GetGraphqlTypeRequest = {
            filePath: filePath,
            linePosition: { line: position?.startLine, offset: position?.startColumn }

        }

        if (typeModelRequest.filePath) {
            const newGraphqlTypeModel: GetGraphqlTypeResponse = await rpcClient.getGraphqlDesignerRpcClient().getGraphqlTypeModel(typeModelRequest);
            console.log(">>> Graphql Type Model", newGraphqlTypeModel);
            setGraphqlTypeModel(newGraphqlTypeModel);
        }

        // setGraphqlModel(response);
    };

    // const goToSource = (filePath: string, position: any) => {
    //     rpcClient.getCommonRpcClient().goToSource({  position, filePath });
    // }

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

    const onTypeEdit = async (typeId: string, isGraphqlRoot?: boolean) => {
        if (isGraphqlRoot) {
            setIsServiceEditorOpen(true);
            return;
        }

        // find the type by checking the references of graphqlTypeModel
        const type = graphqlTypeModel?.refs.find((type) => type.name === typeId);
        if (type) {
            setEditingType(type);
            setIsTypeEditorOpen(true);
        } else {
            console.error("Type not found");
        }
    }

    const onTypeChange = async (type: Type) => {
        setIsTypeEditorOpen(false);
        setEditingType(undefined);
    }

    const onTypeEditorClosed = () => {
        setIsTypeEditorOpen(false);
        setEditingType(undefined);
    }


    return (
        <>
            <View>
                <HeaderContainer>
                    <Title>GraphQL Diagram</Title>
                </HeaderContainer>
                <ViewContent>
                    {graphqlTypeModel ? (
                        <TypeDesignDiagram
                            typeModel={graphqlTypeModel.refs}
                            rootService={graphqlTypeModel.type}
                            isGraphql={true}
                            goToSource={handleOnGoToSource}
                            onTypeEdit={onTypeEdit}
                        />
                    ) : (
                        <ProgressRing color={Colors.PRIMARY} />
                    )}
                </ViewContent>
            </View>
            {isServiceEditorOpen &&
                <GraphqlServiceEditor
                    filePath={filePath}
                    lineRange={
                        {
                            startLine: {
                                line: position?.startLine,
                                offset: position?.startColumn
                            },
                            endLine: {
                                line: position?.endLine,
                                offset: position?.endColumn
                            }
                        }
                    }
                    onClose={() => setIsServiceEditorOpen(false)}
                />
            }
            {isTypeEditorOpen && editingType && (
                <PanelContainer title={`Edit Type`} show={true} onClose={onTypeEditorClosed}>
                    <TypeEditor
                        type={editingType}
                        rpcClient={rpcClient}
                        onTypeChange={onTypeChange}
                        newType={false}
                        isGraphql={true}
                    />
                </PanelContainer>
            )}
        </>
        // <>
        //     {visualizerLocation &&
        //         <GraphqlDesignDiagram
        //             graphqlModelResponse={graphqlModdel}
        //             filePath={visualizerLocation?.documentUri}
        //             goToSource={goToSource}
        //         />
        //     }
        // </>
    );
}
