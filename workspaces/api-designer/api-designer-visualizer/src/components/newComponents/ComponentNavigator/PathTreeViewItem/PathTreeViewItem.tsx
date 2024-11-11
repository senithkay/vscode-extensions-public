/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Button, Codicon, Tooltip, Typography } from '@wso2-enterprise/ui-toolkit';
import { TreeViewItem } from '../../../Treeview/TreeViewItem';
import { Operation, PathItemWrapper, RightPathContainerButtons } from '../ComponentNavigator';
import { OpenAPI } from '../../../../Definitions/ServiceDefinitions';
import { getBackgroundColorByMethod, getColorByMethod } from '../../../Utils/OpenAPIUtils';
import { useVisualizerContext } from '@wso2-enterprise/api-designer-rpc-client';

interface PathTreeViewItemProps {
    id: string;
    openAPI: OpenAPI;
    path: string;
    operation: string;
    selectedComponent: string;
    onPathTreeViewItemChange: (openAPI : OpenAPI) => void;
    onSelectedItemChange: (selectedItem: string) => void;
}

export function PathTreeViewItem(props: PathTreeViewItemProps) {
    const { id, openAPI, path, operation, selectedComponent, onPathTreeViewItemChange, onSelectedItemChange } = props;
    const { rpcClient } = useVisualizerContext();

    const handlePathTreeViewItemChange = (openAPI: OpenAPI) => {
        onPathTreeViewItemChange(openAPI);
    };
    const handleSelectedItemChange = (selectedItem: string) => {
        onSelectedItemChange(selectedItem);
    };
    const handleDeleteMethod = (e: React.MouseEvent, path: string, operation: string) => {
        e.stopPropagation();
        rpcClient.showConfirmMessage({ message: `Are you sure you want to delete the Operation '${operation}'?`, buttonText: "Delete" }).then(res => {
            if (res) {
                const { paths } = openAPI;
                const updatedPaths = { ...paths };
                delete updatedPaths[path][operation];
                handlePathTreeViewItemChange({ ...openAPI, paths: updatedPaths });
            }
        });
    };

    return (
        <div onClick={() => handleSelectedItemChange(`paths-component-${path}-${operation}`)}>
            <TreeViewItem id={id} selectedId={selectedComponent}>
                <PathItemWrapper>
                    <Tooltip>
                        <Operation
                            foreGroundColor={getColorByMethod(operation.toUpperCase())}
                            hoverForeGroundColor={getBackgroundColorByMethod(operation.toUpperCase())}
                        >
                            <Typography variant="h5" sx={{ margin: 0, padding: 4, display: "flex", justifyContent: "flex-start", width: 45, fontWeight: 300 }}>{operation.toUpperCase()}</Typography>
                        </Operation>
                    </Tooltip>
                    <RightPathContainerButtons className="buttons-container">
                        <Button tooltip="Delete Method" appearance="icon" onClick={(e) => handleDeleteMethod(e, path, operation)}><Codicon name="trash" /></Button>
                    </RightPathContainerButtons>
                </PathItemWrapper>
            </TreeViewItem>
        </div>
    )
}
