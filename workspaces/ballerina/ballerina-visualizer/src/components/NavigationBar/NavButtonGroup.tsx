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

interface NavButtonGroupProps {
    currentProjectPath?: string;
}

export function NavButtonGroup(props: NavButtonGroupProps) {

    const { rpcClient } = useVisualizerContext();
    const [isHistoryAvailable, setIsHistoryAvailable] = useState(false);
    rpcClient.getVisualizerRpcClient().getHistory().then((history) => {
        setIsHistoryAvailable(history.length > 0);
    });


    const handleBackButtonClick = () => {
        rpcClient.getVisualizerRpcClient().goBack();
    }

    const handleHomeButtonClick = () => {
        rpcClient.getVisualizerRpcClient().goHome();
    }

    return (
        <>
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
        </>
    );
}
