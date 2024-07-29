/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useRef, useState } from 'react';
import { Button, Codicon, ComponentCard, Icon, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { useVisualizerContext } from '@wso2-enterprise/ballerina-rpc-client';

const FORM_WIDTH = 600;

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin: auto; /* Center vertically and horizontally */
    max-width: 600px;
`;

const Container = styled.div`
    display: flex;
    flex-direction: row;
    height: 50px;
    align-items: center;
    justify-content: flex-start;
`;

const BottomMarginTextWrapper = styled.div`
    font-size: 13px;
    margin-bottom: 10px;
`;

const HorizontalCardContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

const IconWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const ButtonWrapper = styled.div`
    margin-top: 20px;
    width: 130px;
`;

export function ProjectForm() {
    const { rpcClient } = useVisualizerContext();
    const [selectedModule, setSelectedModule] = useState("Main");
    const [name, setName] = useState("");

    const handleSelection = (type: string) => {
        setSelectedModule(type);
    }

    const handleProjectName = (value: string) => {
        setName(value);
    }

    const handleCreateProject = () => {
        rpcClient.getEggplantDiagramRpcClient().createProject({ projectName: name, isService: selectedModule === "Service" });
    }

    return (
        <FormContainer>
            <Typography variant="h1">New Eggplant Project</Typography>
            <Typography variant="h4" sx={{ marginTop: 0 }}>Build an eggplant project from scratch</Typography>
            {/* <BottomMarginTextWrapper>Choose a package structure</BottomMarginTextWrapper> */}
            {/* <Container>
                <HorizontalCardContainer>
                    <ComponentCard isSelected={selectedModule === "Main"} onClick={() => handleSelection("Main")} sx={{ height: 40, width: (FORM_WIDTH / 2 - 25), marginTop: 15, margin: 10 }}>
                        <IconWrapper>
                            <div>Automation</div>
                        </IconWrapper>
                    </ComponentCard>
                    <ComponentCard isSelected={selectedModule === "Service"} onClick={() => handleSelection("Service")} sx={{ height: 40, width: (FORM_WIDTH / 2 - 25), marginTop: 15, margin: 10 }}>
                        <IconWrapper>
                            <div>Service</div>
                        </IconWrapper>
                    </ComponentCard>
                </HorizontalCardContainer>
            </Container> */}
            <TextField
                onTextChange={handleProjectName}
                sx={{ marginTop: 20 }}
                value={name}
                label="Project Name"
                placeholder="Enter a project name"
            />
            <ButtonWrapper>
                <Button disabled={name.length < 2} onClick={handleCreateProject} appearance="primary">Create Project</Button>
            </ButtonWrapper>
        </FormContainer>
    );
};
