/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Button, CheckBox, CheckBoxGroup, Codicon, TextField, Typography } from "@wso2-enterprise/ui-toolkit";
import { PathItem as PI, Param, Parameter, Paths } from "../../Definitions/ServiceDefinitions";
import { PanelBody } from "../Overview/Overview";
import { CodeTextArea } from "../CodeTextArea/CodeTextArea";
import { useEffect, useState } from "react";
import { convertParamsToParameters, getHeaderParametersFromParameters, getPathParametersFromParameters, getPathParametersFromPath, getQueryParametersFromParameters, isNameNotInParams } from "../Utils/OpenAPIUtils";
import { HorizontalFieldWrapper, ParamEditor } from "../Parameter/ParamEditor";
import { getColorByMethod } from "@wso2-enterprise/service-designer";
import { useVisualizerContext } from "@wso2-enterprise/api-designer-rpc-client";

interface MakrDownEditorProps {
    pathItem: Paths;
    path: string;
    onChange: (value: Paths, path?: string) => void;
    sx?: any;
}

const httpMethods = ["get", "post", "put", "delete", "options", "head", "patch", "trace"];
const moreOptions = ["Summary", "Description"];

export function PathItem(props: MakrDownEditorProps) {
    const { pathItem, path, onChange, sx } = props;
    const { rpcClient } = useVisualizerContext();
    const currentPathItem: PI = pathItem[path] as PI;
    const [description, setDescription] = useState<string>(String(currentPathItem.description));
    const pathPramFromPath = getPathParametersFromPath(path);
    const pathParameters: Param[] =  pathItem && path && (pathItem[path] as Paths).parameters && getPathParametersFromParameters(Object.values((pathItem[path] as Paths).parameters));
    const queryParameters: Param[] = pathItem && path && (pathItem[path] as Paths).parameters && getQueryParametersFromParameters(Object.values((pathItem[path] as Paths).parameters));
    const headerParameters: Param[] = pathItem && path && (pathItem[path] as Paths).parameters && getHeaderParametersFromParameters(Object.values((pathItem[path] as Paths).parameters));
    // Available operations for the path
    const operations: string[] = pathItem && pathItem[path] && Object.keys(pathItem[path]);
    const summary = currentPathItem?.summary;
    let selectedOptions: string[] = [];
    if (currentPathItem && currentPathItem.summary === "" || currentPathItem.summary) {
        selectedOptions.push("Summary");
    }
    if (currentPathItem && currentPathItem.description === "" || currentPathItem.description) {
        selectedOptions.push("Description");
    }
    const handleOptionChange = (options: string[]) => {
        let updatedPathItem: Paths = pathItem;
        let itemsUpdated = false;
        if (options.includes("Summary")) {
            const currentPathItem: Paths = updatedPathItem[path] as Paths;
            const updatedPath = {
                ...currentPathItem,
                summary: "",
            };
            updatedPathItem = {
                ...pathItem,
                [path]: updatedPath,
            };
            itemsUpdated = true;
        } else {
            // Delete summary from the pathItem
            const currentPathItem: Paths = updatedPathItem[path] as Paths;
            delete currentPathItem.summary;
            updatedPathItem = {
                ...pathItem,
                [path]: currentPathItem,
            };
            itemsUpdated = true;
        }
        if (options.includes("Description")) {
            const currentPathItem: Paths = updatedPathItem[path] as Paths;
            const updatedPath = {
                ...currentPathItem,
                description: "",
            };
            updatedPathItem = {
                ...pathItem,
                [path]: updatedPath,
            };
            setDescription("");
            itemsUpdated = true;
        } else {
            // Delete description from the pathItem
            const currentPathItem: Paths = updatedPathItem[path] as Paths;
            delete currentPathItem.description;
            updatedPathItem = {
                ...pathItem,
                [path]: currentPathItem,
            };
            setDescription("");
            itemsUpdated = true;
        }
        if (itemsUpdated) {
            onChange(updatedPathItem);
        }
    }
    const handlePathChange = (p: string) => {
        // Delete the current path form the pathItem
        const clonedPathItem = { ...pathItem };
        let deletedIndex = -1;    
        pathItem && Object.entries(pathItem).forEach(([key, value], i) => {
            if (key === path && typeof value === "object" && key !== "servers" && key !== "parameters") {
                deletedIndex = i;
                delete clonedPathItem[path];
            }
        });
        // Add the new path to the pathItem to the deleted index
        pathItem && Object.keys(pathItem).forEach((_, i) => {
            if (i === deletedIndex) {
                clonedPathItem[p] = currentPathItem;
            }
        });
        const updatedPathItem = { ...clonedPathItem };
        onChange(updatedPathItem, p);
    };
    const handleSummaryChange = (summary: string) => {
        const currentPathItem: Paths = pathItem[path] as Paths;
        const updatedPath = {
            ...currentPathItem,
            summary: summary,
        };
        const updatedPathItem = {
            ...pathItem,
            [path]: updatedPath,
        };
        onChange(updatedPathItem);
    };
    const handleDescriptionChange = (description: string) => {
        setDescription(description);
        const currentPathItem: Paths = pathItem[path] as Paths;
        const updatedPath = {
            ...currentPathItem,
            description: description,
        };
        const updatedPathItem = {
            ...pathItem,
            [path]: updatedPath,
        };
        onChange(updatedPathItem);
    };
    const handlePathParametersChange = (params: Param[]) => {
        const pathParamters = convertParamsToParameters(params, "path");
        const queryParams = convertParamsToParameters(queryParameters, "query");
        const headerParams = convertParamsToParameters(headerParameters, "header");
        // New path string from the pathParamters removing the old path parameters
        let newPath = path.split('/').map(segment => {
            if (segment.startsWith('{') && segment.endsWith('}')) {
                const paramName = segment.replace('{', '').replace('}', '');
                const param = pathParamters.find(param => param.name === paramName);
                return param ? `{${param.name}}` : "";
            } else {
                return segment;
            }
        }).join('/');
        newPath = newPath.endsWith('/') ? newPath.slice(0, -1) : newPath;
        const clonedPathItem = { ...pathItem };
        let deletedIndex = -1;    
        let existingPathItems: string | PI | Parameter[];
        pathItem && Object.entries(pathItem).forEach(([key, value], i) => {
            if (key === path && typeof value === "object" && key !== "servers" && key !== "parameters") {
                existingPathItems = clonedPathItem[path];
                deletedIndex = i;
                delete clonedPathItem[path];
            }
        });
        // Add the new path to the pathItem to the deleted index
        pathItem && Object.keys(pathItem).forEach((_, i) => {
            if (i === deletedIndex) {
                clonedPathItem[newPath] = existingPathItems;
            }
        });
        const currentPathItem: Paths = clonedPathItem[newPath] as Paths;
        const updatedPath = {
            ...currentPathItem,
            parameters: [...pathParamters, ...queryParams, ...headerParams],
        };
        const updatedPathItem = {
            ...clonedPathItem,
            [newPath]: updatedPath,
        };
        onChange(updatedPathItem, newPath);
    };
    const handleQueryParametersChange = (params: Param[]) => {
        const pathParamters = convertParamsToParameters(pathParameters, "path");
        const queryParams = convertParamsToParameters(params, "query");
        const headerParams = convertParamsToParameters(headerParameters, "header");
        const currentPathItem: Paths = pathItem[path] as Paths;
        const updatedPath = {
            ...currentPathItem,
            parameters: [...pathParamters, ...queryParams, ...headerParams],
        };
        const updatedPathItem = {
            ...pathItem,
            [path]: updatedPath,
        };
        onChange(updatedPathItem, path);
    };
    const handleHeaderParametersChange = (params: Param[]) => {
        const pathParamters = convertParamsToParameters(pathParameters, "path");
        const queryParams = convertParamsToParameters(queryParameters, "query");
        const headerParams = convertParamsToParameters(params, "header");
        const currentPathItem: Paths = pathItem[path] as Paths;
        const updatedPath = {
            ...currentPathItem,
            parameters: [...pathParamters, ...queryParams, ...headerParams],
        };
        const updatedPathItem = {
            ...pathItem,
            [path]: updatedPath,
        };
        onChange(updatedPathItem, path);
    };
    const handleOperationChange = (isChecked: boolean, method: string) => {
        // If the operation is checked, add it to the pathItem
        if (isChecked) {
            const updatedPathItem = {
                ...pathItem,
                [path]: {
                    ...currentPathItem,
                    [method]: {
                        responses: {
                            200: {
                                description: "OK",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "string",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            };
            onChange(updatedPathItem, path);
        } else {
            // If the operation is unchecked, remove it from the pathItem
            const updatedPathItem = { ...pathItem };
            delete (updatedPathItem[path] as PI)[method];
            onChange(updatedPathItem, path);
        }
    };
    const onConfigureClick=()=>{
        rpcClient.selectQuickPickItems({
            title:"Select sections",
            items: moreOptions.map(item=>({label:item, picked: selectedOptions.includes(item)}))
        }).then(resp=>{
            if(resp){
                handleOptionChange(resp.map(item=>item.label))
            }
        })
    }
    const handlePathParamNameOutFocus = (params: Param[], name: string) => {
        const pathParamters = convertParamsToParameters(params, "path");
        const queryParams = convertParamsToParameters(queryParameters, "query");
        const headerParams = convertParamsToParameters(headerParameters, "header");
        const p = isNameNotInParams(name, pathPramFromPath) ?
            path.endsWith("/") ? `${path}{${name}}` : `${path}/{${name}}` : path;
        const clonedPathItem = { ...pathItem };
        let deletedIndex = -1;    
        let existingPathItems: string | PI | Parameter[];
        pathItem && Object.entries(pathItem).forEach(([key, value], i) => {
            if (key === path && typeof value === "object" && key !== "servers" && key !== "parameters") {
                existingPathItems = clonedPathItem[path];
                deletedIndex = i;
                delete clonedPathItem[path];
            }
        });
        // Add the new path to the pathItem to the deleted index
        pathItem && Object.keys(pathItem).forEach((_, i) => {
            if (i === deletedIndex) {
                clonedPathItem[p] = existingPathItems;
            }
        });
        const currentPathItem: Paths = clonedPathItem[p] as Paths;
        const updatedPath = {
            ...currentPathItem,
            parameters: [...pathParamters, ...queryParams, ...headerParams],
        };
        // Update the path parameters
        const updatedPathItem = {
            ...clonedPathItem,
            [p]: updatedPath,
        };
        onChange(updatedPathItem, p);
    }

    useEffect(() => {
        setDescription(currentPathItem?.description);
    }, [String(pathItem.description)]);

    return (
        <>
            <PanelBody>
                <HorizontalFieldWrapper>
                    <Typography sx={{ margin: 0, marginTop: 0, flex: 1 }} variant="h2">Path</Typography>
                    <Button tooltip='Select sections' onClick={onConfigureClick} appearance='icon'>
                        <Codicon name='gear' sx={{marginRight:"4px"}}/>
                        Configure
                    </Button>
                </HorizontalFieldWrapper>
                <TextField
                    readOnly
                    label="Path"
                    id="path"
                    sx={{ width: "100%" }}
                    value={path}
                    onTextChange={handlePathChange}
                />
                {selectedOptions.includes("Summary") && (
                    <TextField
                        label="Summary"
                        id="summary"
                        sx={{ width: "100%" }}
                        value={String(summary)}
                        onTextChange={handleSummaryChange}
                    />
                )}
                {selectedOptions.includes("Description") && (
                    <CodeTextArea
                        label="Description"
                        id="description"
                        sx={{ width: "100%" }}
                        growRange={{ start: 2, offset: 10 }}
                        value={description}
                        onChange={(e) => handleDescriptionChange(e.target.value)}
                    />
                )}
                <label>Operations</label>
                <CheckBoxGroup
                    direction="vertical"
                    columns={2}
                >
                    {httpMethods && httpMethods.map((method: string) => (
                        <CheckBox
                            label={method?.toLocaleUpperCase()}
                            value={method} checked={operations.includes(method)}
                            onChange={(isChecked: boolean) => handleOperationChange(isChecked, method)}
                            sx={{ "--foreground": getColorByMethod(method) }}
                        />
                    ))}
                </CheckBoxGroup>
                <ParamEditor
                    params={pathParameters}
                    onParamsChange={handlePathParametersChange}
                    paramNameOutFocus={handlePathParamNameOutFocus}
                    title="Path Parameters"
                    type="Path"
                />
                <ParamEditor
                    params={queryParameters}
                    onParamsChange={handleQueryParametersChange}
                    title="Query Parameters"
                    type="Query"
                />
                <ParamEditor
                    params={headerParameters}
                    onParamsChange={handleHeaderParametersChange}
                    title="Headers"
                    type="Header"
                />
            </PanelBody>
        </>
    );
}
