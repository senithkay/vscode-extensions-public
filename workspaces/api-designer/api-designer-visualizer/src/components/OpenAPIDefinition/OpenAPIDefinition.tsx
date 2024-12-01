/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { useContext } from "react";
import { OpenAPI, Operation, Parameter, PathItem, Paths, ReferenceObject } from "../../Definitions/ServiceDefinitions";
import styled from "@emotion/styled";
import { PathsNavigator } from "../PathsNavigator/PathsNavigator";
import * as yup from "yup";
import { Overview } from "../Overview/Overview";
import { getMethodFromResourceID, getOperationFromOpenAPI, getPathFromResourceID, getResourceID } from "../Utils/OpenAPIUtils";
import { Resource } from "../Resource/Resource";
import { SplitView } from "../SplitView/SplitView";
import { ReadOnlyResource } from "../Resource/ReadOnlyResource";
import { ReadOnlyOverview } from "../Overview/ReadOnlyOverview";
import { Tabs } from "../Tabs/Tabs";
import { useVisualizerContext } from "@wso2-enterprise/api-designer-rpc-client";
import { PathItem as PI } from "../PathItem/PathItem";
import { ReadOnlyPathItem } from "../PathItem/ReadOnlyPathItem";
import { Schema, SchemaEditor } from "../SchemaEditor/SchemaEditor";
import { ReadOnlySchemaEditor } from "../SchemaEditor/ReadOnlySchemaEditor";
import { Codicon, Button, Typography } from "@wso2-enterprise/ui-toolkit";
import { APIDesignerContext } from "../../APIDesignerContext";
import { Views } from "../../constants";

const NavigationContainer = styled.div`
    display: flex;
    justify-content: center;
    padding: 15px 10px 0px 10px;
`;

const TitleWrapper = styled.div`
    display: flex;
    flex-direction: row;
    padding: 16px;
    border-bottom: 1px solid var(--vscode-panel-border);
    font: inherit;
    font-weight: bold;
    color: var(--vscode-editor-foreground);
`;

const ServiceDesignerWrapper = styled.div`
    padding: 0 10px;
`;

const ButtonWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    flex-grow: 1;
`;

const schema = yup.object({
    title: yup.string(),
    version: yup.string(),
    selectedPathID: yup.string()
});

const NavigationPanelContainer = styled.div`
    padding: 10px;
