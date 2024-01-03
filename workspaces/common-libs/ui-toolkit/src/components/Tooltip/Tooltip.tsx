/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { ReactNode } from 'react';
import styled from "@emotion/styled";

export interface TooltipProps {
    id?: string;
    className?: string;
    content?: string | ReactNode;
    position?:
        'bottom-end' |
        'bottom-start' |
        'bottom' |
        'left-end' |
        'left-start' |
        'left' |
        'right-end' |
        'right-start' |
        'right' |
        'top-end' |
        'top-start' |
        'top';
    children?: ReactNode;
    sx?: any;
}

const TooltipContainer = styled.div`
    position: relative;
    display: inline-block;
    cursor: pointer;
`;

const TooltipContent = styled.div<TooltipProps>`
    position: absolute;
    background-color: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
    border: var(--vscode-editorHoverWidget-statusBarBackground) 1px solid;
    border-radius: 4px;
    padding: 8px;
    font-size: 14px;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease-in-out;
    white-space: nowrap;
    z-index: 1;
    ${(props: TooltipProps) => {
        switch (props.position) {
            case 'bottom-end':
                return 'top: 100%; left: 50%;';
            case 'bottom-start':
                return 'top: 100%; right: 50%;';
            case 'bottom':
                return 'top: 100%; left: 50%; transform: translateX(-50%);';
            case 'left-end':
                return 'top: 50%; right: 100%;';
            case 'left-start':
                return 'bottom: 50%; right: 100%;';
            case 'left':
                return 'top: 50%; right: 100%; transform: translateY(-50%);';
            case 'right-end':
                return 'top: 50%; left: 100%;';
            case 'right-start':
                return 'bottom: 50%; left: 100%;';
            case 'right':
                return 'top: 50%; left: 100%; transform: translateY(-50%);';
            case 'top-end':
                return 'bottom: 100%; left: 50%;';
            case 'top-start':
                return 'bottom: 100%; right: 50%;';
            case 'top':
                return 'bottom: 100%; left: 50%; transform: translateX(-50%);';
            
            default:
                return '';
        }
    }}
    ${(props: TooltipProps) => props.sx};
`;

export const Tooltip: React.FC<TooltipProps> = (props: TooltipProps) => {
    const { id, className, content, position, children, sx } = props;
    const [isVisible, setIsVisible] = React.useState(false);

    return (
        <TooltipContainer
            id={id}
            className={className}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <TooltipContent position={position} style={{ opacity: isVisible ? 1 : 0, visibility: isVisible ? 'visible' : 'hidden' }} sx={sx}>
                {content}
            </TooltipContent>
        </TooltipContainer>
    );
};
