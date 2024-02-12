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
import { Button, ComponentCard } from "@wso2-enterprise/ui-toolkit";
import { ProjectWizard } from "../Forms/ProjectForm";

const HorizontalCardContainer = styled.div`
    display: flex;
    flex-direction: row;
    gap: 30px;
`;

const IconWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

export function GettingStarted() {
    const { rpcClient } = useVisualizerContext();
    const [state, setState] = React.useState<VisualizerLocation>(null);
    const [showSamples, viewSamples] = React.useState<boolean>(false);
    const [mode, setMode] = React.useState<string>("");

    const viewSampleHandle = async () => {
        viewSamples(true);
    }

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

    return (
        <>
            <h1>Hello Getting Started - {state?.documentUri}</h1>
            <HorizontalCardContainer>
                <ComponentCard
                    onClick={() => handleModeChange("NewProject")}
                    sx={{ height: 40, width: 220, marginTop: 15, marginBottom: 15 }}
                    isSelected={mode === "NewProject"}>
                    <IconWrapper>Create New Project</IconWrapper>
                </ComponentCard>
                <ComponentCard
                    onClick={() => handleModeChange("AI")}
                    sx={{ height: 40, width: 220, marginTop: 15, marginBottom: 15 }}
                    isSelected={mode === "AI"}>
                    <IconWrapper>Create Project using AI prompt</IconWrapper>
                </ComponentCard>
                <ComponentCard
                    onClick={() => handleModeChange("Samples")}
                    sx={{ height: 40, width: 220, marginTop: 15, marginBottom: 15 }}
                    isSelected={mode === "Samples"}>
                    <IconWrapper>Explore Samples</IconWrapper>
                </ComponentCard>
            </HorizontalCardContainer>
            {mode === "NewProject" && (
                <ProjectWizard />
            )}
            {mode === "AI" && <h2>Create Project using AI prompt</h2>}
            {mode === "Samples" && (
                <>
                    {showSamples ?
                        <SamplesView />
                        : (
                            <>
                                <h2>Explore Samples</h2>
                                <Button appearance={"primary"} onClick={viewSampleHandle}>Download a Sample</Button>
                            </>
                        )}
                </>
            )}
        </>
    );
}
