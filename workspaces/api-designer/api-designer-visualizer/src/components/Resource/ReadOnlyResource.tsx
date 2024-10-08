/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Button, Codicon, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { Operation } from '../../Definitions/ServiceDefinitions';
import { PanelBody } from '../Overview/Overview';
import { AccordionTable, getColorByMethod } from '@wso2-enterprise/service-designer';
import { resolveResponseType, resolveTypeFormSchema } from '../Utils/OpenAPIUtils';

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

const moreOptions = ["Summary", "Tags", "Security", "Deprecated"];

export function ReadOnlyResource(props: ReadOnlyResourceProps) {
    const { resourceOperation, method, path, onEdit } = props;

    const parameters = resourceOperation?.parameters;
    const parameterContent = parameters?.map((parameter) => {
        return [parameter.name, parameter.in, resolveTypeFormSchema(parameter.schema)];
    });
    const responses = resourceOperation?.responses;
    const responseContent = resourceOperation?.responses ? Object.entries(responses).map(([status, response]) => {
        return [status, resolveResponseType(response)];
    }) : [];

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
                {parameters && resourceOperation.parameters.length > 0 && (
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
                )}
            </PanelBody>
        </>
    )
}
