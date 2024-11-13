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
import { OpenAPI, Paths } from '../../../../Definitions/ServiceDefinitions';
import { TreeView } from '../../../Treeview/TreeView';
import { PathTreeView } from '../PathTreeView/PathTreeView';
import { useContext } from 'react';
import { APIDesignerContext } from '../../../../NewAPIDesignerContext';
import { Views } from '../../../../constants';

interface PathsTreeViewProps {
    openAPI: OpenAPI;
    paths: Paths;
    onPathTreeViewChange: (openAPI: OpenAPI) => void;
}

export function PathsTreeView(props: PathsTreeViewProps) {
    const { openAPI, paths, onPathTreeViewChange } = props;
    const { 
        props: { selectedComponent },
        api: { onSelectedComponentChange, onPathInitiatedChange, onCurrentViewChange }
    } = useContext(APIDesignerContext);

    const handleAddPathMethod = (evt: React.MouseEvent) => {
        evt.stopPropagation();
        const newPathVal = Object.keys(openAPI.paths).find((key) => key === "/path") ? `/path${Object.keys(openAPI.paths).length + 1}` : "/path";
        openAPI.paths[newPathVal] = {
            get: {
                parameters: [],
                responses: {
                    200: {
                        description: "Successful response",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "string",
                                }
                            }
                        }
                    }
                }
            }
        };
        onPathTreeViewChange(openAPI);
        onPathInitiatedChange(true);
        onCurrentViewChange(Views.EDIT);
        onSelectedComponentChange(`paths-component-${newPathVal}`);
    };

    let pathsArray: string[] = [];
    let pathItems: any[] = [];
    if (paths) {
        Object.entries(paths).forEach(([key, value]) => {
            if (typeof value === "object" && value !== null && key !== "servers" && key !== "parameters" && key !== "description" && key !== "summary") {
                pathsArray.push(key);
                pathItems.push(value);
            }
        });
    } else {
        console.warn("Paths object is null or undefined");
    }

    return (
        <TreeView
            rootTreeView
            id="Paths-Resources"
            content={
                <PathContainer>
                    <LeftPathContainer>
                        <Typography sx={{ margin: "0 0 0 2px", fontWeight: 300 }} variant="h4">Paths</Typography>
                    </LeftPathContainer>
                    <RightPathContainerButtons className="buttons-container">
                        <Button tooltip="Add Path" appearance="icon" onClick={handleAddPathMethod}><Codicon name="plus" /></Button>
                    </RightPathContainerButtons>
                </PathContainer>
            }
            selectedId={selectedComponent}
            onSelect={() => onSelectedComponentChange("Paths-Resources")}
        >
            {
                pathsArray.map((path, index) => {
                    const pathItem = pathItems[index];
                    const operations = pathItem && Object.keys(pathItem);
                    const sanitizedOperations = operations?.filter((operation) => operation !== "description" && operation !== "summary" && operation !== "parameters" && operation !== "servers");
                    return (
                        <PathTreeView
                            id={`paths-component-${path}`}
                            openAPI={openAPI}
                            path={path}
                            operations={sanitizedOperations}
                            onPathTreeViewChange={onPathTreeViewChange}
                        />
                    );
                }
                )
            }
        </TreeView>
    )
}
