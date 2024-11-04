/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { DownloadProgress } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import styled from "@emotion/styled";
import { Button, Icon, ProgressRing } from "@wso2-enterprise/ui-toolkit";
import { Colors } from "../../../resources/constants";

const Wrapper = styled.div`
    height: calc(100vh - 100px);
    max-width: 800px;
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
    gap: 20px;
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
    gap: 4px;
`;

const StepTitle = styled.div<{ color?: string }>`
    font-size: 1.2em;
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

const IconContainer = styled.div`
    margin-top: 4px;
`;

export interface SetupViewProps {
    haveLS: boolean;
}

export function SetupView(props: SetupViewProps) {
    const { rpcClient } = useRpcContext();
    const { haveLS } = props;

    const [progress, setProgress] = React.useState<DownloadProgress>(null);

    const downloadLS = () => {
        rpcClient.getCommonRpcClient().executeCommand({ commands: ["kolab-setup.setupKola"] });
    };

    const reloadVscode = () => {
        rpcClient.getCommonRpcClient().executeCommand({ commands: ["workbench.action.reloadWindow"] });
    };

    rpcClient?.onDownloadProgress((response: DownloadProgress) => {
        setProgress(response);
    });

    const getIcon = (complete: boolean, loading: boolean) => {
        if (complete) {
            return <Icon name="enable-inverse" iconSx={{ fontSize: "15px", color: Colors.PRIMARY }} />;
        } else if (loading) {
            return <ProgressRing sx={{ height: "16px", width: "16px" }} color={Colors.PRIMARY} />;
        } else {
            return <Icon name="radio-button-unchecked" iconSx={{ fontSize: "16px" }} />;
        }
    };

    return (
        <Wrapper>
            <TitleContainer>
                <Headline>Let's Set Up Kola for VSCode</Headline>
                <Caption>
                    Welcome to Kola! Let's quickly set up your environment to get started. Just click the button below,
                    and we’ll take care of everything step by step.
                </Caption>
            </TitleContainer>
            <StyledButton appearance="primary" onClick={() => downloadLS()} disabled={progress !== null}>
                <ButtonContent>Set Up</ButtonContent>
            </StyledButton>
            {progress &&
                <StepContainer>
                    <Row>
                        <IconContainer>
                            {getIcon(progress?.step > 1 || progress?.success, progress?.step === 1)}
                        </IconContainer>

                        <Column>
                            <StepTitle>Check Latest Version</StepTitle>
                            <StepDescription>Ensuring you have the latest version of the Kola runtime.</StepDescription>
                        </Column>
                    </Row>
                    <Row>
                        <IconContainer>
                            {getIcon(progress?.step > 2 || progress?.success, progress?.step === 2)}
                        </IconContainer>
                        <Column>
                            <StepTitle>
                                Download Kola Runtime {progress?.percentage ? "( " + progress.percentage + "% )" : ""}
                            </StepTitle>
                            <StepDescription>Fetching the runtime required to run Kola.</StepDescription>
                        </Column>
                    </Row>
                    <Row>
                        <IconContainer>
                            {getIcon(progress?.step > 3 || progress?.success, progress?.step === 3)}
                        </IconContainer>
                        <Column>
                            <StepTitle>Unzip Files</StepTitle>
                            <StepDescription>Unpacking the downloaded files to prepare for installation.</StepDescription>
                        </Column>
                    </Row>
                    <Row>
                        <IconContainer>
                            {getIcon(progress?.step > 4 || progress?.success, progress?.step === 4)}
                        </IconContainer>
                        <Column>
                            <StepTitle>Install Kola Runtime</StepTitle>
                            <StepDescription>Integrating the Kola runtime with your VSCode setup.</StepDescription>
                        </Column>
                    </Row>
                    <Row>
                        <IconContainer>
                            {getIcon(progress?.step > 5 || progress?.success, progress?.step === 5)}
                        </IconContainer>
                        <Column>
                            <StepTitle>Clean Up</StepTitle>
                            <StepDescription>Cleaning up temporary files and finalizing the setup.</StepDescription>
                        </Column>
                    </Row>
                </StepContainer>
            }
            {progress && progress.step && progress.step === -1 && (
                <StepContainer>
                    <Row>
                        <Column>
                            <StepTitle color={Colors.ERROR}>Something went wrong while setting up Kola</StepTitle>
                            <StepDescription>{progress.message}</StepDescription>
                            <StepDescription>
                                Please check your internet connection or permissions and try again.
                            </StepDescription>
                            <StyledButton appearance="primary" onClick={() => downloadLS()}>
                                <ButtonContent>Retry Setup</ButtonContent>
                            </StyledButton>
                        </Column>
                    </Row>
                </StepContainer>
            )}
            {progress && progress.success && (
                <StepContainer>
                    <Row>
                        <Column>
                            <StepTitle>Restart to Apply Changes</StepTitle>
                            <StepDescription>
                                To finish the setup, please restart the Kola extension. This ensures everything is
                                configured correctly and ready to use.
                            </StepDescription>
                            <StyledButton appearance="primary" onClick={() => reloadVscode()}>
                                <ButtonContent>Restart VSCode</ButtonContent>
                            </StyledButton>
                        </Column>
                    </Row>
                </StepContainer>
            )}
        </Wrapper>
    );
}
