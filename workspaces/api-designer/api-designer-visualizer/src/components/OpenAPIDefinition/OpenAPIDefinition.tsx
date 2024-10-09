/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { useEffect, useState } from "react";
import { OpenAPI, Operation, Path, PathItem } from "../../Definitions/ServiceDefinitions";
import styled from "@emotion/styled";
import { PathsComponent } from "../PathsComponent/PathsComponent";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Overview } from "../Overview/Overview";
import { getMethodFromResourceID, getOperationFromOpenAPI, getPathFromResourceID, getPathParametersFromParameters, getResourceID } from "../Utils/OpenAPIUtils";
import { Resource } from "../Resource/Resource";
import { SplitView } from "../SplitView/SplitView";
import { Service } from "@wso2-enterprise/service-designer";

interface OpenAPIDefinitionProps {
    openAPIDefinition: OpenAPI;
    serviceDesModel: Service;
    onOpenApiDefinitionChange: (openApiDefinition: OpenAPI) => void;
}

const NavigationContainer = styled.div`
    padding: 10px;
    height: 97vh;
    overflow-y: auto;
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

export function OpenAPIDefinition(props: OpenAPIDefinitionProps) {
    const { openAPIDefinition: initialOpenAPIDefinition, serviceDesModel, onOpenApiDefinitionChange } = props;
    const [openAPIDefinition, setOpenAPIDefinition] = useState<OpenAPI>(initialOpenAPIDefinition);
    const [selectedPathID, setSelectedPathID] = useState<string | undefined>(undefined);

    const {
        reset,
        register,
        formState: { errors, isDirty },
        handleSubmit,
        getValues,
        setValue,
        control,
        watch,
    } = useForm({
        // defaultValues: null,
        resolver: yupResolver(schema),
        mode: "onChange"
    });

    const handlePathClick = (pathID: string) => {
        setSelectedPathID(pathID);
    };

    const handlePathChange = (path: Path) => {
        // Update the OpenAPI definition with the new path
        const initialPath = Object.keys(openAPIDefinition.paths).find((key) => key === path.initialPath);
        const initialPathItems = initialPath && openAPIDefinition.paths[initialPath];
        let updatedOpenAPIDefinition = { ...openAPIDefinition };
        const initialPathParamaters = path?.initialPath && path?.initialMethod &&
            openAPIDefinition.paths[path?.initialPath] && openAPIDefinition.paths[path?.initialPath][path?.initialMethod] &&
            getPathParametersFromParameters(openAPIDefinition.paths[path?.initialPath][path?.initialMethod].parameters);
        const newPathParameters = getPathParametersFromParameters(path.initialOperation.parameters);
        if (initialPathParamaters?.length === newPathParameters?.length) {
            // Update the existing path
            const initialPathItem = initialPathItems && initialPathItems[path.method];
            // Update the currentPathItem directly
            if (initialPathItem) {
                // If updatedOpenAPIDefinition.paths[path.path] does not exist, create it delete the initial path
                if (!updatedOpenAPIDefinition.paths[path.path]) {
                    // Add new path with path.method
                    updatedOpenAPIDefinition.paths[path.path] = {
                        [path.method]: {
                            ...path.initialOperation // Update with new operation details
                        }
                    };
                }
                // Delete path.path with path.method
                if ((path.initialPath !== path.path) &&
                    updatedOpenAPIDefinition.paths[path.initialPath][path.initialMethod]) 
                {
                    delete updatedOpenAPIDefinition.paths[path.initialPath][path.initialMethod];
                    // Delete updatedOpenAPIDefinition.paths[path.initialPath] if it is empty
                    if (Object.keys(updatedOpenAPIDefinition.paths[path.initialPath]).length === 0) {
                        delete updatedOpenAPIDefinition.paths[path.initialPath];
                    }
                }
                updatedOpenAPIDefinition.paths[path.path][path.method] = {
                    ...path.initialOperation // Update with new operation details
                };
                // delete updatedOpenAPIDefinition.paths[path.initialPath];
            } else {
                updatedOpenAPIDefinition.paths[path.path][path.method] = {
                    ...path.initialOperation
                };
                if (updatedOpenAPIDefinition.paths[path.initialPath][path.initialMethod]) {
                    delete updatedOpenAPIDefinition.paths[path.initialPath][path.initialMethod];
                    // Delete updatedOpenAPIDefinition.paths[path.initialPath] if it is empty
                    if (Object.keys(updatedOpenAPIDefinition.paths[path.initialPath]).length === 0) {
                        delete updatedOpenAPIDefinition.paths[path.initialPath];
                    }
                }
            }
        } else {
            // If the method does not exist, add it
            if (updatedOpenAPIDefinition.paths[path.initialPath] && [path.initialMethod]) {
                delete updatedOpenAPIDefinition.paths[path.initialPath][path.initialMethod];
                // Delete updatedOpenAPIDefinition.paths[path.initialPath] if it is empty
                if (Object.keys(updatedOpenAPIDefinition.paths[path.initialPath]).length === 0) {
                    delete updatedOpenAPIDefinition.paths[path.initialPath];
                }
            }
            // Add a new path
            updatedOpenAPIDefinition.paths[path.path] = {
                ...updatedOpenAPIDefinition.paths[path.path],
                [path.method]: {
                    ...path.initialOperation
                }
            };
        }
        setSelectedPathID(getResourceID(path.path, path.method));
        setOpenAPIDefinition(updatedOpenAPIDefinition);
        onOpenApiDefinitionChange(updatedOpenAPIDefinition);
    };

    const handleAddPath = () => {
        if (openAPIDefinition.paths === undefined) {
            openAPIDefinition.paths = {};
        }
        // If Genetrate a new path with "path" prefix and 1,2,3 ... suffix if the path already exists
        const newPath = Object.keys(openAPIDefinition.paths).find((key) => key === "/path") ? `/path${Object.keys(openAPIDefinition.paths).length + 1}` : "/path";
        const updatedOpenAPIDefinition: OpenAPI = {
            ...openAPIDefinition,
            paths: {
                ...openAPIDefinition.paths,
                [newPath]: {
                    get: {
                        parameters: []
                    }
                }
            }
        };
        setSelectedPathID(getResourceID(newPath, "get"));
        setOpenAPIDefinition(updatedOpenAPIDefinition);
        onOpenApiDefinitionChange(updatedOpenAPIDefinition);
    };

    const handleAddResource = (path: string, method: string) => {
        // Get current path
        const currentPath = openAPIDefinition.paths[path];
        // Add a new method to the current path
        currentPath[method] = {
            summary: "",
            description: "",
            parameters: []
        };
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
    };

    const onDeleteResource = (p: string, method: string) => {
        // If p with path and method exists, delete the perticular method
        if (openAPIDefinition.paths[p][method]) {
            delete openAPIDefinition.paths[p][method];
        }
        // If no more methods are available for the path, delete the path
        if (Object.keys(openAPIDefinition.paths[p]).length === 0) {
            delete openAPIDefinition.paths[p];
        }
        setSelectedPathID(undefined);
        setOpenAPIDefinition({ ...openAPIDefinition });
        onOpenApiDefinitionChange(openAPIDefinition);
    };

    const onDeletePath = (p: string) => {
        // If p with path and method exists, delete the perticular method
        if (openAPIDefinition.paths[p]) {
            delete openAPIDefinition.paths[p];
            setOpenAPIDefinition({ ...openAPIDefinition });
            onOpenApiDefinitionChange(openAPIDefinition);
        }
    };

    const handleRenamePath = (path: string, pathIndex: number) => {
        // Get path by index
        const pathKey = Object.keys(openAPIDefinition.paths)[pathIndex];
        // Store the existing path item
        const pathItem = openAPIDefinition.paths[pathKey];
        // Delete the old path
        delete openAPIDefinition.paths[pathKey];
        // Insert the renamed path at the same index
        const updatedPaths = Object.keys(openAPIDefinition.paths);
        updatedPaths.splice(pathIndex, 0, path); // Insert at the specified index
        const newPaths: { [key: string]: PathItem } = {}; // Define the type for newPaths
        updatedPaths.forEach(key => {
            newPaths[key] = openAPIDefinition.paths[key] || (key === path ? pathItem : undefined);
        });
        setOpenAPIDefinition({ ...openAPIDefinition, paths: newPaths });
        onOpenApiDefinitionChange({ ...openAPIDefinition, paths: newPaths });
    }

    const handleOperationChange = (path: string, method: string, operation: Operation) => {
        // Get current path
        const currentPath = openAPIDefinition.paths[path];
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

    const selectedMethod = selectedPathID && getMethodFromResourceID(selectedPathID);
    const selectedPath = selectedPathID && getPathFromResourceID(selectedPathID);
    const operation = selectedPath && selectedMethod &&
        getOperationFromOpenAPI(selectedPath, selectedMethod, openAPIDefinition);
    if (selectedMethod && selectedPath) {
        serviceDesModel.resources.forEach((resource) => {
            if (resource.path === selectedPath && resource.methods.includes(selectedMethod)) {
                resource.isOpen = true;
            } else {
                resource.isOpen = false;
            }
        });
    }

    useEffect(() => {
        setOpenAPIDefinition(initialOpenAPIDefinition);
    }, [initialOpenAPIDefinition]);

    return (
        <NavigationContainer>
            <SplitView defaultWidths={[25, 75]}>
                <NavigationPanelContainer>
                    {openAPIDefinition &&
                        <PathsComponent
                            paths={openAPIDefinition.paths}
                            selectedPathID={selectedPathID}
                            onPathChange={handlePathClick}
                            onAddPath={handleAddPath}
                            onAddResource={handleAddResource}
                            onDeletePath={onDeletePath}
                            onPathRename={handleRenamePath}
                        />
                    }
                </NavigationPanelContainer>

                <div>
                    {(selectedPathID === undefined || !operation) && (
                        <Overview
                            openAPIDefinition={openAPIDefinition}
                            onOpenApiDefinitionChange={onOpenApiDefinitionChange}
                        />
                    )}
                    {operation && selectedPathID !== undefined && (
                        <Resource
                            openAPI={openAPIDefinition}
                            resourceOperation={operation}
                            method={selectedMethod}
                            path={selectedPath}
                            onPathChange={handlePathChange}
                            onOperationChange={handleOperationChange}
                            onDelete={onDeleteResource}
                        />
                    )}
                </div>
            </SplitView>
        </NavigationContainer>
    )
}
