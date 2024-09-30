/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import { Button, LocationSelector, TextField, Typography } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { BodyText } from "../../styles";

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin: 80px 120px;
    max-width: 600px;
`;

const ButtonWrapper = styled.div`
    margin-top: 20px;
    width: 130px;
`;

export function ProjectForm() {
    const { rpcClient } = useRpcContext();
    const [selectedModule, setSelectedModule] = useState("Main");
    const [name, setName] = useState("");
    const [path, setPath] = useState("");

    const handleProjectName = (value: string) => {
        setName(value);
    };

    const handleCreateProject = () => {
        rpcClient
            .getEggplantDiagramRpcClient()
            .createProject({ projectName: name, isService: selectedModule === "Service", projectPath: path });
    };

    const handleProjecDirSelection = async () => {
        const projectDirectory = await rpcClient.getCommonRpcClient().selectFileOrDirPath({});
        setPath(projectDirectory.path);
    };

    return (
        <FormContainer>
            <Typography variant="h2">Create Your Eggplant Project</Typography>
            <BodyText>
                Start by naming your project and selecting a location to save it. This will be the foundation for
                building your integration.
            </BodyText>
            <TextField
                onTextChange={handleProjectName}
                sx={{ marginTop: 20, marginBottom: 20 }}
                value={name}
                label="Project Name"
                placeholder="Enter a project name"
            />
            <LocationSelector
                label="Select Project Directory"
                selectedFile={path}
                onSelect={handleProjecDirSelection}
            />
            <ButtonWrapper>
                <Button
                    disabled={name.length < 2 || path.length < 2}
                    onClick={handleCreateProject}
                    appearance="primary"
                >
                    Create Project
                </Button>
            </ButtonWrapper>
        </FormContainer>
    );
}
