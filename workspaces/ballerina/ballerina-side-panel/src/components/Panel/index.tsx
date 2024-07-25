/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { Button, SidePanel, SidePanelTitleContainer } from "@wso2-enterprise/ui-toolkit";
import { Colors } from "../../resources/constants";
import styled from "@emotion/styled";
import { BackIcon, CloseIcon } from "../../resources";

export interface PanelContainerProps {
    children?: React.ReactNode;
    title: string;
    show: boolean;
    onClose(): void;
    onBack?(): void;
}

namespace S {
    export const Row = styled.div`
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        gap: 8px;
    `;

    export const StyledButton = styled(Button)`
        border-radius: 5px;
    `;
}

export function PanelContainer(props: PanelContainerProps) {
    const { children, title, show, onClose, onBack } = props;

    return (
        <SidePanel
            isOpen={show}
            alignmanet="right"
            sx={{
                width: "400px",
                fontFamily: "GilmerRegular",
                backgroundColor: Colors.SURFACE_DIM,
                boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
            }}
        >
            <SidePanelTitleContainer>
                <S.Row>
                    {onBack && (
                        <S.StyledButton appearance="icon" onClick={onBack}>
                            <BackIcon />
                        </S.StyledButton>
                    )}
                    {title}
                </S.Row>
                <S.StyledButton appearance="icon" onClick={onClose}>
                    <CloseIcon />
                </S.StyledButton>
            </SidePanelTitleContainer>
            {children}
        </SidePanel>
    );
}

export default PanelContainer;
