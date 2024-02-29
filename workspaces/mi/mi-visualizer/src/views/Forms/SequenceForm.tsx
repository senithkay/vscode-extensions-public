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
import { AutoComplete, Button, Codicon, TextField, Typography } from "@wso2-enterprise/ui-toolkit";
import { FieldGroup, SectionWrapper } from "./Commons";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
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
    display  : flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: 10px;
    padding-bottom: 20px;
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

export function SequenceWizard() {

    const { rpcClient } = useVisualizerContext();
    const [sequenceName, setSequenceName] = useState("");
    const [selectedEndpoint, setSelectedEndpoint] = useState("");
    const [onErrorSequence, setOnErrorSequence] = useState("");
    const [endpoints, setEndpoints] = useState([]);
    const [sequences, setSequences] = useState([]);

    useEffect(() => {
        (async () => {
            const data = await rpcClient.getMiDiagramRpcClient().getEndpointsAndSequences();
            setEndpoints(data.data[0]);
            setSequences(data.data[1]);
        })();
    }, []);

    const handleEndpointChange = (endpoint: string) => {
        setSelectedEndpoint(endpoint);
    };

    const handleErrorSequenceChange = (sequence: string) => {
        setOnErrorSequence(sequence);
    };

    const validateSequence = (name: string) => {
        // Check if the name is empty
        if (!name.trim()) {
            return "Sequence name is required";
        }

        // Check if the name contains spaces or special characters
        if (/[\s~`!@#$%^&*()_+={}[\]:;'",.<>?/\\|]+/.test(name)) {
            return "Sequence name cannot contain spaces or special characters";
        }
        return "";
    };

    const handleCreateProject = async () => {
        const projectDir = (await rpcClient.getMiDiagramRpcClient().getProjectRoot()).path;
        const sequenceDir = `${projectDir}/src/main/wso2mi/artifacts/sequences`;
        const createSequenceParams = {
            name: sequenceName,
            directory: sequenceDir,
            endpoint: selectedEndpoint,
            onErrorSequence: onErrorSequence,
        }
        const file = await rpcClient.getMiDiagramRpcClient().createSequence(createSequenceParams);
        // rpcClient.getMiVisualizerRpcClient().openView("OPEN_VIEW", { view: "Diagram", documentUri: file.filePath, identifier: `` });
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const handleCancel = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const handleBackButtonClick = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    }

    const isValid: boolean = sequenceName.length > 0;

    return (
        <WizardContainer>
            <SectionWrapper>
                <Container>
                    <Codicon iconSx={{ marginTop: -3, fontWeight: "bold", fontSize: 22 }} name='arrow-left' onClick={handleBackButtonClick} />
                    <div style={{ marginLeft: 30 }}>
                        <Typography variant="h3">Sequence Artifact</Typography>
                    </div>
                </Container>
                <TextField
                    value={sequenceName}
                    id='name-input'
                    label="Name"
                    placeholder="Name"
                    onChange={(text: string) => setSequenceName(text)}
                    errorMsg={validateSequence(sequenceName)}
                    size={40}
                    autoFocus
                    required
                />
                <h5>Advanced Configuration</h5>
                <FieldGroup>
                    <span>Available Endpoints</span>
                    <AutoComplete 
                        items={endpoints}
                        selectedItem={selectedEndpoint}
                        onChange={handleEndpointChange}
                        sx={{width: '370px'}}>
                    </AutoComplete>
                </FieldGroup>
                <FieldGroup>
                    <span>On Error Sequence</span>
                    <AutoComplete 
                        items={sequences}
                        selectedItem={onErrorSequence}
                        onChange={handleErrorSequenceChange}
                        sx={{width: '370px'}}>
                    </AutoComplete>
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
