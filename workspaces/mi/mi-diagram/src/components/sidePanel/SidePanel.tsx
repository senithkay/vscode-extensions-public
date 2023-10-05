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

export interface SidePanelProps {
	isOpen?: boolean;
	alignmanet?: "left" | "right";
	width?: number;
	children?: React.ReactNode;
	sx?: any;
}

export const SidePanelTitleContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid var(--vscode-panel-border);
    font: inherit;
    font-weight: bold;
    color: var(--vscode-editor-foreground);
`;

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
	overflow-y: auto;
	opacity: ${(props: SidePanelProps) => props.isOpen ? 1 : 0};
	${(props: SidePanelProps) => props.sx};
`;

const OverlayContainer = styled.div<OverlayProps>`
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 100;
    ${(props: OverlayProps) => props.sx};
`;

export interface OverlayProps {
	onClose?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
	sx?: any;
}

export const Overlay: React.FC<OverlayProps> = (props: OverlayProps) => {
	const { sx, onClose } = props;

	return (
		<OverlayContainer sx={sx} onClick={onClose} />
	);
};


export function SidePanel(props: SidePanelProps) {
	const { isOpen = false, alignmanet = "right", width = 312, children, sx } = props;
	return (
		<>
			{isOpen && (<Overlay sx={{ background: 'var(--vscode-editor-inactiveSelectionBackground)', opacity: 0.4 }} />)}
			<SidePanelContainer isOpen={isOpen} width={width} alignmanet={alignmanet} sx={sx}>
				{children}
			</SidePanelContainer>
		</>
	);
};
