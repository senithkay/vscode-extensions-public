/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { MACHINE_VIEW, EVENT_TYPE, DownloadProgress } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import styled from "@emotion/styled";
import { Button, Codicon } from "@wso2-enterprise/ui-toolkit";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";

const Wrapper = styled.div`
    max-width: 660px;
    margin: 80px 120px;
    height: calc(100vh - 160px);
    overflow-y: auto;
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

const Option = styled.div`
  display: flex;
  flex-direction: column;
  padding: 14px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  width: 100%;
  box-sizing: border-box;
  border-left: 3px solid #4a86e8;
`;

const OptionTitle = styled.div`
  font-weight: 500;
  font-size: 1.1em;
  margin-bottom: 8px;
`;

type WelcomeViewProps = {
    isBISupported: boolean;
};


export function WelcomeView(props: WelcomeViewProps) {
    const { rpcClient } = useRpcContext();
    const [isLoading, setIsLoading] = useState(false);
    const [updateComplete, setUpdateComplete] = useState(false);
    const [progress, setProgress] = useState<DownloadProgress>(null);

    const goToCreateProject = () => {
        rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.BIProjectForm,
            },
        });
    };

    const openGettingStartedGuide = () => {
        rpcClient.getCommonRpcClient().openExternalUrl({
            url: "https://bi.docs.wso2.com/get-started/quick-start-guide/"
        })
    };

    const openSamples = () => {
        rpcClient.getCommonRpcClient().openExternalUrl({
            url: "https://bi.docs.wso2.com/learn/message-transformation/"
        })
    };

    const updateBallerina = () => {
        setIsLoading(true);
        rpcClient.getCommonRpcClient().executeCommand({ commands: ["ballerina.update-ballerina"] });
    };

    rpcClient?.onDownloadProgress((response: DownloadProgress) => {
        setProgress(response);
    });

    return (
        <Wrapper>
            <TitleContainer>
                <Headline>Ballerina Integrator for VS Code</Headline>
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
                            New to Ballerina Integrator? Start here! Explore step-by-step tutorials to help you get up and running with
                            ease. <VSCodeLink onClick={openGettingStartedGuide}>Read the guide</VSCodeLink>.
                        </StepDescription>
                    </Column>
                </Row>
                <Row>
                    <Column>
                        <StepTitle>Create Your First Integration</StepTitle>
                        <StepDescription>
                            Ready to build? Start a new integration project using our intuitive graphical designer.
                        </StepDescription>
                        {props.isBISupported &&
                            <StyledButton disabled={!props.isBISupported} appearance="primary" onClick={() => goToCreateProject()}>
                                <ButtonContent>
                                    <Codicon name="add" iconSx={{ fontSize: 16 }} />
                                    Create New Integration
                                </ButtonContent>
                            </StyledButton>
                        }
                        {!props.isBISupported &&
                            <Option>
                                <OptionTitle>Update to Ballerina 2201.12.3</OptionTitle>
                                <StepDescription>
                                    Your current Ballerina distribution is not supported. Please update to version 2201.12.3 or above.
                                </StepDescription>
                                <StyledButton appearance="primary" onClick={updateBallerina}>
                                    <ButtonContent>
                                        Update NowX
                                    </ButtonContent>
                                </StyledButton>

                                {isLoading && (
                                    <div style={{ marginTop: 10 }}>
                                        <StepDescription>
                                            Updating Ballerina... This may take a few minutes.
                                        </StepDescription>
                                        <br />
                                        {progress && (
                                            <div style={{ display: 'flex', alignItems: 'center', marginTop: 5 }}>
                                                <StepDescription>{progress.message}</StepDescription>
                                                <div style={{
                                                    width: '100%',
                                                    height: '4px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '2px',
                                                    overflow: 'hidden',
                                                    position: 'relative'
                                                }}>
                                                    <div style={{
                                                        position: 'absolute',
                                                        width: `${progress.percentage}%`,
                                                        height: '100%',
                                                        backgroundColor: '#4a86e8',
                                                        borderRadius: '2px',
                                                        animation: 'progressAnimation 1.5s infinite ease-in-out'
                                                    }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {updateComplete && !isLoading && (
                                    <StyledButton appearance="primary" onClick={() => rpcClient.getCommonRpcClient().executeCommand({ commands: ["workbench.action.reloadWindow"] })}>
                                        <ButtonContent>
                                            Restart VS Code
                                        </ButtonContent>
                                    </StyledButton>
                                )}

                                <StepDescription style={{ marginTop: 10 }}>
                                    <strong>Please restart VS Code after updating the Ballerina distribution.</strong>
                                </StepDescription>
                            </Option>
                        }
                    </Column>
                </Row>
                <Row>
                    <Column>
                        <StepTitle>Explore Pre-Built Samples</StepTitle>
                        <StepDescription>
                            Need inspiration? Browse through sample projects to see how Ballerina Integrator handles real-world
                            integrations. <VSCodeLink onClick={openSamples}>Explore Samples</VSCodeLink>.
                        </StepDescription>
                    </Column>
                </Row>
            </StepContainer>
        </Wrapper>
    );
}
