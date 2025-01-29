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
import { Button, FormGroup, OptionProps, Dropdown } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { DownloadProgressData, EVENT_TYPE, PathDetailsResponse } from "@wso2-enterprise/mi-core";
import { ButtonWithDescription, DownloadComponent, RuntimeStatus, Row, Column, StepDescription } from "./Components";

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


export const EnvironmentSetup = () => {
    const { rpcClient } = useVisualizerContext();
    const [recommendedVersions, setRecommendedVersions] = useState<{ miVersion: string, javaVersion: string }>({ miVersion: "", javaVersion: "" });
    const [isPomValid, setIsPomValid] = useState<boolean>(true);
    const [isJavaDownloading, setIsJavaDownloading] = useState(false);
    const [isMIDownloading, setIsMIDownloading] = useState(false);
    const [javaProgress, setJavaProgress] = useState<number>(0);
    const [miProgress, setMiProgress] = useState<number>(0);
    const [error, setError] = useState<string>();
    const [javaPathDetails, setJavaPathDetails] = useState<PathDetailsResponse>({ status: "not-valid" });
    const [miPathDetails, setPathDetails] = useState<PathDetailsResponse>({ status: "not-valid" });
    const [supportedMIVersions, setSupportedMIVersions] = useState<OptionProps[]>([]);
    const [selectedRuntimeVersion, setSelectedRuntimeVersion] = useState<string>('');
    const [showDownloadButtons, setShowDownloadButtons] = useState<boolean>(false);

    useEffect(() => {
        const fetchMIVersionAndSetup = async () => {
            const { recommendedVersions, javaDetails, miDetails, isSupportedMIVersion, showDownloadButtons } =
                await rpcClient.getMiVisualizerRpcClient().getProjectSetupDetails();
            if (isSupportedMIVersion) {
                setRecommendedVersions(recommendedVersions);
                setJavaPathDetails(javaDetails);
                setPathDetails(miDetails);
                setShowDownloadButtons(showDownloadButtons);
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
        if (javaPathDetails?.status === "not-valid") {
            await handleJavaDownload();
        }
        if (miPathDetails?.status === "not-valid") {
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
            const javaPath = await rpcClient.getMiVisualizerRpcClient().downloadJavaFromMI(recommendedVersions.miVersion);
            const javaDetails = await rpcClient.getMiVisualizerRpcClient().setPathsInWorkSpace({ type: 'JAVA', path: javaPath });
            setJavaPathDetails(javaDetails);
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
            const miPath = await rpcClient.getMiVisualizerRpcClient().downloadMI(recommendedVersions.miVersion);
            const miDetails = await rpcClient.getMiVisualizerRpcClient().setPathsInWorkSpace({ type: 'MI', path: miPath });
            setPathDetails(miDetails);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsMIDownloading(false);
        }
    }

    const selectMIPath = async () => {
        const selectedMIPath = await rpcClient.getMiVisualizerRpcClient().selectFolder("Select the Micro Integrator runtime path");
        if (selectedMIPath) {
            const miDetails = await rpcClient.getMiVisualizerRpcClient().setPathsInWorkSpace({ type: 'MI', path: selectedMIPath });
            if (miDetails.status !== "not-valid") {
                setPathDetails(miDetails);
            }
        }
    }

    const selectJavaHome = async () => {
        const selectedJavaHome = await rpcClient.getMiVisualizerRpcClient().selectFolder("Select the Java Home path");
        if (selectedJavaHome) {
            const javaDetails = await rpcClient.getMiVisualizerRpcClient().setPathsInWorkSpace({ type: 'JAVA', path: selectedJavaHome });
            if (javaDetails.status !== "not-valid") {
                setJavaPathDetails(javaDetails);
            }
        }
    }
    function renderJava() {
        const javaStatus = javaPathDetails?.status;
        const miStatus = miPathDetails?.status;
        const bothNotFound = javaStatus === "not-valid" && miStatus === "not-valid";
        if (isJavaDownloading) {
            return <DownloadComponent title="Java" description="Fetching the Java runtime required to run MI." progress={javaProgress} />;
        }
        return <RuntimeStatus
            type="JAVA"
            pathDetails={javaPathDetails}
            recommendedVersion={recommendedVersions.javaVersion}
            showInlineDownloadButton={showDownloadButtons && !(bothNotFound)}
            handleDownload={handleJavaDownload}
            isDownloading={isJavaDownloading || isMIDownloading}
        />
    }

    function renderMI() {
        const javaStatus = javaPathDetails?.status;
        const miStatus = miPathDetails?.status;
        const bothNotFound = javaStatus === "not-valid" && miStatus === "not-valid";
        if (isMIDownloading) {
            return <DownloadComponent title="Micro Integrator" description="Fetching the MI runtime required to run MI." progress={miProgress} />;
        }
        return <RuntimeStatus
            type="MI"
            pathDetails={miPathDetails}
            recommendedVersion={recommendedVersions.miVersion}
            showInlineDownloadButton={showDownloadButtons && !(bothNotFound)}
            handleDownload={handleMIDownload}
            isDownloading={isJavaDownloading || isMIDownloading}
        />
    }

    function renderContinue() {
        const javaStatus = javaPathDetails?.status;
        const miStatus = miPathDetails?.status;
        const isEnable = javaStatus !== "not-valid" && miStatus !== "not-valid";
        const needSetup = javaStatus !== "valid" || miStatus !== "valid";
        const bothNotFound = javaStatus === "not-valid" && miStatus === "not-valid";
        const refreshDisabled = (javaStatus === "not-valid" || miStatus === "not-valid") || (isJavaDownloading || isMIDownloading)
        if (isEnable && needSetup) {
            return <ButtonWithDescription buttonDisabled={refreshDisabled}
                onClick={refreshProject}
                buttonText="Continue Anyway"
                description="Project is not properly setup. You can continue anyway. However, the project may not work as expected."
                appearance="secondary"
            />
        } else if (!needSetup) {
            return <ButtonWithDescription buttonDisabled={refreshDisabled}
                onClick={refreshProject}
                buttonText="Continue"
                description="Project is properly setup. Click continue to open the project."
            />
        } else if (bothNotFound && showDownloadButtons) {
            return <ButtonWithDescription buttonDisabled={isJavaDownloading || isMIDownloading}
                onClick={handleDownload}
                buttonText="Download Java & MI"
                description="Download and setup the Java and Micro Integrator runtime."
            />
        } else {
            return <ButtonWithDescription buttonDisabled={true}
                onClick={refreshProject}
                buttonText="Continue"
                description="Setup properly to continue."
            />
        }
    }

    const refreshProject = async () => {
        let isJavaSet = javaPathDetails?.status !== "not-valid";
        let isMISet = miPathDetails?.status !== "not-valid";

        if (isJavaSet && isMISet) {
            await rpcClient.getMiVisualizerRpcClient().setPathsInWorkSpace({ type: 'MI', path: miPathDetails.path });
            await rpcClient.getMiVisualizerRpcClient().setPathsInWorkSpace({ type: 'JAVA', path: javaPathDetails.path });
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.REFRESH_ENVIRONMENT,
                location: {},
            });
        } else {
            setError("Java or MI paths are not set properly.");
        }
    }

    const getHeadlineDescription = () => {
        let isJavaSet = javaPathDetails?.status !== "not-valid";
        let isMISet = miPathDetails?.status !== "not-valid";

        if (isJavaSet && isMISet) {
            return `Micro Integrator version ${recommendedVersions.miVersion} is setup.`;
        } else {
            return `Micro Integrator version ${recommendedVersions.miVersion} is not setup.`;
        }
    }

    return (
        <Container>
            <TitlePanel>
                <Headline>Micro Integrator (MI) for VS Code</Headline>
                <HeadlineSecondary>{getHeadlineDescription()}</HeadlineSecondary>
            </TitlePanel>

            {isPomValid ? (
                <>
                    <StepContainer>
                        {renderContinue()}
                        <hr style={{ flexGrow: 1, margin: '0 10px', borderColor: 'var(--vscode-editorIndentGuide-background)' }} />
                        {renderJava()}
                        {renderMI()}
                        {(javaPathDetails.status !== "valid" || miPathDetails.status !== "valid") &&
                            <FormGroup title="Advanced Options" isCollapsed={showDownloadButtons}>
                                <React.Fragment>
                                    {javaPathDetails?.status !== "valid" &&
                                        <>
                                            <Row>
                                                <StepDescription>
                                                    Java {recommendedVersions.javaVersion} is required. Select Java Home path if you have already installed.
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
                                    {miPathDetails?.status !== "valid" && (
                                        <>
                                            <Row>
                                                <StepDescription>
                                                    Micro Integrator runtime {recommendedVersions.miVersion} is required. Select MI path if you have already installed.
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