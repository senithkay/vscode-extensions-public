/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import styled from '@emotion/styled';
import React from 'react';
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
    z-index: 200;
    opacity: ${(props: SidePanelProps) => props.isOpen ? 1 : 0};
    display: ${(props: SidePanelProps) => !props.isOpen && "none" };
    ${(props: SidePanelProps) => props.sx};
`;

export const SidePanel: React.FC<SidePanelProps> = (props: SidePanelProps) => {
    const { id, className, isOpen = false, alignmanet = "right", width = 312, children, sx, overlay = true } = props;
    return (
        <div id={id} className={className}>
            {isOpen && (
                <>
                    { overlay && <Overlay sx={{background: colors.vscodeInputBackground, opacity: 0.4, cursor: 'not-allowed'}}/>}
                    <SidePanelContainer isOpen={isOpen} alignmanet={alignmanet} width={width} sx={sx}>
                        {children}
                    </SidePanelContainer>
                </>
            )}
        </div>
    );
};

