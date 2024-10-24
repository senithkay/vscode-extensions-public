/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { useEffect, useState } from "react";
import { OpenAPI, Operation, Path, PathItem, Paths } from "../../Definitions/ServiceDefinitions";
import styled from "@emotion/styled";
import { PathsNavigator } from "../PathsNavigator/PathsNavigator";
import * as yup from "yup";
import { Overview } from "../Overview/Overview";
import { getMethodFromResourceID, getOperationFromOpenAPI, getPathFromResourceID, getPathParametersFromParameters, getResourceID } from "../Utils/OpenAPIUtils";
import { Resource } from "../Resource/Resource";
import { SplitView } from "../SplitView/SplitView";
import { Service } from "@wso2-enterprise/service-designer";
import { ReadOnlyResource } from "../Resource/ReadOnlyResource";
import { ReadOnlyOverview } from "../Overview/ReadOnlyOverview";
import { Tabs } from "../Tabs/Tabs";
import { useVisualizerContext } from "@wso2-enterprise/api-designer-rpc-client";
import { PathItem as PI } from "../PathItem/PathItem";
import { ReadOnlyPathItem } from "../PathItem/ReadOnlyPathItem";
import { Schema, SchemaEditor } from "../SchemaEditor/SchemaEditor";
import { ReadOnlySchemaEditor } from "../SchemaEditor/ReadOnlySchemaEditor";
import { Codicon, Button, Typography } from "@wso2-enterprise/ui-toolkit";

interface OpenAPIDefinitionProps {
    openAPIDefinition: OpenAPI;
    serviceDesModel: Service;
    isNewFile?: boolean;
    onOpenApiDefinitionChange: (openApiDefinition: OpenAPI) => void;
}

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

// Views Enum
enum Views {
    READ_ONLY = "READ_ONLY",
    EDIT = "EDIT"
}

