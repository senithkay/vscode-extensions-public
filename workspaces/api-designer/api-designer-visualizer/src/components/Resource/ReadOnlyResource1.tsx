/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Button, Codicon, FormGroup, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { Operation } from '../../Definitions/ServiceDefinitions';
import { PanelBody } from '../Overview/Overview';
import { getColorByMethod } from '@wso2-enterprise/service-designer';
import { resolveResonseColor, resolveResonseHoverColor, resolveResponseType, resolveTypeFormSchema } from '../Utils/OpenAPIUtils';
import { useEffect, useState } from 'react';

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
const ResponseCode = styled.div<ResponseCodeProps>`
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
const ButtonWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
    justify-content: flex-end;
    flex-grow: 1;
`;

interface ReadOnlyResourceProps {
    method: string;
    path: string;
    resourceOperation: Operation;
    onEdit: (method: string, path: string) => void;
}

export function ReadOnlyResource2(props: ReadOnlyResourceProps) {
    const { resourceOperation, method, path, onEdit } = props;
    const [ selectedStatus, setSelectedStatus ] = useState<string | undefined>(resourceOperation?.responses ? Object.keys(resourceOperation.responses)[0] : undefined);

    const parameters = resourceOperation?.parameters;
    const parameterContent = parameters?.map((parameter) => {
        return [parameter.name, parameter.in, resolveTypeFormSchema(parameter.schema)];
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

    useEffect(() => {
        setSelectedStatus(resourceOperation?.responses ? Object.keys(resourceOperation.responses)[0] : undefined);
    }, [path, method]);

    return (
        <>
            <TitleWrapper>
                <MethodWrapper color={getColorByMethod(method)}>
                    <Typography
                        variant="h2"
                        sx={{ margin: 0, padding: 4, display: "flex", justifyContent: "center", minWidth: 60 }}
                    >
                        {method}
                    </Typography>
                </MethodWrapper>
                <Typography sx={{ margin: 0, marginTop: 4 }} variant="h2">{path}</Typography>
                <ButtonWrapper>
                    <Button sx={{ marginTop: 2 }} appearance="icon" onClick={() => onEdit(method, path)}>
                        <Codicon name="edit" />
                    </Button>
                </ButtonWrapper>
            </TitleWrapper>
            <PanelBody>
                {/* {parameters && resourceOperation.parameters.length > 0 && (
                    <AccordionTable
                        titile='Parameters'
                        content={parameterContent}
                        headers={["Name", "Kind", "Type"]}
                    />
                )}
                {responses && Object.keys(responses).length > 0 && (
                    <AccordionTable
                        titile='Responses'
                        content={responseContent}
                        headers={["Status", "Type"]}
                    />
                )} */}
                {resourceOperation.summary && ( <Typography sx={{ margin: 0 }} variant='h3'> Summary </Typography> )}
                {resourceOperation.summary && (
                    <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body2'> {resourceOperation.summary} </Typography>
                )}
                 {resourceOperation.description && ( <Typography sx={{ margin: 0 }} variant='h3'> Description </Typography> )}
                {resourceOperation.description && (
                    <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body2'> {resourceOperation.description} </Typography>
                )}
                 {resourceOperation.operationId && (<Typography sx={{ margin: 0 }} variant='h3'> Operation ID </Typography> )}
                {resourceOperation.operationId && (
                    <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body2'> {resourceOperation.operationId} </Typography>
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
                </FormGroup>

                <FormGroup key="Response" title='Response' isCollapsed={Object.keys(responses).length === 0}>
                    <ResponseCodeWrapper>
                        {responseContent.map(([status, response]) => (
                            <ResponseCode
                                key={status}
                                color={resolveResonseColor(status)}
                                hoverBackground={resolveResonseHoverColor(status)}
                                selected={selectedStatus === status}
                                onClick={() => setSelectedStatus(status)}
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
                </FormGroup>

            </PanelBody>
        </>
    )
}
