/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Button, Codicon, Confirm, Icon } from '@wso2-enterprise/ui-toolkit';
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { AccordionTable } from '../AccordionTable/AccordionTable';
import { Resource } from '../../definitions';

type MethodProp = {
    color: string;
    hasLeftMargin?: boolean;
};

type ContainerProps = {
    borderColor?: string;
};

type ButtonSectionProps = {
    isExpanded?: boolean;
};

const AccordionContainer = styled.div<ContainerProps>`
    margin-top: 10px;
    overflow: hidden;
    background-color: var(--vscode-editorHoverWidget-background);
    &:hover {
        background-color: var(--vscode-list-hoverBackground);
        cursor: pointer;
    }
`;

const AccordionHeader = styled.div`
    padding: 10px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ButtonWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    font-size: 10px;
    width: 40px;
`;

const MethodBox = styled.div<MethodProp>`
    display: flex;
    justify-content: center;
    height: 25px;
    width: 70px;
    margin-left: ${(p: MethodProp) => p.hasLeftMargin ? "10px" : "0px"};
    text-align: center;
    padding: 3px 0px 3px 0px;
    background-color: ${(p: MethodProp) => p.color};
    color: #FFF;
    align-items: center;
    font-weight: bold;
`;

const MethodSection = styled.div`
    display: flex;
    justify-content: space-between;
`;

const ButtonSection = styled.div<ButtonSectionProps>`
    display: flex;
    justify-content: space-between;
    width: ${(p: ButtonSectionProps) => p.isExpanded ? 120 : 90};
`;

const AccordionContent = styled.div`
    padding: 10px;
`;

const MethodPath = styled.span`
    align-self: center;
    margin-left: 10px;
`;

const colors = {
    "GET": '#3d7eff',
    "PUT": '#fca130',
    "POST": '#49cc90',
    "DELETE": '#f93e3e',
    "PATCH": '#986ee2',
}

function getColorByMethod(method: string) {
    switch (method.toUpperCase()) {
        case "GET":
            return colors.GET;
        case "PUT":
            return colors.PUT;
        case "POST":
            return colors.POST;
        case "DELETE":
            return colors.DELETE;
        case "PATCH":
            return colors.PATCH;
        default:
            return '#FFF'; // Default color
    }
}

function getCalculateWidth(goToSource: (resource: Resource) => void, onEditResource: (resource: Resource) => void,
    onDeleteResource: (resource: Resource) => void) {
    let width = 15;
    if (goToSource) {
        width += 25;
    }
    if (onEditResource) {
        width += 25;
    }
    if (onDeleteResource) {
        width += 25;
    }
    return width;
}

export interface ResourceAccordionProps {
    resource: Resource;
    goToSource: (resource: Resource) => void;
    onEditResource: (resource: Resource) => void;
    onDeleteResource?: (resource: Resource) => void;
}

