/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Button, Codicon, TreeView, Typography } from '@wso2-enterprise/ui-toolkit';
import { LeftPathContainer, PathContainer, RightPathContainerButtons } from '../ComponentNavigator';
import { OpenAPI } from '../../../../Definitions/ServiceDefinitions';
import { useContext } from 'react';
import { APIDesignerContext } from '../../../../NewAPIDesignerContext';
import { Views } from '../../../../constants';
import { useVisualizerContext } from '@wso2-enterprise/api-designer-rpc-client';
import { RequestBodyTreeViewItem } from '../RequestBodyTreeViewItem/RequestBodyTreeViewItem';

interface RequestBodyTreeViewProps {
    openAPI: OpenAPI;
    onRequestBodyTreeViewChange: (openAPI: OpenAPI) => void;
}

export function RequestBodyTreeView(props: RequestBodyTreeViewProps) {
    const { openAPI, onRequestBodyTreeViewChange } = props;
    const { rpcClient } = useVisualizerContext();
    const { 
        props: { selectedComponentID },
        api: { onSelectedComponentIDChange, onCurrentViewChange }
    } = useContext(APIDesignerContext);

    const handleDeleteRequestBody = (requestBody: string) => {
        rpcClient.showConfirmMessage({ message: `Are you sure you want to delete the Request Body '${requestBody}'?`, buttonText: "Delete" }).then(res => {
            if (res) {
                const clonedRequestBodies = { ...openAPI.components?.requestBodies };
                delete clonedRequestBodies[requestBody];
                const updatedOpenAPIDefinition: OpenAPI = {
                    ...openAPI,
                    components: {
                        ...openAPI.components,
                        requestBodies: clonedRequestBodies
                    }
                };
                onRequestBodyTreeViewChange(updatedOpenAPIDefinition);
                onSelectedComponentIDChange("overview");
            }
        });
    };

    const handleAddRequestBody = (evt : React.MouseEvent) => {
        evt.stopPropagation();
        if (openAPI.components === undefined) {
            openAPI.components = {};
        }
        if (openAPI.components.parameters === undefined) {
            openAPI.components.parameters = {};
        }
        const newRequestBodyName = Object.keys(openAPI.components.parameters).find((key) =>
            key.toLocaleLowerCase() === "requestbody") ? `RequestBody${Object.keys(openAPI.components.parameters).length + 1}` :
            "RequestBody";
        openAPI.components.requestBodies = {
            ...openAPI.components.requestBodies,
            [newRequestBodyName]: {
                description: "",
                content: {
                    "application/json": {
                        schema: {
                            type: "object"
                        }
                    }
                }
            }
        };
        onRequestBodyTreeViewChange(openAPI);
        onSelectedComponentIDChange(`requestBody#-component#-${newRequestBodyName}`);
        onCurrentViewChange(Views.EDIT);
    };

    const requestBodyArray = openAPI?.components?.requestBodies ? Object.keys(openAPI?.components?.requestBodies) : [];

    return (
        <TreeView
            sx={{ paddingBottom: 2 }}
            id="RequestBody#-Components"
            content={
                <PathContainer>
                    <LeftPathContainer>
                        <Typography 
                            sx={{ 
                                margin: "0 0 0 2px",
                                fontWeight: 300,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            }}
                            variant="h4"
                        >
                            Request Bodies
                        </Typography>
                    </LeftPathContainer>
                    <RightPathContainerButtons className="buttons-container">
                        <Button tooltip="Add Request Body" appearance="icon" onClick={handleAddRequestBody}><Codicon name="plus" /></Button>
                    </RightPathContainerButtons>
                </PathContainer>
            }
            selectedId={selectedComponentID}
            onSelect={onSelectedComponentIDChange}
        >
            {requestBodyArray.map((requestBody: string) => {
                return (
                    <RequestBodyTreeViewItem
                        id={`requestBody#-component#-${requestBody}`}
                        requestBody={requestBody}
                        onDeleteRequestBody={handleDeleteRequestBody}
                    />
                );
            })}
        </TreeView>
    )
}
