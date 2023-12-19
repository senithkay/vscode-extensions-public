/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from 'react';
import { Codicon } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { VSCodeButton, VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import { useVisualizerContext } from '@wso2-enterprise/eggplant-rpc-client';

export function TitleBar(props: { clearSelection: () => void }) {
    const { eggplantRpcClient } = useVisualizerContext();

    const TitleBar = styled.div({
        width: "100%",
        overflow: "hidden",

    });

    const HeaderData = styled.div({
        display: "flex",
        justifyContent: "flex-end"
    });

    const handleDiagramView = () => {
        eggplantRpcClient.getWebviewRpcClient().executeCommand('eggplant.openLowCode');
    }

    const handleHomeView = () => {
        props.clearSelection();
    }

    return (
        <TitleBar>
            <HeaderData>
                <VSCodeButton appearance="icon" title="Home" onClick={handleHomeView} style={{ "marginRight": "5px" }}>
                    <Codicon name="home" />
                </VSCodeButton>
                <VSCodeButton appearance="icon" title="Show Diagram" onClick={handleDiagramView}>
                    <Codicon name="circuit-board" />
                </VSCodeButton>
            </HeaderData>
            <VSCodeDivider />
        </TitleBar>
    );
}
