/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Icon } from "@wso2-enterprise/ui-toolkit";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";

const NavContainer = styled.div`
    display: flex;
    align-items: center;
    min-height: 48px;
    padding: 0 16px;
    gap: 8px;
    background-color: var(--vscode-editor-background);
    z-index: 1000;
`;

const BreadcrumbContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 4px;
    color: var(--vscode-foreground);
`;

const BreadcrumbSeparator = styled.span`
    color: var(--vscode-descriptionForeground);
`;

const IconButton = styled.div`
    padding: 4px;
    cursor: pointer;
    border-radius: 4px;

    &:hover {
        background-color: var(--vscode-toolbar-hoverBackground);
    }

    & > div:first-child {
        width: 20px;
        height: 20px;
        font-size: 20px;
    }
`;

const BreadcrumbItem = styled.span<{ clickable?: boolean }>`
    ${({ clickable }: { clickable?: boolean }) =>
        clickable &&
        `
        cursor: pointer;
        &:hover {
            text-decoration: underline;
        }
    `}
`;

interface TopNavigationBarProps {
    onBack?: () => void;
    onHome?: () => void;
}

export function TopNavigationBar(props: TopNavigationBarProps) {
    const { onBack, onHome } = props;
    const { rpcClient } = useRpcContext();
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        rpcClient
            .getVisualizerRpcClient()
            .getHistory()
            .then((history) => {
                console.log(">>> history", history);
                setHistory(history);
            });
    }, []);

    const handleBack = () => {
        rpcClient.getVisualizerRpcClient()?.goBack();
        onBack?.();
    };

    const handleHome = () => {
        rpcClient.getVisualizerRpcClient()?.goHome();
        onHome?.();
    };

    const handleCrumbClick = (index: number) => {
        if (index < history.length - 1) {
            rpcClient.getVisualizerRpcClient().goSelected(index);
        }
    };

    return (
        <NavContainer>
            {onBack && (
                <IconButton onClick={handleBack}>
                    <Icon name="bi-arrow-back" />
                </IconButton>
            )}
            <IconButton onClick={handleHome}>
                <Icon name="bi-home" />
            </IconButton>
            <BreadcrumbContainer>
                {history.map((crumb, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <BreadcrumbSeparator>/</BreadcrumbSeparator>}
                        <BreadcrumbItem
                            clickable={index < history.length - 1}
                            onClick={() => index < history.length - 1 && handleCrumbClick(index)}
                        >
                            {getShortNames(crumb.location.view)}
                        </BreadcrumbItem>
                    </React.Fragment>
                ))}
            </BreadcrumbContainer>
        </NavContainer>
    );
}

function getShortNames(name: string) {
    switch (name) {
        case "BI Diagram":
            return "Diagram";
        case "BI Component View":
            return "Constructs";
        case "BI Welcome":
            return "Welcome";
        case "BI Project Form":
            return "Project";
        case "Add Automation":
            return "Automation";
        case "Add Function":
            return "Function";
        case "Add Test Function":
            return "Test Function";
        case "Service Wizard":
        case "Service Config View":
            return "Service";
        case "Service Designer":
            return "Service Designer";
        case "Listener Config View":
            return "Listener";
        case "Add Data Mapper":
            return "Data Mapper";
        case "Add Connection Wizard":
        case "Edit Connection Wizard":
            return "Connection";
        case "View Config Variables":
        case "Edit Config Variables":
            return "Configurable Variables";
        case "Type Diagram":
        case "Edit Type":
        case "Add Type":
            return "Types";

        default:
            return name;
    }
}
