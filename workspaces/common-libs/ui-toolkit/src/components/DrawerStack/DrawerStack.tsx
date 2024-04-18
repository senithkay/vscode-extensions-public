/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { ReactNode } from "react";
import styled from "@emotion/styled";
import { Breadcrumbs } from "../..";

// interface CodiconContainerProps {
//     sx?: any;
// }

interface ContainerProps {
    sx?: any;
    className?: string;
}

const DrawerContainer = styled.div<ContainerProps>`
    ${(props: ContainerProps) => props.sx};
`;

interface DrawerProps {
    isOpen: boolean;
    isSelected?: boolean;
    id?: string;
    sx?: any;
}

const BreadcrubsWrapper = styled.div`
    display: flex;
    justify-content: flex-end
`;

export interface DrawerStackProps {
    id?: string;
    className?: string;
    sx?: any;
    drawers?: DrawerProps[];
    selectedComponent?: string;
    onChangeDrawer?: (id: string) => void;
    children?: ReactNode;
    // onClick?: (event?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}

export const DrawerStack: React.FC<DrawerStackProps> = (props: DrawerStackProps) => {
    const { id, sx, className, drawers, selectedComponent, onChangeDrawer, children } = props;

    const breadcrubsClickHandler = (id: string) => {
        onChangeDrawer(id);
    }
    return (
        <DrawerContainer id={id} className={className} sx={sx}>
            <BreadcrubsWrapper>
                <Breadcrumbs sx={{width: 200}}>
                    {drawers?.map(drawer => (
                        <div
                            style={{color: drawer.id === selectedComponent ? "var(--vscode-icon-foreground)" : "var(--vscode-foreground)"}}
                            key={drawer.id}
                            onClick={() => breadcrubsClickHandler(drawer.id)}>
                            {drawer.id}
                        </div>
                    ))}
                </Breadcrumbs>
            </BreadcrubsWrapper>
            <DrawerContainer>
                {children}
            </DrawerContainer>
        </DrawerContainer>
    );
};
