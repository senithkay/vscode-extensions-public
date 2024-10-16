/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Button, Codicon, FormGroup, TextArea, TextField } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { Header, Operation, Param, Parameter, Responses } from '../../Definitions/ServiceDefinitions';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import React from 'react';
import { PullUpButton } from '../PullUpButton/PullUPButton';
import { BaseTypes, MediaTypes, StatusCodes } from '../../constants';
import { MarkDownEditor } from '../MarkDownEditor/MarkDownEditor';
import { convertParamsToParameters, getResponseHeadersFromResponse, resolveTypeFromSchema } from '../Utils/OpenAPIUtils';
import { ButtonWrapper, HorizontalFieldWrapper, ParamEditor } from '../Parameter/ParamEditor';
import { Tabs, ViewItem } from '../Tabs/Tabs';

const ParamWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
`;

const ParamContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

interface ResponseCodeProps {
    color?: string;
    hoverBackground?: string;
    selected?: boolean;
}

export const ContentTypeWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
`;
export const ContentType = styled.div<ResponseCodeProps>`
    display: flex;
    justify-content: center;
    width: fit-content;
    gap: 20px;
    padding: 8px;
    border-radius: 4px;
    color: ${(props: ResponseCodeProps) => props.selected ? "white" : 'var(--vscode-editor-foreground)'};
    background-color: ${(props: ResponseCodeProps) => props.selected ? props.color : "none"};
    &:hover {
        background-color: ${(props: ResponseCodeProps) => props.selected ? props.color : props.hoverBackground};
        cursor: ${(props: ResponseCodeProps) => props.selected ? "default" : "pointer"};
    }
`;

const ResponseTypeWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 10px;
`;

interface MarkdownRendererProps {
    markdownContent: string;
}
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdownContent }) => {
    return <ReactMarkdown>{markdownContent}</ReactMarkdown>;
};

interface ReadOnlyResourceProps {
    method: string;
    path: string;
    resourceOperation: Operation;
    onOperationChange: (path: string, method: string, operation: Operation) => void;
}

export function Response(props: ReadOnlyResourceProps) {
    const { resourceOperation, method, path, onOperationChange } = props;
    const [selectedResponseType, setSelectedResponseType] = useState<string | undefined>(resourceOperation?.responses ? Object.keys(resourceOperation.responses)[0] : undefined);
    const [selectedMediaType, setSelectedMediaType] = useState<string | undefined>(resourceOperation?.responses && resourceOperation.responses[selectedResponseType]?.content ? Object.keys(resourceOperation.responses[selectedResponseType].content)[0] : undefined);

    const responseContents = resourceOperation?.responses && resourceOperation?.responses[selectedResponseType]?.content ? Object.entries(resourceOperation.responses[selectedResponseType].content && resourceOperation.responses[selectedResponseType].content) : [];
    const responseMediaTypes = responseContents ? responseContents.map(([key]) => key) : [];
    const selectedContentFromResponseMediaType = resourceOperation?.responses ? resourceOperation.responses[selectedResponseType] : undefined;
    const isInlinedObjectResponse = selectedContentFromResponseMediaType &&
        selectedContentFromResponseMediaType.content && selectedContentFromResponseMediaType.content[selectedMediaType] &&
        selectedContentFromResponseMediaType.content[selectedMediaType].schema &&
        selectedContentFromResponseMediaType.content[selectedMediaType].schema.type === 'object' &&
        selectedContentFromResponseMediaType.content[selectedMediaType].schema.properties &&
        Object.keys(selectedContentFromResponseMediaType.content[selectedMediaType].schema.properties).length > 0;
    const responseSchema = selectedContentFromResponseMediaType && selectedMediaType && selectedContentFromResponseMediaType?.content[selectedMediaType]?.schema;
    const responseMediaType = responseSchema && resolveTypeFromSchema(responseSchema);
    const isResponseSchemaArray = responseSchema && responseSchema.type === "array";
    const headers: Header[] = resourceOperation?.responses && resourceOperation?.responses[selectedResponseType]?.headers ? Object.values(resourceOperation?.responses[selectedResponseType]?.headers) : [];
    const headerParams = getResponseHeadersFromResponse(headers);
    const statusCodes = resourceOperation?.responses && Object.keys(resourceOperation?.responses)?.map((status) => ({ status }));
    const statusTabViewItems: ViewItem[] = statusCodes?.map((status) => ({ id: status.status, name: status.status }));
    const respMediaTypeTabViewItems: ViewItem[] = responseMediaTypes.map((type) => ({ id: type, name: type }));
    const statusCodeList: string[] = Object.entries(StatusCodes).map(([key, value]) => `${key}: ${value}`);
    const selectedStatusCode: string[] = resourceOperation?.responses && statusCodes?.map((status) => {
        const statusValue = StatusCodes[status.status as keyof typeof StatusCodes]; // Type assertion added here
        return `${status.status}: ${statusValue}`;
    });

    const handleOptionChange = (options: string[]) => {
        const colnedMediaTypes = [...responseContents];
        let currentMediaType = selectedMediaType;
        let isItemDeleted = false;
        responseMediaTypes.forEach((type) => {
            // If options does not include the type, remove it from the mediaTypes
            if (!options.includes(type)) {
                colnedMediaTypes.splice(responseMediaTypes.indexOf(type), 1);
                currentMediaType = type;
                isItemDeleted = true;
            }
        });
        // If options does not include the type, add it to the mediaTypes and set it as selectedMediaType
        if (!isItemDeleted) {
            options.forEach((type) => {
                if (!responseMediaTypes.includes(type)) {
                    if (!responseMediaTypes.includes(type)) {
                        colnedMediaTypes.push([type, {}]);
                        currentMediaType = type;
                    }
                    currentMediaType = type;
                }
            });
        }
        if (currentMediaType) {
            setSelectedMediaType(currentMediaType);
            const newResponses: Responses = {
                ...resourceOperation.responses,
                [selectedResponseType]: {
                    ...resourceOperation.responses[selectedResponseType],
                    content: {
                        ...resourceOperation.responses[selectedResponseType].content,
                        [currentMediaType]: selectedContentFromResponseMediaType.content[currentMediaType] || { schema: {} }
                    }
                }
            };
            onOperationChange(path, method, { ...resourceOperation, responses: newResponses });
        }
    };
    const handleStatusCodeChange = (status: string[]) => {
        let isItemDeleted = false;
        statusCodes?.forEach((code) => {
            const extractedCodes = status.map((status) => status.split(":")[0]);
            if (!extractedCodes.includes(code.status)) {
                // Remove the status code from the responses
                const newResponses: Responses = { ...resourceOperation.responses };
                delete newResponses[code.status];
                isItemDeleted = true;
                onOperationChange(path, method, { ...resourceOperation, responses: newResponses });
            }
        });
        if (!isItemDeleted) {
            status.forEach((code) => {
                const newCode = code.split(":")[0];
                if (!statusCodes?.map((status) => status.status).includes(newCode)) {
                    // Add the status code to the responses
                    const newResponses: Responses = {
                        ...resourceOperation.responses,
                        [newCode]: {
                            description: "",
                            content: {}
                        }
                    };
                    onOperationChange(path, method, { ...resourceOperation, responses: newResponses });
                    setSelectedResponseType(newCode);
                }
            });
        }
    };

    const handleDescriptionChange = (markdown: string) => {
        // Update the newResponseBody with Response description
        const newResponseBody: Responses = {
            ...resourceOperation.responses,
            [selectedResponseType]: {
                ...resourceOperation.responses[selectedResponseType],
                description: markdown
            }
        };
        onOperationChange(path, method, { ...resourceOperation, responses: newResponseBody });
    };
    const handleInlineOptionChange = (evt: any) => {
        // TODO: Implement inline object change
    };
    const updateSchemaType = (type: string) => {
        let clonedSchema = { ...responseSchema };
        // If type is not a BaseType, set it as a type else delete the type
        if (BaseTypes.includes(type)) {
            clonedSchema.type = type;
            delete clonedSchema.$ref;
            delete clonedSchema.items;
        } else {
            delete clonedSchema.type;
            // If it is an array, set the type as array
            if (isResponseSchemaArray) {
                clonedSchema.type = "array";
                clonedSchema.items = { $ref: `#/components/schemas/${type}` };
            } else {
                clonedSchema = { $ref: `#/components/schemas/${type}` };
                delete clonedSchema.type
            }
        }
        const newResponseBody: Responses = {
            ...resourceOperation.responses,
            [selectedResponseType]: {
                ...resourceOperation.responses[selectedResponseType],
                content: {
                    ...selectedContentFromResponseMediaType.content,
                    [selectedMediaType]: {
                        ...selectedContentFromResponseMediaType.content[selectedMediaType],
                        schema: clonedSchema
                    }
                }
            }
        };
        onOperationChange(path, method, { ...resourceOperation, responses: newResponseBody });
    };
    const updateArray = () => {
        let clonedSchema = { ...responseSchema };
        if (isResponseSchemaArray && clonedSchema.type) {
            if (BaseTypes.includes(clonedSchema.type)) {
                clonedSchema.type = responseMediaType;
            } else {
                clonedSchema = { $ref: `#/components/schemas/${responseMediaType}` };
            }
            // Delete schema.items if it is an array
            delete clonedSchema.items;
        } else {
            clonedSchema.type = "array";
            if (BaseTypes.includes(responseMediaType)) {
                clonedSchema.items = { responseType: responseMediaType };
            } else {
                clonedSchema.items = { $ref: `#/components/schemas/${responseMediaType}` };
            }
            delete clonedSchema.$ref;
        }
        const newResponseBody: Responses = {
            ...resourceOperation.responses,
            [selectedResponseType]: {
                ...resourceOperation.responses[selectedResponseType],
                content: {
                    ...selectedContentFromResponseMediaType.content,
                    [selectedMediaType]: {
                        ...selectedContentFromResponseMediaType.content[selectedMediaType],
                        schema: clonedSchema
                    }
                }
            }
        };
        onOperationChange(path, method, { ...resourceOperation, responses: newResponseBody });
    };
    const removeType = () => {
        const newResponseBody: Responses = {
            ...resourceOperation?.responses,
            [selectedResponseType]: {
                ...resourceOperation.responses[selectedResponseType],
                content: {
                    ...selectedContentFromResponseMediaType.content,
                    [selectedMediaType]: {
                        ...selectedContentFromResponseMediaType.content[selectedMediaType],
                        schema: {}
                    }
                }
            }
        };
        onOperationChange(path, method, { ...resourceOperation, responses: newResponseBody });
    };

    const handleOnHeaderParamsChange = (params: Param[]) => {
        let headerP: Parameter[] = convertParamsToParameters(params, "header");
        const headersObject: { [key: string]: Parameter } = {};
        headerP.forEach(param => {
            headersObject[param.name] = param; // Assuming 'name' is a unique identifier for headers
        });
        const newResponseBody: Responses = {
            ...resourceOperation.responses,
            [selectedResponseType]: {
                ...resourceOperation.responses[selectedResponseType],
                headers: headersObject // Use the headersObject instead of headerP
            }
        };
        onOperationChange(path, method, { ...resourceOperation, responses: newResponseBody });
    };

    // Implement useEffect to update the selectedMediaType when the responseMediaTypes changes
    useEffect(() => {
        if (!responseMediaTypes.includes(selectedMediaType)) {
            setSelectedMediaType(responseMediaTypes[0]);
        }
    }, [responseMediaTypes]);
    useEffect(() => {
        if (resourceOperation?.responses && Object.keys(resourceOperation.responses)[0]) {
            setSelectedResponseType(Object.keys(resourceOperation.responses)[0]);
        }
    }, [resourceOperation?.responses && Object.keys(resourceOperation.responses)[0]]);

    return (
        <>
            <FormGroup
                key="ResponseBody"
                title='Responses'
                isCollapsed={resourceOperation?.responses && (Object.keys(resourceOperation?.responses)?.length === 0)}
            >   
                <PullUpButton options={statusCodeList} selectedOptions={selectedStatusCode || []} onOptionChange={handleStatusCodeChange}>
                    <Button appearance="primary">
                        Add Status
                        <Codicon sx={{ marginLeft: 5, marginTop: 1 }} name="chevron-down" />
                    </Button>
                </PullUpButton>
                {statusTabViewItems?.length > 0 && (
                    <Tabs views={statusTabViewItems} currentViewId={selectedResponseType} onViewChange={setSelectedResponseType}>
                        {resourceOperation?.responses && Object.keys(resourceOperation?.responses)?.map((status) => (
                            <div id={status}>
                                <TextArea
                                    key={`responseBody-description-${path}-${method}-${status}`}
                                    value={resourceOperation?.responses[status]?.description}
                                    onTextChange={(markdown: string) => handleDescriptionChange(markdown)}
                                    sx={{ maxHeight: 200, minHeight: 100, overflowY: "auto", zIndex: 0 }}
                                />
                                <ParamEditor
                                    params={headerParams}
                                    title='Headers'
                                    addButtonText='Add Header'
                                    type="Header" disableCollapse
                                    onParamsChange={handleOnHeaderParamsChange}
                                />
                                <FormGroup key="body" title='Body' disableCollapse>
                                    <PullUpButton options={MediaTypes} selectedOptions={responseMediaTypes} onOptionChange={handleOptionChange}>
                                        <Button appearance="primary">
                                            Add Media Type
                                            <Codicon sx={{ marginLeft: 5, marginTop: 1 }} name="chevron-down" />
                                        </Button>
                                    </PullUpButton>
                                    <Tabs views={respMediaTypeTabViewItems} currentViewId={selectedMediaType} onViewChange={setSelectedMediaType}>
                                        <div id={selectedMediaType}>
                                            <ResponseTypeWrapper>
                                                {/* <CheckBox checked={isInlinedObjectResponse} label="Define Inline Object" onChange={handleInlineOptionChange} /> */}
                                                {!isInlinedObjectResponse && selectedMediaType && (
                                                    <HorizontalFieldWrapper>
                                                        <TextField
                                                            placeholder="Default Value"
                                                            value={responseMediaType}
                                                            sx={{ width: "100%" }}
                                                            onChange={(e) => updateSchemaType(e.target.value)}
                                                        />
                                                        <ButtonWrapper>
                                                            <Codicon iconSx={{ background: isResponseSchemaArray ? "var(--vscode-menu-separatorBackground)" : "none" }} name="symbol-array" onClick={() => updateArray()} />
                                                            <Codicon name="trash" onClick={() => removeType()} />
                                                        </ButtonWrapper>
                                                    </HorizontalFieldWrapper>
                                                )}
                                            </ResponseTypeWrapper>
                                        </div>
                                    </Tabs>
                                </FormGroup>
                                {/* <MarkDownEditor
                                key={`responseBody-description-${path}-${method}`}
                                value={resourceOperation?.responses[status]?.description}
                                onChange={(markdown: string) => handleDescriptionChange(markdown)}
                                sx={{ maxHeight: 200, minHeight: 100, overflowY: "auto", zIndex: 0 }}
                            /> */}
                            </div>
                        ))}
                    </Tabs>
                )}
            </FormGroup>
        </>
    )
}
