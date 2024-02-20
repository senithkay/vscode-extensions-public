/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import React from "react";

import { Codicon } from "@wso2-enterprise/ui-toolkit";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useVisualizerContext } from "@wso2-enterprise/eggplant-rpc-client";
import styled from "@emotion/styled";

interface NavButtonGroupProps {
    currentProjectPath?: string;
}

const LeftSection = styled.div``;
const RightSection = styled.div``;

export function NavButtonGroup(props: NavButtonGroupProps) {

    const { rpcClient } = useVisualizerContext();


    const handleBackButtonClick = () => {
        rpcClient.getVisualizerRpcClient().goBack();
    }

    const handleHomeButtonClick = () => {
        rpcClient.getVisualizerRpcClient().openView({ view: "Overview" });
    }

    return (
        <>
            <LeftSection>
                <VSCodeButton appearance="icon" title="Go Back" onClick={handleBackButtonClick}>
                    <Codicon name="arrow-left" />
                </VSCodeButton>
                <VSCodeButton appearance="icon" title="Home" onClick={handleHomeButtonClick}>
                    <Codicon name="home" />
                </VSCodeButton>
            </LeftSection>
            <RightSection>
               
            </RightSection>
        </>
    );
}
