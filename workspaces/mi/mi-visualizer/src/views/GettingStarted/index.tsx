/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { SampleDownloadRequest, VisualizerLocation } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { SamplesView } from "../SamplesView";
import styled from "@emotion/styled";
import { Button, Codicon, ComponentCard, Grid } from "@wso2-enterprise/ui-toolkit";
import { ProjectWizard } from "../Forms/ProjectForm";
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react";

const TextWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const NavigationContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
`;

const IconWrapper = styled.div`
    height: 20px;
    width: 20px;
`;

const Wrapper = styled.div`
    height: calc(100vh - 100px);
    padding: 85px 120px;
    overflow: auto;
`;

const TitlePanel = styled.div`
    display: flex;
    flex-direction: column;
    padding-bottom: 40px;
`;

const Pane = styled.div`
    display: flex;
    padding: 0px !important;
    flex-direction: column;
    width: 100%;
`;

const ComponentCardStyles = {
    height: 50,
    width: "100%",
    marginBottom: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingLeft: 30
};

const CreateBtnStyles = {
    gap: 10,
    display: "flex",
    flexDirection: "row"
};

const Tab = styled.div`
    display: flex;
    flex-direction: column;
    padding: 20px 0px;
    gap: 5px;
`;

const Headline = styled.div`
    font-size: 2.7em;
    font-weight: 400;
    font-size: 2.7em;
    white-space: nowrap;
    padding-bottom: 10px;
`;

const SubTitle = styled.div`
    font-weight: 400;
    margin-top: 0;
    margin-bottom: 5px;
    font-size: 1.5em;
    line-height: normal;
`;

const SampleText = styled.div`
    display: flex;
    flex-direction: column;
`;

const SampleTitle = {
    margin:"4px 0px",
    fontSize: 14,
    fontWeight: 500,
    textAlign: "left",
    display: "inline-block"
}

export function GettingStarted() {
    const { rpcClient } = useVisualizerContext();
    const [state, setState] = React.useState<VisualizerLocation>(null);
    const [mode, setMode] = React.useState<string>("");

    useEffect(() => {
        if (rpcClient) {
            rpcClient.getVisualizerState().then((initialState) => {
                setState(initialState);
            });
        }
    }, [rpcClient]);

    const handleModeChange = (mode: string) => {
        setMode(mode);
    }

    const handleBackButtonClick = () => {
        setMode("");
    }

    const handleMoreSamples = () => {
        setMode("Samples");
    }

    const openTroubleshootGuide = () => {

    }

    const openGettingStartedGuide = () => {
    }

    function downloadSample(sampleName: string) {
        let request: SampleDownloadRequest = {
            zipFileName: sampleName
        }
        rpcClient.getMiVisualizerRpcClient().downloadSelectedSampleFromGithub(request);
    }

    return (
        <>
            {mode !== "" ? (
                <NavigationContainer id="nav-bar-main">
                    <VSCodeButton appearance="icon" title="Go Back" onClick={handleBackButtonClick}>
                        <Codicon name="arrow-left" />
                    </VSCodeButton>
                </NavigationContainer>
            ) : (
                <Wrapper>
                    <TitlePanel>
                        <Headline>MI for VS Code</Headline>
                        <span>The Micro Integrator provides developers with a flawless experience in developing, testing, and deploying integration solutions. </span>
                    </TitlePanel>
                    <Grid
                        columns={2}
                        direction="column">
                        <Pane>
                            <Tab>
                                <SubTitle>Getting started</SubTitle>
                                <span>Learn about the Micro Integrator Extension in our <VSCodeLink onClick={openGettingStartedGuide}>Getting Started Guide</VSCodeLink>.</span>
                            </Tab>
                            <Tab>
                                <SubTitle>Create New Project</SubTitle>
                                <span>Create an empty project.</span>
                                <Button appearance="primary" onClick={() => handleModeChange("NewProject")}>
                                    <div style={CreateBtnStyles}>
                                        <IconWrapper>
                                            <Codicon name="folder-library" iconSx={{ fontSize: 20 }} />
                                        </IconWrapper>
                                        <TextWrapper>Create New Project</TextWrapper>
                                    </div>
                                </Button>
                            </Tab>
                            <Tab>
                                <SubTitle>Troubleshooting</SubTitle>
                                <span>Experiencing problems? Start with our <VSCodeLink onClick={openTroubleshootGuide}>troubleshooting guide</VSCodeLink>.</span>
                            </Tab>
                        </Pane>
                        <Pane>
                            <Tab>
                                <SubTitle>Explore Samples</SubTitle>
                                <span>Have a look at some examples.</span>
                            </Tab>
                            <ComponentCard
                                onClick={() => downloadSample("HelloWorldService")}
                                sx={ComponentCardStyles}>
                                <img src="https://raw.githubusercontent.com/wso2/integration-studio/main/SamplesForVSCode/icons/Hello_World.png" className="card-image" />
                                <SampleText>
                                    <span style={SampleTitle}>Hello World Service</span>
                                    <span style={{ fontSize: '12px' }} >A simple HTTP service.</span>
                                </SampleText>
                            </ComponentCard>
                            <ComponentCard
                                onClick={() => downloadSample("APITesting")}
                                sx={ComponentCardStyles}>
                                <img src="https://raw.githubusercontent.com/wso2/integration-studio/main/SamplesForVSCode/icons/Testing_Templates.png" className="card-image" />
                                <SampleText>
                                    <span style={SampleTitle}>API Testing</span>
                                    <span style={{ fontSize: '12px' }} >Unit testing of a REST API artifact.</span>
                                </SampleText>
                            </ComponentCard>
                            <ComponentCard
                                onClick={() => downloadSample("ContentBasedRouting")}
                                sx={ComponentCardStyles}>
                                <img src="https://raw.githubusercontent.com/wso2/integration-studio/main/SamplesForVSCode/icons/Routing_Templates.png" className="card-image" />
                                <SampleText>
                                    <span style={SampleTitle}>Content Based Routing</span>
                                    <span style={{ fontSize: '12px' }} >Content-based message routing.</span>
                                </SampleText>
                            </ComponentCard>
                            <ComponentCard
                                onClick={() => downloadSample("DatabasePolling")}
                                sx={ComponentCardStyles}>
                                <img src="https://raw.githubusercontent.com/wso2/integration-studio/main/SamplesForVSCode/icons/Task_Templates.png" className="card-image" />
                                <SampleText>
                                    <span style={SampleTitle}>Database Polling</span>
                                    <span style={{ fontSize: '12px' }} >A simple HTTP service.</span>
                                </SampleText>
                            </ComponentCard>
                            <span><VSCodeLink onClick={handleMoreSamples}>more...</VSCodeLink></span>
                        </Pane>
                    </Grid>
                </Wrapper>
            )}
            {mode === "NewProject" && <ProjectWizard />}
            {mode === "Samples" && <SamplesView />}
        </>
    );
}
