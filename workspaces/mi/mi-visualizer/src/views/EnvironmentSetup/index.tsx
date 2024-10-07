/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */


import styled from "@emotion/styled";
import { EVENT_TYPE } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { Button, FormGroup } from "@wso2-enterprise/ui-toolkit";
import { useEffect, useState } from "react";

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

export const EnvironmentSetup = () => {
    const { rpcClient } = useVisualizerContext();
    const [selectedMIVersion, setSelectedMIVersion] = useState<string>();
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string>();
    const [isPomValid, setIsPomValid] = useState<boolean>(true);
    const [isJavaSetUp, setIsJavaSetUp] = useState<boolean>(false);
    const [isMISetUp, setIsMISetUp] = useState<boolean>(false);

    // Fetch supported MI versions on component mount
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

    // Handle the download of Java and MI
    const handleDownload = async () => {
        setIsDownloading(true);
        setError(undefined);

        const downloadPromises = [];
        if (!isJavaSetUp) {
            downloadPromises.push(
                rpcClient.getMiVisualizerRpcClient().downloadJava(selectedMIVersion)
            );
        }
        if (!isMISetUp) {
            downloadPromises.push(
                rpcClient.getMiVisualizerRpcClient().downloadMI(selectedMIVersion)
            );
        }
        try {
            await Promise.all(downloadPromises);
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.REFRESH_ENVIRONMENT,
                location: {},
            });
        } catch (err) {
            console.error("Error downloading Java/MI:", err);
            setError("Failed to download Java or MI. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

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
                            {isDownloading
                                ? "Downloading Java and MI runtime..."
                                : "Download and Set Up MI runtime"}
                        </Button>
                    </div>
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
            <p>
                <strong>Note:</strong> If you prefer to set up manually, follow these steps:
                <ul>
                    <li>Press <code>Cmd + Shift + P</code> (or <code>Ctrl + Shift + P</code> on Windows/Linux) to open the Command Palette.</li>
                    <li>Type <code>MI: Set Java Home</code> and select the Java home directory.</li>
                    <li>Type <code>MI: Add MI Server</code> and select the Micro Integrator installation location.</li>
                    <li>After completing these steps, click "Reload Project" below to apply the changes.</li>
                </ul>
            </p>
            <Button onClick={() => rpcClient.getMiVisualizerRpcClient().reloadWindow()}>
                Reload Project
            </Button>

            {error && <ErrorMessage>{error}</ErrorMessage>}
        </Container>

    );
};