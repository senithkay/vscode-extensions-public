
/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Button, Codicon, ComponentCard, IconLabel, Tooltip, Typography } from '@wso2-enterprise/ui-toolkit';
import React, { useEffect, useState } from 'react';
import { FirstCharToUpperCase } from '../../../utils/commons';
import styled from '@emotion/styled';


const ButtonGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px 5px;
    padding: 10px 10px;
    border: 2px solid;
    border-right: none;
    border-top: none;
    border-radius: 10px;
    border-color: var(--vscode-editorIndentGuide-background);
`;

interface ButtonroupProps {
    title: string;
    children?: React.ReactNode;
    isCollapsed?: boolean;
}
export const ButtonGroup: React.FC<ButtonroupProps> = ({ title, children, isCollapsed = true }) => {
    const [collapsed, setCollapsed] = useState(isCollapsed);

    useEffect(() => {
        setCollapsed(isCollapsed);
    }, [isCollapsed]);

    const toggleCollapse = () => setCollapsed(!collapsed);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={toggleCollapse}>
                <Typography variant="h3" sx={{ margin: '0px' }}>{title}</Typography>
                <hr style={{ flexGrow: 1, margin: '0 10px', borderColor: 'var(--vscode-panel-border)' }} />
                <Button appearance="icon" tooltip={collapsed ? 'Expand' : 'Collapse'}>
                    <Codicon name={collapsed ? 'chevron-down' : 'chevron-up'} />
                </Button>
            </div>
            {!collapsed &&
                <ButtonGrid>
                    {children}
                </ButtonGrid>
            }
        </div>
    );
};


const IconContainer = styled.div`
    width: 30px;

    & img {
        width: 25px;
    }
`;

interface GridButtonProps {
    onClick: () => void;
    title: string;
    description: string;
    icon?: React.ReactNode;
}
export const GridButton: React.FC<GridButtonProps> = ({ title, description, icon, onClick }) => {
    return (
        <Tooltip content={description} position='bottom' sx={{ zIndex: 2010 }}>
            <ComponentCard
                id={title}
                key={description}
                onClick={onClick}
                sx={{
                    '&:hover, &.active': {
                        '.icon svg g': {
                            fill: 'var(--vscode-editor-foreground)'
                        },
                        backgroundColor: 'var(--vscode-pickerGroup-border)',
                        border: '0.5px solid var(--vscode-focusBorder)'
                    },
                    alignItems: 'center',
                    border: '0.5px solid var(--vscode-editor-foreground)',
                    borderRadius: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    height: 20,
                    justifyContent: 'left',
                    marginBottom: 10,
                    padding: 10,
                    transition: '0.3s',
                    width: 165
                }}
            >
                <IconContainer>
                    {icon}
                </IconContainer>
                <div >
                    <IconLabel>{FirstCharToUpperCase(title)}</IconLabel>
                </div>
            </ComponentCard>
        </Tooltip>
    );
}