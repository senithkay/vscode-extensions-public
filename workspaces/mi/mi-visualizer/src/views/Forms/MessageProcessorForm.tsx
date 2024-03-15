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
import {Button, TextField, Dropdown, Typography, Codicon} from "@wso2-enterprise/ui-toolkit";
import { SectionWrapper } from "./Commons";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { CreateMessageProcessorRequest } from "@wso2-enterprise/mi-core";

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

const Container = styled.div`
    display: flex;
    flex-direction: row;
    height: 50px;
    align-items: center;
    justify-content: flex-start;
`;

const Table = styled.table`
    border: 1px solid;
    borderCollapse: collapse;
    width: 75%;
`;

const Th = styled.th`
    border: 1px solid;
    borderCollapse: collapse;
    Width: 45%;
`;

const Td = styled.td`
    border: 1px solid;
    borderCollapse: collapse;
    Width: 45%;
`;

const ThButton = styled.th`
    border: 1px solid;
    borderCollapse: collapse;
    Width: 10%;
`;

const TdButton = styled.td`
    border: 1px solid;
    borderCollapse: collapse;
    Width: 10%;
`;

const RadioBtnContainer = styled.div`
    display  : inline-block;
    flex-direction: column;
    justify-content: flex-end;
    gap: 10px;
    padding-bottom: 5px;
`;

const RadioLabel = styled.label`
    margin-right: 10%;
`;

const RequiredSpan = styled.span`
    color: red;
`;

export interface Region {
    label: string;
    value: string;
}

interface KeyValuePair {
    key: string;
    value: any;
}

interface OptionProps {
    value: string;
}

interface MessageProcessorWizardProps {
    path: string;
};

