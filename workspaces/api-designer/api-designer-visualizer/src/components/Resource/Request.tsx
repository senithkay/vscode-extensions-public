/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Button, CheckBox, Codicon, FormGroup, TextArea, TextField } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { Operation, RequestBody } from '../../Definitions/ServiceDefinitions';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import React from 'react';
import { PullUpButton } from '../PullUpButton/PullUPButton';
import { BaseTypes, MediaTypes } from '../../constants';
import { MarkDownEditor } from '../MarkDownEditor/MarkDownEditor';
import { resolveTypeFromSchema } from '../Utils/OpenAPIUtils';
import { ButtonWrapper, HorizontalFieldWrapper } from '../Parameter/ParamEditor';
import { Tabs, ViewItem } from '../Tabs/Tabs';

const RequestTypeWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 10px;
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

export function Request(props: ReadOnlyResourceProps) {
    const { resourceOperation, method, path, onOperationChange } = props;
    const [selectedMediaType, setSelectedMediaType] = useState<string | undefined>(resourceOperation?.requestBody?.content ? Object.keys(resourceOperation.requestBody.content)[0] : undefined);

    const requestContents = resourceOperation?.requestBody?.content ? Object.entries(resourceOperation.requestBody.content) : [];
    const mediaTypes = requestContents ? requestContents.map(([key]) => key) : [];
    const mediaContent = requestContents ? requestContents.map(([_, value]) => value) : [];
    const selectedContentFromMediaType = resourceOperation?.requestBody?.content && selectedMediaType ? resourceOperation.requestBody.content[selectedMediaType] : undefined;
    const isInlinedObject = selectedContentFromMediaType && selectedContentFromMediaType.schema &&
        selectedContentFromMediaType.schema.type === 'object' && selectedContentFromMediaType.schema.properties &&
        Object.keys(selectedContentFromMediaType.schema.properties).length > 0;
    const schema = selectedContentFromMediaType && selectedContentFromMediaType.schema;
    const type = schema && resolveTypeFromSchema(schema);
    const isSchemaArray = schema && schema.type === "array";
    const requestContentTabViewItems: ViewItem[] = mediaTypes?.map((type: string) => {
        return {
            id: type,
            name: type, // Added the missing 'name' property
        };
    });

    const handleOptionChange = (options: string[]) => {
        const colnedMediaTypes = [...requestContents];
        let currentMediaType = selectedMediaType;
        let isItemDeleted = false;
        mediaTypes.forEach((type) => {
            // If options does not include the type, remove it from the mediaTypes
            if (!options.includes(type)) {
                colnedMediaTypes.splice(mediaTypes.indexOf(type), 1);
                currentMediaType = type;
                isItemDeleted = true;
            }
        });
        // If options does not include the type, add it to the mediaTypes and set it as selectedMediaType
        if (!isItemDeleted) {
            options.forEach((type) => {
                if (!mediaTypes.includes(type)) {
                    colnedMediaTypes.push([type, {}]);
                    currentMediaType = type;
                }
            });
        }
        if (currentMediaType) {
            setSelectedMediaType(currentMediaType);
            const newRequestBody: RequestBody = {
                ...resourceOperation.requestBody,
                content: Object.fromEntries(colnedMediaTypes)
            };
            onOperationChange(path, method, { ...resourceOperation, requestBody: newRequestBody });
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
        let clonedSchema = { ...schema };
        // If type is not a BaseType, set it as a type else delete the type
        if (BaseTypes.includes(type)) {
            clonedSchema.type = type;
            delete clonedSchema.$ref;
            delete clonedSchema.items;
        } else {
            delete clonedSchema.type;
            // If it is an array, set the type as array
            if (isSchemaArray) {
                clonedSchema.type = "array";
                clonedSchema.items = { $ref: `#/components/schemas/${type}` };
            } else {
                clonedSchema = { $ref: `#/components/schemas/${type}` };
                delete clonedSchema.type
            }
        }
        const newRequestBody: RequestBody = {
            ...resourceOperation.requestBody,
            content: {
                ...resourceOperation.requestBody.content,
                [selectedMediaType]: {
                    ...selectedContentFromMediaType,
                    schema: clonedSchema
                }
            }
        };
        onOperationChange(path, method, { ...resourceOperation, requestBody: newRequestBody });
    };
    const updateArray = () => {
        let clonedSchema = { ...schema };
        if (isSchemaArray && clonedSchema.type) {
            if (BaseTypes.includes(clonedSchema.type)) {
                clonedSchema.type = type;
            } else {
                clonedSchema = { $ref: `#/components/schemas/${type}` };
            }
            // Delete schema.items if it is an array
            delete clonedSchema.items;
        } else {
            clonedSchema.type = "array";
            if (BaseTypes.includes(type)) {
                clonedSchema.items = { type };
            } else {
                clonedSchema.items = { $ref: `#/components/schemas/${type}` };
            }
            delete clonedSchema.$ref;
        }
        const newRequestBody: RequestBody = {
            ...resourceOperation.requestBody,
            content: {
                ...resourceOperation.requestBody.content,
                [selectedMediaType]: {
                    ...selectedContentFromMediaType,
                    schema: clonedSchema
                }
            }
        };
        onOperationChange(path, method, { ...resourceOperation, requestBody: newRequestBody });
    };
    const removeType = () => {
        const newRequestBody: RequestBody = {
            ...resourceOperation.requestBody,
            content: {
                ...resourceOperation.requestBody.content,
                [selectedMediaType]: {
                    ...selectedContentFromMediaType,
                    schema: undefined
                }
            }
        };
        onOperationChange(path, method, { ...resourceOperation, requestBody: newRequestBody });
    };

    return (
        <>
            <FormGroup key="Requests" title='Requests Body' isCollapsed={requestContents.length === 0}>
                <TextArea
                    label='Description'
                    value={resourceOperation?.requestBody?.description}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                />
                <FormGroup key="Requests" title='Body' disableCollapse>
                    <PullUpButton options={MediaTypes} selectedOptions={mediaTypes} onOptionChange={handleOptionChange}>
                        <Button appearance="primary">
                            Add Content Type
                            <Codicon sx={{ marginLeft: 5, marginTop: 1 }} name="chevron-down" />
                        </Button>
                    </PullUpButton>
                    {requestContentTabViewItems.length > 0 && (
                        <Tabs
                            views={requestContentTabViewItems}
                            currentViewId={selectedMediaType}
                            onViewChange={setSelectedMediaType}
                        >
                            {requestContents.map(([key, value], index) => (
                                <div key={index} id={key}>
                                    <RequestTypeWrapper>
                                        <CheckBox checked={isInlinedObject} label="Define Inline Object" onChange={handleInlineOptionChange} />
                                        {!isInlinedObject && (
                                            <HorizontalFieldWrapper>
                                                <TextField
                                                    placeholder="Default Value"
                                                    value={type}
                                                    sx={{ width: "100%" }}
                                                    onChange={(e) => updateSchemaType(e.target.value)}
                                                />
                                                <ButtonWrapper>
                                                    <Codicon iconSx={{ background: isSchemaArray ? "var(--vscode-menu-separatorBackground)" : "none" }} name="symbol-array" onClick={() => updateArray()} />
                                                    <Codicon name="trash" onClick={() => removeType()} />
                                                </ButtonWrapper>
                                            </HorizontalFieldWrapper>
                                        )}
                                    </RequestTypeWrapper>
                                </div>
                            ))}
                        </Tabs>
                    )}
                </FormGroup>
            </FormGroup>
        </>
    )
}
