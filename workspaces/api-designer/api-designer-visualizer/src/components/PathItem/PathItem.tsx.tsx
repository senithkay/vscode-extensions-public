/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Button, CheckBox, CheckBoxGroup, Codicon, TextField, Typography } from "@wso2-enterprise/ui-toolkit";
import { PathItem as PI, Param, Paths } from "../../Definitions/ServiceDefinitions";
import { PanelBody } from "../Overview/Overview";
import { CodeTextArea } from "../CodeTextArea/CodeTextArea";
import { useEffect, useState } from "react";
import { convertParamsToParameters, getHeaderParametersFromParameters, getPathParametersFromParameters, getQueryParametersFromParameters } from "../Utils/OpenAPIUtils";
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
    const [description, setDescription] = useState<string>(String(pathItem.description));
    const currentPathItem: PI = pathItem[path] as PI;
    const pathParameters: Param[] = pathItem.parameters && getPathParametersFromParameters(Object.values(pathItem.parameters));
    const queryParameters: Param[] = pathItem.parameters && getQueryParametersFromParameters(Object.values(pathItem.parameters));
    const headerParameters: Param[] = pathItem.parameters && getHeaderParametersFromParameters(Object.values(pathItem.parameters));
    // Available operations for the path
    const operations: string[] = pathItem && pathItem[path] && Object.keys(pathItem[path]);
    let selectedOptions: string[] = [];
    if ((pathItem as Paths).summary) {
        selectedOptions.push("Summary");
    }
    if ((pathItem as Paths).description) {
        selectedOptions.push("Description");
    }
    const handleOptionChange = (options: string[]) => {
        if (options.includes("Summary")) {
            const updatedPathItem = {
                ...pathItem,
                [path]: {
                    ...currentPathItem,
                    summary: "",
                },
            };
            onChange(updatedPathItem, path);
        } else {
            // Delete summary from the pathItem
            const updatedPathItem = { ...pathItem };
            delete (updatedPathItem[path] as PI).summary;
        }
        if (options.includes("Description")) {
            const updatedPathItem = {
                ...pathItem,
                [path]: {
                    ...currentPathItem,
                    description: "",
                },
            };
            onChange(updatedPathItem, path);
        } else {
            // Delete description from the pathItem
            const updatedPathItem = { ...pathItem };
            delete (updatedPathItem[path] as PI).description;
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
        const updatedPathItem: Paths = { 
            ...pathItem, 
            summary: summary,
         };
        onChange(updatedPathItem);
    };
    const handleDescriptionChange = (description: string) => {
        setDescription(description);
        const updatedPathItem = {
            ...pathItem,
            description: description,
        };
        onChange(updatedPathItem);
    };
    const handlePathParametersChange = (params: Param[]) => {
        const updatedPathItem = {
            ...pathItem,
            parameters: convertParamsToParameters(params, "path"),
        };
        onChange(updatedPathItem, path);
    };
    const handleQueryParametersChange = (params: Param[]) => {
        const updatedPathItem = {
            ...pathItem,
            parameters: convertParamsToParameters(params, "query"),
        };
        onChange(updatedPathItem, path);
    };
    const handleHeaderParametersChange = (params: Param[]) => {
        const updatedPathItem = {
            ...pathItem,
            parameters: convertParamsToParameters(params, "header"),
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

    useEffect(() => {
        setDescription(String(pathItem.description));
    }, [String(pathItem.description)]);

    return (
        <>
            <PanelBody>
                <HorizontalFieldWrapper>
                    <Typography sx={{ margin: 0, marginTop: 0, flex: 1 }} variant="h2">Path Item</Typography>
                    <Button tooltip='Select sections' onClick={onConfigureClick} appearance='icon'>
                        <Codicon name='gear' sx={{marginRight:"4px"}}/>
                        Configure
                    </Button>
                </HorizontalFieldWrapper>
                <TextField 
                    label="Path"
                    id="path"
                    sx={{ width: "100%" }}
                    value={path}
                    forceAutoFocus
                    onTextChange={handlePathChange}
                />
                {selectedOptions.includes("Summary") && (
                    <TextField
                        label="Summary"
                        id="summary"
                        sx={{ width: "100%" }}
                        value={String(pathItem?.summary)}
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
