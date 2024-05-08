/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import { Overlay } from './../Commons/Overlay';
import { colors } from '../Commons/Colors';

export interface SidePanelProps {
    id?: string;
    className?: string;
	isOpen?: boolean;
	overlay?: boolean;
	children?: React.ReactNode;
    alignmanet?: "left" | "right";
    width?: number;
    sx?: any;
    onClose?: (event?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}

const SidePanelContainer = styled.div<SidePanelProps>`
    position: fixed;
    top: 0;
    left: ${(props: SidePanelProps) => props.alignmanet === "left" ? 0 : "auto"};
    right: ${(props: SidePanelProps) => props.alignmanet === "right" ? 0 : "auto"};
    width: ${(props: SidePanelProps) => `${props.width}px`};
    height: 100%;
    background-color: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
    box-shadow: 0 5px 10px 0 var(--vscode-badge-background);
    z-index: 2000;
    opacity: ${(props: SidePanelProps) => props.isOpen ? 1 : 0};
    transform: translateX(${(props: SidePanelProps) => props.alignmanet === 'left' ? (props.isOpen ? '0%' : '-100%') : (props.isOpen ? '0%' : '100%')});
    transition: transform 0.4s ease, opacity 0.4s ease;
    ${(props: SidePanelProps) => props.sx};
`;
    
export const SidePanel: React.FC<SidePanelProps> = (props: SidePanelProps) => {
    const { id, className, isOpen = false, alignmanet = "right", width = 312, children, sx, overlay = true } = props;
    const [open, setOpen] = useState(false);
    const [visible, setVisible] = useState(isOpen);

    const handleTransitionEnd = (event: React.TransitionEvent) => {
        if (event.propertyName === 'transform' && !isOpen) {
            setVisible(false);
        }
    };

    const handleOverlayClose = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (props.onClose) {
            setOpen(false);
            props.onClose(event);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
            requestAnimationFrame(() => {
                setOpen(true);
            });
        } else {
            setOpen(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!open && !isOpen) {
            const timer = setTimeout(() => {
                setVisible(false);
            }, 500); // Corresponds to the transition time
            return () => clearTimeout(timer);
        }
    }, [open, isOpen]);
    return (
        <div id={id} className={className}>
            {visible && (
                <>
                    { overlay && isOpen && <Overlay sx={{background: colors.vscodeInputBackground, opacity: 0.4}} onClose={handleOverlayClose}/> }
                    <SidePanelContainer isOpen={open} alignmanet={alignmanet} width={width} sx={sx} onTransitionEnd={handleTransitionEnd}>
                        {children}
                    </SidePanelContainer>
                </>
            )}
        </div>
    );
};