export function MessageProcessorWizard(props: MessageProcessorWizardProps) {

    const { rpcClient } = useVisualizerContext();
    const [ messageProcessor, setMessageProcessor ] = useState<any>({
        messageProcessorName: "",
        messageProcessorType: "Scheduled Message Forwarding Processor",
        messageStoreType: "TestMBStore",
        failMessageStoreType: "",
        sourceMessageStoreType: "TestMBStore",
        targetMessageStoreType: "TestMBStore",
        processorState: "Activate",
        dropMessageOption: "Disabled",
        quartzConfigPath: "",
        cron: "",
        forwardingInterval: 1000,
        retryInterval: 1000,
        maxRedeliveryAttempts: 4,
        maxConnectionAttempts: -1,
        connectionAttemptInterval: 1000,
        taskCount: 1,
        statusCodes: "",
        clientRepository: "",
        axis2Config: "",
        endpointType: null,
        sequenceType: null,
        replySequenceType: null,
        faultSequenceType: null,
        deactivateSequenceType: null,
        endpoint: "",
        sequence: "",
        replySequence: "",
        faultSequence: "",
        deactivateSequence: "",
        samplingInterval: 1000,
        samplingConcurrency: 1,
        providerClass: "",
        properties: [],
        hasCustomProperties: false,
    })
    const [properties, setProperties] = useState<KeyValuePair[]>([]);
    const [sequences, setSequences] = useState();
    const [endpoints, setEndpoints] = useState();
    const [existingFilePath, setExistingFilePath] = useState(props.path);
    const isNewTask = !existingFilePath.endsWith(".xml");
    const [changesOccurred, setChangesOccurred] = useState(false);
    const [message, setMessage] = useState({
        isError: false,
        text: ""
    });

    const isValid: boolean = messageProcessor.messageProcessorName.length > 0 &&
        (messageProcessor.messageProcessorType === 'Scheduled Message Forwarding Processor' ? messageProcessor.endpoint.length > 0 :
            messageProcessor.messageProcessorType === 'Message Sampling Processor' ? messageProcessor.sequence.length > 0 :
                messageProcessor.messageProcessorType === 'Custom Message Processor' ? messageProcessor.providerClass.length > 0 :
                    messageProcessor.targetMessageStoreType.length > 0);

    useEffect(() => {

        (async () => {
            const items = await rpcClient.getMiDiagramRpcClient().getEndpointsAndSequences();
            const sequenceList = items.data[1].map((seq: string) => {
                seq = seq.replace(".xml", "");
                return { value: seq }
            });
            const endpointList = items.data[0].map((seq: string) => {
                seq = seq.replace(".xml", "");
                return { value: seq }
            });
            setSequences(sequenceList);
            setEndpoints(endpointList);

            if (!isNewTask) {
                if (existingFilePath.includes('/messageProcessors')) {
                    setExistingFilePath(existingFilePath.replace('/messageProcessors', '/message-processors'));
                }
                const existingMessageProcessor = await rpcClient.getMiDiagramRpcClient().getMessageProcessor({ path: existingFilePath });
                setMessageProcessor(existingMessageProcessor);
                messageProcessor.endpoint = existingMessageProcessor.endpoint;
                messageProcessor.sequence = existingMessageProcessor.sequence;
                messageProcessor.faultSequence = existingMessageProcessor.faultSequence;
                messageProcessor.replySequence = existingMessageProcessor.replySequence;
                messageProcessor.deactivateSequence = existingMessageProcessor.deactivateSequence;
                if (!!existingMessageProcessor.processorState === true) {
                    setMessageProcessor((prev: any) => ({ ...prev, processorState: 'Activate' }));
                } else {
                    setMessageProcessor((prev: any) => ({ ...prev, processorState: 'Deactivate' }));
                }
                setProperties(existingMessageProcessor.properties);
                updateTypes(endpointList, sequenceList);
            }
        })();
    }, []);

    useEffect(() => {
        const INVALID_CHARS_REGEX = /[@\\^+;:!%&,=*#[\]$?'"<>{}() /]/;

        if (!isValid) {
            handleMessage("Please fill all the mandatory fields", true);
        } else if (INVALID_CHARS_REGEX.test(messageProcessor.messageProcessorName)) {
            handleMessage("Invalid message processor name", true);
        } else {
            handleMessage("");
        }

    }, [messageProcessor.messageProcessorName, isValid]);

    const updateTypes = (endpointList:[], sequenceList:[]) => {
        if (messageProcessor.endpoint != '') {
            if (endpointList.some((option: any) => option.value === messageProcessor.endpoint)) {
                setMessageProcessor((prev: any) => ({ ...prev, endpointType: 'Workspace' }));
            } else {
                setMessageProcessor((prev: any) => ({ ...prev, endpointType: 'Custom' }));
            }
        }
        if (messageProcessor.sequence != '') {
            if (sequenceList.some((option: any) => option.value === messageProcessor.sequence)) {
                setMessageProcessor((prev: any) => ({ ...prev, sequenceType: 'Workspace' }));
            } else {
                setMessageProcessor((prev: any) => ({ ...prev, sequenceType: 'Custom' }));
            }
        }
        if (messageProcessor.replySequence != '') {
            if (sequenceList.some((option: any) => option.value === messageProcessor.replySequence)) {
                setMessageProcessor((prev: any) => ({ ...prev, replySequenceType: 'Workspace' }));
            } else {
                setMessageProcessor((prev: any) => ({ ...prev, replySequenceType: 'Custom' }));
            }
        }
        if (messageProcessor.faultSequence != '') {
            if (sequenceList.some((option: any) => option.value === messageProcessor.faultSequence)) {
                setMessageProcessor((prev: any) => ({ ...prev, faultSequenceType: 'Workspace' }));
            } else {
                setMessageProcessor((prev: any) => ({ ...prev, faultSequenceType: 'Custom' }));
            }
        }
        if (messageProcessor.deactivateSequence != '') {
            if (sequenceList.some((option: any) => option.value === messageProcessor.deactivateSequence)) {
                setMessageProcessor((prev: any) => ({ ...prev, deactivateSequenceType: 'Workspace' }));
            } else {
                setMessageProcessor((prev: any) => ({ ...prev, deactivateSequenceType: 'Custom' }));
            }
        }
    };

    const removeValue = (keyToRemove: string) => {
        updateChangeStatus();
        setProperties(prevState =>
            prevState.filter(pair => pair.key !== keyToRemove)
        );
    };

    const addValue = () => {
        updateChangeStatus();
        setProperties(prevState => [...prevState, { key: 'Parameter_Key', value: 'Parameter_Value' }]);
    };

    const editKey = (oldKey: string, newKey: string) => {
        updateChangeStatus();
        setProperties(prevState =>
            prevState.map(pair =>
                pair.key === oldKey ? { ...pair, key: newKey } : pair
            )
        );
    };

    const editValue = (key: string, newValue: string) => {
        updateChangeStatus();
        setProperties(prevState =>
            prevState.map(pair =>
                pair.key === key ? { ...pair, value: newValue } : pair
            )
        );
    };

    const messageProcessorTypes: OptionProps[] = [
        { value: "Scheduled Message Forwarding Processor"},
        { value: "Message Sampling Processor"},
        { value: "Custom Message Processor"},
        { value: "Scheduled Failover Message Forwarding Processor"}
    ];

    const messageStoreTypes: OptionProps[] = [
        { value: "TestMBStore"},
        { value: "TestJMSStore"},
        { value: "TestRabbitMQMessageStore"},
        { value: "TestJDBCMessageStore"},
        { value: "TestResquenceMessageStore"}
    ];

    const processorStates = [
        'Activate',
        'Deactivate'
    ];

    const dropMessageOptions = [
        'Enabled',
        'Disabled'
    ];

    const sequenceSelectionOptions = [
        "Workspace",
        "Custom"
    ];

    const handleOnChange = (field: any, value: any) => {
        updateChangeStatus();
        setMessageProcessor((prev: any) => ({ ...prev, [field]: value }));
    }

    const updateChangeStatus = () => {
        if(!isNewTask && !changesOccurred) {
            setChangesOccurred(true);
        }
    }

    const handleMessageProcessorTypeChange = (type: string) => {
        updateChangeStatus();
        setMessageProcessor((prev: any) => ({ ...prev, messageProcessorType: type }));
    };

    const handleMessageStoreTypeChange = (type: string) => {
        updateChangeStatus();
        setMessageProcessor((prev: any) => ({ ...prev, messageStoreType: type }));
    };

    const handleProcessorStateChange = (event: any) => {
        updateChangeStatus();
        setMessageProcessor((prev: any) => ({ ...prev, processorState: event.target.value }));
    };

    const handleDropMessageOptionChange = (event: any) => {
        updateChangeStatus();
        setMessageProcessor((prev: any) => ({ ...prev, dropMessageOption: event.target.value }));
    };

    const handleFailMessageStoreTypeChange = (type: string) => {
        updateChangeStatus();
        setMessageProcessor((prev: any) => ({ ...prev, failMessageStoreType: type }));
    };

    const handleSourceMessageStoreTypeChange = (type: string) => {
        updateChangeStatus();
        setMessageProcessor((prev: any) => ({ ...prev, messageStoreType: type }));
    };

    const handleTargetMessageStoreTypeChange = (type: string) => {
        updateChangeStatus();
        setMessageProcessor((prev: any) => ({ ...prev, targetMessageStoreType: type }));
    };

    const handleEndpointTypeChange = (event: any) => {
        updateChangeStatus();
        setMessageProcessor((prev: any) => ({ ...prev, endpointType: event.target.value }));
    };

    const handleSequenceTypeChange = (event: any) => {
        updateChangeStatus();
        setMessageProcessor((prev: any) => ({ ...prev, sequenceType: event.target.value }));
    };

    const handleDeactivateSequenceTypeChange = (event: any) => {
        updateChangeStatus();
        setMessageProcessor((prev: any) => ({ ...prev, deactivateSequenceType: event.target.value }));
    };

    const handleFaultSequenceTypeChange = (event: any) => {
        updateChangeStatus();
        setMessageProcessor((prev: any) => ({ ...prev, faultSequenceType: event.target.value }));
    };

    const handleReplySequenceTypeChange = (event: any) => {
        updateChangeStatus();
        setMessageProcessor((prev: any) => ({ ...prev, replySequenceType: event.target.value }));
    };

    const handleEndpointChange = (type: string) => {
        updateChangeStatus();
        setMessageProcessor((prev: any) => ({ ...prev, endpoint: type }));
    };

    const handleSequenceChange = (type: string) => {
        updateChangeStatus();
        setMessageProcessor((prev: any) => ({ ...prev, sequence: type }));
    };

    const handleFaultSequenceChange = (type: string) => {
        updateChangeStatus();
        setMessageProcessor((prev: any) => ({ ...prev, faultSequence: type }));
    };

    const handleDeactivateSequenceChange = (type: string) => {
        updateChangeStatus();
        setMessageProcessor((prev: any) => ({ ...prev, deactivateSequence: type }));
    };

    const handleReplySequenceChange = (type: string) => {
        updateChangeStatus();
        setMessageProcessor((prev: any) => ({ ...prev, replySequence: type }));
    };

    const handleAddCustomPropertiesChange = (value: boolean) => {
        updateChangeStatus();
        if (!value) {
            setProperties([]);
        }
        setMessageProcessor((prev: any) => ({ ...prev, hasCustomProperties: value }));
    };

    const handleMessage = (text: string, isError: boolean = false) => {
        setMessage({ isError, text });
    }

    const handleCreateMessageProcessor = async () => {

        messageProcessor.properties = properties;
        const createMessageProcessorParams: CreateMessageProcessorRequest = {
            directory: existingFilePath,
            ...messageProcessor
        }
        const filePath = await rpcClient.getMiDiagramRpcClient().createMessageProcessor(createMessageProcessorParams);
        setExistingFilePath(filePath.path);
        handleMessage(isNewTask ? "Message Processor created successfully" : "Message Processor updated successfully");
    };

    const handleCancel = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const handleBackButtonClick = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    }

    return (
        <WizardContainer>
            <SectionWrapper>
                <Container>
                    <Codicon iconSx={{ marginTop: -3, fontWeight: "bold", fontSize: 22 }} name='arrow-left' onClick={handleBackButtonClick} />
                    <div style={{ marginLeft: 30 }}>
                        <Typography variant="h3">Message Processor Artifact</Typography>
                    </div>
                </Container>
                <span>Message Processor Type</span>
                <Dropdown items={messageProcessorTypes} value={messageProcessor.messageProcessorType} onChange={handleMessageProcessorTypeChange} id="message-processor-type"/>
                <TextField
                    placeholder="Name"
                    label="Message Processor Name"
                    onChange={(value: string) => handleOnChange("messageProcessorName", value)}
                    value={messageProcessor.messageProcessorName}
                    id="message-processor-name-input"
                    autoFocus
                    required
                    validationMessage="Message processor name is required"
                    size={100}
                />
                {messageProcessor.messageProcessorType != "Scheduled Failover Message Forwarding Processor" && (
                    <>
                        <span>Message Store</span>
                        <Dropdown items={messageStoreTypes} value={messageProcessor.messageStoreType} onChange={handleMessageStoreTypeChange} id="message-store-type"/>
                    </>
                )}
                {messageProcessor.messageProcessorType === "Scheduled Failover Message Forwarding Processor" && (
                    <>
                        <span>Source Messages Store</span>
                        <Dropdown items={messageStoreTypes} value={messageProcessor.messageStoreType} onChange={handleSourceMessageStoreTypeChange} id="source-message-store"/>
                        <span>Target Messages Store</span>
                        <Dropdown items={messageStoreTypes} value={messageProcessor.targetMessageStoreType} onChange={handleTargetMessageStoreTypeChange} id="target-message-store"/>
                    </>
                )}
                {messageProcessor.messageProcessorType != "Custom Message Processor" && (
                    <>
                        <span>Processor State</span>
                        <RadioBtnContainer>
                            <RadioLabel>
                                <input
                                    type="radio"
                                    value={processorStates[0]}
                                    checked={messageProcessor.processorState === processorStates[0]}
                                    onChange={handleProcessorStateChange}
                                />
                                {processorStates[0]}
                            </RadioLabel>
                            <RadioLabel>
                                <input
                                    type="radio"
                                    value={processorStates[1]}
                                    checked={messageProcessor.processorState === processorStates[1]}
                                    onChange={handleProcessorStateChange}
                                />
                                {processorStates[1]}
                            </RadioLabel>
                        </RadioBtnContainer>
                        <TextField
                            placeholder="\temp\test-file.txt"
                            label="Quartz configuration file path"
                            onChange={(value: string) => handleOnChange("quartzConfigPath", value)}
                            value={messageProcessor.quartzConfigPath}
                            id="quartz-config-path-input"
                            size={100}
                        />
                        <TextField
                            placeholder="0 0 * * FRI"
                            label="Cron Expression"
                            onChange={(value: string) => handleOnChange("cron", value)}
                            value={messageProcessor.cron}
                            id="cron-input"
                            size={100}
                        />
                    </>
                )}
                {(messageProcessor.messageProcessorType === "Scheduled Message Forwarding Processor" ||
                    messageProcessor.messageProcessorType === "Scheduled Failover Message Forwarding Processor") && (
                        <>
                            <TextField
                                placeholder="10"
                                label="Forwarding Interval (Millis)"
                                onChange={(value: string) => {
                                    if (!isNaN(Number(value))) {
                                        handleOnChange("forwardingInterval", Number(value));
                                    } else {
                                        handleOnChange("forwardingInterval", null);
                                    }
                                }}
                                value={messageProcessor.forwardingInterval}
                                id="forwarding-interval-input"
                                size={50}
                            />
                            <TextField
                                placeholder="10"
                                label="Retry Interval (Millis)"
                                onChange={(value: string) => {
                                    if (!isNaN(Number(value))) {
                                        handleOnChange("retryInterval", Number(value));
                                    } else {
                                        handleOnChange("retryInterval", null);
                                    }
                                }}
                                value={messageProcessor.retryInterval}
                                id="retry-interval-input"
                                size={50}
                            />
                            <TextField
                                placeholder="10"
                                label="Maximum redelivery attempts"
                                onChange={(value: string) => {
                                    if (!isNaN(Number(value))) {
                                        handleOnChange("maxRedeliveryAttempts", Number(value));
                                    } else {
                                        handleOnChange("maxRedeliveryAttempts", null);
                                    }
                                }}
                                value={messageProcessor.maxRedeliveryAttempts}
                                id="max-redelivery-attempts-input"
                                size={50}
                            />
                            <TextField
                                placeholder="10"
                                label="Maximum store connection attempts"
                                onChange={(value: string) => {
                                    if (!isNaN(Number(value))) {
                                        handleOnChange("maxConnectionAttempts", Number(value));
                                    } else {
                                        handleOnChange("maxConnectionAttempts", null);
                                    }
                                }}
                                value={messageProcessor.maxConnectionAttempts}
                                id="max-connection-attempts-input"
                                size={50}
                            />
                            <TextField
                                placeholder="10"
                                label="Store connection attempt interval (Millis)"
                                onChange={(value: string) => {
                                    if (!isNaN(Number(value))) {
                                        handleOnChange("connectionAttemptInterval", Number(value));
                                    } else {
                                        handleOnChange("connectionAttemptInterval", null);
                                    }
                                }}
                                value={messageProcessor.connectionAttemptInterval}
                                id="connection-attempt-interval-input"
                                size={50}
                            />
                            <span>Drop message after maximum delivery attempts</span>
                            <RadioBtnContainer>
                                <RadioLabel>
                                    <input
                                        type="radio"
                                        value={dropMessageOptions[0]}
                                        checked={messageProcessor.dropMessageOption === dropMessageOptions[0]}
                                        onChange={handleDropMessageOptionChange}
                                    />
                                    {dropMessageOptions[0]}
                                </RadioLabel>
                                <RadioLabel>
                                    <input
                                        type="radio"
                                        value={dropMessageOptions[1]}
                                        checked={messageProcessor.dropMessageOption === dropMessageOptions[1]}
                                        onChange={handleDropMessageOptionChange}
                                    />
                                    {dropMessageOptions[1]}
                                </RadioLabel>
                            </RadioBtnContainer>
                            <span>Fault Sequence Name</span>
                            <RadioBtnContainer>
                                <RadioLabel>
                                    <input
                                        type="radio"
                                        value={sequenceSelectionOptions[0]}
                                        checked={messageProcessor.faultSequenceType === sequenceSelectionOptions[0]}
                                        onChange={handleFaultSequenceTypeChange}
                                    />
                                    {sequenceSelectionOptions[0]}
                                </RadioLabel>
                                <RadioLabel>
                                    <input
                                        type="radio"
                                        value={sequenceSelectionOptions[1]}
                                        checked={messageProcessor.faultSequenceType === sequenceSelectionOptions[1]}
                                        onChange={handleFaultSequenceTypeChange}
                                    />
                                    {sequenceSelectionOptions[1]}
                                </RadioLabel>
                            </RadioBtnContainer>
                            {messageProcessor.faultSequenceType === "Workspace" && (
                                <Dropdown items={sequences} value={messageProcessor.faultSequence} onChange={handleFaultSequenceChange} id="fault-sequence"/>
                            )}
                            {messageProcessor.faultSequenceType === "Custom" && (
                                <TextField
                                    placeholder="Sequence"
                                    label="Custom Sequence"
                                    onChange={(value: string) => handleOnChange("faultSequence", value)}
                                    value={messageProcessor.faultSequence}
                                    id="fault-sequence-custom"
                                    size={100}
                                />
                            )}
                            <span>Deactivate Sequence Name</span>
                            <RadioBtnContainer>
                                <RadioLabel>
                                    <input
                                        type="radio"
                                        value={sequenceSelectionOptions[0]}
                                        checked={messageProcessor.deactivateSequenceType === sequenceSelectionOptions[0]}
                                        onChange={handleDeactivateSequenceTypeChange}
                                    />
                                    {sequenceSelectionOptions[0]}
                                </RadioLabel>
                                <RadioLabel>
                                    <input
                                        type="radio"
                                        value={sequenceSelectionOptions[1]}
                                        checked={messageProcessor.deactivateSequenceType === sequenceSelectionOptions[1]}
                                        onChange={handleDeactivateSequenceTypeChange}
                                    />
                                    {sequenceSelectionOptions[1]}
                                </RadioLabel>
                            </RadioBtnContainer>
                            {messageProcessor.deactivateSequenceType === "Workspace" && (
                                <Dropdown items={sequences} value={messageProcessor.deactivateSequence} onChange={handleDeactivateSequenceChange} id="deactivate-sequence"/>
                            )}
                            {messageProcessor.deactivateSequenceType === "Custom" && (
                                <TextField
                                    placeholder="Sequence"
                                    label="Custom Sequence"
                                    onChange={(value: string) => handleOnChange("deactivateSequence", value)}
                                    value={messageProcessor.deactivateSequence}
                                    id="deactivate-sequence-custom"
                                    size={100}
                                />
                            )}
                            <TextField
                                placeholder="10"
                                label="Task Count (Cluster Mode)"
                                onChange={(value: string) => {
                                    if (!isNaN(Number(value))) {
                                        handleOnChange("taskCount", Number(value));
                                    } else {
                                        handleOnChange("taskCount", null);
                                    }
                                }}
                                value={messageProcessor.taskCount}
                                id="task-count-input"
                                size={50}
                            />
                        </>
                )}
                {messageProcessor.messageProcessorType === "Scheduled Message Forwarding Processor" && (
                    <>
                        <TextField
                            placeholder="304,305"
                            label="Non retry http status codes"
                            onChange={(value: string) => handleOnChange("statusCodes", value)}
                            value={messageProcessor.statusCodes}
                            id="status-codes-input"
                            size={50}
                        />
                        <TextField
                            placeholder="Client Repository"
                            label="Axis2 Client Repository"
                            onChange={(value: string) => handleOnChange("clientRepository", value)}
                            value={messageProcessor.clientRepository}
                            id="client-repository-input"
                            size={100}
                        />
                        <TextField
                            placeholder="Configuration"
                            label="Axis2 Configuration"
                            onChange={(value: string) => handleOnChange("axis2Config", value)}
                            value={messageProcessor.axis2Config}
                            id="axis2-config-input"
                            size={100}
                        />
                        <span>Endpoint Name<RequiredSpan>*</RequiredSpan></span>
                        <RadioBtnContainer>
                            <RadioLabel>
                                <input
                                    type="radio"
                                    value={sequenceSelectionOptions[0]}
                                    checked={messageProcessor.endpointType === sequenceSelectionOptions[0]}
                                    onChange={handleEndpointTypeChange}
                                />
                                {sequenceSelectionOptions[0]}
                            </RadioLabel>
                            <RadioLabel>
                                <input
                                    type="radio"
                                    value={sequenceSelectionOptions[1]}
                                    checked={messageProcessor.endpointType === sequenceSelectionOptions[1]}
                                    onChange={handleEndpointTypeChange}
                                />
                                {sequenceSelectionOptions[1]}
                            </RadioLabel>
                        </RadioBtnContainer>
                        {messageProcessor.endpointType === "Workspace" && (
                            <Dropdown items={endpoints} value={messageProcessor.endpoint} onChange={handleEndpointChange} id="endpoint"/>
                        )}
                        {messageProcessor.endpointType === "Custom" && (
                            <TextField
                                placeholder="Endpoint"
                                label="Custom Endpoint"
                                onChange={(value: string) => handleOnChange("endpoint", value)}
                                value={messageProcessor.endpoint}
                                id="endpoint-custom"
                                size={100}
                            />
                        )}
                        <span>Reply Sequence Name</span>
                        <RadioBtnContainer>
                            <RadioLabel>
                                <input
                                    type="radio"
                                    value={sequenceSelectionOptions[0]}
                                    checked={messageProcessor.replySequenceType === sequenceSelectionOptions[0]}
                                    onChange={handleReplySequenceTypeChange}
                                />
                                {sequenceSelectionOptions[0]}
                            </RadioLabel>
                            <RadioLabel>
                                <input
                                    type="radio"
                                    value={sequenceSelectionOptions[1]}
                                    checked={messageProcessor.replySequenceType === sequenceSelectionOptions[1]}
                                    onChange={handleReplySequenceTypeChange}
                                />
                                {sequenceSelectionOptions[1]}
                            </RadioLabel>
                        </RadioBtnContainer>
                        {messageProcessor.replySequenceType === "Workspace" && (
                            <Dropdown items={sequences} value={messageProcessor.replySequence} onChange={handleReplySequenceChange} id="reply-sequence"/>
                        )}
                        {messageProcessor.replySequenceType === "Custom" && (
                            <TextField
                                placeholder="Sequence"
                                label="Custom Sequence"
                                onChange={(value: string) => handleOnChange("replySequence", value)}
                                value={messageProcessor.replySequence}
                                id="reply-sequence-custom"
                                size={100}
                            />
                        )}
                        <span>Fail Messages Store</span>
                        <Dropdown items={messageStoreTypes} value={messageProcessor.failMessageStoreType} onChange={handleFailMessageStoreTypeChange} id="fail-message-store"/>
                    </>
                )}
                {messageProcessor.messageProcessorType === "Message Sampling Processor" && (
                    <>
                        <span>Sequence<RequiredSpan>*</RequiredSpan></span>
                        <RadioBtnContainer>
                            <RadioLabel>
                                <input
                                    type="radio"
                                    value={sequenceSelectionOptions[0]}
                                    checked={messageProcessor.sequenceType === sequenceSelectionOptions[0]}
                                    onChange={handleSequenceTypeChange}
                                />
                                {sequenceSelectionOptions[0]}
                            </RadioLabel>
                            <RadioLabel>
                                <input
                                    type="radio"
                                    value={sequenceSelectionOptions[1]}
                                    checked={messageProcessor.sequenceType === sequenceSelectionOptions[1]}
                                    onChange={handleSequenceTypeChange}
                                />
                                {sequenceSelectionOptions[1]}
                            </RadioLabel>
                        </RadioBtnContainer>
                        {messageProcessor.sequenceType === "Workspace" && (
                            <Dropdown items={sequences} value={messageProcessor.sequence} onChange={handleSequenceChange} id="sequence"/>
                        )}
                        {messageProcessor.sequenceType === "Custom" && (
                            <TextField
                                placeholder="Sequence"
                                label="Custom Sequence"
                                onChange={(value: string) => handleOnChange("sequence", value)}
                                value={messageProcessor.sequence}
                                id="sequence-custom"
                                size={100}
                            />
                        )}
                        <TextField
                            placeholder="10"
                            label="Sampling Interval (Millis)"
                            onChange={(value: string) => {
                                if (!isNaN(Number(value))) {
                                    handleOnChange("samplingInterval", Number(value));
                                } else {
                                    handleOnChange("samplingInterval", null);
                                }
                            }}
                            value={messageProcessor.samplingInterval}
                            id="sampling-interval-input"
                            size={50}
                        />
                        <TextField
                            placeholder="10"
                            label="Sampling Concurrency"
                            onChange={(value: string) => {
                                if (!isNaN(Number(value))) {
                                    handleOnChange("samplingConcurrency", Number(value));
                                } else {
                                    handleOnChange("samplingConcurrency", null);
                                }
                            }}
                            value={messageProcessor.samplingConcurrency}
                            id="sampling-concurrency-input"
                            size={50}
                        />
                    </>
                )}
                {messageProcessor.messageProcessorType === "Custom Message Processor" ? (
                    <>
                        <TextField
                            placeholder="Provider Class"
                            label="Message Processor Provider Class FQN"
                            onChange={(value: string) => handleOnChange("providerClass", value)}
                            value={messageProcessor.providerClass}
                            id="provider-class-input"
                            required
                            validationMessage="Message processor provider class FQN is required"
                            size={100}
                        />
                    </>
                ) : (
                     <>
                         <span>Require Custom Properties</span>
                         <RadioBtnContainer>
                             <RadioLabel>
                                 <input
                                     type="radio"
                                     checked={messageProcessor.hasCustomProperties === true}
                                     onChange={() => handleAddCustomPropertiesChange(true)}
                                 />
                                 Yes
                             </RadioLabel>
                             <RadioLabel>
                                 <input
                                     type="radio"
                                     checked={messageProcessor.hasCustomProperties === false}
                                     onChange={() => handleAddCustomPropertiesChange(false)}
                                 />
                                 No
                             </RadioLabel>
                         </RadioBtnContainer>
                     </>
                )}

                {(messageProcessor.hasCustomProperties || messageProcessor.messageProcessorType === "Custom Message Processor") && (
                    <>
                        <span>Parameters</span>
                        <Button onClick={addValue}>Add Parameter</Button>
                        <Table>
                            <thead>
                            <tr>
                                <Th>Name</Th>
                                <Th>Value</Th>
                                <ThButton>Remove</ThButton>
                            </tr>
                            </thead>
                            <tbody>
                            {properties.map(pair => (
                                <tr>
                                    <Td contentEditable={true} onBlur={(e) => editKey(pair.key, e.currentTarget.textContent || '')}>{pair.key}</Td>
                                    <Td contentEditable={true} onBlur={(e) => editValue(pair.key, e.currentTarget.textContent || '')}>{pair.value}</Td>
                                    <TdButton>
                                        <Button onClick={() => removeValue(pair.key)}>Remove</Button>
                                    </TdButton>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </>
                )}
            </SectionWrapper>
            <ActionContainer>
                {message && <span style={{ color: message.isError ? "#f48771" : "" }}>{message.text}</span>}
                <Button
                    appearance="secondary"
                    onClick={handleCancel}
                >
                    Cancel
                </Button>
                <Button
                    appearance="primary"
                    onClick={handleCreateMessageProcessor}
                    disabled={!isValid || (!changesOccurred && !isNewTask)}
                >
                    {isNewTask ? "Create" : "Save Changes"}
                </Button>
            </ActionContainer>
        </WizardContainer>
    );
}
