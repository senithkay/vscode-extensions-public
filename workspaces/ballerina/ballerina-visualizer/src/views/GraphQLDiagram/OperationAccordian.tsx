/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Codicon, Confirm, Icon } from '@wso2-enterprise/ui-toolkit';
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { FunctionModel } from '@wso2-enterprise/ballerina-core';

type MethodProp = {
    color: string;
    hasLeftMargin?: boolean;
};

type ContainerProps = {
    borderColor?: string;
    haveErrors?: boolean;
};

type ButtonSectionProps = {
    isExpanded?: boolean;
};

type HeaderProps = {
    expandable?: boolean;
}

const AccordionContainer = styled.div<ContainerProps>`
    margin-top: 10px;
    overflow: hidden;
    background-color: var(--vscode-editorHoverWidget-statusBarBackground);
    &:hover {
        background-color: var(--vscode-editorHoverWidget-border);
        cursor: pointer;
    }
    border: ${(p: ContainerProps) => p.haveErrors ? "1px solid red" : "none"};
`;

const AccordionHeader = styled.div<HeaderProps>`
    padding: 10px;
    cursor: pointer;
    display: grid;
    grid-template-columns: 3fr 1fr;
`;

const MethodSection = styled.div`
    display: flex;
    gap: 4px;
`;

const ButtonSection = styled.div<ButtonSectionProps>`
    display: flex;
    align-items: center;
    margin-left: auto;
    gap: ${(p: ButtonSectionProps) => p.isExpanded ? "8px" : "6px"};
`;

const MethodPath = styled.span`
    align-self: center;
    margin-left: 10px;
`;

export interface OperationAccordionProps {
    functionModel: FunctionModel;
    goToSource: (resource: FunctionModel) => void;
    onEditFunction: (resource: FunctionModel) => void;
    onDeleteFunction: (resource: FunctionModel) => void;
    onFunctionImplement: (resource: FunctionModel) => void;
}

export function OperationAccordion(params: OperationAccordionProps) {
    const { functionModel, goToSource, onEditFunction, onDeleteFunction, onFunctionImplement } = params;

    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [confirmEl, setConfirmEl] = React.useState(null);

    const handleEditFuncrion = (e: Event) => {
        e.stopPropagation();
        onEditFunction(functionModel);
    };

    const handleOpenConfirm = () => {
        setConfirmOpen(true);
    };

    const handleDeleteFunction = (e: React.MouseEvent<HTMLElement | SVGSVGElement>) => {
        e.stopPropagation();
        setConfirmEl(e.currentTarget);
        handleOpenConfirm();
    };

    const handleConfirm = (status: boolean) => {
        if (status) {
            onDeleteFunction && onDeleteFunction(functionModel);
        }
        setConfirmOpen(false);
        setConfirmEl(null);
    };

    const handleFunctionImplement = () => {
        onFunctionImplement(functionModel)
    }

    return (
        <AccordionContainer>
            <AccordionHeader onClick={handleFunctionImplement}>
                <MethodSection>
                    <MethodPath>{functionModel.name.value}</MethodPath>
                </MethodSection>
                <ButtonSection>
                    <>
                        {onEditFunction! && (
                            <VSCodeButton appearance="icon" title="Edit Field" onClick={handleEditFuncrion}>
                                <Icon name="bi-edit" sx={{ marginTop: 3.5 }} />
                            </VSCodeButton>
                        )}
                        {onDeleteFunction! && (
                            <VSCodeButton appearance="icon" title="Delete Field" onClick={handleDeleteFunction}>
                                <Codicon name="trash" />
                            </VSCodeButton>
                        )}
                    </>
                </ButtonSection>
            </AccordionHeader>
            <Confirm
                isOpen={isConfirmOpen}
                onConfirm={handleConfirm}
                confirmText="Okay"
                message="Are you sure want to delete this field?"
                anchorEl={confirmEl}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                sx={{ zIndex: 3002}}
            />
        </AccordionContainer>
    );
};

