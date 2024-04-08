/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useState } from "react";
import {Button, TextField, Dropdown, RadioButtonGroup, FormView, FormActions, ParamConfig, ParamManager} from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { CreateMessageProcessorRequest } from "@wso2-enterprise/mi-core";
import CardWrapper from "./Commons/CardWrapper";
import { TypeChangeButton } from "./Commons";

interface OptionProps {
    value: string;
}

interface MessageProcessorWizardProps {
    path: string;
};

const newMessageProcessor = {
    messageProcessorName: "",
    messageProcessorType: "",
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
    endpointType: null as string,
    sequenceType: null as string,
    replySequenceType: null as string,
    faultSequenceType: null as string,
    deactivateSequenceType: null as string,
    endpoint: "",
    sequence: "",
    replySequence: "",
    faultSequence: "",
    deactivateSequence: "",
    samplingInterval: 1000,
    samplingConcurrency: 1,
    providerClass: "",
    properties: [] as any,
    hasCustomProperties: false
};

export function MessageProcessorWizard(props: MessageProcessorWizardProps) {

    const { rpcClient } = useVisualizerContext();
    const [ messageProcessor, setMessageProcessor ] = useState<any>(newMessageProcessor);
    const [sequences, setSequences] = useState();
    const [endpoints, setEndpoints] = useState();
    const [isNewMessageProcessor, setIsNewMessageProcessor] = useState(!props.path.endsWith(".xml"));
    const [changesOccurred, setChangesOccurred] = useState(false);
    const [message, setMessage] = useState({
        isError: false,
        text: ""
    });

    const paramConfigs: ParamConfig = {
        paramValues: [],
        paramFields: [
            {
                id: 0,
                type: "TextField",
                label: "Name",
                defaultValue: "parameter_key",
                isRequired: true
            },
            {
                id: 1,
                type: "TextField",
                label: "Value",
                defaultValue: "parameter_value",
                isRequired: true
            }]
    }

    const [params, setParams] = useState(paramConfigs);

    const messageStoreTypes: OptionProps[] = [
        { value: "TestMBStore"},
        { value: "TestJMSStore"},
        { value: "TestRabbitMQMessageStore"},
        { value: "TestJDBCMessageStore"},
        { value: "TestResquenceMessageStore"}
    ];

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

            if (props.path.endsWith(".xml")) {
                setIsNewMessageProcessor(false);
                if (props.path.includes('/messageProcessors')) {
                    props.path = props.path.replace('/messageProcessors', '/message-processors');
                }
                const existingMessageProcessor = await rpcClient.getMiDiagramRpcClient().getMessageProcessor({ path: props.path });
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
                paramConfigs.paramValues = [];
                setParams(paramConfigs);
                existingMessageProcessor.properties.map((param: any) => {
                    setParams((prev: any) => {
                        return {
                            ...prev,
                            paramValues: [...prev.paramValues, {
                                id: prev.paramValues.length,
                                parameters: [{
                                    id: 0,
                                    value: param.key,
                                    label: "Name",
                                    type: "TextField",
                                },
                                    {
                                        id: 1,
                                        value: param.value,
                                        label: "Value",
                                        type: "TextField",
                                    },
                                ],
                                key: param.key,
                                value: param.value,
                            }
                            ]
                        }
                    });
                });
                updateTypes(endpointList, sequenceList);
            } else {
                setMessageProcessor(newMessageProcessor);
                paramConfigs.paramValues = [];
                setParams(paramConfigs);
                setIsNewMessageProcessor(true);
                setMessage({ isError: false, text: "" });
            }
        })();
    }, [props.path]);

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

    const setMessageProcessorType = (type: string) => {
        setMessageProcessor((prev: any) => ({ ...prev, messageProcessorType: type }));
    }

    const handleOnChange = (field: any, value: any) => {
        updateChangeStatus();
        setMessageProcessor((prev: any) => ({ ...prev, [field]: value }));
    }

    const handlePropertiesOnChange = (params: any) => {
        const modifiedParams = {
            ...params, paramValues: params.paramValues.map((param: any) => {
                return {
                    ...param,
                    key: param.parameters[0].value,
                    value: param.parameters[1].value,
                }
            })
        };
        setParams(modifiedParams);
    };

    const updateChangeStatus = () => {
        if(!isNewMessageProcessor && !changesOccurred) {
            setChangesOccurred(true);
        }
    }

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

    const handleAddCustomPropertiesChange = (event: any) => {
        updateChangeStatus();
        if (!event.target.value) {
            paramConfigs.paramValues = [];
            setParams(paramConfigs);
        }
        setMessageProcessor((prev: any) => ({ ...prev, hasCustomProperties: event.target.value }));
    };

    const handleMessage = (text: string, isError: boolean = false) => {
        setMessage({ isError, text });
    }

    const handleCreateMessageProcessor = async () => {

        let customProperties: any = [];
        params.paramValues.map((param: any) => {
            customProperties.push({ key: param.parameters[0].value, value: param.parameters[1].value });
        })
        messageProcessor.properties = customProperties;

        const createMessageProcessorParams: CreateMessageProcessorRequest = {
            directory: props.path,
            ...messageProcessor
        }
        await rpcClient.getMiDiagramRpcClient().createMessageProcessor(createMessageProcessorParams);

        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const handleCancel = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    return (
        <FormView title="Message Processor" onClose={handleCancel}>
            { messageProcessor.messageProcessorType === '' ? <CardWrapper cardsType="MESSAGE_PROCESSOR" setType={setMessageProcessorType} /> : <>
            { isNewMessageProcessor && <TypeChangeButton type={messageProcessor.messageProcessorType} onClick={setMessageProcessorType} /> }
                <TextField
                    placeholder="Name"
                    label="Message Processor Name"
                    onTextChange={(value: string) => handleOnChange("messageProcessorName", value)}
                    value={messageProcessor.messageProcessorName}
                    id="message-processor-name-input"
                    autoFocus
                    required
                    validationMessage="Message processor name is required"
                    size={100}
                />
                {messageProcessor.messageProcessorType != "Scheduled Failover Message Forwarding Processor" && (
                    <Dropdown label="Message Store" items={messageStoreTypes} value={messageProcessor.messageStoreType} onValueChange={handleMessageStoreTypeChange} id="message-store-type"/>
                )}
                {messageProcessor.messageProcessorType === "Scheduled Failover Message Forwarding Processor" && (
                    <>
                        <Dropdown label="Source Messages Store" items={messageStoreTypes} value={messageProcessor.messageStoreType} onValueChange={handleSourceMessageStoreTypeChange} id="source-message-store"/>
                        <Dropdown label="Target Messages Store" items={messageStoreTypes} value={messageProcessor.targetMessageStoreType} onValueChange={handleTargetMessageStoreTypeChange} id="target-message-store"/>
                    </>
                )}
                {messageProcessor.messageProcessorType != "Custom Message Processor" && (
                    <>
                        <RadioButtonGroup
                            label="Processor State"
                            id="processor-state"
                            options={[{ content: "Activate", value: "Activate" }, { content: "Deactivate", value: "Deactivate" }]}
                            onChange={handleProcessorStateChange}
                            value={messageProcessor.processorState}
                        />
                        <TextField
                            placeholder="\temp\test-file.txt"
                            label="Quartz configuration file path"
                            onTextChange={(value: string) => handleOnChange("quartzConfigPath", value)}
                            value={messageProcessor.quartzConfigPath}
                            id="quartz-config-path-input"
                            size={100}
                        />
                        <TextField
                            placeholder="0 0 * * FRI"
                            label="Cron Expression"
                            onTextChange={(value: string) => handleOnChange("cron", value)}
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
                                onTextChange={(value: string) => {
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
                                onTextChange={(value: string) => {
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
                                onTextChange={(value: string) => {
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
                                onTextChange={(value: string) => {
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
                                onTextChange={(value: string) => {
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
                            <RadioButtonGroup
                                label="Drop message after maximum delivery attempts"
                                id="drop-message-option"
                                options={[{ content: "Enabled", value: "Enabled" }, { content: "Disabled", value: "Disabled" }]}
                                onChange={handleDropMessageOptionChange}
                                value={messageProcessor.dropMessageOption}
                            />
                            <RadioButtonGroup
                                label="Fault Sequence Name"
                                id="fault-sequence-type"
                                options={[{ content: "Workspace", value: "Workspace" }, { content: "Custom", value: "Custom" }]}
                                onChange={handleFaultSequenceTypeChange}
                                value={messageProcessor.faultSequenceType}
                            />
                            {messageProcessor.faultSequenceType === "Workspace" && (
                                <Dropdown items={sequences} value={messageProcessor.faultSequence} onValueChange={handleFaultSequenceChange} id="fault-sequence"/>
                            )}
                            {messageProcessor.faultSequenceType === "Custom" && (
                                <TextField
                                    placeholder="Sequence"
                                    label="Custom Sequence"
                                    onTextChange={(value: string) => handleOnChange("faultSequence", value)}
                                    value={messageProcessor.faultSequence}
                                    id="fault-sequence-custom"
                                    size={100}
                                />
                            )}
                            <RadioButtonGroup
                                label="Deactivate Sequence Name"
                                id="deactivate-sequence-type"
                                options={[{ content: "Workspace", value: "Workspace" }, { content: "Custom", value: "Custom" }]}
                                onChange={handleDeactivateSequenceTypeChange}
                                value={messageProcessor.deactivateSequenceType}
                            />
                            {messageProcessor.deactivateSequenceType === "Workspace" && (
                                <Dropdown items={sequences} value={messageProcessor.deactivateSequence} onValueChange={handleDeactivateSequenceChange} id="deactivate-sequence"/>
                            )}
                            {messageProcessor.deactivateSequenceType === "Custom" && (
                                <TextField
                                    placeholder="Sequence"
                                    label="Custom Sequence"
                                    onTextChange={(value: string) => handleOnChange("deactivateSequence", value)}
                                    value={messageProcessor.deactivateSequence}
                                    id="deactivate-sequence-custom"
                                    size={100}
                                />
                            )}
                            <TextField
                                placeholder="10"
                                label="Task Count (Cluster Mode)"
                                onTextChange={(value: string) => {
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
                            onTextChange={(value: string) => handleOnChange("statusCodes", value)}
                            value={messageProcessor.statusCodes}
                            id="status-codes-input"
                            size={50}
                        />
                        <TextField
                            placeholder="Client Repository"
                            label="Axis2 Client Repository"
                            onTextChange={(value: string) => handleOnChange("clientRepository", value)}
                            value={messageProcessor.clientRepository}
                            id="client-repository-input"
                            size={100}
                        />
                        <TextField
                            placeholder="Configuration"
                            label="Axis2 Configuration"
                            onTextChange={(value: string) => handleOnChange("axis2Config", value)}
                            value={messageProcessor.axis2Config}
                            id="axis2-config-input"
                        />
                        <RadioButtonGroup
                            label="Endpoint Name"
                            id="endpoint-type"
                            options={[{ content: "Workspace", value: "Workspace" }, { content: "Custom", value: "Custom" }]}
                            onChange={handleEndpointTypeChange}
                            value={messageProcessor.endpointType}
                        />
                        {messageProcessor.endpointType === "Workspace" && (
                            <Dropdown items={endpoints} value={messageProcessor.endpoint} onValueChange={handleEndpointChange} id="endpoint"/>
                        )}
                        {messageProcessor.endpointType === "Custom" && (
                            <TextField
                                placeholder="Endpoint"
                                label="Custom Endpoint"
                                onTextChange={(value: string) => handleOnChange("endpoint", value)}
                                value={messageProcessor.endpoint}
                                id="endpoint-custom"
                            />
                        )}
                        <RadioButtonGroup
                            label="Reply Sequence Name"
                            id="reply-sequence-type"
                            options={[{ content: "Workspace", value: "Workspace" }, { content: "Custom", value: "Custom" }]}
                            onChange={handleReplySequenceTypeChange}
                            value={messageProcessor.replySequenceType}
                        />
                        {messageProcessor.replySequenceType === "Workspace" && (
                            <Dropdown items={sequences} value={messageProcessor.replySequence} onValueChange={handleReplySequenceChange} id="reply-sequence"/>
                        )}
                        {messageProcessor.replySequenceType === "Custom" && (
                            <TextField
                                placeholder="Sequence"
                                label="Custom Sequence"
                                onTextChange={(value: string) => handleOnChange("replySequence", value)}
                                value={messageProcessor.replySequence}
                                id="reply-sequence-custom"
                            />
                        )}
                        <Dropdown label="Fail Messages Store" items={messageStoreTypes} value={messageProcessor.failMessageStoreType} onValueChange={handleFailMessageStoreTypeChange} id="fail-message-store"/>
                    </>
                )}
                {messageProcessor.messageProcessorType === "Message Sampling Processor" && (
                    <>
                        <RadioButtonGroup
                            label="Sequence Name"
                            id="sequence-type"
                            options={[{ content: "Workspace", value: "Workspace" }, { content: "Custom", value: "Custom" }]}
                            onChange={handleSequenceTypeChange}
                            value={messageProcessor.sequenceType}
                        />
                        {messageProcessor.sequenceType === "Workspace" && (
                            <Dropdown items={sequences} value={messageProcessor.sequence} onValueChange={handleSequenceChange} id="sequence"/>
                        )}
                        {messageProcessor.sequenceType === "Custom" && (
                            <TextField
                                placeholder="Sequence"
                                label="Custom Sequence"
                                onTextChange={(value: string) => handleOnChange("sequence", value)}
                                value={messageProcessor.sequence}
                                id="sequence-custom"
                                size={100}
                            />
                        )}
                        <TextField
                            placeholder="10"
                            label="Sampling Interval (Millis)"
                            onTextChange={(value: string) => {
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
                            onTextChange={(value: string) => {
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
                            onTextChange={(value: string) => handleOnChange("providerClass", value)}
                            value={messageProcessor.providerClass}
                            id="provider-class-input"
                            required
                            validationMessage="Message processor provider class FQN is required"
                            size={100}
                        />
                    </>
                ) : (
                    <RadioButtonGroup
                        label="Require Custom Properties"
                        id="custom-properties"
                        options={[{ content: "Yes", value: true }, { content: "No", value: false }]}
                        onChange={handleAddCustomPropertiesChange}
                        value={messageProcessor.hasCustomProperties}
                    />
                )}

                {(messageProcessor.hasCustomProperties || messageProcessor.messageProcessorType === "Custom Message Processor") && (
                    <>
                        <span>Parameters</span>
                        <ParamManager
                            paramConfigs={params}
                            readonly={false}
                            onChange={handlePropertiesOnChange} />
                    </>
                )}
                {message && <span style={{ color: message.isError ? "#f48771" : "" }}>{message.text}</span>}
            <FormActions>
                <Button
                    appearance="primary"
                    onClick={handleCreateMessageProcessor}
                    disabled={!isValid || (!changesOccurred && !isNewMessageProcessor)}
                >
                    {isNewMessageProcessor ? "Create" : "Save Changes"}
                </Button>
                <Button
                    appearance="secondary"
                    onClick={handleCancel}
                >
                    Cancel
                </Button>
            </FormActions>
            </>}
        </FormView>
    );
}