const ResourceAccordion = (params: ResourceAccordionProps) => {
    const { resource, goToSource, onEditResource, onDeleteResource } = params;
    const [isOpen, setIsOpen] = useState(false);
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [confirmEl, setConfirmEl] = React.useState(null);


    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };

    const handleShowDiagram = (e: Event) => {
        e.stopPropagation(); // Stop the event propagation
        goToSource(resource);
    };

    const handleEditResource = (e: Event) => {
        e.stopPropagation(); // Stop the event propagation
        onEditResource(resource);
    };

    const handleOpenConfirm = () => {
        setConfirmOpen(true);
    };

    const handleDeleteResource = (e: React.MouseEvent<HTMLElement | SVGSVGElement>) => {
        e.stopPropagation(); // Stop the event propagation
        setConfirmEl(e.currentTarget);
        handleOpenConfirm();
    };

    const resourceParams: string[][] = [];
    resource?.advancedParams?.forEach(param => {
        resourceParams.push([param.type, `${param.name}${param?.defaultValue ? ` = ${param.defaultValue}` : ""}`]);
    });
    resource?.params?.forEach(param => {
        resourceParams.push([param.type, `${param.name}${param?.defaultValue ? ` = ${param.defaultValue}` : ""}`]);
    });

    const payloadInfo: string[][] = [];
    if (resource?.payloadConfig) {
        payloadInfo.push([`@http:Payload ${resource?.payloadConfig.type} ${resource?.payloadConfig.name}`]);
    }

    const responses: string[][] = [];
    resource?.responses?.forEach(response => {
        responses.push([`${response.code}`, response.type]);
    });

    const handleConfirm = (status: boolean) => {
        if (status) {
            onDeleteResource && onDeleteResource(resource);
        }
        setConfirmOpen(false);
        setConfirmEl(null);
    };

    return (
        <AccordionContainer>
            <AccordionHeader onClick={toggleAccordion}>
                <MethodSection>
                    {resource?.methods?.map((method, index) => {
                        return (
                            <MethodBox key={index} color={getColorByMethod(method)} hasLeftMargin={index >= 1}>
                                {method}
                            </MethodBox>
                        );
                    })}
                    <MethodPath>{resource?.path}</MethodPath>
                </MethodSection>
                <ButtonSection isExpanded={isOpen}>
                    {isOpen ? (
                        <>
                            <ButtonWrapper>
                                <VSCodeButton appearance="icon" title="Show Diagram" onClick={handleShowDiagram}>
                                    <Icon name='design-view' />
                                </VSCodeButton>
                                <>
                                    Diagram
                                </>
                            </ButtonWrapper>
                            <ButtonWrapper>
                                <VSCodeButton appearance="icon" title="Edit Resource" onClick={handleEditResource}>
                                    <Icon name="editIcon" />
                                </VSCodeButton>
                                <>
                                    Edit
                                </>
                            </ButtonWrapper>
                            <ButtonWrapper>
                                <VSCodeButton appearance="icon" title="Delete Resource" onClick={handleDeleteResource}>
                                    <Icon name="delete" />
                                </VSCodeButton>
                                <>
                                    Delete
                                </>
                            </ButtonWrapper>
                        </>
                    ) : (
                        <>
                            <VSCodeButton appearance="icon" title="Show Diagram" onClick={handleShowDiagram}>
                                <Icon name='design-view' />
                            </VSCodeButton>
                            <VSCodeButton appearance="icon" title="Edit Resource" onClick={handleEditResource}>
                                <Icon name="editIcon" />
                            </VSCodeButton>
                            <VSCodeButton appearance="icon" title="Delete Resource" onClick={handleDeleteResource}>
                                <Icon name="delete" />
                            </VSCodeButton>
                        </>
                    )}

                    {isOpen ?
                        <Button appearance='icon' onClick={toggleAccordion}>
                            <Codicon iconSx={{ marginTop: -3 }} name="chevron-up" />
                        </Button>
                        :
                        <Button appearance='icon' onClick={toggleAccordion}>
                            <Codicon iconSx={{ marginTop: -3 }} name="chevron-down" />
                        </Button>
                    }
                </ButtonSection>
            </AccordionHeader>
            {isOpen && (
                <AccordionContent>
                    {resourceParams?.length > 0 &&
                        <AccordionTable key="params" titile="Parameters" headers={["Type", "Description"]} content={resourceParams} />
                    }
                    {payloadInfo.length > 0 &&
                        <AccordionTable key="body" titile="Body" headers={["Description"]} content={payloadInfo} />
                    }
                    {responses.length > 0 &&
                        <AccordionTable key="responses" titile="Responses" headers={["Code", "Description"]} content={responses} />
                    }
                </AccordionContent>
            )}
            <Confirm
                isOpen={isConfirmOpen}
                onConfirm={handleConfirm}
                confirmText="Okay"
                message="Are you sure want to delete this resource?"
                anchorEl={confirmEl}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            />
        </AccordionContainer>
    );
};

export default ResourceAccordion;
