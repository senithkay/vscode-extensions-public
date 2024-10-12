/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Button, CheckBox, Codicon, FormGroup, TextField } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { Header, Operation, Param, Parameter, RequestBody, Responses } from '../../Definitions/ServiceDefinitions';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import React from 'react';
import { PullUpButton } from '../PullUpButton/PullUPButton';
import { BaseTypes, MediaTypes } from '../../constants';
import { MarkDownEditor } from '../MarkDownEditor/MarkDownEditor';
import { convertParamsToParameters, getResponseHeadersFromResponse, resolveResonseColor, resolveResonseHoverColor, resolveTypeFromSchema } from '../Utils/OpenAPIUtils';
import { ButtonWrapper, HorizontalFieldWrapper, ParamEditor } from '../Parameter/ParamEditor';
import { ResponseCode } from './ReadOnlyResource';

const TitleWrapper = styled.div`
    display: flex;
    flex-direction: row;
    padding: 16px;
    border-bottom: 1px solid var(--vscode-panel-border);
    font: inherit;
    font-weight: bold;
    gap: 20px;
    color: var(--vscode-editor-foreground);
`;

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

const ContentTypeWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
`;
const ContentType = styled.div<ResponseCodeProps>`
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

interface MethodWrapperProps {
    color: string;
}
const DescriptionWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
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

    const responseContents = resourceOperation?.responses[selectedResponseType]?.content ? Object.entries(resourceOperation.responses[selectedResponseType].content && resourceOperation.responses[selectedResponseType].content) : [];
    const responseMediaTypes = responseContents ? responseContents.map(([key]) => key) : [];
    const selectedContentFromResponseMediaType = resourceOperation?.responses ? resourceOperation.responses[selectedResponseType] : undefined;
    const isInlinedObjectResponse = selectedContentFromResponseMediaType && 
        selectedContentFromResponseMediaType.content && selectedContentFromResponseMediaType.content[selectedMediaType] &&
        selectedContentFromResponseMediaType.content[selectedMediaType].schema && 
        selectedContentFromResponseMediaType.content[selectedMediaType].schema.type === 'object' && 
        selectedContentFromResponseMediaType.content[selectedMediaType].schema.properties && 
        Object.keys(selectedContentFromResponseMediaType.content[selectedMediaType].schema.properties).length > 0;
    const responseSchema = selectedContentFromResponseMediaType && selectedMediaType && selectedContentFromResponseMediaType.content[selectedMediaType]?.schema;
    const responseMediaType = responseSchema && resolveTypeFromSchema(responseSchema);
    const isResponseSchemaArray = responseSchema && responseSchema.type === "array";
    const headers: Header[] = resourceOperation?.responses[selectedResponseType]?.headers ? Object.values(resourceOperation?.responses[selectedResponseType]?.headers) : [];
    const headerParams = getResponseHeadersFromResponse(headers);

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
                        [currentMediaType]: selectedContentFromResponseMediaType.content[currentMediaType]
                    }
                }
            };
            onOperationChange(path, method, { ...resourceOperation, responses: newResponses });
        }
    };
    const handleDescriptionChange = (markdown: string) => {
        const newRequestBody: RequestBody = {
            ...resourceOperation.requestBody,
            description: markdown
        };
        onOperationChange(path, method, { ...resourceOperation, requestBody: newRequestBody });
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

    return (
        <>
            <FormGroup
                key="ResponseBody"
                title='Response Body'
                isCollapsed={(Object.keys(resourceOperation?.responses).length === 0)}
            >
                <ContentTypeWrapper>
                    {Object.keys(resourceOperation.responses).map((status) => (
                        <ResponseCode
                            key={status}
                            color={resolveResonseColor(status)}
                            hoverBackground={resolveResonseHoverColor(status)}
                            selected={selectedResponseType === status}
                            onClick={() => setSelectedResponseType(status)}
                        >
                            {status} 
                        </ResponseCode>
                    ))}
                </ContentTypeWrapper>
                <DescriptionWrapper>
                    <label htmlFor="description">Description</label>
                    <MarkDownEditor
                        key={`responseBody-description-${path}-${method}`}
                        value={resourceOperation.responses.selectedMediaType?.description}
                        onChange={(markdown: string) => handleDescriptionChange(markdown)}
                        sx={{ maxHeight: 200, minHeight: 100, overflowY: "auto", zIndex: 0 }}
                    />
                </DescriptionWrapper>
                <FormGroup key="body" title='Headers' isCollapsed={Object.keys(headers).length === 0}>
                    <ParamEditor params={headerParams} type="Header" onParamsChange={handleOnHeaderParamsChange} />
                </FormGroup>
                <FormGroup key="body" title='Body' isCollapsed={responseMediaTypes?.length === 0}>
                    <PullUpButton options={MediaTypes} selectedOptions={responseMediaTypes} onOptionChange={handleOptionChange}>
                        <Button appearance="primary">
                            More Options
                            <Codicon sx={{ marginLeft: 5, marginTop: 1 }} name="chevron-down" />
                        </Button>
                    </PullUpButton>
                    <ContentTypeWrapper>
                        {responseMediaTypes.map((type: string) => (
                            <ContentType
                                key={type}
                                color={'var(--vscode-symbolIcon-variableForeground)'}
                                hoverBackground={'var(--vscode-minimap-selectionHighlight)'}
                                selected={selectedMediaType === type}
                                onClick={() => setSelectedMediaType(type)}
                            >
                                {type}
                            </ContentType>
                        ))}
                    </ContentTypeWrapper>
                    <CheckBox checked={isInlinedObjectResponse} label="Define Inline Object" onChange={handleInlineOptionChange} />
                    {!isInlinedObjectResponse && (
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
                </FormGroup>
            </FormGroup>
        </>
    )
}
