
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
    border-radius: 10px;
`;

const VersionTag = styled.div`
    color: #808080;
    font-size: 10px;
    padding-left: 2px;
`;

const CardContent = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`;

const CardLabel = styled.div`
    display: flex;
    flex-direction: row;
    align-self: flex-start;
    width: 100%;
    gap: 10px;
`;


interface ButtonroupProps {
    title: string;
    children?: React.ReactNode;
    isCollapsed?: boolean;
    iconUri?: string;
    versionTag?: string;
}
export const ButtonGroup: React.FC<ButtonroupProps> = ({ title, children, isCollapsed = true, iconUri, versionTag }) => {
    const [collapsed, setCollapsed] = useState(isCollapsed);

    useEffect(() => {
        setCollapsed(isCollapsed);
    }, [isCollapsed]);

    const toggleCollapse = () => setCollapsed(!collapsed);

    return (
        <div style={{
            backgroundColor: 'var(--vscode-editorWidget-background)',
            border: '0px',
            borderRadius: 2,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'left',
            transition: '0.3s',
            flexDirection: 'column',
            marginBottom: '15px'
        }}>
            <ComponentCard
                id={title}
                key={title}
                onClick={toggleCollapse}
                sx={{
                    border: '0px',
                    borderRadius: 2,
                    padding: '6px 10px',
                    width: 'auto',
                    height: '32px'
                }}
            >
                <CardContent>
                    <CardLabel>
                        {iconUri && (
                            <IconContainer>
                                <img
                                    src={iconUri}
                                    alt="Icon"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'https://mi-connectors.wso2.com/icons/wordpress.gif'
                                    }}
                                />
                            </IconContainer>
                        )}
                        <div style={{
                            width: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textAlign: 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                            <Typography variant="h3" sx={{ margin: '0px' }}>{title}</Typography>
                            <VersionTag>
                                {versionTag}
                            </VersionTag>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            {/* {expandedConnections.includes(connection) ?
                                <Codicon name={"chevron-up"} /> : <Codicon name={"chevron-down"} />
                            } */}
                            <Button appearance="icon" tooltip={collapsed ? 'Expand' : 'Collapse'}>
                                <Codicon name={collapsed ? 'chevron-down' : 'chevron-up'} />
                            </Button>
                        </div>
                    </CardLabel>
                </CardContent>
            </ComponentCard>
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
                    width: 168
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