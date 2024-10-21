/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Typography } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { PathItem, Paths } from '../../Definitions/ServiceDefinitions';
import { ContentWrapper, PanelBody } from '../Overview/Overview';
import { getColorByMethod } from '@wso2-enterprise/service-designer';
import { resolveTypeFormSchema } from '../Utils/OpenAPIUtils';
import { MarkdownRenderer } from '../Resource/ReadOnlyResource';
import React from 'react';

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

interface ReadOnlyPathItemProps {
    pathItem: Paths;
    currentPath: string;
}

export function ReadOnlyPathItem(props: ReadOnlyPathItemProps) {
    const { pathItem, currentPath } = props;
    const currentPathItem = pathItem[currentPath] as PathItem | undefined;
    const summary = (currentPathItem as PathItem).summary;
    const description = (currentPathItem as PathItem).description;
    const operations: string[] = currentPathItem ? Object.keys(currentPathItem) : [];
    const filteredOperations = operations.filter((operation) => operation !== "summary" &&
        operation !== "description" && operation !== "parameters" && operation !== "servers" && 
            operation !== "tags" && operation !== "externalDocs");
    const parameters = currentPathItem && (currentPathItem as PathItem)?.parameters;
    const pathParamaters = parameters && parameters.filter((parameter) => parameter.in === "path");
    const queryParamaters = parameters && parameters.filter((parameter) => parameter.in === "query");
    const headerParamaters = parameters && parameters.filter((parameter) => parameter.in === "header");

    return (
        <>
            <PanelBody>
                <Typography sx={{ margin: 0, marginTop: 0, flex: 1 }} variant="h2">{currentPath}</Typography>
                {summary && (
                    <>
                        <Typography sx={{ margin: 0 }} variant='h3'> Summary </Typography>
                        <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body3'> {summary} </Typography>
                    </>
                )}
                {description && (
                    <>
                        <Typography sx={{ margin: 0 }} variant='h3'> Description </Typography>
                        <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body3'>
                            <MarkdownRenderer key="description" markdownContent={description} />
                        </Typography>
                    </>
                )}
                <Typography sx={{ margin: 0 }} variant='h3'> Operations </Typography>
                <PathWrapper>
                    {filteredOperations?.length > 0 && filteredOperations.map((operation) => (
                        <MethodWrapper key={operation} color={getColorByMethod(operation)}>
                            <Typography
                                variant="h3"
                                sx={{ margin: 0, padding: 4, display: "flex", justifyContent: "center", minWidth: 60 }}
                            >
                                {operation.toUpperCase()}
                            </Typography>
                        </MethodWrapper>
                    ))}
                </PathWrapper>

                {pathParamaters?.length > 0 && (<Typography sx={{ margin: 0 }} variant='h3'> Parameters </Typography>)}
                {pathParamaters?.length > 0 && (
                    <>
                        <Typography sx={{ margin: 0 }} variant='h4'> Path Parameters </Typography>
                        <ContentWrapper>
                            {pathParamaters.length > 0 && pathParamaters.map((parameter) => (
                                <ParamContainer>
                                    <ParamWrapper>
                                        <Typography sx={{ margin: 0 }} variant='body2'> {parameter.name} </Typography>
                                        <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body2'> {`${resolveTypeFormSchema(parameter.schema)} ${parameter.schema.format ? `<${parameter.schema.format}>` : ""}`} </Typography>
                                    </ParamWrapper>
                                    <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body3'> {parameter.description} </Typography>
                                </ParamContainer>
                            ))}
                        </ContentWrapper>
                    </>
                )}
                {queryParamaters?.length > 0 && (
                    <>
                        <Typography sx={{ margin: 0 }} variant='h4'> Query Parameters </Typography>
                        <ContentWrapper>
                            {queryParamaters.length > 0 && queryParamaters.map((parameter) => (
                                <ParamContainer>
                                    <ParamWrapper>
                                        <Typography sx={{ margin: 0, fontWeight: "bold" }} variant='body2'> {parameter.name} </Typography>
                                        <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body2'> {`${resolveTypeFormSchema(parameter.schema)} ${parameter.schema.format ? `<${parameter.schema.format}>` : ""}`} </Typography>
                                    </ParamWrapper>
                                    <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body3'> {parameter.description} </Typography>
                                </ParamContainer>
                            ))}
                        </ContentWrapper>
                    </>
                )}
                {headerParamaters?.length > 0 && (
                    <>
                        <Typography sx={{ margin: 0 }} variant='h4'> Header Parameters </Typography>
                        <ContentWrapper>
                            {headerParamaters.length > 0 && headerParamaters.map((parameter) => (
                                <ParamContainer>
                                    <ParamWrapper>
                                        <Typography sx={{ margin: 0, fontWeight: "bold" }} variant='body2'> {parameter.name} </Typography>
                                        <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body2'> {`${resolveTypeFormSchema(parameter.schema)} ${parameter.schema.format ? `<${parameter.schema.format}>` : ""}`} </Typography>
                                    </ParamWrapper>
                                    <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body3'> {parameter.description} </Typography>
                                </ParamContainer>
                            ))}
                        </ContentWrapper>
                    </>
                )}
                {/* {(pathParamaters?.length > 0 || queryParamaters?.length > 0 || headerParamaters?.length > 0  || !!requestMediaTypes) && <>
                    <Typography sx={{ margin: 0 }} variant='h2'> Request </Typography>
                    <ContentWrapper>
                        {pathParamaters?.length > 0 && (
                            <>
                                <Typography sx={{ margin: 0 }} variant='h4'> Path Parameters </Typography>
                                <ContentTypeWrapper>
                                    {pathParamaters.length > 0 && pathParamaters.map((parameter) => (
                                        <ParamContainer>
                                            <ParamWrapper>
                                                <Typography sx={{ margin: 0 }} variant='body2'> {parameter.name} </Typography>
                                                <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body2'> {`${resolveTypeFormSchema(parameter.schema)} ${parameter.schema.format ? `<${parameter.schema.format}>` : ""}`} </Typography>
                                            </ParamWrapper>
                                            <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body3'> {parameter.description} </Typography>
                                        </ParamContainer>
                                    ))}
                                </ContentTypeWrapper>
                            </>
                        )}
                        {queryParamaters?.length > 0 && (
                            <>
                                <Typography sx={{ margin: 0 }} variant='h4'> Query Parameters </Typography>
                                <ContentWrapper>
                                    {queryParamaters.length > 0 && queryParamaters.map((parameter) => (
                                        <ParamContainer>
                                            <

                {/* {(pathParamaters?.length > 0 || queryParamaters?.length > 0 || headerParamaters?.length > 0  || !!requestMediaTypes) && <>
                    <Typography sx={{ margin: 0 }} variant='h2'> Request </Typography>
                    <ContentWrapper>
                        {pathParamaters?.length > 0 && (
                            <>
                                <Typography sx={{ margin: 0 }} variant='h4'> Path Parameters </Typography>
                                <ContentTypeWrapper>
                                    {pathParamaters.length > 0 && pathParamaters.map((parameter) => (
                                        <ParamContainer>
                                            <ParamWrapper>
                                                <Typography sx={{ margin: 0 }} variant='body2'> {parameter.name} </Typography>
                                                <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body2'> {`${resolveTypeFormSchema(parameter.schema)} ${parameter.schema.format ? `<${parameter.schema.format}>` : ""}`} </Typography>
                                            </ParamWrapper>
                                            <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body3'> {parameter.description} </Typography>
                                        </ParamContainer>
                                    ))}
                                </ContentTypeWrapper>
                            </>
                        )}
                        {queryParamaters?.length > 0 && (
                            <>
                                <Typography sx={{ margin: 0 }} variant='h4'> Query Parameters </Typography>
                                <ContentWrapper>
                                    {queryParamaters.length > 0 && queryParamaters.map((parameter) => (
                                        <ParamContainer>
                                            <ParamWrapper>
                                                <Typography sx={{ margin: 0, fontWeight: "bold" }} variant='body2'> {parameter.name} </Typography>
                                                <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body2'> {`${resolveTypeFormSchema(parameter.schema)} ${parameter.schema.format ? `<${parameter.schema.format}>` : ""}`} </Typography>
                                            </ParamWrapper>
                                            <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body3'> {parameter.description} </Typography>
                                        </ParamContainer>
                                    ))}
                                </ContentWrapper>
                            </>
                        )}
                        {headerParamaters?.length > 0 && (
                            <>
                                <Typography sx={{ margin: 0 }} variant='h4'> Header Parameters </Typography>
                                <ContentWrapper>
                                    {headerParamaters.length > 0 && headerParamaters.map((parameter) => (
                                        <ParamContainer>
                                            <ParamWrapper>
                                                <Typography sx={{ margin: 0, fontWeight: "bold" }} variant='body2'> {parameter.name} </Typography>
                                                <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body2'> {`${resolveTypeFormSchema(parameter.schema)} ${parameter.schema.format ? `<${parameter.schema.format}>` : ""}`} </Typography>
                                            </ParamWrapper>
                                            <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body3'> {parameter.description} </Typography>
                                        </ParamContainer>
                                    ))}
                                </ContentWrapper>
                            </>
                        )} */}
                    {/* </ContentWrapper>
                </>} */}

            </PanelBody>
        </>
    )
}
