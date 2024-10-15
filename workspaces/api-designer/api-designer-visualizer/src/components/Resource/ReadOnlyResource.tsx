/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { FormGroup, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { Operation } from '../../Definitions/ServiceDefinitions';
import { PanelBody } from '../Overview/Overview';
import { getColorByMethod } from '@wso2-enterprise/service-designer';
import { resolveResonseColor, resolveResonseHoverColor, resolveResponseType, resolveTypeFormSchema } from '../Utils/OpenAPIUtils';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ContentType, ContentTypeWrapper } from './Response';

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

const ResponseCodeWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
`;
export const ResponseCode = styled.div<ResponseCodeProps>`
    display: flex;
    justify-content: center;
    width: 55px;
    gap: 20px;
    padding: 8px;
    border-radius: 4px;
    color: ${(props: ResponseCodeProps) => props.selected ? "white" : props.color};
    background-color: ${(props: ResponseCodeProps) => props.selected ? props.color : "none"};
    &:hover {
        background-color: ${(props: ResponseCodeProps) => props.selected ? props.color : props.hoverBackground};
        cursor: ${(props: ResponseCodeProps) => props.selected ? "default" : "pointer"};
    }
`;

interface MethodWrapperProps {
    color: string;
}
const MethodWrapper = styled.div<MethodWrapperProps>`
    display: flex;
    width: fit-content;
    color: white;
    background-color: ${(props: MethodWrapperProps) => props.color};
