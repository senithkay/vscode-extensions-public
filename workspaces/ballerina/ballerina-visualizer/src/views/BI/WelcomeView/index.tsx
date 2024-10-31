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

const Wrapper = styled.div`
    height: calc(100vh - 100px);
    max-width: 660px;
    margin: 80px 120px;
    overflow: auto;
`;

const Headline = styled.div`
    font-size: 2.7em;
    font-weight: 400;
    font-size: 2.7em;
    white-space: nowrap;
    margin-bottom: 20px;
`;

const StyledButton = styled(Button)`
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

//

const TitleContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 20px;
`;

const Caption = styled.div`
    font-size: 1.1em;
    line-height: 1.5em;
    font-weight: 400;
    margin-top: 0;
    margin-bottom: 5px;
`;

const StepContainer = styled.div`
    margin-top: 60px;
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 48px;
`;

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 10px;
`;

const Column = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
`;

const StepTitle = styled.div<{ color?: string }>`
    font-size: 1.5em;
    font-weight: 400;
    margin-top: 0;
    margin-bottom: 5px;
    color: ${(props: { color?: string }) => props.color || "inherit"};
`;

const StepDescription = styled.div<{ color?: string }>`
    font-size: 1em;
    font-weight: 400;
    margin-top: 0;
    margin-bottom: 5px;
    color: ${(props: { color?: string }) => props.color || "inherit"};
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
        <Wrapper>
            <TitleContainer>
                <Headline>Kola Integrator for VS Code</Headline>
                <Caption>
                    A comprehensive integration solution that simplifies your digital transformation journey.
                    Streamlines connectivity among applications, services, data, and cloud using a user-friendly
                    low-code graphical designing experience.
                </Caption>
            </TitleContainer>

            <StepContainer>
                <Row>
                    <Column>
                        <StepTitle>Get Started Quickly</StepTitle>
                        <StepDescription>
                            New to Kola? Start here! Explore step-by-step tutorials to help you get up and running with
                            ease. <VSCodeLink onClick={openGettingStartedGuide}>Read the Guide</VSCodeLink>.
                        </StepDescription>
                    </Column>
                </Row>
                <Row>
                    <Column>
                        <StepTitle>Create Your First Integration</StepTitle>
                        <StepDescription>
                            Ready to build? Start a new integration project using our intuitive graphical designer.
                        </StepDescription>
                        <StyledButton appearance="primary" onClick={() => goToCreateProject()}>
                            <ButtonContent>
                                <Codicon name="add" iconSx={{ fontSize: 16 }} />
                                Create New Integration
                            </ButtonContent>
                        </StyledButton>
                    </Column>
                </Row>
                <Row>
                    <Column>
                        <StepTitle>Explore Pre-Built Samples</StepTitle>
                        <StepDescription>
                            Need inspiration? Browse through sample projects to see how Kola handles real-world
                            integrations. <VSCodeLink onClick={openGettingStartedGuide}>Explore Samples</VSCodeLink>.
                        </StepDescription>
                    </Column>
                </Row>
            </StepContainer>
        </Wrapper>
    );
}
