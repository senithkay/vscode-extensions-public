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
import { PathsNavigator } from "../PathsNavigator/PathsNavigator";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
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
import { APIResources } from "../../constants";

interface OpenAPIDefinitionProps {
    openAPIDefinition: OpenAPI;
    serviceDesModel: Service;
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
    const { openAPIDefinition: initialOpenAPIDefinition, serviceDesModel, onOpenApiDefinitionChange } = props;
    const [openAPIDefinition, setOpenAPIDefinition] = useState<OpenAPI>(initialOpenAPIDefinition);
    const [currentView, setCurrentView] = useState<Views>(Views.READ_ONLY);
    const [selectedPathID, setSelectedPathID] = useState<string | undefined>(undefined);
    const { rpcClient } = useVisualizerContext();

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
        if (path.path === "") {
            path.path = "/";
        }
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
        const newPathVal = Object.keys(openAPIDefinition.paths).find((key) => key === "/path") ? `/path${Object.keys(openAPIDefinition.paths).length + 1}` : "/path";
        rpcClient.showInputBox({
            title: "Add New Path",
            placeholder: "/path",
            value: newPathVal,
        }).then(newPath=>{
            if(newPath){
                if(Object.keys(openAPIDefinition.paths).includes(newPath)){
                    rpcClient.showErrorNotification(`Path ${newPath} already exists in the OpenAPI schema`)
                    return
                }
                rpcClient.selectQuickPickItems({title:`Select methods of path ${newPath}`,items: APIResources.map(item=>({
                    label: item,
                    picked: item === "get"
                }))}).then(methodSelection=>{
                    if(!methodSelection || methodSelection.length<1){
                        rpcClient.showErrorNotification("Need to select at least one method for the path")
                    }else{
                        const pathObj: PathItem = {};
                        methodSelection.forEach(method=>{
                            pathObj[method.label]={parameters:[]}
                        })
                        const updatedOpenAPIDefinition: OpenAPI = {
                            ...openAPIDefinition,
                            paths: {
                                ...openAPIDefinition.paths,
                                [newPath]: pathObj
                            }
                        };
                        setOpenAPIDefinition(updatedOpenAPIDefinition);
                        onOpenApiDefinitionChange(updatedOpenAPIDefinition);
                        if(methodSelection.length === 1){
                            setSelectedPathID(getResourceID(newPath, methodSelection[0]?.label));
                        }
                    }
                })
            }
        })
    };

    const handleAddResources = (path: string, methods: string[] = []) => {
        const pathParameters = openAPIDefinition.paths[path] && 
            Object.keys(openAPIDefinition.paths[path]).map((key: string) => 
                openAPIDefinition.paths[path][key]?.parameters?.find((param) => param.in === "path"));
        const distinctPathParameters = pathParameters && pathParameters.filter((param: { name: any; }, index: any, self: any[]) =>
            index === self.findIndex((t) => param && t?.name === param?.name));
        // Get current path
        const currentPath = openAPIDefinition.paths[path];
        // Add a new method to the current path
        methods?.forEach(method=>{
            currentPath[method] = {
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
        if(newMethods.length === 1){
            setSelectedPathID(getResourceID(path, newMethods[0]));
        }
        setOpenAPIDefinition(updatedOpenAPIDefinition);
        onOpenApiDefinitionChange(updatedOpenAPIDefinition);
    };

    const onDeleteResource = (p: string, method: string) => {
        const methodCount = Object.keys(openAPIDefinition.paths[p]).length;
        rpcClient.showConfirmMessage({buttonText:"Delete", message:`Are you sure you want to delete this method '${method}' ${methodCount === 1 ? `and the path '${p}'?`: "?" }`}).then(res=>{
            if(res){
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

    const handleViewChange = (view: string) => {
        console.log("View changed to: ", view);
        setCurrentView(view as Views);
    };

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

    useEffect(() => {
        setOpenAPIDefinition(initialOpenAPIDefinition);
    }, [initialOpenAPIDefinition]);

    return (
        <NavigationContainer>
            <SplitView defaultWidths={[18, 82]} sx={{maxWidth: 1200}} dynamicContainerSx={{height: "96vh"}}>
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
                        />
                    }
                </NavigationPanelContainer>

                <Tabs
                    sx={{paddingLeft: 10}}
                    childrenSx={{overflowY: "auto", maxHeight: "90vh"}}
                    tabTitleSx={{marginLeft: 5}}
                    titleContainerSx={{
                        position: "sticky",
                        top: 0,
                        zIndex: 5,
                    }}
                    views={[
                        { id: Views.READ_ONLY, name: 'Docs' },
                        { id: Views.EDIT, name: 'Designer' },
                    ]}
                    currentViewId={currentView}
                    onViewChange={handleViewChange}
                >
                    <div id={Views.EDIT}>
                        {(selectedPathID === undefined || !operation) && ( 
                            <Overview
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
                    </div>
                    <div id={Views.READ_ONLY}>
                        {(selectedPathID === undefined || !operation) && (
                            <ReadOnlyOverview openAPIDefinition={openAPIDefinition} />
                        )}
                        {(operation && selectedPathID !== undefined) && (
                            <ReadOnlyResource resourceOperation={operation} method={selectedMethod} path={selectedPath} />
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
