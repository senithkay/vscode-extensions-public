/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import { Button, Codicon, Typography } from "@wso2-enterprise/ui-toolkit";
import { useState } from "react";
import { DevantComponentResponse } from ".";
import { DeployProjectRequest } from "@wso2-enterprise/mi-core";

interface DeploymentOptionProps {
    title: string;
    description: string;
    buttonText: string;
    isExpanded: boolean;
    onToggle: () => void;
    onDeploy: () => void;
    learnMoreLink?: boolean;
}

const Title = styled(Typography)`
    margin: 8px 0;
`;

const DeploymentOptionContainer = styled.div<{ isExpanded: boolean }>`
    cursor: pointer;
    border: ${(props: { isExpanded: any; }) => props.isExpanded ? '1px solid var(--vscode-welcomePage-tileBorder)' : 'none'};
    background: ${(props: { isExpanded: any; }) => props.isExpanded ? 'var(--vscode-welcomePage-tileBackground)' : 'transparent'};
    border-radius: 6px;
    display: flex;
    overflow: hidden;
    width: 100%;
    padding: 10px;
    flex-direction: column;
    margin-bottom: 8px;

    &:hover {
        background: var(--vscode-welcomePage-tileHoverBackground);
    }
`;

const DeploymentHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    h3 {
        font-size: 13px;
        font-weight: 600;
        margin: 0;
    }
`;

const DeploymentBody = styled.div<{ isExpanded: boolean }>`
    max-height: ${(props: { isExpanded: any; }) => props.isExpanded ? '200px' : '0'};
    overflow: hidden;
    transition: max-height 0.3s ease-in-out;
    margin-top: ${(props: { isExpanded: any; }) => props.isExpanded ? '8px' : '0'};
`;

function DeploymentOption({
    title,
    description,
    buttonText,
    isExpanded,
    onToggle,
    onDeploy,
    learnMoreLink
}: DeploymentOptionProps) {
    return (
        <DeploymentOptionContainer
            isExpanded={isExpanded}
            onClick={onToggle}
        >
            <DeploymentHeader>
                <Codicon
                    name={'circle-outline'}
                    sx={{ color: isExpanded ? 'var(--vscode-textLink-foreground)' : 'inherit' }}
                />
                <h3>{title}</h3>
            </DeploymentHeader>
            <DeploymentBody isExpanded={isExpanded}>
                <p style={{ marginTop: 8 }}>
                    {description}
                    {learnMoreLink && <> <VSCodeLink>Learn more</VSCodeLink></>}
                </p>
                <Button appearance="secondary" onClick={(e: { stopPropagation: () => void; }) => {
                    e.stopPropagation();
                    onDeploy();
                }}>
                    {buttonText}
                </Button>
            </DeploymentBody>
        </DeploymentOptionContainer>
    );
}

interface DeploymentOptionsProps {
    handleDockerBuild: () => void;
    handleCAPPBuild: () => void;
    handleDeploy: (params: DeployProjectRequest) => void;
    goToDevant: (devantComponent: DevantComponentResponse) => void;
    devantComponent: DevantComponentResponse | undefined;
}

export function DeploymentOptions({ handleDockerBuild, handleCAPPBuild, handleDeploy, goToDevant, devantComponent }: DeploymentOptionsProps) {
    const [expandedOptions, setExpandedOptions] = useState<Set<string>>(new Set(['cloud', 'devant']));

    const toggleOption = (option: string) => {
        setExpandedOptions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(option)) {
                newSet.delete(option);
            } else {
                newSet.add(option);
            }
            return newSet;
        });
    };

    return (
        <div>
            <Title variant="h3">Deployment Options</Title>

            {devantComponent == undefined &&
                <DeploymentOption
                    title="Deploy to Devant"
                    description="Deploy your integration to the cloud using WSO2 Devant."
                    buttonText="Deploy to Cloud"
                    isExpanded={expandedOptions.has('cloud')}
                    onToggle={() => toggleOption('cloud')}
                    onDeploy={() => handleDeploy({})}
                    learnMoreLink={true}
                />
            }

            {devantComponent != undefined &&
                <DeploymentOption
                    title="Deployed in Devant"
                    description="This integration is already deployed in Devant."
                    buttonText="View in Devant"
                    isExpanded={expandedOptions.has('devant')}
                    onToggle={() => toggleOption('devant')}
                    onDeploy={() => goToDevant(devantComponent)}
                    learnMoreLink={true}
                />
            }

            <DeploymentOption
                title="Deploy with Docker"
                description="Create a Docker image of your integration and deploy it to any Docker-enabled system."
                buttonText="Create Docker Image"
                isExpanded={expandedOptions.has('docker')}
                onToggle={() => toggleOption('docker')}
                onDeploy={handleDockerBuild}
            />

            <DeploymentOption
                title="Deploy on a Micro Integrator Server"
                description="Create an Integration Application (CApp) that runs on WSO2 Micro Integrator Server."
                buttonText="Create CAPP"
                isExpanded={expandedOptions.has('vm')}
                onToggle={() => toggleOption('vm')}
                onDeploy={handleCAPPBuild}
            />
        </div>
    );
}
