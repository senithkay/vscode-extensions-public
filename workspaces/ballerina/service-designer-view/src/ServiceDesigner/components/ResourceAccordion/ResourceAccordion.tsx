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
import { ServiceDesignerRpcClient } from '@wso2-enterprise/ballerina-rpc-client';
import { AccordionTable } from '../AccordionTable/AccordionTable';
import { ResourceInfo } from '../../definitions';
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
    resourceInfo: ResourceInfo;
    modelPosition?: NodePosition;
    rpcClient: ServiceDesignerRpcClient;
    showDiagram: (position: NodePosition) =>  void;
    onEditResource: (resourceInfo: ResourceInfo) => void;
}

const ResourceAccordion = (params: ResourceAccordionProps) => {
    const { modelPosition, resourceInfo, rpcClient, showDiagram, onEditResource } = params;
    const [isOpen, setIsOpen] = useState(false);

    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };

    const handleShowDiagram = () => {
        // Show the eggplant diagram
        showDiagram(modelPosition);
    };

    const handleEditResource = () => {
        onEditResource(resourceInfo);
    };

    const handleDeleteResource = (e: Event) => {
        e.stopPropagation(); // Stop the event propagation
        handleOpenConfirm();
    };

    const resourceParams: string[][] = [];
    resourceInfo?.advancedParams?.forEach((param) => {
        resourceParams.push([param.type, `${param.name}${param?.defaultValue ? ` = ${param.defaultValue}` : ""}`]);
    });
    resourceInfo?.params?.forEach((param) => {
        resourceParams.push([param.type, `${param.name}${param?.defaultValue ? ` = ${param.defaultValue}` : ""}`]);
    });

    const payloadInfo: string[][] = [];
    if (resourceInfo?.payloadConfig) {
        payloadInfo.push([`@http:Payload ${resourceInfo?.payloadConfig.type} ${resourceInfo?.payloadConfig.name}`]);
    }

    const responses: string[][] = [];
    resourceInfo?.responses?.forEach((response) => {
        responses.push([`${response.code}`, response.type]);
    });

    const [isConfirmOpen, setConfirmOpen] = useState(false);

    const handleConfirm = async () => {
        // Handle confirmation logic
        await rpcClient.deleteResource({ position: modelPosition });
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
                    <MethodBox color={getColorByMethod(resourceInfo.method)}>{resourceInfo.method.toUpperCase()}</MethodBox><MethodPath>{resourceInfo?.path}</MethodPath>
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
                        <AccordionTable titile="Parameters" headers={["Type", "Description"]} content={resourceParams} /> 
                    }
                    {payloadInfo.length > 0 && 
                        <AccordionTable titile="Body"  headers={["Description"]} content={payloadInfo} />
                    }
                    {responses.length > 0 &&
                        <AccordionTable titile="Responses" headers={["Code", "Description"]} content={responses} />
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
