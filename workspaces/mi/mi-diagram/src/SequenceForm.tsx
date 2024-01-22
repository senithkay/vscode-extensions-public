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
import { AutoComplete, Button, TextField } from "@wso2-enterprise/ui-toolkit";
import { MIWebViewAPI } from "./utils/WebViewRpc";

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

export interface Region {
    label: string;
    value: string;
}

export function SequenceWizard() {

    const [sequenceName, setSequenceName] = useState("");
    const [projectDir, setProjectDir] = useState("");
    const [selectedEndpoint, setSelectedEndpoint] = useState("");
    const [onErrorSequence, setOnErrorSequence] = useState("");
    const [endpoints, setEndpoints] = useState([]);
    const [sequences,setSequences] = useState([]);

    useEffect(() => {
        (async () => {
            const synapseSequencePath = await MIWebViewAPI.getInstance().getSequenceDirectory();
            setProjectDir(synapseSequencePath);
            const data = await MIWebViewAPI.getInstance().getEndpointsAndSequences();
            setEndpoints(data[0]);
            setSequences(data[1]);
        })();

    }, []);

    const handleEndpointChange = (endpoint: string) => {
        setSelectedEndpoint(endpoint);
    };

    const handleErrorSequenceChange = (sequence: string) => {
        setOnErrorSequence(sequence);
    };

    const handleCreateProject = async () => {
        const createSequenceParams = {
            name: sequenceName,
            directory: projectDir,
            endpoint: selectedEndpoint,
            onErrorSequence: onErrorSequence,
        }
        const file = await MIWebViewAPI.getInstance().createSequence(createSequenceParams);
        MIWebViewAPI.getInstance().openFile(file);
        MIWebViewAPI.getInstance().closeWebView();
    };

    const handleCancel = () => {
        MIWebViewAPI.getInstance().closeWebView();
    };

    const isValid: boolean = sequenceName.length > 0;

    return (
        <WizardContainer>
            <TitleWrapper>
                <h2>New Sequence Artifact</h2>
            </TitleWrapper>
            <SectionWrapper>
                <h3>Sequence Artifact</h3>
                <TextField
                    value={sequenceName}
                    id='name-input'
                    label="Name"
                    placeholder="Name"
                    validationMessage="Sequence name is required"
                    onChange={(text: string) => setSequenceName(text)}
                    autoFocus
                    required
                />
                <h5>Advanced Configuration</h5>
                <span>Available Endpoints</span>
                <AutoComplete items={endpoints} selectedItem={selectedEndpoint} onChange={handleEndpointChange}></AutoComplete>
                <span>On Error Sequence</span>
                <AutoComplete items={sequences} selectedItem={onErrorSequence} onChange={handleErrorSequenceChange}></AutoComplete>
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
