/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { TextField } from "@wso2-enterprise/ui-toolkit";
import { PathItem as PI, Param, Paths } from "../../Definitions/ServiceDefinitions";
import { PanelBody } from "../Overview/Overview";
import { CodeTextArea } from "../CodeTextArea/CodeTextArea";
import { useEffect, useState } from "react";
import { convertParamsToParameters, getHeaderParametersFromParameters, getPathParametersFromParameters, getQueryParametersFromParameters } from "../Utils/OpenAPIUtils";
import { ParamEditor } from "../Parameter/ParamEditor";

interface MakrDownEditorProps {
    pathItem: Paths;
    path: string;
    onChange: (value: Paths, path?: string) => void;
    sx?: any;
}

export function PathItem(props: MakrDownEditorProps) {
    const { pathItem, path, onChange, sx } = props;
    const [description, setDescription] = useState<string>(String(pathItem.description));
    const currentPathItem: PI = pathItem[path] as PI;
    const pathParameters: Param[] = pathItem.parameters && getPathParametersFromParameters(Object.values(pathItem.parameters));
    const queryParameters: Param[] = pathItem.parameters && getQueryParametersFromParameters(Object.values(pathItem.parameters));
    const headerParameters: Param[] = pathItem.parameters && getHeaderParametersFromParameters(Object.values(pathItem.parameters));
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

    useEffect(() => {
        setDescription(String(pathItem.description));
    }, [String(pathItem.description)]);

    return (
        <>
            <PanelBody>
                <TextField 
                    label="Path"
                    id="path"
                    sx={{ width: "100%" }}
                    value={path}
                    onTextChange={handlePathChange}
                />
                <TextField
                    label="Summary"
                    id="summary"
                    sx={{ width: "100%" }}
                    value={String(pathItem?.summary)}
                    onTextChange={handleSummaryChange}
                />
                <CodeTextArea
                    label="Description"
                    id="description"
                    sx={{ width: "100%" }}
                    growRange={{ start: 2, offset: 10 }}
                    value={description}
                    onTextChange={handleDescriptionChange}
                />
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
