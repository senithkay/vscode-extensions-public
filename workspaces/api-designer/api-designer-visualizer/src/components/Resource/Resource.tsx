/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { useEffect, useState } from 'react';
import { Button, Codicon, Dropdown, OptionProps, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { OpenAPI, Operation, Param, Parameter, Path, Responses } from '../../Definitions/ServiceDefinitions';
import { ParamEditor } from '../Parameter/ParamEditor';
import {
    convertParamsToParameters,
    getHeaderParametersFromParameters,
    getPathParametersFromParameters,
    getQueryParametersFromParameters
} from '../Utils/OpenAPIUtils';
import { ContentWrapper, PanelBody, SubSectionWrapper } from '../Overview/Overview';
import { Request } from './Request';
import { Response } from './Response';
import { CodeTextArea } from '../CodeTextArea/CodeTextArea';
import ResourceHeader from './ResourceHeader';
import { useVisualizerContext } from '@wso2-enterprise/api-designer-rpc-client';

const HorizontalFieldWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
`;

const DescriptionWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

interface ResourceProps {
    method: string;
    path: string;
    resourceOperation: Operation;
    openAPI: OpenAPI;
    onPathChange: (pathObject: Path) => void;
    onOperationChange: (path: string, method: string, operation: Operation) => void;
}

type InputsFields = {
    method: string;
    path: string;
    summary: string;
    description: string;
    queryParams: Param[];
    pathParams: Param[];
    headerParams: Param[];
    responses: Responses;
};
const moreOptions = ["Summary", "Description", "OperationId"];

export function Resource(props: ResourceProps) {
    const { resourceOperation, openAPI, method, path, onPathChange, onOperationChange } = props;
    const [initailPath, setInitailPath] = useState<string>(path);
    const [initialMethod, setInitialMethod] = useState<string>(method);
    const { rpcClient } = useVisualizerContext();
    let selOpt: string[] = [];
    if (resourceOperation.summary || resourceOperation.summary === "") {
        selOpt.push("Summary");
    }
    if (resourceOperation.description || resourceOperation.description === "") {
        selOpt.push("Description");
    }
    if (resourceOperation.operationId || resourceOperation.operationId === "") {
        selOpt.push("OperationId");
    }
    const [defaultOptions, setDefaultOptions] = useState<string[]>(selOpt);

    const values: InputsFields = {
        method: method.toUpperCase(),
        path: path,
        summary: resourceOperation.summary,
        description: resourceOperation.description,
        queryParams: getQueryParametersFromParameters(resourceOperation.parameters),
        pathParams: getPathParametersFromParameters(resourceOperation.parameters),
        headerParams: getHeaderParametersFromParameters(resourceOperation.parameters),
        responses: resourceOperation.responses
    };

    const handleOnQueryParamsChange = (params: Param[]) => {
        let p: Parameter[] = convertParamsToParameters(values.pathParams, "path");
        if (params) {
            p = p.concat(convertParamsToParameters(params, "query"));
        }
        if (values?.headerParams) {
            p = p.concat(convertParamsToParameters(values?.headerParams, "header"));
        }
        const currentPath = getPath();
        const newPath = {
            ...currentPath,
            initialOperation: {
                ...currentPath.initialOperation,
                parameters: p
            }
        };
        onPathChange(newPath);
    };

    const handleOnPathParamsChange = (params: Param[]) => {
        const pathParams = params.map((param) => {
            return `{${param.name}}`;
        }).join("/");
        const path = values.path;
        let containsInitialSlash = path.startsWith("/");
        const initialSlashRemovedPath =
            path.startsWith("/") ? path.substring(1) : path;
        const pathParamSanitizedPath = initialSlashRemovedPath.split("/")[0];
        let p: Parameter[] = convertParamsToParameters(params, "path");
        if (values?.queryParams) {
            p = p.concat(convertParamsToParameters(values?.queryParams, "query"));
        }
        if (values?.headerParams) {
            p = p.concat(convertParamsToParameters(values?.headerParams, "header"));
        }
        const currentPath = getPath();
        const newPath = {
            ...currentPath,
            path: `${containsInitialSlash ? "/" : ""}${pathParamSanitizedPath}/${pathParams}`,
            initialOperation: {
                ...currentPath.initialOperation,
                parameters: p,
            }
        };
        onPathChange(newPath);
    };

    const handleOnHeaderParamsChange = (params: Param[]) => {
        let p: Parameter[] = convertParamsToParameters(values.pathParams, "path");
        if (values?.queryParams) {
            p = p.concat(convertParamsToParameters(values.queryParams, "query"));
        }
        if (params) {
            p = p.concat(convertParamsToParameters(params, "header"));
        }
        const currentPath = getPath();
        const newPath = {
            ...currentPath,
            initialOperation: {
                ...currentPath.initialOperation,
                parameters: p
            }
        };
        onPathChange(newPath);
    };

    const handlePathChange = (value: string) => {
        const pathParams = value.split('/').filter((part: string) => part.startsWith('{') && part.endsWith('}')).map((part: string) => part.substring(1, part.length - 1));
        const modifiedPathParams = pathParams.map((paramName: string) => ({ name: paramName, type: "", defaultValue: "", isArray: false, isRequired: false }));
        let p: Parameter[] = convertParamsToParameters(modifiedPathParams, "path");
        if (values?.queryParams) {
            p = p.concat(convertParamsToParameters(values?.queryParams, "query"));
        }
        if (values?.headerParams) {
            p = p.concat(convertParamsToParameters(values?.headerParams, "header"));
        }
        const currentPath = getPath();
        const newPath = {
            ...currentPath,
            path: value,
            initialOperation: {
                ...currentPath.initialOperation,
                parameters: p
            }
        };
        onPathChange(newPath);
    };

    const handleMethodChange = (value: string) => {
        const currentPath = getPath();
        const newPath = {
            ...currentPath,
            method: value
        }
        onPathChange(newPath);
    };

    const handleOptionChange = (options: string[]) => {
        let operation = resourceOperation;
        if (!options.includes("Summary") && defaultOptions.includes("Summary")) {
            operation = { ...operation, summary: "" };
        } else if (!options.includes("Summary") && !defaultOptions.includes("Summary")) {
            delete operation.summary;
        }
        if (!options.includes("Description") && defaultOptions.includes("Description")) {
            operation = { ...operation, description: "" };
        } else if (!options.includes("Description") && !defaultOptions.includes("Description")) {
            delete operation.description;
        }
        if (!options.includes("OperationId") && defaultOptions.includes("OperationId")) {
            operation = { ...operation, operationId: "" };
        } else if (!options.includes("OperationId") && !defaultOptions.includes("OperationId")) {
            delete operation.operationId;
        }
        onOperationChange(path, method, operation);
        setDefaultOptions(options);
    };

    // Method to get Form values
    const getPath = (): Path => {
        const { method, path, summary, description, queryParams, pathParams, headerParams, responses } = values;
        let params: Parameter[] = [];
        if (queryParams) {
            params = convertParamsToParameters(queryParams, "query");
        }
        if (pathParams) {
            params = params.concat(convertParamsToParameters(pathParams, "path"));
        }
        if (headerParams) {
            params = params.concat(convertParamsToParameters(headerParams, "header"));
        }
        const operation: Operation = {
            summary: summary,
            description: description,
            parameters: params,
            responses: responses
        };
        const pathObject: Path = {
            method: method.toLowerCase(),
            path: path,
            initialOperation: operation,
            initialMethod: initialMethod,
            initialPath: initailPath
        };
        return pathObject;
    };

    const handleSummaryChange = (value: string) => {
        const newOperation = {
            ...resourceOperation,
            summary: value
        };
        onOperationChange(path, method, newOperation);
    };

    const handleDescriptionChange = (value: string) => {
        const newOperation = {
            ...resourceOperation,
            description: value
        };
        onOperationChange(path, method, newOperation);
    };

    const handleOperationIdChange = (value: string) => {
        const newOperation = {
            ...resourceOperation,
            operationId: value
        };
        onOperationChange(path, method, newOperation);
    };

    // Dropdown items which are not in openAPI
    const availableItems: OptionProps[] = [];
    openAPI.paths[path] && Object.keys(openAPI.paths[path]).forEach((m) => {
        if (m !== method) {
            availableItems.push({ value: m, content: m.toUpperCase() });
        }
    });
    const dropDownItems: OptionProps[] = [
        { value: "get", content: "GET" },
        { value: "post", content: "POST" },
        { value: "put", content: "PUT" },
        { value: "delete", content: "DELETE" },
        { value: "patch", content: "PATCH" },
        { value: "options", content: "OPTIONS" },
        { value: "head", content: "HEAD" }
    ].filter((item) => !availableItems.find((availableItem) => availableItem.value === item.value));

    useEffect(() => {
        setInitailPath(path);
        setInitialMethod(method);
    }, [path, method]);

    const onConfigureClick=()=>{
        rpcClient.selectQuickPickItems({
            title:"Select sections",
            items: moreOptions.map(item=>({label:item, picked: defaultOptions.includes(item)}))
        }).then(resp=>{
            if(resp){
                handleOptionChange(resp.map(item=>item.label))
            }
        })
    }

    return (
        <>
            <PanelBody>
                <ResourceHeader 
                    method={method} 
                    path={path} 
                    actionButtons={
                        <Button tooltip='Select sections' onClick={onConfigureClick} appearance='icon'>
                            <Codicon name='gear' sx={{marginRight:"4px"}}/> Configure
                        </Button>
                    }
                />
                {
                    defaultOptions.includes("Summary") && (
                        <TextField
                            id="summary"
                            label="Summary"
                            value={values?.summary}
                            onTextChange={handleSummaryChange}
                        />
                    )
                }
                {
                    defaultOptions.includes("Description") && (
                        <DescriptionWrapper>
                            <CodeTextArea
                                id="description"
                                label='Decription'
                                value={values?.description}
                                onChange={(evt) => handleDescriptionChange(evt.target.value)}
                                resize="vertical"
                                growRange={{ start: 5, offset: 10 }}
                            />
                        </DescriptionWrapper>
                    )
                }
                {
                    defaultOptions.includes("OperationId") && (
                        <TextField
                            id="operationId"
                            label="Operation ID"
                            value={resourceOperation.operationId}
                            onTextChange={handleOperationIdChange}
                        />
                    )
                }
                <SubSectionWrapper>
                    <ParamEditor title="Path Parameters" params={values?.pathParams} type="Path" onParamsChange={handleOnPathParamsChange} />
                </SubSectionWrapper>
                <SubSectionWrapper>
                    <ParamEditor title="Query Parameters" params={values?.queryParams} type="Query" onParamsChange={handleOnQueryParamsChange} />
                </SubSectionWrapper>
                <SubSectionWrapper>
                    <ParamEditor title="Header Parameters" params={values?.headerParams} type="Header" onParamsChange={handleOnHeaderParamsChange} />
                </SubSectionWrapper>
                {method !== "get" && 
                    <Request resourceOperation={resourceOperation} method={method} path={path} onOperationChange={onOperationChange} />
                }
                <Response resourceOperation={resourceOperation} method={method} path={path} onOperationChange={onOperationChange} />
            </PanelBody >
        </>
    )
}
