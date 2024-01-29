/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Codicon, Icon } from '@wso2-enterprise/ui-toolkit';
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { AccordionTable } from '../AccordionTable/AccordionTable';
import { Resource } from '../../definitions';
import ConfirmDialog from '../ConfirmBox/ConfirmBox';

// Define styles using @emotion/styled
const AccordionContainer = styled.div`
    margin-top: 10px;
    overflow: hidden;

    &.open {
        background-color: var(--vscode-sideBar-background);
    }

    &.closed {
        &:hover {
            background-color: var(--vscode-inputOption-hoverBackground);
            cursor: pointer;
        }
    }
`;

const AccordionHeader = styled.div`
    padding: 10px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const MethodBox = styled.div<MethodProp>`
    width: 60px;
    text-align: center;
    padding: 3px 0px 3px 0px;
    color: ${(p: MethodProp) => p.color};
    font-weight: bold;
`;

const MethodSection = styled.div`
    display: flex;
    justify-content: space-between;
`;

const ButtonSection = styled.div`
    display: flex;
    justify-content: space-between;
    width: 90px;
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
    "PUT": '#49cc90',
    "POST": '#fca130',
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

type MethodProp = {
    color: string;
};


interface ResourceAccordionProps {
    resource: Resource;
    modelPosition?: NodePosition;
    goToSource: (position: NodePosition) =>  void;
    onEditResource: (resourceInfo: Resource) => void;
    onDeleteResource?: (resourceInfo: Resource, position: NodePosition) => void;
}

const ResourceAccordion = (params: ResourceAccordionProps) => {
    const { modelPosition, resource, goToSource, onEditResource, onDeleteResource } = params;
    const [isOpen, setIsOpen] = useState(false);

    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };

    const handleShowDiagram = () => {
        // Show the eggplant diagram
        goToSource(modelPosition);
    };

    const handleEditResource = () => {
        onEditResource(resource);
    };

    const handleDeleteResource = (e: Event) => {
        e.stopPropagation(); // Stop the event propagation
        handleOpenConfirm();
    };

    const resourceParams: string[][] = [];
    resource?.advancedParams?.forEach((param) => {
        resourceParams.push([param.type, `${param.name}${param?.defaultValue ? ` = ${param.defaultValue}` : ""}`]);
    });
    resource?.params?.forEach((param) => {
        resourceParams.push([param.type, `${param.name}${param?.defaultValue ? ` = ${param.defaultValue}` : ""}`]);
    });

    const payloadInfo: string[][] = [];
    if (resource?.payloadConfig) {
        payloadInfo.push([`@http:Payload ${resource?.payloadConfig.type} ${resource?.payloadConfig.name}`]);
    }

    const responses: string[][] = [];
    resource?.responses?.forEach((response) => {
        responses.push([`${response.code}`, response.type]);
    });

    const [isConfirmOpen, setConfirmOpen] = useState(false);

    const handleConfirm = async () => {
        // Handle confirmation logic
        onDeleteResource && onDeleteResource(resource, resource?.deletePosition);
        setConfirmOpen(false);
    };

    const handleOpenConfirm = () => {
        setConfirmOpen(true);
    };

    const handleCloseConfirm = () => {
        setConfirmOpen(false);
    };

    return (
        <AccordionContainer className={isOpen ? 'open' : 'closed'}>
            <AccordionHeader onClick={toggleAccordion}>
                <MethodSection>
                    <MethodBox color={getColorByMethod(resource.method)}>{resource.method.toUpperCase()}</MethodBox><MethodPath>{resource?.path}</MethodPath>
                </MethodSection>
                <ButtonSection>
                    <VSCodeButton appearance="icon" title="Show Diagram" onClick={handleShowDiagram}>
                        <Icon name='design-view' />
                    </VSCodeButton>

                    <VSCodeButton appearance="icon" title="Edit Resource" onClick={handleEditResource}>
                        <Icon name="editIcon" />
                    </VSCodeButton>

                    <VSCodeButton appearance="icon" title="Delete Resource" onClick={handleDeleteResource}>
                        <Icon name="delete" />
                    </VSCodeButton>

                    {isOpen ? <Codicon name="chevron-up" /> : <Codicon name="chevron-down" />}
                </ButtonSection>
            </AccordionHeader>
            {isOpen && (
                <AccordionContent>
                    {resourceParams?.length > 0 &&
                        <AccordionTable key="params" titile="Parameters" headers={["Type", "Description"]} content={resourceParams} /> 
                    }
                    {payloadInfo.length > 0 && 
                        <AccordionTable key="body" titile="Body"  headers={["Description"]} content={payloadInfo} />
                    }
                    {responses.length > 0 &&
                        <AccordionTable key="responses" titile="Responses" headers={["Code", "Description"]} content={responses} />
                    }
                </AccordionContent>
            )}
            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={handleCloseConfirm}
                onConfirm={handleConfirm}
            />
        </AccordionContainer>
    );
};

export default ResourceAccordion;
