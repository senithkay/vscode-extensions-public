/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { VisualizerLocation } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { SamplesView } from "../SamplesView";
import styled from "@emotion/styled";
import { Codicon, ComponentCard } from "@wso2-enterprise/ui-toolkit";
import { ProjectWizard } from "../Forms/ProjectForm";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { AiPrompt } from "../Forms/AiPrompt";

const HorizontalCardContainer = styled.div`
    display: flex;
    flex-direction: row;
    gap: 50px;
    justify-content: center;
`;

const TextWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 18px;
`;

const NavigationContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
`;

const IconWrapper = styled.div`
    padding: 20px;
    height: 150px;
    width: 150px;
`;

const HeadlineWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    font-size: 18px;
    height: 20vh;
    padding: 40px;
`;

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

    return (
        <>
            {mode !== "" ? (
                <NavigationContainer id="nav-bar-main">
                    <VSCodeButton appearance="icon" title="Go Back" onClick={handleBackButtonClick}>
                        <Codicon name="arrow-left" />
                    </VSCodeButton>
                </NavigationContainer>
            ) : (
                <>  
                    <HeadlineWrapper>
                        <h1>Getting Started{state?.documentUri}</h1>
                        <span>Select an option to get started.</span>
                    </HeadlineWrapper>
                    <HorizontalCardContainer>
                        <ComponentCard
                            onClick={() => handleModeChange("NewProject")}
                            sx={{ height: 350, width: 300, marginTop: 15, marginBottom: 15, display: "flex", flexDirection: "column" }}>
                            <IconWrapper>
                                <Codicon name="folder-library" iconSx={{ fontSize: 150 }} />
                            </IconWrapper>
                            <TextWrapper>Create New Project</TextWrapper>
                        </ComponentCard>
                        <ComponentCard
                            onClick={() => handleModeChange("AI")}
                            sx={{ height: 350, width: 300, marginTop: 15, marginBottom: 15, display: "flex", flexDirection: "column" }}>
                            <IconWrapper>
                                <Codicon name="wand" iconSx={{ fontSize: 150 }} />
                            </IconWrapper>
                            <TextWrapper>Create Project using AI prompt</TextWrapper>
                        </ComponentCard>
                        <ComponentCard
                            onClick={() => handleModeChange("Samples")}
                            sx={{ height: 350, width: 300, marginTop: 15, marginBottom: 15, display: "flex", flexDirection: "column" }}>
                            <IconWrapper>
                                <Codicon name="notebook-template" iconSx={{ fontSize: 150 }} />
                            </IconWrapper>
                            <TextWrapper>Explore Samples</TextWrapper>
                        </ComponentCard>
                    </HorizontalCardContainer>
                </>
            )}
            {mode === "NewProject" && <ProjectWizard />}
            {mode === "AI" && <AiPrompt />}
            {mode === "Samples" && <SamplesView />}
        </>
    );
}
