/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import styled from '@emotion/styled';
import React from 'react';
import { Codicon } from '../Codicon/Codicon';
export interface CardProps {
    id?: string;
	sx?: any;
    icon: string;
    title: string;
    description?: string;
    onClick?: () => void;
}

export interface CardWrapperProps {
    sx?: any;
}

const CardWraper = styled.div<CardWrapperProps>`
    border: 1px solid var(--vscode-dropdown-border);
    background-color: var(--vscode-dropdown-background);
    padding: 10px;
    cursor: pointer;
    &:hover {
        background-color: var(--vscode-button-background);
    }
    display: flex;
    flex-direction: column;
    ${(props: CardProps) => props.sx};
`;

export interface CardState {
    isHovered: boolean;
}

const CardTitle = styled.div<CardState>`
    font-size: 1.2em;
    color: ${(props: CardState) => (props.isHovered ? 'var(--vscode-button-foreground)' : 'inherit')};
`;

const CardDescription = styled.div<CardState>`
    margin-left: 24px;
    color: ${(props: CardState) => (props.isHovered ? 'var(--vscode-button-foreground)' : 'inherit')};
`;

export const Card: React.FC<CardProps> = ( props: CardProps ) => {
    const { icon, title, description, onClick, id, sx } = props;

    const [hovered, setHovered] = React.useState(false);

    return (
        <CardWraper id={id} sx={sx} onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Codicon
                        name={icon}
                        iconSx={{ fontSize: '1.5em', color: hovered ? 'var(--vscode-button-foreground)' : 'inherit' }}
                        sx={{ marginRight: '10px' }}
                    />
                    <CardTitle isHovered={hovered}>{title}</CardTitle>
                </div>
                {description && <CardDescription isHovered={hovered}>{description}</CardDescription>}
            </div>
        </CardWraper>
    );
};
