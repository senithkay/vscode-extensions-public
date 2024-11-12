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
import { PathTreeViewItem } from '../PathTreeViewItem/PathTreeViewItem';
import { useVisualizerContext } from '@wso2-enterprise/api-designer-rpc-client';
import { APIResources } from '../../../../constants';
import { useContext } from 'react';
import { APIDesignerContext } from '../../../../NewAPIDesignerContext';

interface PathTreeViewProps {
    id: string;
    openAPI: OpenAPI;
    path: string;
    operations: string[];
    onPathTreeViewChange: (openAPI: OpenAPI) => void;
}

export function PathTreeView(props: PathTreeViewProps) {
    const { id, openAPI, path, operations, onPathTreeViewChange } = props;
    const { rpcClient } = useVisualizerContext();
    const { 
        props: { selectedComponent },
        api: { onSelectedComponentChange }
    } = useContext(APIDesignerContext);

    const handlePathTreeViewChange = (openAPI: OpenAPI) => {
        onPathTreeViewChange(openAPI);
    };
    const handleDeletePath = (e: React.MouseEvent, path: string) => {
        e.stopPropagation();
        rpcClient.showConfirmMessage({ message: `Are you sure you want to delete the Path '${path}'?`, buttonText: "Delete" }).then(res => {
            if (res) {
                const { paths } = openAPI;
                const updatedPaths = { ...paths };
                delete updatedPaths[path];
                handlePathTreeViewChange({ ...openAPI, paths: updatedPaths });
            }
        });
    };
    const onPathRename = (newPath: string, oldPath: string) => {
        const { paths } = openAPI;
        const updatedPaths = { ...paths };
        updatedPaths[newPath] = updatedPaths[oldPath];
        delete updatedPaths[oldPath];
        handlePathTreeViewChange({ ...openAPI, paths: updatedPaths });
    };
    const onAddResources = (path: string, methods: string[]) => {
        const { paths } = openAPI;
        const updatedPaths = { ...paths };
        const currentPathItem = updatedPaths[path];
        // Add methods to the currentPathItem
        updatedPaths[path] = { ...currentPathItem, ...methods.reduce((acc, method) => ({ ...acc, [method]: {} }), {}) };
        handlePathTreeViewChange({ ...openAPI, paths: updatedPaths });
    };
    const modifyPathClick = (evt: React.MouseEvent, path: string, currentOperations: string[]) => {
        evt.stopPropagation();
        rpcClient.selectQuickPickItem({
            title: `Select an option`, items: [
                { label: "Edit Route path", detail: `Edit the route '${path}'` },
                { label: "Select Methods", detail: `Select the methods belonging to the path '${path}'` }
            ]
        }).then(res => {
            if (res.label === "Edit Route path") {
                rpcClient.showInputBox({ title: "Edit Route path", value: path }).then(newPath => {
                    if (onPathRename && newPath) {
                        onPathRename(newPath, path)
                    }
                })
            } else if (res.label === "Select Methods") {
                rpcClient.selectQuickPickItems({
                    title: "Select the methods of the path", items: APIResources.map(method => ({
                        label: method,
                        picked: currentOperations.includes(method)
                    }))
                }).then(methodSelection => {
                    if (!methodSelection || methodSelection.length < 1) {
                        rpcClient.showErrorNotification("Need to select at least one method for the path")
                    } else {
                        onAddResources(path, methodSelection.map(item => item.label))
                    }
                })
            }
        })
    };

    return (
        <TreeView
            id={id}
            content={
                <PathContainer>
                    <LeftPathContainer>
                        <Typography
                            sx={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                margin: "0 0 0 2px",
                                fontWeight: 300
                            }} variant="h4">
                            {path}
                        </Typography>
                    </LeftPathContainer>

                    <RightPathContainerButtons className="buttons-container">
                        <Button tooltip="Modify Path" appearance="icon" onClick={(e) => modifyPathClick(e, String(path), operations)}><Codicon name="gear" /></Button>
                        <Button tooltip="Delete Path" appearance="icon" onClick={(e) => handleDeletePath(e, String(path))}><Codicon name="trash" /></Button>
                    </RightPathContainerButtons>
                </PathContainer>
            }
            selectedId={selectedComponent}
            onSelect={(id) => onSelectedComponentChange(id)}
        >
            {operations?.map((operation) => {
                return (
                    <PathTreeViewItem
                        id={`paths-component-${path}-${operation}`}
                        openAPI={openAPI}
                        path={path}
                        operation={operation}
                        onPathTreeViewItemChange={handlePathTreeViewChange}
                    />
                );
            })}
        </TreeView>
    )
}
