/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Codicon, Icon, Typography } from '@wso2-enterprise/ui-toolkit';
import { VSCodeButton, VSCodeDataGrid, VSCodeDataGridCell, VSCodeDataGridRow, VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import { NodePosition, ResourceAccessorDefinition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import ConfirmDialog from './ConfirmBox';
import { responseCodes } from '@wso2-enterprise/ballerina-core';
import { ServiceDesignerRpcClient } from '@wso2-enterprise/ballerina-rpc-client';


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

interface DataValues {
    code?: string,
    value: string,
    type?: string,
    header?: string
}

interface ResourceAccordionProps {
    model: ResourceAccessorDefinition;
    rpcClient: ServiceDesignerRpcClient;
    showDiagram: (position: NodePosition) =>  void;
}

const ResourceAccordion = (params: ResourceAccordionProps) => {
    const { model, rpcClient, showDiagram } = params;
    const [isOpen, setIsOpen] = useState(false);

    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };

    const handleShowDiagram = () => {
        // Show the eggplant diagram
        showDiagram(model.position);
    };

    const handleEditResource = () => {
        // Edit Resource
    };

    const handleDeleteResource = (e: Event) => {
        e.stopPropagation(); // Stop the event propagation
        handleOpenConfirm();
    };

    const paramData: DataValues[] = [];

    const parameters = model.functionSignature?.parameters;

    for (const [i, param] of parameters.entries()) {
        if (
            (STKindChecker.isRequiredParam(param) || STKindChecker.isDefaultableParam(param))
            && (!param.source.includes("Payload") && !(i === 0 && param.annotations.length === 0 && isStructuredType(param.typeName)))
        ) {
            let paramDetails = param.source.split(" ");
            let annotation = "";
            if (param.annotations.length > 0) {
                annotation = param.annotations[0].source;
                const sourceWithoutAnnotation = param.source.replace(annotation, "");
                paramDetails = sourceWithoutAnnotation.split(" ");
            }
            const recordName = paramDetails[0];
            let description = paramDetails.length > 0 && paramDetails[1];
            if (paramDetails.length > 2) {
                description = paramDetails.slice(1).join(" ");
            }
            paramData.push({ type: recordName, value: description });

        }
    }

    const bodyData: DataValues[] = [];

    model.functionSignature?.parameters?.forEach((param, i) => {
        if (STKindChecker.isRequiredParam(param) && (param.source.includes("Payload") || (i === 0 && param.annotations.length === 0))) {
            const typeSymbol = param.typeData?.typeSymbol;
            const typeName = typeSymbol?.name || typeSymbol?.memberTypeDescriptor?.name;
            if (typeName) {
                bodyData.push({
                    type: `${param.typeName?.source.trim()}`,
                    value: `${param.paramName?.value}`
                })
            } else {
                bodyData.push({
                    value: `${param.source}`
                })
            }
        }
    });

    function getReturnTypesArray() {
        const returnTypes = model.functionSignature?.returnTypeDesc?.type?.source.split(/\|(?![^{]*[}])/gm);
        return returnTypes || [];
    }

    function defaultResponseCode() {
        const isPost = model?.functionName.value.toUpperCase() === "POST";
        return isPost ? "201" : "200";
    }

    const responseData: DataValues[] = [];

    const values = getReturnTypesArray();

    for (const [, value] of values.entries()) {
        let code = defaultResponseCode();
        const recordName = value.replace("?", "").trim();

        responseCodes.forEach(item => {
            if (recordName.includes(item.source)) {
                code = item.code.toString();
            }
        });

        if (value.includes("error")) {
            code = "500";
        }
        responseData.push({ code: code, value: recordName })
    }

    const [isConfirmOpen, setConfirmOpen] = useState(false);

    const handleConfirm = async () => {
        // Handle confirmation logic
        await rpcClient.deleteResource({ position: model.position });
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
                    {paramData.length > 0 &&
                        <>
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
                        </>
                    }

                    {bodyData.length > 0 &&
                        <>
                            <Typography sx={{ marginBlockEnd: 10 }} variant="h3">Body</Typography>
                            <VSCodeDivider />
                            <VSCodeDataGrid>
                                <VSCodeDataGridRow row-type="header">
                                    <VSCodeDataGridCell cell-type="columnheader" grid-column="1">
                                        Description
                                    </VSCodeDataGridCell>
                                </VSCodeDataGridRow>
                                {bodyData.map(row => (
                                    <VSCodeDataGridRow>
                                        <VSCodeDataGridCell grid-column="1">{row?.type} {row.value}</VSCodeDataGridCell>
                                    </VSCodeDataGridRow>
                                ))}
                            </VSCodeDataGrid>
                        </>
                    }

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

function isStructuredType(node: STNode): boolean {
    // Add logic to determine if the node is a structured node (map/record/table/tuple/array/xml)
    // Return true if it's structured, false otherwise
    if (
        STKindChecker.isMapTypeDesc(node) ||
        STKindChecker.isRecordTypeDesc(node) ||
        STKindChecker.isTableTypeDesc(node) ||
        STKindChecker.isTupleTypeDesc(node) ||
        STKindChecker.isArrayTypeDesc(node) && STKindChecker.isSimpleNameReference(node.memberTypeDesc) ||
        STKindChecker.isArrayTypeDesc(node) && STKindChecker.isByteTypeDesc(node.memberTypeDesc) ||
        STKindChecker.isXmlTypeDesc(node) ||
        STKindChecker.isSimpleNameReference(node) ||
        STKindChecker.isOptionalTypeDesc(node) && STKindChecker.isSimpleNameReference(node.typeDescriptor)
    ) {
        return true;
    }
    return false;
}
