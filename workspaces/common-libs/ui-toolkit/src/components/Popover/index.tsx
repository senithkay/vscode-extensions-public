/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";
import "@wso2-enterprise/font-wso2-vscode/dist/wso2-vscode.css";

import styled from "@emotion/styled";
import { createPortal } from "react-dom";
import { SxStyle } from "../Commons/Definitions";

export interface ContainerProps {
	top?: number;
    left?: number;
    sx?: SxStyle;
}

const StyledPopover = styled.div<ContainerProps>`
    position: absolute;
    z-index: 200;
    background-color: #fff;
    padding: 8px;
    box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    font-size: 14px;
    line-height: 20px;
    color: #333;
    top: ${(props: ContainerProps) => `${props.top}px`};
    left: ${(props: ContainerProps) => `${props.left}px`};
    ${(props: ContainerProps) => props.sx};
`;
  
export interface PopoverProps {
    open: boolean;
    anchorEl: HTMLElement | SVGGElement | null;
    sx?: SxStyle;
    id?: string;
    children?: React.ReactNode;
}

export const Popover: React.FC<PopoverProps> = (props: PopoverProps) => {
    const { open, id, anchorEl: anchorEvent, sx, children } = props;
  
    return (
        <div id={id}>
            {open &&
                createPortal(
                    <StyledPopover
                        top={anchorEvent?.getBoundingClientRect().top}
                        left={anchorEvent?.getBoundingClientRect().left}
                        sx={sx}
                    >
                        {children}
                    </StyledPopover>,
                    document.body
                )
            }
        </div>
    );
}
