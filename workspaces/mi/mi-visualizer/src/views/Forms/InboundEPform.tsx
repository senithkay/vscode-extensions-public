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
import { AutoComplete, Button, TextField, Dropdown } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { SectionWrapper } from "./Commons";

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

const HiddenFormWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px 40px;
`;

export interface Region {
    label: string;
    value: string;
}

export function InboundEPWizard() {

    const { rpcClient } = useVisualizerContext();

    const [inboundEPName, setInboundEPName] = useState("");
    const [creationType, setCreationType] = useState("HTTP");
    const [directoryPath, setDirectoryPath] = useState("");

    const [sequences, setSequences] = useState([]);
    const [selectedSequence, setSelectedSequence] = useState("");
    const [onErrorSequence, setOnErrorSequence] = useState("");
    const [customSequence, setCustomSequence] = useState("");
    const [customOnErrorSequence, setCustomOnErrorSequence] = useState("");

    const defaultSequence = {
        content: "custom-sequence",
        value: "custom",
    };

    useEffect(() => {
        rpcClient.getMiDiagramRpcClient().getInboundEndpointDirectory().then((path) => {
            setDirectoryPath(path.data);
        }).catch((error) => {
            console.error("Error getting project directory", error);
        });

        (async () => {
            const data = await rpcClient.getMiDiagramRpcClient().getEndpointsAndSequences();
            const items = data.data[1].map((seq: string) => {
                seq = seq.replace(".xml", "");
                return { value: seq }
            });

            setSequences([defaultSequence, ...items]);

            setSelectedSequence(defaultSequence.value);
            setOnErrorSequence(defaultSequence.value);
        })();
    }, []);

    const creationTypes = ['CXF_WS_RM', 'Custom', 'Feed', 'File', 'HL7', 'HTTP', 'HTTPS', 'JMS', 'KAFKA', 'MQTT', 'RABBITMQ', 'WS', 'WSO2_MB', 'WSS'];

    const excludeSubFormFrom = ['HTTP', 'HTTPS', 'CXF_WS_RM', 'Feed'];

    const handleCreationTypeChange = (type: string) => {
        setCreationType(type);
    };

    const handleSelectedSequenceChange = (sequence: string) => {
        setSelectedSequence(sequence);
    };

    const handleErrorSequenceChange = (sequence: string) => {
        setOnErrorSequence(sequence);
    };

    const handleCreateInboundEP = async () => {
        const createInboundEPParams = {
            directory: directoryPath,
            name: inboundEPName,
            type: creationType,
            sequence: selectedSequence === defaultSequence.value ? customSequence : selectedSequence,
            errorSequence: onErrorSequence === defaultSequence.value ? customOnErrorSequence : onErrorSequence,
        }
        const filePath = await rpcClient.getMiDiagramRpcClient().createInboundEndpoint(createInboundEPParams);
        rpcClient.getMiDiagramRpcClient().openFile(filePath);
        rpcClient.getMiDiagramRpcClient().closeWebView();
    };

    const handleCancel = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ view: "Overview" });
    };

    const isValid: boolean = inboundEPName.length > 0 && creationType.length > 0 && (excludeSubFormFrom.includes(creationType) ||
        (selectedSequence !== defaultSequence.value ? selectedSequence.length > 0 : customSequence.length > 0) &&
        (onErrorSequence !== defaultSequence.value ? onErrorSequence.length > 0 : customOnErrorSequence.length > 0));

    return (
        <WizardContainer>
            <TitleWrapper>
                <h2>New Inbound Endpoint Artifact</h2>
            </TitleWrapper>
            <SectionWrapper>
                <h3>Inbound Endpoint Artifact</h3>
                <TextField
                    value={inboundEPName}
                    id='name-input'
                    label="Name"
                    placeholder="Name"
                    validationMessage="Inbound Endpoint name is required"
                    onChange={(text: string) => setInboundEPName(text)}
                    size={100}
                    autoFocus
                    required
                />
                <span>Creation Type</span>
                <AutoComplete
                    items={creationTypes}
                    selectedItem={creationType}
                    onChange={handleCreationTypeChange}
                    sx={{ width: '50%' }}
                ></AutoComplete>
                {!excludeSubFormFrom.includes(creationType) && (
                    <HiddenFormWrapper>
                        <span>Sequence</span>
                        <Dropdown
                            id="sequence"
                            value={selectedSequence}
                            onChange={handleSelectedSequenceChange}
                            items={sequences}
                        />
                        {selectedSequence === defaultSequence.value && <>
                            {/* <span>Custom Sequence Name <span style={{ color: "#f48771" }}>*</span></span> */}
                            <TextField
                                value={customSequence}
                                id='custom-sequence'
                                placeholder="Custom Sequence Name"
                                validationMessage="Custom sequence name is required"
                                onChange={(text: string) => setCustomSequence(text)}
                                size={50}
                                required
                            />
                        </>}
                        <span>On Error Sequence</span>
                        <Dropdown
                            id="onErrorSequence"
                            value={onErrorSequence}
                            onChange={handleErrorSequenceChange}
                            items={sequences}
                        />
                        {onErrorSequence === defaultSequence.value && <>
                            {/* <span>Custom On Error Sequence Name <span style={{ color: "#f48771" }}>*</span></span> */}
                            <TextField
                                value={customOnErrorSequence}
                                id='custom-onerror-sequence'
                                placeholder="Custom On Error Sequence Name"
                                validationMessage="Custom on-error sequence name is required"
                                onChange={(text: string) => setCustomOnErrorSequence(text)}
                                size={50}
                                required
                            />
                        </>}
                    </HiddenFormWrapper>
                )}
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
                    onClick={handleCreateInboundEP}
                    disabled={!isValid}
                >
                    Create
                </Button>
            </ActionContainer>
        </WizardContainer>
    );
}