`;

export function OpenAPIDefinition() {
    const { rpcClient } = useVisualizerContext();
    const {
        props: { 
            openAPIVersion,
            openAPI,
            isNewFile,
            selectedComponent,
            currentView
        },
        api: {
            onOpenAPIDefinitionChange,
            onCurrentViewChange,
            onSelectedComponentChange
        }
    } = useContext(APIDesignerContext);

    const handlePathClick = (pathID: string) => {
        if (pathID?.includes("Schemas-Components")) {
            const firstSchemaName = openAPI.components?.schemas && Object.keys(openAPI.components?.schemas)[0];
            if (firstSchemaName) {
                onSelectedComponentChange(firstSchemaName + "-schema");
            } else {
                onSelectedComponentChange(pathID);
            }
        } else if (pathID?.includes("Paths-Resources")) {
            const firstPath = openAPI.paths && Object.keys(openAPI.paths)[0];
            if (firstPath) {
                onSelectedComponentChange(firstPath);
            } else {
                onSelectedComponentChange(pathID);
            }
        }
    };

    const handleAddPath = () => {
        if (openAPI.paths === undefined) {
            openAPI.paths = {};
        }

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
        onOpenAPIDefinitionChange(openAPI, newPathVal, Views.EDIT);
    };

    const handleAddSchema = () => {
        if (openAPI.components === undefined) {
            openAPI.components = {};
        }
        if (openAPI.components.schemas === undefined) {
            openAPI.components.schemas = {};
        }
        const newSchemaName = Object.keys(openAPI.components.schemas).find((key) => 
            key.toLocaleLowerCase() === "schema") ? `Schema${Object.keys(openAPI.components.schemas).length + 1}` : 
                "Schema";
        openAPI.components.schemas[newSchemaName] = {
            type: "object",
            properties: {}
        };
        onOpenAPIDefinitionChange(openAPI, newSchemaName + "-schema", Views.EDIT);
    }

    const handleAddResources = (path: string, methods: string[] = []) => {
        const pathParameters = openAPI.paths[path] &&
            Object.keys(openAPI.paths[path]).map((key: string) => {
                const item = (openAPI.paths[path] as PathItem)[key];
                // Check if item is of type Operation to access parameters
                return (item as Operation)?.parameters?.find((param) => param.in === "path");
            });
            const distinctPathParameters = pathParameters && pathParameters.filter((param: ReferenceObject | Parameter, index: number, self: (ReferenceObject | Parameter)[]) =>
                'name' in param && index === self.findIndex((t) => 'name' in t && t.name === param.name));
        // Get current path
        const currentPath = openAPI.paths[path];
        // Add a new method to the current path
        methods?.forEach(method => {
            (currentPath as PathItem)[method] = { // Type assertion added here
                parameters: distinctPathParameters || []
            };
        })
        const updatedOpenAPIDefinition: OpenAPI = {
            ...openAPI,
            paths: {
                ...openAPI.paths,
                [path]: currentPath
            }
        };

        const oldMethods = Object.keys(currentPath);
        const newMethods = methods?.filter(item => !oldMethods.includes(item))
        if (newMethods.length === 1) {
            onSelectedComponentChange(getResourceID(path, newMethods[0]));
        }
        onOpenAPIDefinitionChange(updatedOpenAPIDefinition);
    };

    const onDeleteResource = (p: string, method: string) => {
        const methodCount = Object.keys(openAPI.paths[p]).length;
        rpcClient.showConfirmMessage({ buttonText: "Delete", message: `Are you sure you want to delete this method '${method}' ${methodCount === 1 ? `and the path '${p}'?` : "?"}` }).then(res => {
            if (res) {
                // If p with path and method exists, delete the perticular method
                const pathItem = openAPI.paths[p] as PathItem;
                if (pathItem && pathItem[method]) {
                    delete pathItem[method];
                }
                // If no more methods are available for the path, delete the path
                if (Object.keys(openAPI.paths[p]).length === 0) {
                    delete openAPI.paths[p];
                }
                onOpenAPIDefinitionChange(openAPI);
                onSelectedComponentChange(undefined);
            }
        })
    };

    const onDeletePath = (p: string) => {
        // If p with path and method exists, delete the perticular method
        if (openAPI.paths[p]) {
            delete openAPI.paths[p];
            onOpenAPIDefinitionChange(openAPI);
        }
    };

    const handleRenamePath = (path: string, pathIndex: number, prevPath: string) => {
        // Get path by index
        const pathKey = Object.keys(openAPI.paths).find((key) => key === prevPath);
        // Store the existing path item
        const pathItem = openAPI.paths[pathKey];
        const newPaths: { [key: string]: PathItem } = {};
        Object.keys(openAPI.paths).forEach((key, index) => {
            if (index === pathIndex) {
                newPaths[path] = pathItem as PathItem;
            } else {
                newPaths[key] = openAPI.paths[key] as PathItem;
            }
        });
        onOpenAPIDefinitionChange({ ...openAPI, paths: newPaths });
    }

    const handleOperationChange = (path: string, method: string, operation: Operation) => {
        // Get current path
        const currentPath = openAPI.paths[path] as PathItem;
        // Add a new method to the current path
        currentPath[method] = operation;
        const updatedOpenAPIDefinition: OpenAPI = {
            ...openAPI,
            paths: {
                ...openAPI.paths,
                [path]: currentPath
            }
        };
        onOpenAPIDefinitionChange(updatedOpenAPIDefinition, getResourceID(path, method));
    }

    const handleViewChange = (view: string) => {
        onCurrentViewChange(view as Views);
    };

    const handlePathItemChange = (pathItem: Paths, currentPath: string) => {
        // Update the OpenAPI definition with the new path
        const updatedOpenAPIDefinition: OpenAPI = {
            ...openAPI,
            paths: pathItem
        };
        selectedComponent && onSelectedComponentChange(currentPath || selectedComponent);
        onOpenAPIDefinitionChange(updatedOpenAPIDefinition);
    };

    const handleSchemaNameChange = (newName: string, oldSchemaName: string) => {
        const updatedOpenAPIDefinition: OpenAPI = {
            ...openAPI,
            components: {
                ...openAPI.components,
                schemas: Object.keys(openAPI.components?.schemas || {}).reduce((acc, key) => {
                    acc[key === oldSchemaName ? newName : key] = openAPI.components?.schemas?.[key];
                    return acc;
                }, {} as { [key: string]: Schema })
            }
        };
        onOpenAPIDefinitionChange(updatedOpenAPIDefinition, selectedComponent?.replace(oldSchemaName, newName));
    }

    const handleSchemaChange = (schema: Schema) => {
        // Update the OpenAPI definition with the new schema
        const updatedOpenAPIDefinition: OpenAPI = {
            ...openAPI,
            components: {
                ...openAPI.components,
                schemas: {
                    ...openAPI.components?.schemas,
                    [schemaName]: schema
                }
            }
        };
        onOpenAPIDefinitionChange(updatedOpenAPIDefinition);
    };

    const handleImportJSON = (schemaName: string) => {
        rpcClient.getApiDesignerVisualizerRpcClient().importJSON().then(resp => {
            if (resp) {
                handleSchemaChange(resp);
            }
        })
    }

    const handleDeteteSchema = (schemaName: string) => {
        const clonedSchemas = { ...openAPI.components?.schemas };
        delete clonedSchemas[schemaName];
        const updatedOpenAPIDefinition: OpenAPI = {
            ...openAPI,
            components: {
                ...openAPI.components,
                schemas: clonedSchemas
            }
        };
        onOpenAPIDefinitionChange(updatedOpenAPIDefinition);
        selectedComponent && onSelectedComponentChange(undefined);
    };

    const selectedMethod = selectedComponent && getMethodFromResourceID(selectedComponent);
    const selectedPath = selectedComponent && getPathFromResourceID(selectedComponent);
    const operation = selectedPath && selectedMethod &&
        getOperationFromOpenAPI(selectedPath, selectedMethod, openAPI);
    const currentPath = selectedComponent && openAPI?.paths && openAPI?.paths[selectedComponent];

    const isSchemaSelected = selectedComponent && selectedComponent?.includes("-schema");
    const schemaName = isSchemaSelected && selectedComponent?.split("-")[0];
    const schema = schemaName && openAPI?.components?.schemas[schemaName];

    return (
        <NavigationContainer>
            <SplitView defaultWidths={[18, 82]} sx={{ maxWidth: 1200 }} dynamicContainerSx={{ height: "96vh" }}>
                <NavigationPanelContainer>
                    {openAPI &&
                        <PathsNavigator
                            paths={openAPI.paths}
                            components={openAPI.components}
                            selectedPathID={selectedComponent}
                            onPathChange={handlePathClick}
                            onAddPath={handleAddPath}
                            onAddResources={handleAddResources}
                            onDeletePath={onDeletePath}
                            onPathRename={handleRenamePath}
                            onDeleteMethod={onDeleteResource}
                            onAddSchema={handleAddSchema}
                            onDeleteSchema={handleDeteteSchema}
                        />
                    }
                </NavigationPanelContainer>

                <Tabs
                    sx={{ paddingLeft: 10 }}
                    childrenSx={{ overflowY: "auto", maxHeight: "90vh" }}
                    tabTitleSx={{ marginLeft: 5 }}
                    titleContainerSx={{
                        position: "sticky",
                        top: 0,
                        zIndex: 5,
                    }}
                    views={[
                        { id: Views.READ_ONLY, name: 'View' },
                        { id: Views.EDIT, name: 'Design' },
                    ]}
                    currentViewId={currentView}
                    onViewChange={handleViewChange}
                >
                    <div id={Views.EDIT} style={{ minHeight: "90vh" }}>
                        {(selectedComponent === undefined) && (
                            <Overview
                                isNewFile={isNewFile}
                                openAPIDefinition={openAPI}
                                onOpenApiDefinitionChange={(openAPI: OpenAPI) => onOpenAPIDefinitionChange(openAPI)}
                            />
                        )}
                        {currentView === Views.EDIT && operation && selectedComponent !== undefined && (
                            <Resource
                                openAPI={openAPI}
                                resourceOperation={operation}
                                method={selectedMethod}
                                path={selectedPath}
                                onOperationChange={handleOperationChange}
                            />
                        )}
                        {currentView === Views.EDIT && selectedComponent && currentPath && (
                            <PI path={selectedComponent} pathItem={openAPI?.paths} onChange={handlePathItemChange} />
                        )}
                        {currentView === Views.EDIT && isSchemaSelected && schema && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                    <Typography variant="h3" sx={{}}>{schemaName}</Typography>
                                    <Button tooltip='Import from JSON' onClick={() => handleImportJSON(schemaName)} appearance='icon' sx={{ marginLeft: '10px' }}>
                                        <Codicon name='arrow-circle-down' sx={{ marginRight: "4px" }} /> Import JSON
                                    </Button>
                                </div>
                                <SchemaEditor openAPI={openAPI} schema={schema} schemaName={schemaName} onNameChange={handleSchemaNameChange} onSchemaChange={handleSchemaChange} />
                            </>
                        )}
                    </div>
                    <div id={Views.READ_ONLY}>
                        {(selectedComponent === undefined) && (
                            <ReadOnlyOverview openAPIDefinition={openAPI} />
                        )}
                        {(operation && selectedComponent !== undefined) && (
                            <ReadOnlyResource resourceOperation={operation} method={selectedMethod} path={selectedPath} />
                        )}
                        {selectedComponent && currentPath && (
                            <ReadOnlyPathItem currentPath={selectedComponent} pathItem={openAPI?.paths} />
                        )}
                        {isSchemaSelected && schema && (
                            <ReadOnlySchemaEditor schema={schema} schemaName={schemaName} />
                        )}
                    </div>
                </Tabs>
            </SplitView>
        </NavigationContainer>
    )
}
