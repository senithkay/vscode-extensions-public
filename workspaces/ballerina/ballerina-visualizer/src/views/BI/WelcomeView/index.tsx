/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { MACHINE_VIEW, EVENT_TYPE } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import styled from "@emotion/styled";
import { Button, Codicon } from "@wso2-enterprise/ui-toolkit";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";

const TextWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const Wrapper = styled.div`
    height: calc(100vh - 100px);
    max-width: 800px;
    margin: 80px 120px;
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
    margin-bottom: 20px;
`;

const SubTitle = styled.div`
    font-weight: 400;
    margin-top: 0;
    margin-bottom: 5px;
    font-size: 1.5em;
    line-height: normal;
`;

const Grid = styled.div({
    display: "flex",
    flexDirection: "row",
    gap: 20,
});

const AddButton = styled(Button)`
    margin-top: 10px;
    width: 100%;
`;

const ButtonContent = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    height: 28px;
`;

export function WelcomeView() {
    const { rpcClient } = useRpcContext();

    const goToCreateProject = () => {
        rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.BIProjectForm,
            },
        });
    };

    const openGettingStartedGuide = () => {
        // rpcClient.getVisualizerRpcClient().openExternal({
        //     uri: "https://mi.docs.wso2.com/en/4.3.0/get-started/development-kickstart/"
        // })
    };

    return (
        <>
            <Wrapper>
                <TitlePanel>
                    <Headline>Kola Integrator for VS Code</Headline>
                    <span>
                        A comprehensive integration solution that simplifies your digital transformation journey.
                        Streamlines connectivity among applications, services, data, and cloud using a user-friendly
                        low-code graphical designing experience.{" "}
                    </span>
                </TitlePanel>
                <Grid>
                    <Pane>
                        <Tab>
                            <SubTitle>Getting started</SubTitle>
                            <span>
                                Learn about the BI Extension in our{" "}
                                <VSCodeLink onClick={openGettingStartedGuide}>Getting Started Guide</VSCodeLink>.
                            </span>
                        </Tab>
                        <Tab>
                            <SubTitle>Create New Project</SubTitle>
                            <span>Create a new project by clicking the button below.</span>
                            <AddButton appearance="primary" onClick={() => goToCreateProject()}>
                                <ButtonContent>
                                    <Codicon name="add" iconSx={{ fontSize: 16 }} />
                                    <TextWrapper>Create New Project</TextWrapper>
                                </ButtonContent>
                            </AddButton>
                        </Tab>
                        <Tab>
                            <SubTitle>Explore Samples</SubTitle>
                            <span>
                                Have a look at some examples.
                                <VSCodeLink onClick={openGettingStartedGuide}>View Samples</VSCodeLink>.
                            </span>
                        </Tab>
                    </Pane>
                </Grid>
            </Wrapper>
        </>
    );
}
