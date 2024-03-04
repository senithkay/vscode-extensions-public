/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { Button, Codicon, TextField, Typography } from "@wso2-enterprise/ui-toolkit";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { FieldGroup, SectionWrapper } from "./Commons";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";

const WizardContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 95vw;
    height: calc(100vh - 140px);
    overflow: auto;
`;

const ActionContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: 10px;
    padding-bottom: 20px;
`;

const LocationText = styled.div`
    max-width: 60vw;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const Container = styled.div`
    display: flex;
    flex-direction: row;
    height: 50px;
    align-items: center;
    justify-content: flex-start;
`;

export interface Region {
    label: string;
    value: string;
}

export function ProjectWizard() {

    const { rpcClient } = useVisualizerContext();
    const [projectName, setProjectName] = useState("");
    const [projectDir, setProjectDir] = useState("");

    useEffect(() => {
        (async () => {
            const currentDir = await rpcClient.getMiDiagramRpcClient().getWorkspaceRoot();
            setProjectDir(currentDir.path);
        })();

    }, []);

    const handleProjecDirSelection = async () => {
        const projectDirectory = await rpcClient.getMiDiagramRpcClient().askProjectDirPath();
        setProjectDir(projectDirectory.path);
    }

    const handleCreateProject = async () => {
        const createProjectParams = {
            name: projectName,
            directory: projectDir,
            open: true
        }
        await rpcClient.getMiDiagramRpcClient().createProject(createProjectParams);
        console.log("Project created");
    };

    const handleCancel = () => {
        console.log("cancel");
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });

    };

    const handleBackButtonClick = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    }

    const validateProjectName = (name: string) => {
        // Check if the name is empty
        if (!name.trim()) {
            return "Project name is required";
        }

        // Check if the name contains spaces or special characters
        if (/[\s~`!@#$%^&*()_+={}[\]:;'",.<>?/\\|]+/.test(name)) {
            return "Project name cannot contain spaces or special characters";
        }
        return "";
    };

    const isValid: boolean = projectName.length > 0 && projectDir.length > 0;

    return (
        <WizardContainer>
            <SectionWrapper>
                <Container>
                    <Codicon iconSx={{ marginTop: -3, fontWeight: "bold", fontSize: 22 }} name='arrow-left' onClick={handleBackButtonClick} />
                    <div style={{ marginLeft: 30 }}>
                        <Typography variant="h3">Integration Project</Typography>
                    </div>
                </Container>
                <TextField
                    value={projectName}
                    id='name-input'
                    label="Project Name"
                    placeholder="Project Name"
                    onChange={(text: string) => setProjectName(text)}
                    errorMsg={validateProjectName(projectName)}
                    size={46}
                    autoFocus
                    required
                />
                <FieldGroup>
                    <span>  Project Location  </span>
                    {!!projectDir && <LocationText>{projectDir}</LocationText>}
                    {!projectDir && <span>Please choose a directory for project workspace. </span>}
                    <Button appearance="secondary" onClick={handleProjecDirSelection} id="select-project-dir-btn">
                        Select Location
                    </Button>
                </FieldGroup>
                <ActionContainer>
                    <Button
                        appearance="secondary"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        appearance="primary"
                        onClick={handleCreateProject}
                        disabled={!isValid}
                    >
                        Create
                    </Button>
                </ActionContainer>
            </SectionWrapper>
        </WizardContainer>
    );
}
