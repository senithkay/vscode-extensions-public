import React, { useState } from 'react';
import { Button, Codicon, ComponentCard, Icon, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { useVisualizerContext } from '@wso2-enterprise/eggplant-rpc-client';

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

const ProjectForm = () => {
    const { rpcClient } = useVisualizerContext();
    const [selectedModule, setSelectedModule] = useState("Main");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleWelcome = () => {
        rpcClient.getVisualizerRpcClient().sendMachineEvent({ type: "CANCEL_CREATION" });
    }

    const handleSelection = (type: string) => {
        setSelectedModule(type);
    }

    const handleProjectName = (value: string) => {
        setName(value);
    }

    const handleCreateProject = () => {
        setIsLoading(true);
        rpcClient.getVisualizerRpcClient().executeCommand({
            command: "CREATE_PROJECT",
            projectName: name,
            isService: selectedModule === "Service"
        });
    }

    return (
        <FormContainer>
            <Container>
                <Codicon onClick={handleWelcome} iconSx={{ marginTop: -3, fontWeight: "bold", fontSize: 22 }} name='arrow-left' />
                <Icon sx={{ marginLeft: 20, marginTop: -10, fontSize: 30, pointerEvents: "none" }} name='circuit-board' />
                <div style={{ marginLeft: 30 }}>
                    <Typography variant="h3">Eggplant Project</Typography>
                </div>
            </Container>
            <Typography variant="h1">New Eggplant Project</Typography>
            <Typography variant="h4" sx={{ marginTop: 0 }}>Build an eggplant project of your choice</Typography>
            <BottomMarginTextWrapper>Choose a package structure</BottomMarginTextWrapper>
            <Container>
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
            </Container>
            <TextField onChange={handleProjectName} sx={{ marginTop: 20 }} value={name} label="Project Name" placeholder="Enter a project name" />
            <ButtonWrapper>
                <Button disabled={isLoading} onClick={handleCreateProject} appearance="primary">Create Project</Button>
            </ButtonWrapper>
        </FormContainer>
    );
};

export default ProjectForm;

