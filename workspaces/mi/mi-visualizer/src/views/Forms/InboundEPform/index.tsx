/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { AutoComplete, Button, TextField, TextArea, Dropdown, Typography, Codicon, CheckBox } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { FieldGroup, SectionWrapper } from "../Commons";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import ParamForm from "./ParamForm";
import { sampleData } from "./ParamTemplate";

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

type InboundEndpoint = {
    name: string;
    type: string;
    sequence: string;
    errorSequence: string;
};

const creationTypes = ['CXF_WS_RM', 'Custom', 'Feed', 'File', 'HL7', 'HTTP', 'HTTPS', 'JMS', 'KAFKA', 'MQTT', 'RABBITMQ', 'WS', 'WSO2_MB', 'WSS'];
const hideSubFormTypes = ['HTTP', 'HTTPS', 'CXF_WS_RM', 'Feed'];

const customSequenceType = {
    content: "custom-sequence",
    value: "custom",
};

export function InboundEPWizard(props: InboundEPWizardProps) {

    const { rpcClient } = useVisualizerContext();

    const [isNewInboundEndpoint, setIsNewInboundEndpoint] = useState(true);
    const [changesOccured, setChangesOccured] = useState(false);

    const [inboundEndpoint, setInboundEndpoint] = useState<InboundEndpoint>({
        name: "",
        type: "HTTP",
        sequence: "",
        errorSequence: "",
    });

    const [paramState, setParamState] = useState<{ [key: string]: { [key: string]: any } }>({});

    const [additionalParameters, setAdditionalParameters] = useState<any>({
        suspend: false,
        trace: false,
        statistics: false,
        description: "",
    });

    const [selectedInboundParamaters, setSelectedInboundParameters] = useState<any>(sampleData[inboundEndpoint.type.toLowerCase()]);

    const [sequences, setSequences] = useState([]);
    const [isCustom, setIsCustom] = useState({
        sequence: true,
        errorSequence: true,
    });

    const [customSequence, setCustomSequence] = useState("");
    const [customErrorSequence, setCustomErrorSequence] = useState("");

    const [showHiddenForm, setShowHiddenForm] = useState(false);

    const [message, setMessage] = useState({
        isError: false,
        text: "",
    });

    useEffect(() => {
        if (props.path) {
            (async () => {
                const { parameters, additionalParameters, ...data } = await rpcClient.getMiDiagramRpcClient().getInboundEndpoint({ path: props.path });
                if (data.name) {
                    data.type = data.type.toUpperCase();
                    setInboundEndpoint((prev: any) => ({
                        ...prev,
                        ...data,
                    }));
                    setIsNewInboundEndpoint(false);
                    setParamState({
                        [data.type.toLowerCase()]: { ...parameters },
                    })
                    setAdditionalParameters((prev: any) => ({ ...prev, ...additionalParameters }));
                    setSelectedInboundParameters(sampleData[data.type.toLowerCase()]);
                }
                else {
                    clearForm();
                }
            })();
        }
    }, [props.path]);

    useEffect(() => {
        (async () => {
            const data = await rpcClient.getMiDiagramRpcClient().getEndpointsAndSequences();
            const items = data.data[1].map((seq: string) => {
                seq = seq.replace(".xml", "");
                return { value: seq }
            });

            setSequences([customSequenceType, ...items]);
            setInboundEndpoint((prev: any) => ({
                ...prev,
                sequence: customSequenceType.value,
                errorSequence: customSequenceType.value
            }));
        })();
    }, []);

    const handleMessage = (text: string, isError: boolean = false) => {
        setMessage({ isError, text });
    }

    const clearForm = () => {
        setInboundEndpoint({
            name: "",
            type: "HTTP",
            sequence: "",
            errorSequence: "",
        });
        setParamState({});
        setAdditionalParameters({
            suspend: false,
            trace: false,
            statistics: false,
            description: "",
        });
        setSelectedInboundParameters(sampleData["http"]);
        setCustomSequence("");
        setCustomErrorSequence("");
        setShowHiddenForm(false);
        setIsCustom({
            sequence: true,
            errorSequence: true,
        });
        setIsNewInboundEndpoint(true);
    }

    const handleTypeChange = (type: string) => {
        if (hideSubFormTypes.includes(type)) {
            setShowHiddenForm(false);
            setInboundEndpoint((prev: any) => ({ ...prev, sequence: "", errorSequence: "" }));
        }
        else {
            setShowHiddenForm(true);
        }

        setSelectedInboundParameters(sampleData[type.toLowerCase()]);

        handleOnChange("type", type);
    }

    const handleOnChange = (field: any, value: any) => {
        if (!isNewInboundEndpoint && !changesOccured) {
            setChangesOccured(true);
        }

        if ((field === "sequence" || field === "errorSequence")) {
            setIsCustom((prev: any) => ({ ...prev, [field]: value === customSequenceType.value }));
        }

        setInboundEndpoint((prevTask: any) => ({ ...prevTask, [field]: value }));
    }

    const handleAdditionalParamChange = (field: string, value: any) => {
        setAdditionalParameters((prev: any) => ({ ...prev, [field]: value }));
    }

    const handleParamChange = (field: string, value: any) => {
        if (!isNewInboundEndpoint && !changesOccured) {
            setChangesOccured(true);
        }

        setParamState((prev: any) => {
            const params = prev[inboundEndpoint.type.toLowerCase()] ?? {};
            return {
                ...prev,
                [inboundEndpoint.type.toLowerCase()]: {
                    ...params,
                    [field]: value
                }
            }
        });
    }

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
            directory: props.path,
            name: inboundEndpoint.name,
            type: inboundEndpoint.type.toLowerCase(),
            sequence: (showHiddenForm && isCustom.sequence) ? customSequence : inboundEndpoint.sequence,
            errorSequence: (showHiddenForm && isCustom.errorSequence) ? customErrorSequence : inboundEndpoint.errorSequence,
            parameters: {
                ...paramState[inboundEndpoint.type.toLowerCase()],
            },
            additionalParameters,
        }
        await rpcClient.getMiDiagramRpcClient().createInboundEndpoint(createInboundEPParams);
        handleMessage(isNewInboundEndpoint ? "Task created successfully" : "Task updated successfully");
        setIsNewInboundEndpoint(false);
        clearForm();
        openOverview();
    };

    const openOverview = () => {
        setMessage({ isError: false, text: "" });
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const handleBackButtonClick = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    }

    const isValid: boolean = !message.isError && inboundEndpoint.name.length > 0 && inboundEndpoint.type.length > 0 && (hideSubFormTypes.includes(inboundEndpoint.type) || (
        inboundEndpoint.sequence.length > 0 && inboundEndpoint.errorSequence.length > 0
    ));

    return (
        <WizardContainer>
            <SectionWrapper>
                <Container>
                    <Codicon iconSx={{ marginTop: -3, fontWeight: "bold", fontSize: 22 }} name='arrow-left' onClick={handleBackButtonClick} />
                    <div style={{ marginLeft: 30 }}>
                        <Typography variant="h3">{!isNewInboundEndpoint && "Update"} Inbound Endpoint Artifact</Typography>
                    </div>
                </Container>
                <TextField
                    value={inboundEndpoint.name}
                    id='name-input'
                    label="Name"
                    placeholder="Name"
                    onChange={(text: string) => handleOnChange("name", text)}
                    errorMsg={validateName(inboundEndpoint.name)}
                    autoFocus
                    required
                    size={100}
                />
                <FieldGroup>
                    <span>Creation Type</span>
                    <AutoComplete
                        items={creationTypes}
                        selectedItem={inboundEndpoint.type}
                        onChange={(text: string) => handleTypeChange(text)}
                        sx={{ width: '370px' }}
                    ></AutoComplete>
                </FieldGroup>
                {showHiddenForm && (
                    <HiddenFormWrapper>
                        <span>Sequence</span>
                        <Dropdown
                            id="sequence"
                            value={inboundEndpoint.sequence}
                            onChange={(text: string) => handleOnChange("sequence", text)}
                            items={sequences}
                        />
                        {isCustom.sequence && <>
                            <TextField
                                value={customSequence}
                                id='custom-sequence'
                                placeholder="Custom Sequence Name"
                                onChange={(text: string) => setCustomSequence(text)}
                                errorMsg={validateName(customSequence)}
                                required
                                size={100}
                            />
                        </>}
                        <span>On Error Sequence</span>
                        <Dropdown
                            id="errorSequence"
                            value={inboundEndpoint.errorSequence}
                            onChange={(text: string) => handleOnChange("errorSequence", text)}
                            items={sequences}
                        />
                        {isCustom.errorSequence && <>
                            <TextField
                                value={customErrorSequence}
                                id='custom-onerror-sequence'
                                placeholder="Custom On Error Sequence Name"
                                onChange={(text: string) => setCustomErrorSequence(text)}
                                errorMsg={validateName(customErrorSequence)}
                                required
                                size={100}
                            />
                        </>}
                    </HiddenFormWrapper>
                )}
                {!isNewInboundEndpoint && (
                    <div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            marginBottom: "20px",
                        }}>
                            <CheckBox
                                label="Suspend"
                                value="suspend"
                                checked={additionalParameters.suspend}
                                onChange={(checked: boolean) => handleAdditionalParamChange("suspend", checked)}
                            />
                            <CheckBox
                                label="Trace Enabled"
                                value="trace"
                                checked={additionalParameters.trace}
                                onChange={(checked: boolean) => handleAdditionalParamChange("trace", checked)}
                            />
                            <CheckBox
                                label="Statistics Enabled"
                                value="statistics"
                                checked={additionalParameters.statistics}
                                onChange={(checked: boolean) => handleAdditionalParamChange("statistics", checked)}
                            />
                        </div>
                        {selectedInboundParamaters && <ParamForm
                            paramState={paramState[inboundEndpoint.type.toLocaleLowerCase()] ?? {}}
                            parameters={selectedInboundParamaters}
                            handleOnChange={handleParamChange}
                        />}
                        <TextArea
                            value={additionalParameters.description}
                            id='description'
                            label="Description"
                            placeholder="Description"
                            onChange={(text: string) => handleAdditionalParamChange("description", text)}
                            cols={150}
                        />
                    </div>
                )}
                <ActionContainer>
                    <Button
                        appearance="secondary"
                        onClick={openOverview}
                    >
                        Cancel
                    </Button>
                    <Button
                        appearance="primary"
                        onClick={handleCreateInboundEP}
                        disabled={!isValid}
                    >
                        {isNewInboundEndpoint ? "Create" : "Save Changes"}
                    </Button>
                </ActionContainer>
            </SectionWrapper>
        </WizardContainer>
    );
}
