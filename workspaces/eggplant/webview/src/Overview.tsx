import React from 'react';
import styled from '@emotion/styled';
import { Overview as OverviewPanel } from "@wso2-enterprise/eggplant-overview";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { Codicon } from "@wso2-enterprise/ui-toolkit";

const Header = styled.div({
    width: "100%",
    overflow: "hidden",

});

const HeaderData = styled.div({
    display: "flex",
    justifyContent: "flex-end"
});

const Overview = () => {

    const handleDiagramView = () => {
        console.log("BACK");
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

