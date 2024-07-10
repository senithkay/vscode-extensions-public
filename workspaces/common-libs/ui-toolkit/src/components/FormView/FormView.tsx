/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from 'react';
import { Button } from '../Button/Button';
import { Typography } from '../Typography/Typography';
import { Codicon } from '../Codicon/Codicon';


interface FormViewProps {
    title: string;
    children: React.ReactNode;
    onClose: () => void; // Added onClose prop
    hideClose?: boolean;
}

export const FormView: React.FC<FormViewProps> = ({ title, children, onClose, hideClose }) => {
    const [isScrolling, setIsScrolling] = useState(false);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (e.currentTarget.scrollTop > 0) {
            setIsScrolling(true);
        } else {
            setIsScrolling(false);
        }
    };

    return (
        <div onScroll={handleScroll} style={{
            overflowY: 'auto',
            overflowX: 'hidden',
            maxHeight: !hideClose ? 'calc(100vh - 22px)' : 'fit-content',
        }} className="form-view">
            <div style={{ maxWidth: '50em', margin: '0 auto' }}>
                <div style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    backgroundColor: 'var(--background)',
                    boxShadow: isScrolling ? '0 4px 2px -2px rgba(0,0,0,0.2)' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <Typography variant="h2" sx={{ flexGrow: 1 }}>{title}</Typography>
                    {!hideClose &&
                        <Button appearance="icon" onClick={onClose} tooltip="Close">
                            <Codicon name='close' />
                        </Button>
                    }
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

interface FormActionsProps {
    children?: React.ReactNode;
}

export const FormActions: React.FC<FormActionsProps> = ({ children }) => {
    return (
        <div className="form-actions" style={{
            display: 'flex',
            gap: '10px',
            position: 'sticky',
            bottom: 0,
            zIndex: 1,
            backgroundColor: 'var(--background)',
            padding: '10px 0px',
        }}>
            {children}
        </div>
    );
};
interface FormGroupProps {
    title: string;
    children?: React.ReactNode;
    isCollapsed?: boolean;
}

export const FormGroup: React.FC<FormGroupProps> = ({ title, children, isCollapsed = true }) => {
    const [collapsed, setCollapsed] = useState(isCollapsed);

    const toggleCollapse = () => setCollapsed(!collapsed);

    return (
        <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={toggleCollapse}>
                <Typography variant="h3">{title}</Typography>
                <Button appearance="icon" tooltip={collapsed ? 'Expand' : 'Collapse'}>
                    <Codicon name={collapsed ? 'chevron-down' : 'chevron-up'} />
                </Button>
            </div>
            {!collapsed &&
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {children}
                </div>
            }
        </div>
    );
};