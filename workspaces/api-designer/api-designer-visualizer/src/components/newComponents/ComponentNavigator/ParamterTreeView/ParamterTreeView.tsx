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
import { ParameterTreeViewItem } from '../ParameterTreeViewItem/ParameterTreeViewItem';
import { Views } from '../../../../constants';

interface ParameterViewItemProps {
    openAPI: OpenAPI;
    onParameterTreeViewChange: (openAPI: OpenAPI) => void;
}

export function ParameterTreeView(props: ParameterViewItemProps) {
    const { openAPI, onParameterTreeViewChange } = props;
    const { 
        props: { selectedComponentID },
        api: { onSelectedComponentIDChange, onCurrentViewChange }
    } = useContext(APIDesignerContext);

    const handleDeleteParameter = (schema: string) => {
        // rpcClient.showConfirmMessage({ message: `Are you sure you want to delete the Schema '${schema}'?`, buttonText: "Delete" }).then(res => {
        //     if (res) {
        //         const clonedSchemas = { ...openAPI.components?.schemas };
        //         delete clonedSchemas[schema];
        //         const updatedOpenAPIDefinition: OpenAPI = {
        //             ...openAPI,
        //             components: {
        //                 ...openAPI.components,
        //                 schemas: clonedSchemas
        //             }
        //         };
        //         onSchemaTreeViewChange(updatedOpenAPIDefinition);
        //         onSelectedComponentIDChange("overview");
        //     }
        // });
    };

    const handleAddParameter = (evt : React.MouseEvent) => {
        evt.stopPropagation();
        if (openAPI.components === undefined) {
            openAPI.components = {};
        }
        if (openAPI.components.parameters === undefined) {
            openAPI.components.parameters = {};
        }
        const newParameterName = Object.keys(openAPI.components.parameters).find((key) =>
            key.toLocaleLowerCase() === "parameter") ? `Parameter${Object.keys(openAPI.components.parameters).length + 1}` :
            "Parameter";
        openAPI.components.parameters[newParameterName] = {
            in: "query",
            name: "",
            required: false,
            schema: {
                type: "string"
            }
        };
        onParameterTreeViewChange(openAPI);
        onSelectedComponentIDChange(`parameters#-component#-${newParameterName}`);
        onCurrentViewChange(Views.EDIT);
    };

    const parameterArray = openAPI?.components?.parameters ? Object.keys(openAPI?.components?.parameters) : [];

    return (
        <TreeView
            sx={{ paddingBottom: 2 }}
            id="Paramters#-Components"
            content={
                <PathContainer>
                    <LeftPathContainer>
                        <Typography sx={{ margin: "0 0 0 2px", fontWeight: 300 }} variant="h4">Parameters</Typography>
                    </LeftPathContainer>
                    <RightPathContainerButtons className="buttons-container">
                        <Button tooltip="Add Parameter" appearance="icon" onClick={handleAddParameter}><Codicon name="plus" /></Button>
                    </RightPathContainerButtons>
                </PathContainer>
            }
            selectedId={selectedComponentID}
            onSelect={onSelectedComponentIDChange}
        >
            {parameterArray.map((parameterName: string) => {
                return (
                    <ParameterTreeViewItem
                        id={`parameters#-component#-${parameterName}`}
                        parameter={parameterName}
                        onDeleteParameter={handleDeleteParameter}
                    />
                );
            })}
        </TreeView>
    )
}
