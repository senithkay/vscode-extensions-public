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
import { Button, TextField } from "@wso2-enterprise/ui-toolkit";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { SectionWrapper } from "./Commons";

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
            const currentDir = await rpcClient.getMiDiagramRpcClient().getProjectRoot();
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
        rpcClient.getMiVisualizerRpcClient().openView({ view: "Overview" });

    };

    const isValid: boolean = projectName.length > 0 && projectDir.length > 0;

    return (
            <WizardContainer>
                <SectionWrapper>
                    <h3>Integration Project</h3>
                    <TextField
                        value={projectName}
                        id='name-input'
                        label="Project Name"
                        placeholder="Project Name"
                        validationMessage="Project name is required"
                        onChange={(text: string) => setProjectName(text)}
                        size={35}
                        autoFocus
                        required
                    />
                    <span>  Project Location  </span>
                    {!!projectDir && <LocationText>{projectDir}</LocationText>}
                    {!projectDir && <span>Please choose a directory for project workspace. </span>}
                    <Button appearance="secondary" onClick={handleProjecDirSelection} id="select-project-dir-btn">
                        Select Location
                    </Button>
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
