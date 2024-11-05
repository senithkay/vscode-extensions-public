/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { Button, Icon, ProgressRing, VSCodeColors } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { DownloadProgressData, EVENT_TYPE } from "@wso2-enterprise/mi-core";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    max-width: 800px;
    height: 100%;
    margin: 2em auto 0;
    padding: 0 32px;
    gap: 32px;
    box-sizing: border-box;

    @media (max-width: 768px) {
        max-width: fit-content;
    }
`;

const TitlePanel = styled.div`
    display: flex;
    flex-direction: column;
`;

const Headline = styled.h1`
    font-size: 2.7em;
    font-weight: 400;
    white-space: nowrap;
    padding-bottom: 10px;
`;

const ErrorMessage = styled.div`
    color: red;
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

export const EnvironmentSetup = () => {
    const { rpcClient } = useVisualizerContext();
    const [selectedMIVersion, setSelectedMIVersion] = useState<string>();
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string>();
    const [isPomValid, setIsPomValid] = useState<boolean>(true);
    const [isJavaSetUp, setIsJavaSetUp] = useState<boolean>(false);
    const [isMISetUp, setIsMISetUp] = useState<boolean>(false);
    const [javaProgress, setJavaProgress] = useState<number>(0);
    const [miProgress, setMiProgress] = useState<number>(0);

    useEffect(() => {
        const checkSetUp = async () => {
            const javaSetUp = await rpcClient.getMiVisualizerRpcClient().isJavaHomeSet();
            const miSetUp = await rpcClient.getMiVisualizerRpcClient().isMISet();
            setIsJavaSetUp(javaSetUp);
            setIsMISetUp(miSetUp);
        };
        const fetchMIVersion = async () => {
            try {
                const version = await rpcClient.getMiVisualizerRpcClient().getMIVersionFromPom();
                setSelectedMIVersion(version);
                checkSetUp();
            } catch (err) {
                console.error("Error fetching MI version from pom.xml:", err);
                setIsPomValid(false);
            }
        };

        fetchMIVersion();
    }, [rpcClient]);

    useEffect(() => {
        if (isJavaSetUp && isMISetUp) {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.REFRESH_ENVIRONMENT,
                location: {},
            });
        }
    }, [isJavaSetUp, isMISetUp, rpcClient]);

    const handleDownload = async () => {
        setIsDownloading(true);
        setError(undefined);
        try {
            if (!isJavaSetUp) {
                rpcClient.onDownloadProgress((data: DownloadProgressData) => {
                    setJavaProgress(data.percentage);
                });
                await rpcClient.getMiVisualizerRpcClient().downloadJava(selectedMIVersion);
            }
            if (!isMISetUp) {
                rpcClient.onDownloadProgress((data: DownloadProgressData) => {
                    setMiProgress(data.percentage);
                });
                await rpcClient.getMiVisualizerRpcClient().downloadMI(selectedMIVersion);
            }
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.REFRESH_ENVIRONMENT,
                location: {},
            });
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsDownloading(false);
        }
    };

    const getIcon = (complete: boolean, loading: boolean) => {
        if (complete) {
            return <Icon name="enable-inverse" iconSx={{ fontSize: "15px", color: VSCodeColors.PRIMARY }} />;
        } else if (loading) {
            return <ProgressRing sx={{ height: "16px", width: "16px" }} color={VSCodeColors.PRIMARY} />;
        } else {
            return <Icon name="radio-button-unchecked" iconSx={{ fontSize: "16px" }} />;
        }
    };
    const getDownloadButtonText = () => {
        const values: string[] = [];
        if (!isJavaSetUp) {
            values.push("Java");
        }
        if (!isMISetUp) {
            values.push("Micro Integrator");
        }
        return isDownloading ? `Downloading ${values.join(" and ")}...` :
            `Download and Set Up ${values.join(" and ")}`;
    }

    return (
        <Container>
            <TitlePanel>
                <Headline>Micro Integrator (MI) for VS Code</Headline>
            </TitlePanel>

            {isPomValid ? (
                <>
                    <div>
                        <p>Micro Integrator {selectedMIVersion} is not set up.</p>
                        <p>
                            This extension requires both Java and the Micro Integrator runtime to function properly.
                        </p>
                        <p>
                            Click the button below to automatically download and install the required Java and Micro Integrator runtime.
                        </p>
                    </div>
                    <div>
                        <Button onClick={handleDownload} disabled={isDownloading}>
                            {getDownloadButtonText()}
                        </Button>
                    </div>

                    <StepContainer>
                        {isJavaSetUp ?
                            <Row>
                                <IconContainer>
                                    {getIcon(true, false)}
                                </IconContainer>
                                <Column>
                                    <StepTitle color={VSCodeColors.PRIMARY}>Java is set up.</StepTitle>
                                    <StepDescription color={VSCodeColors.PRIMARY}>Java is already set up.</StepDescription>
                                </Column>
                            </Row> :
                            <Row>
                                <IconContainer>
                                    {getIcon(javaProgress === 100, javaProgress > 0 && javaProgress < 100)}
                                </IconContainer>
                                <Column>
                                    <StepTitle>Download Java {javaProgress ? `( ${javaProgress}% )` : ""}</StepTitle>
                                    <StepDescription>Fetching the Java runtime required to run MI.</StepDescription>
                                </Column>
                            </Row>}
                        {isMISetUp ?
                            <Row>
                                <IconContainer>
                                    {getIcon(true, false)}
                                </IconContainer>
                                <Column>
                                    <StepTitle color={VSCodeColors.PRIMARY}>Micro Integrator is set up.</StepTitle>
                                    <StepDescription color={VSCodeColors.PRIMARY}>Micro Integrator is already set up.</StepDescription>
                                </Column>
                            </Row> :
                            <Row>
                                <IconContainer>
                                    {getIcon(miProgress === 100, miProgress > 0 && miProgress < 100)}
                                </IconContainer>
                                <Column>
                                    <StepTitle>Download Micro Integrator {miProgress ? `( ${miProgress}% )` : ""}</StepTitle>
                                    <StepDescription>Fetching the MI runtime required to run MI.</StepDescription>
                                </Column>
                            </Row>}
                    </StepContainer>
                </>
            ) : (
                <div>
                    <p>
                        Failed to get the MI runtime version from <code>pom.xml</code>. The{" "}
                        <code>&lt;project.runtime.version&gt;</code> property tag was not found.
                    </p>
                    <p>
                        To proceed, set the MI runtime version manually and click the button below to reload the project.
                    </p>
                </div>
            )}
            {!isDownloading && <>
                <p>
                    <strong>Note:</strong> If you prefer to set up manually, follow these steps:
                    <ul>
                        <li>Press <code>Cmd + Shift + P</code> (or <code>Ctrl + Shift + P</code> on Windows/Linux) to open the Command Palette.</li>
                        <li>Type <code>MI: Set Java Home</code> and select the Java home directory.</li>
                        <li>Type <code>MI: Add MI Server</code> and select the Micro Integrator installation location.</li>
                        <li>Or, You can use the <code>Set Java Home</code> and <code>Add MI Server</code> buttons in the side bar.</li>
                        <li>After completing these steps, click "Reload Project" below to apply the changes.</li>
                    </ul>
                </p>
                <Button disabled={isDownloading} onClick={() => rpcClient.getMiVisualizerRpcClient().reloadWindow()}>
                    Reload Project
                </Button>
            </>}

            {error && <ErrorMessage>{error}</ErrorMessage>}
        </Container>
    );
};