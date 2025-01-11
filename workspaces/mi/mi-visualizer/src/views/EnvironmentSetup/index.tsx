/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Button, Icon, ProgressRing, VSCodeColors, FormGroup, OptionProps, Dropdown } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { DownloadProgressData, EVENT_TYPE, SetupDetails, PathResponse } from "@wso2-enterprise/mi-core";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    max-width: 800px;
    height: 90%;
    margin: 2em auto 0;
    padding: 0 32px;
    gap: 32px;
    box-sizing: border-box;
    overflow-y: auto; 

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
`;

const HeadlineSecondary = styled.h2`
    font-size: 1.5em;
    font-weight: 400;
    white-space: nowrap;
`;

const ErrorMessage = styled.div`
    color: red;
`;

const StepContainer = styled.div`
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

const SpaceBetweenRow = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
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
    const [setupDetails, setMiDetails] = useState<SetupDetails>({
        isSupportedMIVersion: false, showDownloadButtons: false, javaDetails:
        {
            version: "",
            path: "",
            status: "not-valid"
        }, miDetails: {
            version: "",
            path: "",
            status: "not-valid"
        }
    });
    const [isPomValid, setIsPomValid] = useState<boolean>(true);
    const [isJavaDownloading, setIsJavaDownloading] = useState(false);
    const [isMIDownloading, setIsMIDownloading] = useState(false);
    const [javaProgress, setJavaProgress] = useState<number>(0);
    const [miProgress, setMiProgress] = useState<number>(0);
    const [error, setError] = useState<string>();
    const [javaPath, setJavaPath] = useState<PathResponse>({ status: "not-valid" });
    const [miPath, setMiPath] = useState<PathResponse>({ status: "not-valid" });
    const [supportedMIVersions, setSupportedMIVersions] = useState<OptionProps[]>([]);
    const [selectedRuntimeVersion, setSelectedRuntimeVersion] = useState<string>('');
    const [showInlineDownloadButton, setShowInlineDownloadButton] = useState<boolean>(false);
    useEffect(() => {
        const fetchMIVersionAndSetup = async () => {
            const setUpDetails = await rpcClient.getMiVisualizerRpcClient().getProjectSetupDetails();
            if (setUpDetails.isSupportedMIVersion) {
                setMiDetails(setupDetails);
                setJavaPath(setupDetails.javaDetails);
                setMiPath(setupDetails.miDetails);
                setShowInlineDownloadButton(setupDetails.showDownloadButtons);
            } else {
                const supportedVersions = await rpcClient.getMiVisualizerRpcClient().getSupportedMIVersionsHigherThan('');
                const supportedMIVersions = supportedVersions.map((version: string) => ({ value: version, content: version }));
                setSupportedMIVersions(supportedMIVersions);
                setSelectedRuntimeVersion(supportedMIVersions[0].value);
                setIsPomValid(false);
            }
        };
        fetchMIVersionAndSetup();
    }, [rpcClient]);

    const handleDownload = async () => {

        if (javaPath?.status !== "valid") {
            await handleJavaDownload();
        }
        if (miPath?.status !== "valid") {
            await handleMIDownload();
        }

        rpcClient.getMiVisualizerRpcClient().openView({
            type: EVENT_TYPE.REFRESH_ENVIRONMENT,
            location: {},
        });
    }

    const handleJavaDownload = async () => {
        setIsJavaDownloading(true);
        setError(undefined);
        try {
            rpcClient.onDownloadProgress((data: DownloadProgressData) => {
                setJavaProgress(data.percentage);
            });
            const javaPath = await rpcClient.getMiVisualizerRpcClient().downloadJava(setupDetails.javaDetails.version);
            await rpcClient.getMiVisualizerRpcClient().setJavaAndMIPaths({ javaPath });
            setJavaPath({ path: javaPath, status: "valid" });
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsJavaDownloading(false);
        }
    }
    const handleMIDownload = async () => {
        setIsMIDownloading(true);
        setError(undefined);
        try {
            rpcClient.onDownloadProgress((data: DownloadProgressData) => {
                setMiProgress(data.percentage);
            });
            const miPath = await rpcClient.getMiVisualizerRpcClient().downloadMI(setupDetails.miDetails.version);
            await rpcClient.getMiVisualizerRpcClient().setJavaAndMIPaths({ miPath });
            setMiPath({ path: miPath, status: "valid" });
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsMIDownloading(false);
        }
    }

    const selectMIPath = async () => {
        const selectedMIPath = await rpcClient.getMiVisualizerRpcClient().selectFolder("Select the Micro Integrator runtime path");
        if (selectedMIPath) {
            const { miDetails } = await rpcClient.getMiVisualizerRpcClient().setJavaAndMIPaths({ miPath: selectedMIPath });
            if (miDetails.status !== "not-valid") {
                setMiPath(miPath);
                setShowInlineDownloadButton(true);
            }
        }
    }

    const selectJavaHome = async () => {
        const selectedJavaHome = await rpcClient.getMiVisualizerRpcClient().selectFolder("Select the Java Home path");
        if (selectedJavaHome) {
            const { javaDetails } = await rpcClient.getMiVisualizerRpcClient().setJavaAndMIPaths({ javaPath: selectedJavaHome });
            if (javaDetails.status !== "not-valid") {
                setJavaPath(javaPath);
                setShowInlineDownloadButton(true);
            }
        }
    }

    const getIcon = (complete: boolean, loading: boolean, sx?: any) => {
        if (complete) {
            return <Icon name="enable-inverse" iconSx={{ fontSize: "15px", color: VSCodeColors.PRIMARY, ...sx }} />;
        } else if (loading) {
            return <ProgressRing sx={{ height: "16px", width: "16px", ...sx }} color={VSCodeColors.PRIMARY} />;
        } else {
            return <Icon name="radio-button-unchecked" iconSx={{ fontSize: "16px", ...sx }} />;
        }
    };

    function renderJavaSetup() {
        switch (javaPath?.status) {
            case "valid":
                return renderJavaValid();
            case "mismatch":
                return renderJavaMismatch();
            case "not-valid":
                return renderJavaNotFound();
            default:
                return null;
        }
        function renderJavaValid() {
            return (<Row>
                <IconContainer>
                    {getIcon(true, false, { cursor: "default" })}
                </IconContainer>
                <Column>
                    <StepTitle color={VSCodeColors.PRIMARY}>Java is setup.</StepTitle>
                    <StepDescription color={VSCodeColors.PRIMARY}>Java is already setup.</StepDescription>
                    {javaPath && <StepDescription color={VSCodeColors.PRIMARY}>Current Java Home: {javaPath.path}</StepDescription>}
                </Column>
            </Row>);
        }
        function renderJavaMismatch() {
            return (<SpaceBetweenRow>
                <Row>
                    <IconContainer>
                        {getIcon(true, false, { cursor: "default" })}
                    </IconContainer>
                    <Column>
                        <StepTitle>Java is available</StepTitle>
                        <StepDescription>Note: Available Java ({javaPath.version}) does not match the recommended version: {setupDetails.javaDetails.version}</StepDescription>
                        {javaPath && <StepDescription>Current Java Home: {javaPath.path}</StepDescription>}
                    </Column>
                </Row>
                {showInlineDownloadButton &&
                    <Button onClick={handleJavaDownload} disabled={isMIDownloading || isJavaDownloading}>
                        Download Java {setupDetails.javaDetails.version}
                    </Button>}
            </SpaceBetweenRow>);
        }
        function renderJavaNotFound() {
            return (<SpaceBetweenRow>
                <Row>
                    <IconContainer>
                        {getIcon(false, false, { cursor: "default" })}
                    </IconContainer>
                    <Column>
                        <StepTitle>Java is not available</StepTitle>
                        <StepDescription>Download the Java runtime required to run MI.</StepDescription>
                    </Column>
                </Row>
                {showInlineDownloadButton &&
                    <Button onClick={handleJavaDownload} disabled={isMIDownloading || isJavaDownloading}>
                        Download Java
                    </Button>}
            </SpaceBetweenRow>);
        }
    }

    function renderDownloadJava() {
        return (<Row>
            <IconContainer>
                {getIcon(javaProgress === 100, javaProgress > 0 && javaProgress < 100, { cursor: "default" })}
            </IconContainer>
            <Column>
                <StepTitle>Download Java {javaProgress ? `( ${javaProgress}% )` : ""}</StepTitle>
                <StepDescription>Fetching the Java runtime required to run MI.</StepDescription>
            </Column>
        </Row>);
    }

    function renderMISetup() {
        switch (miPath?.status) {
            case "valid":
                return renderMIValid();
            case "mismatch":
                return renderMIMismatch();
            case "not-valid":
                return renderMINotFound();
            default:
                return null;
        }
        function renderMIValid() {
            return (<Row>
                <IconContainer>
                    {getIcon(true, false, { cursor: "default" })}
                </IconContainer>
                <Column>
                    <StepTitle color={VSCodeColors.PRIMARY}>Micro Integrator is setup.</StepTitle>
                    <StepDescription color={VSCodeColors.PRIMARY}>Micro Integrator is already setup.</StepDescription>
                    {miPath && <StepDescription color={VSCodeColors.PRIMARY}>MI Path: {miPath.path}</StepDescription>}
                </Column>
            </Row>);
        }
        function renderMIMismatch() {
            return (<SpaceBetweenRow>
                <Row>
                    <IconContainer>
                        {getIcon(true, false, { cursor: "default" })}
                    </IconContainer>
                    <Column>
                        <StepTitle>Micro Integrator is available</StepTitle>
                        <StepDescription>Note: Available Micro Integrator ({miPath.version}) does not match the recommended version: {setupDetails.miDetails.version}</StepDescription>
                        {miPath && <StepDescription>MI Path: {miPath.path}</StepDescription>}
                    </Column>
                </Row>
                {showInlineDownloadButton &&
                    <Button onClick={handleMIDownload} disabled={isMIDownloading || isJavaDownloading}>
                        Download MI {setupDetails.miDetails.version}
                    </Button>}
            </SpaceBetweenRow>);
        }
        function renderMINotFound() {
            return (<SpaceBetweenRow>
                <Row>
                    <IconContainer>
                        {getIcon(false, false, { cursor: "default" })}
                    </IconContainer>
                    <Column>
                        <StepTitle>Micro Integrator is not available</StepTitle>
                        <StepDescription>Download the MI runtime required to run MI.</StepDescription>
                    </Column>
                </Row>
                {showInlineDownloadButton &&
                    <Button onClick={handleMIDownload} disabled={isMIDownloading || isJavaDownloading}>
                        Download MI
                    </Button>}
            </SpaceBetweenRow>);
        }
    }

    function renderDownloadMI() {
        return (<Row>
            <IconContainer>
                {getIcon(miProgress === 100, miProgress > 0 && miProgress < 100, { cursor: "default" })}
            </IconContainer>
            <Column>
                <StepTitle>Download Micro Integrator {miProgress ? `( ${miProgress}% )` : ""}</StepTitle>
                <StepDescription>Fetching the MI runtime required to run MI.</StepDescription>
            </Column>
        </Row>);
    }

    function renderContinue() {
        const javaStatus = javaPath?.status;
        const miStatus = miPath?.status;
        const isEnable = javaStatus !== "not-valid" && miStatus !== "not-valid";
        const needSetup = javaStatus !== "valid" || miStatus !== "valid";
        const bothNotFound = javaStatus === "not-valid" && miStatus === "not-valid";

        return (
            <>
                {isEnable && needSetup &&
                    <>
                        <StepDescription>
                            Project is not properly setup. You can continue anyway. However, the project may not work as expected.
                        </StepDescription>
                        <Column>
                            <Button appearance="secondary"
                                disabled={refreshDisabled()} onClick={() => refreshProject()}>
                                Continue Anyway
                            </Button>
                        </Column>
                    </>
                }
                {!needSetup && <>
                    <StepDescription>
                        Project is properly setup. Click continue to open the project.
                    </StepDescription>
                    <Column>
                        <Button
                            disabled={refreshDisabled()} onClick={() => refreshProject()}>
                            Continue
                        </Button>
                    </Column>
                </>
                }
                {bothNotFound &&
                    <Column>
                        <Button onClick={handleDownload} disabled={isMIDownloading || isJavaDownloading}>
                            Download Java & MI
                        </Button>
                    </Column>
                }
            </>
        );

    }

    const refreshProject = () => {
        let isJavaSet = javaPath?.status !== "not-valid";
        let isMISet = miPath?.status !== "not-valid";

        if (isJavaSet && isMISet) {

            if (javaPath?.status !== "not-valid") {
                rpcClient.getMiVisualizerRpcClient().setJavaAndMIPaths({ javaPath: javaPath.path });
            }
            if (miPath?.status !== "not-valid") {
                rpcClient.getMiVisualizerRpcClient().setJavaAndMIPaths({ miPath: miPath.path });
            }

            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.REFRESH_ENVIRONMENT,
                location: {},
            });
        }
    }
    const refreshDisabled = () => {
        return (javaPath?.status === "not-valid" || miPath?.status === "not-valid") || (isJavaDownloading || isMIDownloading);
    }

    return (
        <Container>
            <TitlePanel>
                <Headline>Micro Integrator (MI) for VS Code</Headline>
                <HeadlineSecondary>Micro Integrator version {setupDetails.miDetails.version} is not setup.</HeadlineSecondary>
            </TitlePanel>

            {isPomValid ? (
                <>
                    <StepContainer>
                        <StepDescription>
                            Download and setup the Java and Micro Integrator runtime.
                        </StepDescription>
                        {renderContinue()}
                        <hr style={{ flexGrow: 1, margin: '0 10px', borderColor: 'var(--vscode-editorIndentGuide-background)' }} />
                        {isJavaDownloading ? renderDownloadJava() : renderJavaSetup()}
                        {isMIDownloading ? renderDownloadMI() : renderMISetup()}
                        {(javaPath.status !== "valid" || miPath.status !== "valid") &&
                            <FormGroup title="Advanced Options">
                                <React.Fragment>
                                    {javaPath?.status !== "valid" &&
                                        <>
                                            <Row>
                                                <StepDescription>
                                                    Java {setupDetails.javaDetails.version} is required. Select Java Home path if you have already installed.
                                                </StepDescription>
                                            </Row>
                                            <Row>
                                                <Column>
                                                    <Button appearance="secondary" disabled={isMIDownloading || isJavaDownloading} onClick={() => selectJavaHome()}>
                                                        Select Java Home
                                                    </Button>
                                                </Column>
                                            </Row>
                                            <hr style={{ flexGrow: 1, margin: '0 10px', borderColor: 'var(--vscode-editorIndentGuide-background)' }} />
                                        </>
                                    }
                                    {miPath?.status !== "valid" && (
                                        <>
                                            <Row>
                                                <StepDescription>
                                                    Micro Integrator runtime {setupDetails.miDetails.version} is required. Select MI path if you have already installed.
                                                    <br />
                                                    <strong>Note:</strong> All the artifacts in the server will be cleaned in this selected runtime.
                                                </StepDescription>
                                            </Row>
                                            <Row>
                                                <Column>
                                                    <Button appearance="secondary" disabled={isMIDownloading || isJavaDownloading} onClick={() => selectMIPath()}>
                                                        Select MI Path
                                                    </Button>
                                                </Column>
                                            </Row>
                                            <hr style={{ flexGrow: 1, margin: '0 10px', borderColor: 'var(--vscode-editorIndentGuide-background)' }} />
                                        </>
                                    )}
                                </React.Fragment>
                            </FormGroup>}
                    </StepContainer>
                </>
            ) : (
                <>
                    <div>
                        <p>
                            Unsupported project runtime version detected in <code>pom.xml</code>.
                        </p>
                        <p>
                            Update the runtime version in your <code>pom.xml</code> file to a supported version.
                        </p>
                    </div>

                    <Dropdown
                        id='miVersion'
                        label="Micro Integrator runtime version"
                        isRequired={true}
                        items={supportedMIVersions}
                        onChange={(e) => setSelectedRuntimeVersion(e.target.value)}
                    />
                    <Button onClick={() => {
                        if (selectedRuntimeVersion) {
                            rpcClient.getMiVisualizerRpcClient().updateRuntimeVersionsInPom(selectedRuntimeVersion).then((result) => {
                                if (result) {
                                    rpcClient.getMiVisualizerRpcClient().reloadWindow();
                                }
                            }).catch((error) => {
                                setError((error as Error).message);
                            });
                        }
                    }}
                    >
                        Save
                    </Button>
                </>
            )}
            {error && <ErrorMessage>{error}</ErrorMessage>}
        </Container>
    );
};