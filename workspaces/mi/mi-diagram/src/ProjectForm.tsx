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
import { MIWebViewAPI } from "./utils/WebViewRpc";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

const WizardContainer = styled.div`
    width: 95%;
    display  : flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
`;

const ActionContainer = styled.div`
    display  : flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: 10px;
    padding-bottom: 20px;
`;


const CardContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
`;

const SubContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-content: space-between;
    gap: 20px;
`;

const TitleWrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
`;


export const SectionWrapper: React.FC<React.HTMLAttributes<HTMLDivElement>> = styled.div`
    // Flex Props
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    position: relative;
    gap: 10px;
    // End Flex Props
    // Sizing Props
    padding: 20px;
    // End Sizing Props
    // Border Props
    border-radius: 10px;
    border-style: solid;
    border-width: 1px;
    border-color: transparent;
    background-color: var(--vscode-welcomePage-tileBackground);
    &.active {
        border-color: var(--vscode-focusBorder);
    }
`;

const BrowseBtn = styled(VSCodeButton)`
    width: fit-content;
    padding: 5px;
`;

export interface Region {
    label: string;
    value: string;
}

export function ProjectWizard() {


    const [projectName, setProjectName] = useState("");
    const [projectDir, setProjectDir] = useState("");

    useEffect(() => {
        (async () => {
            const currentDir = await MIWebViewAPI.getInstance().getProjectRoot();
            setProjectDir(currentDir);
        })();

    }, []);

    const handleProjecDirSelection = async () => {
        const projectDirectory = await MIWebViewAPI.getInstance().askProjectDirPath();
        setProjectDir(projectDirectory);
    }

    const handleCreateProject = async () => {
        const createProjectParams = {
            name: projectName,
            directory: projectDir
        }
        await MIWebViewAPI.getInstance().createProject(createProjectParams);
        console.log("Project created");
        MIWebViewAPI.getInstance().closeWebView();
    };

    const handleCancel = () => {
        console.log("cancel");
        MIWebViewAPI.getInstance().closeWebView();
    };

    const isValid: boolean = projectName.length > 0 && projectDir.length > 0;

    return (
        <WizardContainer>
            <TitleWrapper>
                <h2>New Integration Project</h2>
            </TitleWrapper>
            <SectionWrapper>
                <h3>Integration Project</h3>
                <TextField
                    value={projectName}
                    id='name-input'
                    label="Name"
                    placeholder="Name"
                    validationMessage="Project name is required"
                    onChange={(text: string) => setProjectName(text)}
                    autoFocus
                    required
                />
                <span>  Project Location  </span>
                {!!projectDir && <span>{projectDir}</span>}
                {!projectDir && <span>Please choose a directory for project workspace. </span>}
                <BrowseBtn onClick={handleProjecDirSelection} id="select-project-dir-btn">
                    Select Directory to Save Project
                </BrowseBtn>
                <SubContainer>
                    <CardContainer>
                    </CardContainer>
                </SubContainer>
            </SectionWrapper>
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
        </WizardContainer>
    );
}