`;
const PathWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
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
}

export function ReadOnlyResource(props: ReadOnlyResourceProps) {
    const { resourceOperation, method, path } = props;
    const [ selectedStatus, setSelectedStatus ] = useState<string | undefined>(resourceOperation?.responses ? Object.keys(resourceOperation.responses)[0] : undefined);
    const [ selectedResposeMediaType, setSelectedResposeMediaType ] = useState<string | undefined>(
        (resourceOperation?.responses && resourceOperation.responses[selectedStatus]?.content) ? 
            Object.keys(resourceOperation.responses[selectedStatus].content)[0] : undefined
    );
    const [ selectedRequestMediaType, setSelectedRequestMediaType ] = useState<string | undefined>(
        (resourceOperation?.requestBody && resourceOperation.requestBody.content) ? 
            Object.keys(resourceOperation.requestBody.content)[0] : undefined
    );

    const parameters = resourceOperation?.parameters;
    const parameterContent = parameters?.map((parameter) => {
        if (parameter.name) {
            return [parameter.name, parameter.in, parameter.schema && resolveTypeFormSchema(parameter.schema)];
        }
    });
    const responses = resourceOperation?.responses;
    const queryParamaters = parameters?.filter((parameter) => parameter.in === "query");
    const pathParamaters = parameters?.filter((parameter) => parameter.in === "path");
    const headerParamaters = parameters?.filter((parameter) => parameter.in === "header");
    const responseContent = resourceOperation?.responses ? Object.entries(responses).map(([status, response]) => {
        return [status, resolveResponseType(response)];
    }) : [];
    const selectedResponse = responses ? responses[selectedStatus] : undefined;
    const selectedResponseHeaders = selectedResponse?.headers;
    const responseMediaTypes = selectedResponse?.content && Object.keys(selectedResponse.content);
    const responseBody = selectedResponse?.content && selectedResponse?.content[selectedResposeMediaType];
    const requestMediaTypes = resourceOperation?.requestBody?.content && Object.keys(resourceOperation.requestBody.content);
    const requestBody = resourceOperation?.requestBody?.content && resourceOperation.requestBody.content[selectedRequestMediaType];

    const handleResponseCodeChange = (status: string) => {
        setSelectedStatus(status);
        if (responses && responses[status]?.content) {
            setSelectedResposeMediaType(Object.keys(responses[status].content)[0]);
        }
    };

    useEffect(() => {
        setSelectedStatus(resourceOperation?.responses ? Object.keys(resourceOperation.responses)[0] : undefined);
    }, [path, method]);

    return (
        <>
            <PanelBody>
                <PathWrapper>
                <MethodWrapper color={getColorByMethod(method)}>
                        <Typography
                            variant="h2"
                            sx={{ margin: 0, padding: 4, display: "flex", justifyContent: "center", minWidth: 60 }}
                        >
                            {method.toUpperCase()}
                        </Typography>
                    </MethodWrapper>
                    <Typography sx={{ margin: 0, marginTop: 4 }} variant="h2">{path}</Typography>
                </PathWrapper>
                {resourceOperation.summary && (
                    <>
                        <Typography sx={{ margin: 0 }} variant='h3'> Summary </Typography>
                        <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body2'> {resourceOperation.summary} </Typography>
                    </>
                )}
                {resourceOperation.description && (
                    <>
                        <Typography sx={{ margin: 0 }} variant='h3'> Description </Typography>
                        <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body2'>
                            <MarkdownRenderer key="description" markdownContent={resourceOperation.description} /> 
                        </Typography>
                    </>
                )}
                {resourceOperation.operationId && (
                    <>
                        <Typography sx={{ margin: 0 }} variant='h3'> Operation ID </Typography>
                        <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body2'> {resourceOperation.operationId} </Typography>
                    </>
                )}

                <FormGroup key="Request" title='Request' isCollapsed={pathParamaters?.length === 0 && queryParamaters?.length === 0 && headerParamaters?.length === 0}>
                    {pathParamaters?.length > 0 && (
                        <FormGroup key="Path Parameters" title='Path Parameters' isCollapsed={pathParamaters.length === 0}>
                            {pathParamaters.length > 0 && pathParamaters.map((parameter) => (
                                <ParamContainer>
                                    <ParamWrapper>
                                        <Typography sx={{ margin: 0, fontWeight: "bold" }} variant='body1'> {parameter.name} </Typography>
                                        <Typography sx={{ margin: `2px 0 0 0`, fontWeight: "lighter" }} variant='body2'> {`${resolveTypeFormSchema(parameter.schema)} ${parameter.schema.format ? `<${parameter.schema.format}>` : ""}`} </Typography>
                                    </ParamWrapper>
                                    <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body2'> {parameter.description} </Typography>
                                </ParamContainer>
                            ))}
                        </FormGroup>
                    )}
                    {queryParamaters?.length > 0 && (
                        <FormGroup key="Query Parameters" title='Query Parameters' isCollapsed={queryParamaters?.length === 0}>
                            {queryParamaters.length > 0 && queryParamaters.map((parameter) => (
                                <ParamContainer>
                                    <ParamWrapper>
                                        <Typography sx={{ margin: 0, fontWeight: "bold" }} variant='body1'> {parameter.name} </Typography>
                                        <Typography sx={{ margin: `2px 0 0 0`, fontWeight: "lighter" }} variant='body2'> {`${resolveTypeFormSchema(parameter.schema)} ${parameter.schema.format ? `<${parameter.schema.format}>` : ""}`} </Typography>
                                    </ParamWrapper>
                                    <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body2'> {parameter.description} </Typography>
                                </ParamContainer>
                            ))}
                        </FormGroup>
                    )}
                    {headerParamaters?.length > 0 && (
                        <FormGroup key="Header Parameters" title='Header Parameters' isCollapsed={headerParamaters?.length === 0}>
                            {headerParamaters.length > 0 && headerParamaters.map((parameter) => (
                                <ParamContainer>
                                    <ParamWrapper>
                                        <Typography sx={{ margin: 0, fontWeight: "bold" }} variant='body1'> {parameter.name} </Typography>
                                        <Typography sx={{ margin: `2px 0 0 0`, fontWeight: "lighter" }} variant='body2'> {`${resolveTypeFormSchema(parameter.schema)} ${parameter.schema.format ? `<${parameter.schema.format}>` : ""}`} </Typography>
                                    </ParamWrapper>
                                    <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body2'> {parameter.description} </Typography>
                                </ParamContainer>
                            ))}
                        </FormGroup>
                    )}
                    {requestMediaTypes && (
                        <FormGroup key="Request Body" title='Body' isCollapsed={!requestBody}>
                            <ContentTypeWrapper>
                                {requestMediaTypes.map((type: string) => (
                                    <ContentType
                                        key={type}
                                        color={'var(--vscode-symbolIcon-variableForeground)'}
                                        hoverBackground={'var(--vscode-minimap-selectionHighlight)'}
                                        selected={selectedRequestMediaType === type}
                                        onClick={() => setSelectedRequestMediaType(type)}
                                    >
                                        {type}
                                    </ContentType>
                                ))}
                            </ContentTypeWrapper>
                            <Typography 
                                sx={{ margin: 0, fontWeight: "lighter" }}
                                variant='body2'> {
                                    requestBody?.schema?.type === "array" ? 
                                    (requestBody?.schema?.items?.type === "object" ? 
                                        requestBody?.schema?.items?.$ref?.replace("#/components/schemas/", "") : 
                                        requestBody?.schema?.items?.type 
                                    ) : (requestBody?.schema?.type ? 
                                    requestBody?.schema?.type : (requestBody?.schema?.$ref)?.replace("#/components/schemas/", ""))
                                }
                            </Typography>
                        </FormGroup>
                    )}
                </FormGroup>

                <FormGroup key="Response" title='Response' isCollapsed={responseContent.length === 0}>
                    <ResponseCodeWrapper>
                        {responseContent.map(([status, response]) => (
                            <ResponseCode
                                key={status}
                                color={resolveResonseColor(status)}
                                hoverBackground={resolveResonseHoverColor(status)}
                                selected={selectedStatus === status}
                                onClick={() => handleResponseCodeChange(status)}
                            >
                                {status} 
                            </ResponseCode>
                        ))}
                    </ResponseCodeWrapper>
                    {selectedResponse?.description && (
                        <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body2'> {selectedResponse.description} </Typography>
                    )}
                    {selectedResponseHeaders && Object.keys(selectedResponseHeaders).length > 0 && (
                        <FormGroup key="Headers" title='Headers' isCollapsed={!selectedResponseHeaders || Object.keys(selectedResponseHeaders).length === 0}>
                            {Object.entries(selectedResponseHeaders).map(([header, schema]) => (
                                <ParamContainer>
                                    <ParamWrapper>
                                        <Typography sx={{ margin: 0, fontWeight: "bold" }} variant='body1'> {header} </Typography>
                                        <Typography 
                                            sx={{ margin: `2px 0 0 0`, fontWeight: "lighter" }}
                                            variant='body2'> {`${resolveTypeFormSchema(schema.schema)} ${schema.schema.format ? `<${schema.schema.format}>` : ""}`} 
                                        </Typography>
                                    </ParamWrapper>
                                    <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body2'> {schema.description} </Typography>
                                </ParamContainer>
                            ))}
                        </FormGroup>
                    )}
                    {responseMediaTypes && (
                        <FormGroup key="Response Body" title='Body' isCollapsed={!responseBody}>
                            <ContentTypeWrapper>
                                {responseMediaTypes.map((type: string) => (
                                    <ContentType
                                        key={type}
                                        color={'var(--vscode-symbolIcon-variableForeground)'}
                                        hoverBackground={'var(--vscode-minimap-selectionHighlight)'}
                                        selected={selectedResposeMediaType === type}
                                        onClick={() => setSelectedResposeMediaType(type)}
                                    >
                                        {type}
                                    </ContentType>
                                ))}
                            </ContentTypeWrapper>
                            <Typography 
                                sx={{ margin: 0, fontWeight: "lighter" }}
                                variant='body2'> {
                                    requestBody?.schema?.type === "array" ? 
                                    (requestBody?.schema?.items?.type === "object" ? 
                                        requestBody?.schema?.items?.$ref?.replace("#/components/schemas/", "") : 
                                        requestBody?.schema?.items?.type 
                                    ) : (requestBody?.schema?.type ? 
                                    requestBody?.schema?.type : (requestBody?.schema?.$ref)?.replace("#/components/schemas/", ""))
                                }
                            </Typography>
                        </FormGroup>
                    )}
                </FormGroup>

            </PanelBody>
        </>
    )
}
