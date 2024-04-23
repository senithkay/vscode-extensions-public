/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import React, { PropsWithChildren } from "react";

export interface AlertProps {
    title?: string;
    subTitle?: string;
    variant?: "primary" | "secondary";
    sx?: React.CSSProperties;
}

interface ContainerProps {
    variant: "primary" | "secondary";
    sx?: React.CSSProperties;
}

const Container = styled.div<ContainerProps>`
    border-left: 0.3rem solid
        var(${(props: ContainerProps) => (props.variant === "secondary" ? "--vscode-editorWidget-border" : "--vscode-focusBorder")});
    background: var(
        ${(props: ContainerProps) => (props.variant === "secondary" ? "transparent" : "--vscode-inputValidation-infoBackground")}
    );
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
    gap: 12px;
    margin-bottom: 15px;
    ${(props: ContainerProps) => props.sx};
`;

const Title = styled.div`
    color: var(--vscode-foreground);
    font-weight: 500;
`;

const SubTitle = styled.div`
    color: var(--vscode-descriptionForeground);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.5;
`;


export const Alert: React.FC<PropsWithChildren<AlertProps>> = props => {
    const { title, subTitle, variant = "primary", children } = props;

    return (
        <Container variant={variant}>
            {title && <Title>{title}</Title>}
            {subTitle && <SubTitle>{subTitle}</SubTitle>}
            {children}
        </Container>
    );
};

