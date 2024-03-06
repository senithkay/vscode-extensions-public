/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import React, { useState } from "react";

import { Codicon } from "@wso2-enterprise/ui-toolkit";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";
import { HistoryEntry } from "@wso2-enterprise/ballerina-core";
import styled from "@emotion/styled";

interface NavButtonGroupProps {
    historyStack?: HistoryEntry[];
}

const LeftSection = styled.div``;
const RightSection = styled.div``;

export function NavButtonGroup(props: NavButtonGroupProps) {

    const { historyStack } = props;
    const { rpcClient } = useVisualizerContext();
    const isHistoryAvailable = historyStack && historyStack.length > 0;

    const handleBackButtonClick = () => {
        rpcClient.getVisualizerRpcClient().goBack();
    }

    const handleHomeButtonClick = () => {
        rpcClient.getVisualizerRpcClient().goHome();
    }
    const handleProjectDesignClick = () => {
        rpcClient.getVisualizerRpcClient().openView({ view: "ArchitectureDiagram" });
    }

    return (
        <>
            <LeftSection>
                <VSCodeButton
                appearance="icon"
                title="Go Back"
                onClick={isHistoryAvailable ? handleBackButtonClick : undefined}
                style={{color: isHistoryAvailable
                    ? "var(--vscode-activityBar-foreground)"
                    : "var(--vscode-activityBar-inactiveForeground)"
                }}
            >
                    <Codicon name="arrow-left" />
                </VSCodeButton>
                <VSCodeButton
                appearance="icon"
                title="Home"
                onClick={isHistoryAvailable ? handleHomeButtonClick : undefined}
                style={{color: isHistoryAvailable
                    ? "var(--vscode-activityBar-foreground)"
                    : "var(--vscode-activityBar-inactiveForeground)"
                }}
            >
                    <Codicon name="home" />
                </VSCodeButton>
            </LeftSection>
            <RightSection>
                <VSCodeButton appearance="icon" title="Architecture Diagram" onClick={handleProjectDesignClick}>
                    <Codicon name="type-hierarchy-sub" />
                </VSCodeButton>
            </RightSection>
        </>
    );
}
