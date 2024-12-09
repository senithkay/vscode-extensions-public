/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Button, Codicon, Typography } from '@wso2-enterprise/ui-toolkit';
import { LeftPathContainer, PathContainer, RightPathContainerButtons } from '../ComponentNavigator';
import { OpenAPI } from '../../../../Definitions/ServiceDefinitions';
import { TreeView } from '../../../Treeview/TreeView';
import { useContext } from 'react';
import { APIDesignerContext } from '../../../../NewAPIDesignerContext';
import { Views } from '../../../../constants';
import { useVisualizerContext } from '@wso2-enterprise/api-designer-rpc-client';
import { ResponseViewItem } from '../ResponsesViewItem/ResponsesViewItem';

interface ResponsesTreeViewProps {
    openAPI: OpenAPI;
    onResponseTreeViewChange: (openAPI: OpenAPI) => void;
}

export function ResponsesTreeView(props: ResponsesTreeViewProps) {
    const { openAPI, onResponseTreeViewChange } = props;
    const { rpcClient } = useVisualizerContext();
    const { 
        props: { selectedComponentID },
        api: { onSelectedComponentIDChange, onCurrentViewChange }
    } = useContext(APIDesignerContext);

    const handleDeleteResponse = (response: string) => {
        rpcClient.showConfirmMessage({ message: `Are you sure you want to delete the Response '${response}'?`, buttonText: "Delete" }).then(res => {
            if (res) {
                const clonedResponses = { ...openAPI.components?.responses };
                delete clonedResponses[response];
                const updatedOpenAPIDefinition: OpenAPI = {
                    ...openAPI,
                    components: {
                        ...openAPI.components,
                        responses: clonedResponses
                    }
                };
                onResponseTreeViewChange(updatedOpenAPIDefinition);
                onSelectedComponentIDChange("overview");
            }
        });
    };

    const handleAddResponse = (evt : React.MouseEvent) => {
        evt.stopPropagation();
        if (openAPI.components === undefined) {
            openAPI.components = {};
        }
        if (openAPI.components.parameters === undefined) {
            openAPI.components.parameters = {};
        }
        const newResponseName = Object.keys(openAPI.components.parameters).find((key) =>
            key.toLocaleLowerCase() === "response") ? `Response${Object.keys(openAPI.components.parameters).length + 1}` :
            "Response";
        openAPI.components.responses = {
            ...openAPI.components.responses,
            [newResponseName]: {
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
        onResponseTreeViewChange(openAPI);
        onSelectedComponentIDChange(`responses#-component#-${newResponseName}`);
        onCurrentViewChange(Views.EDIT);
    };

    const responseArray = openAPI?.components?.responses ? Object.keys(openAPI?.components?.responses) : [];

    return (
        <TreeView
            sx={{ paddingBottom: 2 }}
            id="Responses#-Components"
            content={
                <PathContainer>
                    <LeftPathContainer>
                        <Typography sx={{ margin: "0 0 0 2px", fontWeight: 300 }} variant="h4">Responses</Typography>
                    </LeftPathContainer>
                    <RightPathContainerButtons className="buttons-container">
                        <Button tooltip="Add Response" appearance="icon" onClick={handleAddResponse}><Codicon name="plus" /></Button>
                    </RightPathContainerButtons>
                </PathContainer>
            }
            selectedId={selectedComponentID}
            onSelect={onSelectedComponentIDChange}
        >
            {responseArray.map((requestBody: string) => {
                return (
                    <ResponseViewItem
                        id={`responses#-component#-${requestBody}`}
                        response={requestBody}
                        onDeleteResponse={handleDeleteResponse}
                    />
                );
            })}
        </TreeView>
    )
}
