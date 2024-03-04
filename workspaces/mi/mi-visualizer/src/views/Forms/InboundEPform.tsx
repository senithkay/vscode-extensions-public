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
import { AutoComplete, Button, TextField, Dropdown, Typography, Codicon } from "@wso2-enterprise/ui-toolkit";
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

export interface InboundEPWizardProps {
    path: string;
}

export function InboundEPWizard(props: InboundEPWizardProps) {

    const { rpcClient } = useVisualizerContext();

    const [inboundEPName, setInboundEPName] = useState("");
    const [creationType, setCreationType] = useState("HTTP");
    const [directoryPath, setDirectoryPath] = useState("");

    const [sequences, setSequences] = useState([]);
    const [selectedSequence, setSelectedSequence] = useState("");
    const [onErrorSequence, setOnErrorSequence] = useState("");
    const [customSequence, setCustomSequence] = useState("");
    const [customOnErrorSequence, setCustomOnErrorSequence] = useState("");

    const [nameError, setNameError] = useState(false);

    const defaultSequence = {
        content: "custom-sequence",
        value: "custom",
    };

    useEffect(() => {
        rpcClient.getMiDiagramRpcClient().getInboundEndpointDirectory({path: props.path}).then((path) => {
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

    useEffect(() => {
        const INVALID_CHARS_REGEX = /[@\\^+;:!%&,=*#[\]$?'"<>{}() /]/;

        if (INVALID_CHARS_REGEX.test(inboundEPName) || INVALID_CHARS_REGEX.test(customSequence) || INVALID_CHARS_REGEX.test(customOnErrorSequence)) {
            setNameError(true);
        }
        else {
            setNameError(false);
        }
    }, [inboundEPName, customSequence, customOnErrorSequence]);

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

    const validateName = (name: string) => {
        // Check if the name is empty
        if (!name.trim()) {
            return "Name is required";
        }

        // Check if the name contains spaces or special characters
        if (/[\s~`!@#$%^&*()_+={}[\]:;'",.<>?/\\|]+/.test(name)) {
            return "Name cannot contain spaces or special characters";
        }
        return "";
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
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const handleBackButtonClick = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    }

    const isValid: boolean = !nameError && inboundEPName.length > 0 && creationType.length > 0 && (excludeSubFormFrom.includes(creationType) ||
        (selectedSequence !== defaultSequence.value ? selectedSequence.length > 0 : customSequence.length > 0) &&
        (onErrorSequence !== defaultSequence.value ? onErrorSequence.length > 0 : customOnErrorSequence.length > 0));

    return (
        <WizardContainer>
            <SectionWrapper>
                <Container>
                    <Codicon iconSx={{ marginTop: -3, fontWeight: "bold", fontSize: 22 }} name='arrow-left' onClick={handleBackButtonClick} />
                    <div style={{ marginLeft: 30 }}>
                        <Typography variant="h3">Inbound Endpoint Artifact</Typography>
                    </div>
                </Container>
                <TextField
                    value={inboundEPName}
                    id='name-input'
                    label="Name"
                    placeholder="Name"
                    onChange={(text: string) => setInboundEPName(text)}
                    errorMsg={validateName(inboundEPName)}
                    size={40}
                    autoFocus
                    required
                />
                <FieldGroup>
                    <span>Creation Type</span>
                    <AutoComplete
                        items={creationTypes}
                        selectedItem={creationType}
                        onChange={handleCreationTypeChange}
                        sx={{width: '370px'}}
                    ></AutoComplete>
                </FieldGroup>
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
                            <TextField
                                value={customSequence}
                                id='custom-sequence'
                                placeholder="Custom Sequence Name"
                                onChange={(text: string) => setCustomSequence(text)}
                                errorMsg={validateName(customSequence)}
                                size={40}
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
                            <TextField
                                value={customOnErrorSequence}
                                id='custom-onerror-sequence'
                                placeholder="Custom On Error Sequence Name"
                                onChange={(text: string) => setCustomOnErrorSequence(text)}
                                errorMsg={validateName(customOnErrorSequence)}
                                size={40}
                                required
                            />
                        </>}
                    </HiddenFormWrapper>
                )}
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
            </SectionWrapper>
        </WizardContainer>
    );
}
