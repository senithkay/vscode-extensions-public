/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { ReactNode } from 'react';
import styled from '@emotion/styled';

const MainTitleContainer = styled.div`
    display: flex;
    flex-direction: column;
    padding: 24px;
    border-bottom: 1px solid var(--vscode-editorWidget-border);
`;

const TitleRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
`;

const TitleContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Title = styled.h1`
    margin: 0;
    font-size: 28px;
    font-weight: 600;
    color: var(--vscode-foreground);
`;

const SubTitle = styled.p`
    margin: 0;
    font-size: 14px;
    color: var(--vscode-descriptionForeground);
    line-height: 1.5;
`;

const ActionsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

interface MainTitleBarProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
}

export function MainTitleBar({ title, subtitle, actions }: MainTitleBarProps) {
    return (
        <MainTitleContainer>
            <TitleRow>
                <TitleContent>
                    <Title>{title}</Title>
                    {subtitle && <SubTitle>{subtitle}</SubTitle>}
                </TitleContent>
                {actions && <ActionsContainer>{actions}</ActionsContainer>}
            </TitleRow>
        </MainTitleContainer>
    );
} 
