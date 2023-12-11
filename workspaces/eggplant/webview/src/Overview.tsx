import React from 'react';
import styled from '@emotion/styled';
import { Overview as OverviewPanel } from "@wso2-enterprise/eggplant-overview";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { Codicon } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from '@wso2-enterprise/eggplant-rpc-client';

const Header = styled.div({
    width: "100%",
    overflow: "hidden",

});

const HeaderData = styled.div({
    display: "flex",
    justifyContent: "flex-end"
});

const Overview = () => {
    const { eggplantRpcClient } = useVisualizerContext();
    const handleDiagramView = () => {
        eggplantRpcClient.getWebviewRpcClient().executeCommand('eggplant.openLowCode');
    }

    const handleHomeView = () => {
        console.log("Home");
    }

    return (
        <div>
            <Header>
                <HeaderData>
                    <VSCodeButton appearance="icon" title="Home" onClick={handleHomeView}>
                        <Codicon name="home" />
                    </VSCodeButton>
                    <VSCodeButton appearance="icon" title="Show Diagram" onClick={handleDiagramView}>
                        <Codicon name="circuit-board" />
                    </VSCodeButton>
                </HeaderData>
            </Header>
            <OverviewPanel />
        </div>
    );
};

export default Overview;

