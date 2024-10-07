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
    title?: string;
    width?: string;
    show: boolean;
    showSubPanel?: boolean;
    onClose: () => void;
    onBack?: () => void;
    handleSubPanel?: (show: boolean) => void;
}

interface SidePanelProps {
    width: string;
}

interface AdvancedPanelProps {
    isOpen: boolean;
}

namespace S {

    export const SidePanels = styled.div`
        display: flex;
        position: fixed;
        right: 0;
    `;

    export const SidePanel = styled.div<SidePanelProps>`
        width: ${(props: SidePanelProps) => (props.width ? `${props.width}` : "400px")};
        z-index: 7000;
    `;

    export const AdvancedPanel = styled.div<AdvancedPanelProps>`
        width: 400px;
        height: 100vh;
        background-color: var(--vscode-editor-background);
        box-shadow: 0 5px 10px 0 var(--vscode-badge-background);
        color: var(--vscode-editor-foreground);
        position: relative;
        top: 0;
        transform: translateX(${(props: AdvancedPanelProps) => (props.isOpen ? '0%' : '100%')});
        transition: transform 0.4s ease, opacity 0.4s ease;
        z-index: 6000;
        opacity: ${(props: AdvancedPanelProps) => (props.isOpen ? 1 : 0)};
    `;

    export const Row = styled.div`
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-family: GilmerBold;
    `;

    export const StyledButton = styled(Button)`
        border-radius: 5px;
    `;
}

export function PanelContainer(props: PanelContainerProps) {
    const { children, title, show, showSubPanel, onClose, onBack, width } = props;

    return (
        <S.SidePanels>
            <S.AdvancedPanel isOpen={showSubPanel}>
                {title && (
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
                )}
                {children}
            </S.AdvancedPanel>
            <S.SidePanel width={width}>
                <SidePanel
                    isOpen={show}
                    alignment="right"
                    overlay={false}
                    sx={{
                        width: width ? width : "400px",
                        fontFamily: "GilmerRegular",
                        backgroundColor: Colors.SURFACE_DIM,
                        boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
                    }}
                >
                    {title && (
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
                    )}
                    {children}
                </SidePanel>
            </S.SidePanel>
        </S.SidePanels>
    );
}

export default PanelContainer;
