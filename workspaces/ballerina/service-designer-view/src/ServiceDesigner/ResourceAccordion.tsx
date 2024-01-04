/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Codicon, Icon, Typography } from '@wso2-enterprise/ui-toolkit';
import { VSCodeButton, VSCodeDataGrid, VSCodeDataGridCell, VSCodeDataGridRow, VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import { ResourceAccessorDefinition, STKindChecker } from "@wso2-enterprise/syntax-tree";
import ConfirmDialog from './ConfirmBox';
import { removeStatement } from './utils/utils';
import { STModification } from '@wso2-enterprise/ballerina-core';


// Define styles using @emotion/styled
const AccordionContainer = styled.div`
    border: 1px solid var(--vscode-foreground);
    margin-top: 10px;
    overflow: hidden;

    &.open {
    ${/* Your open styles go here */ ''}
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
    border: 1px solid var(--vscode-foreground);
    width: 60px;
    text-align: center;
    padding: 3px 0px 3px 0px;
    color: ${(p: MethodProp) => p.color}
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

const ResourceAccordion = (params: { model: ResourceAccessorDefinition, rpcClient: any }) => {
    const { model, rpcClient } = params;
    const [isOpen, setIsOpen] = useState(false);

    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };

    const handleShowDiagram = () => {
        // Show the eggplant diagram
        const context: any = {
            view: "Overview",
            position: model.position
        }
        rpcClient.getWebviewRpcClient().openVisualizerView(context);
    };

    const handleEditResource = () => {
        // Edit Resource
    };

    const handleDeleteResource = (e: Event) => {
        e.stopPropagation(); // Stop the event propagation
        handleOpenConfirm();
    };

    const paramData = [
        { type: "string", value: "name" },
        { type: "http:Request", value: "req" },
        { type: "string?", value: "Cell Data", header: "@http:Header" },
    ];

    const responseData = [
        { code: "200", value: "string" },
        { code: "500", value: "error" },
    ];

    const [isConfirmOpen, setConfirmOpen] = useState(false);

    const handleConfirm = async () => {
        // Handle confirmation logic
        await rpcClient.getServiceDesignerRpcClient().deleteResource({ position: model.position });
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
                    <MethodBox color={getColorByMethod(model.functionName.value)}>{model.functionName.value.toUpperCase()}</MethodBox><MethodPath>{getResourcePath(model)}</MethodPath>
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
                    <Typography sx={{ marginBlockEnd: 10 }} variant="h3">Parameters</Typography>
                    <VSCodeDivider />
                    <VSCodeDataGrid>
                        <VSCodeDataGridRow row-type="header">
                            <VSCodeDataGridCell cell-type="columnheader" grid-column="1">
                                Type
                            </VSCodeDataGridCell>
                            <VSCodeDataGridCell cell-type="columnheader" grid-column="2">
                                Description
                            </VSCodeDataGridCell>
                        </VSCodeDataGridRow>
                        {paramData.map(row => (
                            <VSCodeDataGridRow>
                                <VSCodeDataGridCell grid-column="1">{row?.header} {row.type}</VSCodeDataGridCell>
                                <VSCodeDataGridCell grid-column="2">{row.value}</VSCodeDataGridCell>
                            </VSCodeDataGridRow>
                        ))}
                    </VSCodeDataGrid>

                    <Typography sx={{ marginBlockEnd: 10 }} variant="h3">Responses</Typography>
                    <VSCodeDivider />
                    <VSCodeDataGrid>
                        <VSCodeDataGridRow row-type="header">
                            <VSCodeDataGridCell cell-type="columnheader" grid-column="1">
                                Code
                            </VSCodeDataGridCell>
                            <VSCodeDataGridCell cell-type="columnheader" grid-column="2">
                                Description
                            </VSCodeDataGridCell>
                        </VSCodeDataGridRow>
                        {responseData.map(row => (
                            <VSCodeDataGridRow>
                                <VSCodeDataGridCell grid-column="1">{row.code}</VSCodeDataGridCell>
                                <VSCodeDataGridCell grid-column="2">{row.value}</VSCodeDataGridCell>
                            </VSCodeDataGridRow>
                        ))}
                    </VSCodeDataGrid>
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

function getResourcePath(model: ResourceAccessorDefinition) {
    const pathElements = model?.relativeResourcePath.map(node => {
        if (STKindChecker.isIdentifierToken(node) || STKindChecker.isSlashToken(node)) {
            return node.value
        } else if (STKindChecker.isResourcePathSegmentParam(node) || STKindChecker.isResourcePathRestParam(node)) {
            return (
                <>
                    [<span className={'type-descriptor'}>
                        {`${(node as any).typeDescriptor?.name?.value} `}
                    </span>
                    {STKindChecker.isResourcePathRestParam(node) ? '...' : ''}{(node as any).paramName?.value}]
                </>
            );
        } else if (STKindChecker.isDotToken(node)) {
            return (<>/</>);
        }
    });
    return pathElements.length === 1 && pathElements[0] === '.' ? "/" : pathElements
}

