/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useContext, useState, useEffect } from "react";
import styled from "@emotion/styled";

import { Icon, ProgressRing } from "@wso2-enterprise/ui-toolkit";
import SidePanelContext from "../sidePanel/SidePanelContexProvider";

export interface NodeLayerWidgetProps {
}

const Container = styled.div<{ isVisible: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    backdrop-filter: blur(5px);
    background-color: rgba(0, 0, 0, 0.1);
    pointer-events: auto;
    z-index: 3000;
    opacity: ${(props: any) => props.isVisible ? 1 : 0};
    transition: opacity 0.3s ease-in-out;
`;

export interface OverlayLayerAlertProps extends NodeLayerWidgetProps {
    message: string;
    onClose: () => void;
}

const AlertBox = styled.div<{ isVisible: boolean }>`
    background-color: var(--vscode-inputValidation-errorBackground);
    color: var(--vscode-editor-foreground);
    border: 1px solid var(--vscode-errorBorder);
    border-radius: 4px;
    padding: 20px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 4px 8px var(--vscode-widget-shadow);
    animation: pulse 2s infinite;
    position: relative;
    transform: ${(props: any) => props.isVisible ? 'scale(1)' : 'scale(0.8)'};
    opacity: ${(props: any) => props.isVisible ? 1 : 0};
    transition: transform 0.3s ease-out, opacity 0.3s ease-out;

    @keyframes pulse {
        0% { box-shadow: 0 4px 8px var(--vscode-widget-shadow); }
        50% { box-shadow: 0 4px 12px var(--vscode-errorBorder); }
        100% { box-shadow: 0 4px 8px var(--vscode-widget-shadow); }
    }
`;

const CloseButton = styled.button`
    position: absolute;
    top: 15px;
    right: 15px;
    background-color: transparent;
    color: var(--vscode-editorError-foreground);
    border: 1px solid var(--vscode-editorError-foreground);
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-weight: bold;
`;

const AlertTitle = styled.h3`
    margin-top: 0;
    margin-bottom: 10px;
    color: var(--vscode-list-errorForeground);
`;

const AlertMessage = styled.p`
    margin-bottom: 0;
    color: var(--vscode-list-errorForeground);
`;

export function OverlayLayerAlertWidget() {
    const sidePanelContext = useContext(SidePanelContext);
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(!!sidePanelContext.alertMessage);

    useEffect(() => {
        if (sidePanelContext.alertMessage) {
            setShouldRender(true);
            setTimeout(() => setIsVisible(true), 10);
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [sidePanelContext.alertMessage]);

    const onClose = () => {
        setIsVisible(false);
        // Wait for animation to complete before updating context
        setTimeout(() => {
            sidePanelContext.setSidePanelState((prevState: any) => ({
                ...prevState,
                alertMessage: undefined
            }));
        }, 300);
    };

    if (!shouldRender) {
        return null;
    }

    return (
        <div data-testid={"loading-overlay"}>
            <Container isVisible={isVisible}>
                <AlertBox isVisible={isVisible}>
                    <CloseButton onClick={onClose}><Icon name="close" isCodicon/></CloseButton>
                    <AlertTitle>Error</AlertTitle>
                    <AlertMessage>{sidePanelContext.alertMessage}</AlertMessage>
                </AlertBox>
            </Container>
        </div>
    );
};