export function OpenAPIDefinition(props: OpenAPIDefinitionProps) {
    const { openAPIDefinition: initialOpenAPIDefinition, serviceDesModel, isNewFile: newF, onOpenApiDefinitionChange } = props;
    const [openAPIDefinition, setOpenAPIDefinition] = useState<OpenAPI>(initialOpenAPIDefinition);
    const [currentView, setCurrentView] = useState<Views>(newF ? Views.EDIT : Views.READ_ONLY);
    const [selectedPathID, setSelectedPathID] = useState<string | undefined>(undefined);
    const [isNewFile, setIsNewFile] = useState<boolean>(newF);
    const { rpcClient } = useVisualizerContext();

    const handlePathClick = (pathID: string) => {
        setSelectedPathID(pathID);
        if (pathID?.includes("Schemas-Components")) {
            const firstSchemaName= Object.keys(openAPIDefinition.components?.schemas)[0];
            setSelectedPathID(firstSchemaName + "-schema");
        } else if (pathID?.includes("Paths-Resources")) {
            const firstPath = Object.keys(openAPIDefinition.paths)[0];
            setSelectedPathID(firstPath);
        }
    };

    const handlePathChange = (path: Path) => {
        // if (path.path === "") {
        //     path.path = "/";
        // }
        // // Update the OpenAPI definition with the new path
        // const initialPath = Object.keys(openAPIDefinition.paths).find((key) => key === path.initialPath);
        // const initialPathItems = initialPath && openAPIDefinition.paths[initialPath];
        // let updatedOpenAPIDefinition = { ...openAPIDefinition };
        // const initialPathParamaters = path?.initialPath && path?.initialMethod &&
        //     openAPIDefinition.paths[path?.initialPath]?.[path?.initialMethod];

        // if (isOperation(initialPathParamaters)) {
        //     const parameters = getPathParametersFromParameters(initialPathParamaters.parameters);
        //     const newPathParameters = getPathParametersFromParameters(path.initialOperation.parameters);
        //     if (parameters?.length === newPathParameters?.length) {
        //         // ... existing code ...
        //     }
        // }
        // const newPathParameters = getPathParametersFromParameters(path.initialOperation.parameters);
        // if (initialPathParamaters?.length === newPathParameters?.length) {
        //     // Update the existing path
        //     const initialPathItem = initialPathItems && initialPathItems[path.method];
        //     // Update the currentPathItem directly
        //     if (initialPathItem) {
        //         // If updatedOpenAPIDefinition.paths[path.path] does not exist, create it delete the initial path
        //         if (!updatedOpenAPIDefinition.paths[path.path]) {
        //             // Add new path with path.method
        //             updatedOpenAPIDefinition.paths[path.path] = {
        //                 [path.method]: {
        //                     ...path.initialOperation // Update with new operation details
        //                 }
        //             };
        //         }
        //         // Delete path.path with path.method
        //         if ((path.initialPath !== path.path) &&
        //             updatedOpenAPIDefinition.paths[path.initialPath][path.initialMethod]) 
        //         {
        //             delete updatedOpenAPIDefinition.paths[path.initialPath][path.initialMethod];
        //             // Delete updatedOpenAPIDefinition.paths[path.initialPath] if it is empty
        //             if (Object.keys(updatedOpenAPIDefinition.paths[path.initialPath]).length === 0) {
        //                 delete updatedOpenAPIDefinition.paths[path.initialPath];
        //             }
        //         }
        //         updatedOpenAPIDefinition.paths[path.path][path.method] = {
        //             ...path.initialOperation // Update with new operation details
        //         };
        //         // delete updatedOpenAPIDefinition.paths[path.initialPath];
        //     } else {
        //         updatedOpenAPIDefinition.paths[path.path][path.method] = {
        //             ...path.initialOperation
        //         };
        //         if (updatedOpenAPIDefinition.paths[path.initialPath][path.initialMethod]) {
        //             delete updatedOpenAPIDefinition.paths[path.initialPath][path.initialMethod];
        //             // Delete updatedOpenAPIDefinition.paths[path.initialPath] if it is empty
        //             if (Object.keys(updatedOpenAPIDefinition.paths[path.initialPath]).length === 0) {
        //                 delete updatedOpenAPIDefinition.paths[path.initialPath];
        //             }
        //         }
        //     }
        // } else {
        //     // If the method does not exist, add it
        //     if (updatedOpenAPIDefinition.paths[path.initialPath] && [path.initialMethod]) {
        //         delete updatedOpenAPIDefinition.paths[path.initialPath][path.initialMethod];
        //         // Delete updatedOpenAPIDefinition.paths[path.initialPath] if it is empty
        //         if (Object.keys(updatedOpenAPIDefinition.paths[path.initialPath]).length === 0) {
        //             delete updatedOpenAPIDefinition.paths[path.initialPath];
        //         }
        //     }
        //     // Add a new path
        //     updatedOpenAPIDefinition.paths[path.path] = {
        //         ...updatedOpenAPIDefinition.paths[path.path],
        //         [path.method]: {
        //             ...path.initialOperation
        //         }
        //     };
        // }
        // setSelectedPathID(getResourceID(path.path, path.method));
        // setOpenAPIDefinition(updatedOpenAPIDefinition);
        // onOpenApiDefinitionChange(updatedOpenAPIDefinition);
    };

    const handleAddPath = () => {
        if (openAPIDefinition.paths === undefined) {
            openAPIDefinition.paths = {};
        }

        const newPathVal = Object.keys(openAPIDefinition.paths).find((key) => key === "/path") ? `/path${Object.keys(openAPIDefinition.paths).length + 1}` : "/path";
        openAPIDefinition.paths[newPathVal] = {
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
        setOpenAPIDefinition(openAPIDefinition);
        onOpenApiDefinitionChange(openAPIDefinition);
        setSelectedPathID(newPathVal);
        setCurrentView(Views.EDIT);
        // rpcClient.showInputBox({
        //     title: "Add New Path",
        //     placeholder: "/path",
        //     value: newPathVal,
        // }).then(newPath=>{
        //     if(newPath){
        //         if(Object.keys(openAPIDefinition.paths).includes(newPath)){
        //             rpcClient.showErrorNotification(`Path ${newPath} already exists in the OpenAPI schema`)
        //             return
        //         }
        //         rpcClient.selectQuickPickItems({title:`Select methods of path ${newPath}`,items: APIResources.map(item=>({
        //             label: item,
        //             picked: item === "get"
        //         }))}).then(methodSelection=>{
        //             if(!methodSelection || methodSelection.length<1){
        //                 rpcClient.showErrorNotification("Need to select at least one method for the path")
        //             }else{
        //                 const pathObj: PathItem = {};
        //                 methodSelection.forEach(method=>{
        //                     pathObj[method.label]={parameters:[]}
        //                 })
        //                 const updatedOpenAPIDefinition: OpenAPI = {
        //                     ...openAPIDefinition,
        //                     paths: {
        //                         [newPath]: pathObj,
        //                         ...openAPIDefinition.paths,
        //                     }
        //                 };
        //                 setOpenAPIDefinition(updatedOpenAPIDefinition);
        //                 onOpenApiDefinitionChange(updatedOpenAPIDefinition);
        //                 if(methodSelection.length === 1){
        //                     setSelectedPathID(getResourceID(newPath, methodSelection[0]?.label));
        //                 }
        //             }
        //         })
        //     }
        // })
    };

    const handleAddSchema = () => {
        if (openAPIDefinition.components === undefined) {
            openAPIDefinition.components = {};
        }
        if (openAPIDefinition.components.schemas === undefined) {
            openAPIDefinition.components.schemas = {};
        }
        const newSchemaName = Object.keys(openAPIDefinition.components.schemas).find((key) => key === "schema") ? `Schema${Object.keys(openAPIDefinition.components.schemas).length + 1}` : "Schema";
        openAPIDefinition.components.schemas[newSchemaName] = {
            type: "object",
            properties: {}
        };
        setOpenAPIDefinition(openAPIDefinition);
        onOpenApiDefinitionChange(openAPIDefinition);
        setSelectedPathID(newSchemaName + "-schema");
        setCurrentView(Views.EDIT);
    }

    const handleAddResources = (path: string, methods: string[] = []) => {
        const pathParameters = openAPIDefinition.paths[path] &&
            Object.keys(openAPIDefinition.paths[path]).map((key: string) => {
                const item = (openAPIDefinition.paths[path] as PathItem)[key];
                // Check if item is of type Operation to access parameters
                return (item as Operation)?.parameters?.find((param) => param.in === "path");
            });
        const distinctPathParameters = pathParameters && pathParameters.filter((param: { name: any; }, index: any, self: any[]) =>
            index === self.findIndex((t) => param && t?.name === param?.name));
        // Get current path
        const currentPath = openAPIDefinition.paths[path];
        // Add a new method to the current path
        methods?.forEach(method => {
            (currentPath as PathItem)[method] = { // Type assertion added here
                parameters: distinctPathParameters || []
            };
        })
        const updatedOpenAPIDefinition: OpenAPI = {
            ...openAPIDefinition,
            paths: {
                ...openAPIDefinition.paths,
                [path]: currentPath
            }
        };

        const oldMethods = Object.keys(currentPath);
        const newMethods = methods?.filter(item => !oldMethods.includes(item))
        if (newMethods.length === 1) {
            setSelectedPathID(getResourceID(path, newMethods[0]));
        }
        setOpenAPIDefinition(updatedOpenAPIDefinition);
        onOpenApiDefinitionChange(updatedOpenAPIDefinition);
    };

    const onDeleteResource = (p: string, method: string) => {
        const methodCount = Object.keys(openAPIDefinition.paths[p]).length;
        rpcClient.showConfirmMessage({ buttonText: "Delete", message: `Are you sure you want to delete this method '${method}' ${methodCount === 1 ? `and the path '${p}'?` : "?"}` }).then(res => {
            if (res) {
                // If p with path and method exists, delete the perticular method
                const pathItem = openAPIDefinition.paths[p] as PathItem;
                if (pathItem && pathItem[method]) {
                    delete pathItem[method];
                }
                // If no more methods are available for the path, delete the path
                if (Object.keys(openAPIDefinition.paths[p]).length === 0) {
                    delete openAPIDefinition.paths[p];
                }
                setSelectedPathID(undefined);
                setOpenAPIDefinition({ ...openAPIDefinition });
                onOpenApiDefinitionChange(openAPIDefinition);
            }
        })
    };

    const onDeletePath = (p: string) => {
        // If p with path and method exists, delete the perticular method
        if (openAPIDefinition.paths[p]) {
            delete openAPIDefinition.paths[p];
            setOpenAPIDefinition({ ...openAPIDefinition });
            onOpenApiDefinitionChange(openAPIDefinition);
        }
    };

    const handleRenamePath = (path: string, pathIndex: number, prevPath: string) => {
        // Get path by index
        const pathKey = Object.keys(openAPIDefinition.paths).find((key) => key === prevPath);
        // Store the existing path item
        const pathItem = openAPIDefinition.paths[pathKey];
        const newPaths: { [key: string]: PathItem } = {};
        Object.keys(openAPIDefinition.paths).forEach((key, index) => {
            if (index === pathIndex) {
                newPaths[path] = pathItem as PathItem;
            } else {
                newPaths[key] = openAPIDefinition.paths[key] as PathItem;
            }
        });
        setOpenAPIDefinition({ ...openAPIDefinition, paths: newPaths });
        onOpenApiDefinitionChange({ ...openAPIDefinition, paths: newPaths });
    }

    const handleOperationChange = (path: string, method: string, operation: Operation) => {
        // Get current path
        const currentPath = openAPIDefinition.paths[path] as PathItem;
        // Add a new method to the current path
        currentPath[method] = operation;
        const updatedOpenAPIDefinition: OpenAPI = {
            ...openAPIDefinition,
            paths: {
                ...openAPIDefinition.paths,
                [path]: currentPath
            }
        };
        setSelectedPathID(getResourceID(path, method));
        setOpenAPIDefinition(updatedOpenAPIDefinition);
        onOpenApiDefinitionChange(updatedOpenAPIDefinition);
    }

    const handleViewChange = (view: string) => {
        setCurrentView(view as Views);
    };

    const handlePathItemChange = (pathItem: Paths, currentPath: string) => {
        // Update the OpenAPI definition with the new path
        const updatedOpenAPIDefinition: OpenAPI = {
            ...openAPIDefinition,
            paths: pathItem
        };
        selectedPathID && setSelectedPathID(currentPath || selectedPathID);
        setOpenAPIDefinition(updatedOpenAPIDefinition);
        onOpenApiDefinitionChange(updatedOpenAPIDefinition);
    };

    const handleSchemaNameChange = (newName: string, oldSchemaName: string) => {
        const component = openAPIDefinition.components[oldSchemaName];
        const updatedOpenAPIDefinition: OpenAPI = {
            ...openAPIDefinition,
            components: {
                ...openAPIDefinition.components,
                schemas: Object.keys(openAPIDefinition.components?.schemas || {}).reduce((acc, key) => {
                    acc[key === oldSchemaName ? newName : key] = openAPIDefinition.components?.schemas?.[key];
                    return acc;
                }, {} as { [key: string]: Schema })
            }
        };
        setSelectedPathID(selectedPathID?.replace(oldSchemaName, newName));
        setOpenAPIDefinition(updatedOpenAPIDefinition);
        onOpenApiDefinitionChange(updatedOpenAPIDefinition);
    }

    const handleSchemaChange = (schema: Schema) => {
        // Update the OpenAPI definition with the new schema
        const updatedOpenAPIDefinition: OpenAPI = {
            ...openAPIDefinition,
            components: {
                ...openAPIDefinition.components,
                schemas: {
                    ...openAPIDefinition.components?.schemas,
                    [schemaName]: schema
                }
            }
        };
        setOpenAPIDefinition(updatedOpenAPIDefinition);
        onOpenApiDefinitionChange(updatedOpenAPIDefinition);
    };

    const handleImportJSON = (schemaName: string) => {
        console.log("schemaName", schemaName);
    }

    const selectedMethod = selectedPathID && getMethodFromResourceID(selectedPathID);
    const selectedPath = selectedPathID && getPathFromResourceID(selectedPathID);
    const operation = selectedPath && selectedMethod &&
        getOperationFromOpenAPI(selectedPath, selectedMethod, openAPIDefinition);
    if (selectedMethod && selectedPath) {
        serviceDesModel?.resources.forEach((resource) => {
            if (resource.path === selectedPath && resource.methods.includes(selectedMethod)) {
                resource.isOpen = true;
            } else {
                resource.isOpen = false;
            }
        });
    }
    const currentPath = selectedPathID && openAPIDefinition?.paths[selectedPathID];

    const isSchemaSelected = selectedPathID && selectedPathID?.includes("-schema");
    const schemaName = isSchemaSelected && selectedPathID?.split("-")[0];
    const schema = schemaName && openAPIDefinition?.components?.schemas[schemaName];
    console.log("schema-out", schema);
    console.log("schemaName-out", schemaName);
    console.log("selectedPathID-out", selectedPathID);

    useEffect(() => {
        setOpenAPIDefinition(initialOpenAPIDefinition);
    }, [initialOpenAPIDefinition]);
    useEffect(() => {
        setIsNewFile(newF);
        setCurrentView(newF ? Views.EDIT : Views.READ_ONLY);
    }, [newF]);

    return (
        <NavigationContainer>
            <SplitView defaultWidths={[18, 82]} sx={{ maxWidth: 1200 }} dynamicContainerSx={{ height: "96vh" }}>
                <NavigationPanelContainer>
                    {openAPIDefinition &&
                        <PathsNavigator
                            paths={openAPIDefinition.paths}
                            components={openAPIDefinition.components}
                            selectedPathID={selectedPathID}
                            onPathChange={handlePathClick}
                            onAddPath={handleAddPath}
                            onAddResources={handleAddResources}
                            onDeletePath={onDeletePath}
                            onPathRename={handleRenamePath}
                            onDeleteMethod={onDeleteResource}
                            onAddSchema={handleAddSchema}
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
                        {(selectedPathID === undefined) && (
                            <Overview
                                isNewFile={isNewFile}
                                openAPIDefinition={openAPIDefinition}
                                onOpenApiDefinitionChange={onOpenApiDefinitionChange}
                            />
                        )}
                        {currentView === Views.EDIT && operation && selectedPathID !== undefined && (
                            <Resource
                                openAPI={openAPIDefinition}
                                resourceOperation={operation}
                                method={selectedMethod}
                                path={selectedPath}
                                onPathChange={handlePathChange}
                                onOperationChange={handleOperationChange}
                            />
                        )}
                        {currentView === Views.EDIT && selectedPathID && currentPath && (
                            <PI path={selectedPathID} pathItem={openAPIDefinition?.paths} onChange={handlePathItemChange} />
                        )}
                        {currentView === Views.EDIT && isSchemaSelected && schema && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                    <Typography variant="h3" sx={{}}>{schemaName}</Typography>
                                    <Button tooltip='Import from JSON' onClick={() => handleImportJSON(schemaName)} appearance='icon' sx={{ marginLeft: '10px' }}>
                                        <Codicon name='arrow-circle-down' sx={{ marginRight: "4px" }} /> Import JSON
                                    </Button>
                                </div>
                                <SchemaEditor openAPI={openAPIDefinition} schema={schema} schemaName={schemaName} onNameChange={handleSchemaNameChange} onSchemaChange={handleSchemaChange} />
                            </>
                        )}
                    </div>
                    <div id={Views.READ_ONLY}>
                        {(selectedPathID === undefined) && (
                            <ReadOnlyOverview openAPIDefinition={openAPIDefinition} />
                        )}
                        {(operation && selectedPathID !== undefined) && (
                            <ReadOnlyResource resourceOperation={operation} method={selectedMethod} path={selectedPath} />
                        )}
                        {selectedPathID && currentPath && (
                            <ReadOnlyPathItem currentPath={selectedPathID} pathItem={openAPIDefinition?.paths} />
                        )}
                        {isSchemaSelected && schema && (
                            <ReadOnlySchemaEditor schema={schema} schemaName={schemaName} />
                        )}
                    </div>
                    {/* {(selectedPathID === undefined || !operation) && (
                        <>
                            <Overview
                                openAPIDefinition={openAPIDefinition}
                                onOpenApiDefinitionChange={onOpenApiDefinitionChange}
                            />
                            <ReadOnlyOverview openAPIDefinition={openAPIDefinition} />
                        </>
                    )} */}
                    {/* {operation && selectedPathID !== undefined && (
                        <>
                            <Resource
                                openAPI={openAPIDefinition}
                                resourceOperation={operation}
                                method={selectedMethod}
                                path={selectedPath}
                                onPathChange={handlePathChange}
                                onOperationChange={handleOperationChange}
                                onDelete={onDeleteResource}
                            />
                            <ReadOnlyResource resourceOperation={operation} method={selectedMethod} path={selectedPath} />
                        </>
                    )} */}
                </Tabs>
            </SplitView>
        </NavigationContainer>
    )
}
