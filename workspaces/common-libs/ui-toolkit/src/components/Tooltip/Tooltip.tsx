/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from "@emotion/styled";
import { getOffsetMultiplier } from './utils';

export type PositionType =
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
    'top'
    ;

export interface Position {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
}

export interface OffsetMultiplier {
    hoverEl: Position;
    tooltipEl: Position;
}

export type ElementProperties =
    Position & {
        width: number;
        height: number;
    }

export interface TooltipProps {
    id?: string;
    className?: string;
    content?: string | ReactNode;
    position?: PositionType;
    children?: ReactNode;
    containerPosition?: string;
    sx?: any;
}

export interface TooltipConatinerProps {
    position?: string;
}

const TooltipContainer = styled.div<TooltipConatinerProps>`
    position: ${(props: TooltipConatinerProps) => props.position || 'relative'};
    display: inline-block;
    cursor: pointer;
    pointer-events: auto;
`;

const TooltipContent = styled.div<TooltipProps>`
    position: absolute;
    width: fit-content;
    height: fit-content;
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
    ${(props: TooltipProps) => props.sx}
`;

export const Tooltip: React.FC<TooltipProps> = (props: TooltipProps) => {
    const { id, className, content, position, children, sx } = props;
    const [isVisible, setIsVisible] = React.useState(false);
    const [diagramPosition, setDiagramPosition] = React.useState<Position>({ top: 0, bottom: 0, left: 0, right: 0 });
    const hoverElRef = React.useRef(null);
    const tooltipElRef = React.useRef(null);

    useEffect(() => {
        const hoverEl = hoverElRef.current;
        const tooltipEl = tooltipElRef.current;
        const observer = () => {
            if (hoverEl && tooltipEl) {
                const hoverElProps = (hoverEl as any).getBoundingClientRect() as ElementProperties;
                const tooltipElProps = (tooltipEl as any).getBoundingClientRect() as ElementProperties;
                const offsetMultiplier: OffsetMultiplier = getOffsetMultiplier(position);
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                setDiagramPosition({
                    // updated position = initial position + adjustment of position w.r.t. hover element + adjustment of position w.r.t. tooltip element
                    ...(offsetMultiplier.hoverEl.top && { top: hoverElProps.top + (hoverElProps.height * offsetMultiplier.hoverEl.top) + (tooltipElProps.height * offsetMultiplier.tooltipEl.top) }),
                    ...(offsetMultiplier.hoverEl.bottom && { bottom: (viewportHeight - hoverElProps.bottom) + (hoverElProps.height * offsetMultiplier.hoverEl.bottom) + (tooltipElProps.height * offsetMultiplier.tooltipEl.bottom) }),
                    ...(offsetMultiplier.hoverEl.left && { left: hoverElProps.left + (hoverElProps.width * offsetMultiplier.hoverEl.left) + (tooltipElProps.width * offsetMultiplier.tooltipEl.left) }),
                    ...(offsetMultiplier.hoverEl.right && { right: (viewportWidth - hoverElProps.right) + (hoverElProps.width * offsetMultiplier.hoverEl.right) + (tooltipElProps.width * offsetMultiplier.tooltipEl.right) })
                })
            }
        }

        hoverEl.addEventListener('mouseenter', observer);

        return () => {
            hoverEl.removeEventListener('mouseenter', observer);
        }
    }, [position])

    return (
        <TooltipContainer
            ref={hoverElRef}
            id={id}
            className={className}
            position={props.containerPosition}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {createPortal(
                <TooltipContent
                    ref={tooltipElRef}
                    style={{
                        opacity: isVisible && content ? 1 : 0,
                        visibility: isVisible && content ? 'visible' : 'hidden',
                        ...diagramPosition
                    }}
                    sx={sx}
                >
                    {content && content.toString().split('\n').map((line, index) => <div key={index}>{line}</div>)}
                </TooltipContent>,
                document.body
            )}
        </TooltipContainer>
    );
};

