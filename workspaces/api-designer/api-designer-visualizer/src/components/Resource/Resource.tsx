/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { useEffect, useState } from 'react';
import { Dropdown, TextArea, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { Operation, Param, Parameter, Path, Responses } from '../../Definitions/ServiceDefinitions';
import { ParamEditor } from '../Parameter/ParamEditor';
import { convertParamsToParameters, getHeaderParametersFromParameters, getPathParametersFromParameters, getQueryParametersFromParameters, getResourceID } from '../Utils/OpenAPIUtils';
import { debounce } from 'lodash';
import { OptionPopup } from '../OptionPopup/OptionPopup';
import { PanelBody } from '../Overview/Overview';
import { ReadOnlyResource2 } from './ReadOnlyResource1';

const HorizontalFieldWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
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

interface OverviewProps {
    method: string;
    path: string;
    resourceOperation: Operation;
    onPathChange: (pathObject: Path) => void;
    onDelete: (path: string, method: string) => void;
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

const moreOptions = ["Summary", "Tags", "Security", "Deprecated"];

export function Resource(props: OverviewProps) {
    const { resourceOperation, method, path, onPathChange, onDelete } = props;
    const [initailPath, setInitailPath] = useState<string>(path);
    const [initialMethod, setInitialMethod] = useState<string>(method);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [isReadOnly, setIsReadOnly] = useState<boolean>(true);

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

    const debouncedHandlePathChange = debounce((value: string) => {
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
    }, 300);

    const handlePathChange = (value: string) => {
        debouncedHandlePathChange(value);
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
        setSelectedOptions(options);
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

    const handleDeleteResource = () => {
        onDelete(path, method);
    };

    useEffect(() => {
        setInitailPath(path);
        setInitialMethod(method);
    }, [path, method]);

    console.log("Path", resourceOperation.parameters);
    console.log("PathParams", values?.pathParams);

    return (
        <>
            {isReadOnly ? (
                <>
                    <ReadOnlyResource2 resourceOperation={resourceOperation} method={method} path={path} onEdit={() => setIsReadOnly(false)} />
                </>
            ) : (
                <>
                    <TitleWrapper>
                        <Typography sx={{ margin: 0 }} variant="h1">Resource Path</Typography>
                        <OptionPopup options={moreOptions} selectedOptions={selectedOptions} onOptionChange={handleOptionChange} onDeleteResource={handleDeleteResource} onSwiychToReadOnly={() => setIsReadOnly(true)} />
                    </TitleWrapper>
                    <PanelBody>
                        <HorizontalFieldWrapper>
                            <Dropdown
                                id="method"
                                containerSx={{ width: "20%", gap: 0 }}
                                dropdownContainerSx={{ gap: 0 }}
                                items={[
                                    { value: "get", content: "GET" },
                                    { value: "post", content: "POST" },
                                    { value: "put", content: "PUT" },
                                    { value: "delete", content: "DELETE" },
                                    { value: "patch", content: "PATCH" },
                                    { value: "options", content: "OPTIONS" },
                                    { value: "head", content: "HEAD" },
                                    { value: "trace", content: "TRACE" }
                                ]}
                                value={values?.method.toLowerCase()}
                                onValueChange={handleMethodChange}
                            />
                            <TextField
                                id="path"
                                sx={{ width: "80%" }}
                                autoFocus
                                onTextChange={handlePathChange}
                                value={values?.path}
                            />
                        </HorizontalFieldWrapper>
                        {selectedOptions.includes("Summary") && (
                            <TextField
                                id="summary"
                                label="Summary"
                                value={values?.summary}
                            />
                        )}
                        <TextArea
                            id="description"
                            label="Description"
                            resize="vertical"
                            rows={4}
                            value={values?.description}
                        />
                        <ParamEditor params={values?.pathParams} type="Path" onParamsChange={handleOnPathParamsChange} />
                        <ParamEditor params={values?.queryParams} type="Query" onParamsChange={handleOnQueryParamsChange} />
                        <ParamEditor params={values?.headerParams} type="Header" onParamsChange={handleOnHeaderParamsChange} />
                    </PanelBody>
                </>
            )}
        </>
    )
}
