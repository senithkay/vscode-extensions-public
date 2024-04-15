/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, {useEffect, useState} from "react";
import {Button, TextField, Dropdown, RadioButtonGroup, FormView, FormActions, ParamConfig, ParamManager} from "@wso2-enterprise/ui-toolkit";
import {useVisualizerContext} from "@wso2-enterprise/mi-rpc-client";
import {EVENT_TYPE, MACHINE_VIEW} from "@wso2-enterprise/mi-core";
import {CreateMessageProcessorRequest} from "@wso2-enterprise/mi-core";
import CardWrapper from "./Commons/CardWrapper";
import {TypeChip} from "./Commons";
import {useForm} from "react-hook-form";
import * as yup from "yup";
import {yupResolver} from "@hookform/resolvers/yup"

interface OptionProps {
    value: string;
}

interface MessageProcessorWizardProps {
    path: string;
};

type InputsFields = {
    messageProcessorName?: string;
    messageProcessorType?: string;
    messageStoreType?: string;
    failMessageStoreType?: string;
    sourceMessageStoreType?: string;
    targetMessageStoreType?: string;
    processorState?: string;
    dropMessageOption?: string;
    quartzConfigPath?: string;
    cron?: string;
    forwardingInterval?: number;
    retryInterval?: number;
    maxRedeliveryAttempts?: number;
    maxConnectionAttempts?: number;
    connectionAttemptInterval?: number;
    taskCount?: number;
    statusCodes?: string;
    clientRepository?: string;
    axis2Config?: string;
    endpointType?: string;
    sequenceType?: string;
    replySequenceType?: string;
    faultSequenceType?: string;
    deactivateSequenceType?: string;
    endpoint?: string;
    sequence?: string;
    replySequence?: string;
    faultSequence?: string;
    deactivateSequence?: string;
    samplingInterval?: number;
    samplingConcurrency?: number;
    providerClass?: string;
};

const newMessageProcessor: InputsFields = {
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
    providerClass: ""
};

const schema = yup.object({
    messageProcessorName: yup.string().required("Message Processor Name is required").matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in Message Processor Name"),
    messageProcessorType: yup.string().default(""),
    messageStoreType: yup.string().default("TestMBStore"),
    failMessageStoreType: yup.string().notRequired().default(""),
    sourceMessageStoreType: yup.string().default("TestMBStore"),
    targetMessageStoreType: yup.string().default("TestMBStore"),
    processorState: yup.string().default("Activate"),
    dropMessageOption: yup.string().default("Disabled"),
    quartzConfigPath: yup.string().notRequired().default(""),
    cron: yup.string().notRequired().default(""),
    forwardingInterval: yup.number().typeError('Forwarding Interval must be a number').min(1, "Forwarding Interval must be greater than 0").notRequired().default(1000),
    retryInterval: yup.number().typeError('Retry interval must be a number').min(1, "Retry interval must be greater than 0").notRequired().default(1000),
    maxRedeliveryAttempts: yup.number().typeError('Max Redelivery Attempts must be a number').min(1, "Max Redelivery Attempts must be greater than 0").notRequired().default(4),
    maxConnectionAttempts: yup.number().typeError('Max Connection Attempts must be a number').min(-1, "Max Connection Attempts must be greater than -1").notRequired().default(-1),
    connectionAttemptInterval: yup.number().typeError('Connection Attempt Interval must be a number').min(1, "Connection Attempt Interval must be greater than 0").notRequired().default(1000),
    taskCount: yup.number().typeError('Task count must be a number').min(1, "Task Count must be greater than 0").notRequired().default(1),
    statusCodes: yup.string().notRequired().default(""),
    clientRepository: yup.string().notRequired().default(""),
    axis2Config: yup.string().notRequired().default(""),
    endpointType: yup.string().when('messageProcessorType', {
        is: 'Scheduled Message Forwarding Processor',
        then: (schema) => schema.required("Select Endpoint Type"),
        otherwise: (schema) => schema.notRequired().default(""),
    }),
    sequenceType: yup.string().when('messageProcessorType', {
        is: 'Message Sampling Processor',
        then: (schema) => schema.required("Select Sequence Type"),
        otherwise: (schema) => schema.notRequired().default(""),
    }),
    replySequenceType: yup.string().notRequired().default(""),
    faultSequenceType: yup.string().notRequired().default(""),
    deactivateSequenceType: yup.string().notRequired().default(""),
    endpoint: yup.string().when('messageProcessorType', {
        is: 'Scheduled Message Forwarding Processor',
        then: (schema) => schema.required("Endpoint is required"),
        otherwise: (schema) => schema.notRequired().default(""),
    }),
    sequence: yup.string().when('messageProcessorType', {
        is: 'Message Sampling Processor',
        then: (schema) => schema.required("Sequence is required"),
        otherwise: (schema) => schema.notRequired().default(""),
    }),
    replySequence: yup.string().notRequired().default(""),
    faultSequence: yup.string().notRequired().default(""),
    deactivateSequence: yup.string().notRequired().default(""),
    samplingInterval: yup.number().typeError('Sampling Interval must be a number').min(1, "Sampling Interval must be greater than 0").notRequired().default(1000),
    samplingConcurrency: yup.number().typeError('Sampling Concurrency must be a number').min(1, "Sampling Concurrency must be greater than 0").notRequired().default(1),
    providerClass: yup.string().when('messageProcessorType', {
        is: 'Custom Message Processor',
        then: (schema) => schema.required("Message Processor Provider Class FQN is required"),
        otherwise: (schema) => schema.notRequired().default(""),
    })
})

export function MessageProcessorWizard(props: MessageProcessorWizardProps) {

    const {
        reset,
        register,
        formState: {errors, isDirty},
        handleSubmit,
        setValue,
        watch,
        getValues,
    } = useForm({
        defaultValues: newMessageProcessor,
        resolver: yupResolver(schema),
        mode: "onChange"
    });

    const {rpcClient} = useVisualizerContext();
    const [messageProcessorType, setMessageProcessorType] = useState("");
    const [hasCustomProperties, setHasCustomProperties] = useState("No");
    const [sequences, setSequences] = useState();
    const [endpoints, setEndpoints] = useState();
    const [isNewMessageProcessor, setIsNewMessageProcessor] = useState(!props.path.endsWith(".xml"));

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
        {value: "TestMBStore"},
        {value: "TestJMSStore"},
        {value: "TestRabbitMQMessageStore"},
        {value: "TestJDBCMessageStore"},
        {value: "TestResquenceMessageStore"}
    ];

    useEffect(() => {

        (async () => {
            const items = await rpcClient.getMiDiagramRpcClient().getEndpointsAndSequences();
            const sequenceList = items.data[1].map((seq: string) => {
                seq = seq.replace(".xml", "");
                return {value: seq}
            });
            const endpointList = items.data[0].map((seq: string) => {
                seq = seq.replace(".xml", "");
                return {value: seq}
            });
            setSequences(sequenceList);
            setEndpoints(endpointList);

            if (props.path.endsWith(".xml")) {
                setIsNewMessageProcessor(false);
                if (props.path.includes('/messageProcessors')) {
                    props.path = props.path.replace('/messageProcessors', '/message-processors');
                }
                const existingMessageProcessor = await rpcClient.getMiDiagramRpcClient().getMessageProcessor({path: props.path});
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
                setMessageProcessorType(existingMessageProcessor.messageProcessorType);
                reset(existingMessageProcessor);
                setValue('processorState', existingMessageProcessor.processorState ? "Activate" : "Deactivate");
                setHasCustomProperties(existingMessageProcessor.properties.length > 0 ? "Yes" : "No");
                updateTypes(endpointList, sequenceList);
            } else {
                setMessageProcessorType('');
                paramConfigs.paramValues = [];
                setParams(paramConfigs);
                reset(newMessageProcessor);
                setIsNewMessageProcessor(true);
            }
        })();
    }, [props.path]);

    const updateTypes = (endpointList: [], sequenceList: []) => {
        if (getValues('endpoint') != '') {
            if (endpointList.some((option: any) => option.value === getValues('endpoint'))) {
                setValue('endpointType', 'Workspace');
            } else {
                setValue('endpointType', 'Custom');
            }
        }
        if (getValues('sequence') != '') {
            if (sequenceList.some((option: any) => option.value === getValues('sequence'))) {
                setValue('sequenceType', 'Workspace');
            } else {
                setValue('sequenceType', 'Custom');
            }
        }
        if (getValues('replySequence') != '') {
            if (sequenceList.some((option: any) => option.value === getValues('replySequence'))) {
                setValue('replySequenceType', 'Workspace');
            } else {
                setValue('replySequenceType', 'Custom');
            }
        }
        if (getValues('faultSequence') != '') {
            if (sequenceList.some((option: any) => option.value === getValues('faultSequence'))) {
                setValue('faultSequenceType', 'Workspace');
            } else {
                setValue('faultSequenceType', 'Custom');
            }
        }
        if (getValues('deactivateSequence') != '') {
            if (sequenceList.some((option: any) => option.value === getValues('deactivateSequence'))) {
                setValue('deactivateSequenceType', 'Workspace');
            } else {
                setValue('deactivateSequenceType', 'Custom');
            }
        }
    };

    const handleSetCustomProperties = (event: any) => {
        if (!event.target.value) {
            paramConfigs.paramValues = [];
            setParams(paramConfigs);
        }
        setHasCustomProperties(event.target.value);
    };

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

    const handleCreateMessageProcessor = async (values: any) => {

        let customProperties: any = [];
        params.paramValues.map((param: any) => {
            customProperties.push({key: param.parameters[0].value, value: param.parameters[1].value});
        })

        const messageProcessorRequest: CreateMessageProcessorRequest = {
            ...values,
            messageProcessorType: messageProcessorType,
            properties: customProperties,
            directory: props.path
        };

        await rpcClient.getMiDiagramRpcClient().createMessageProcessor(messageProcessorRequest);
        rpcClient.getMiVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {view: MACHINE_VIEW.Overview}
        });
    };

    const handleCancel = () => {
        rpcClient.getMiVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {view: MACHINE_VIEW.Overview}
        });
    };

    const renderProps = (fieldName: keyof InputsFields) => {
        return {
            id: fieldName,
            value: String(watch(fieldName)),
            ...register(fieldName),
            errorMsg: errors[fieldName] && errors[fieldName].message.toString()
        }
    };

    return (
        <FormView title="Message Processor" onClose={handleCancel}>
            {messageProcessorType === '' ?
                <CardWrapper cardsType="MESSAGE_PROCESSOR" setType={setMessageProcessorType}/> : <>
                    <TypeChip type={messageProcessorType} onClick={setMessageProcessorType}
                              showButton={isNewMessageProcessor}/>
                    <TextField
                        placeholder="Name"
                        label="Message Processor Name"
                        autoFocus
                        required
                        {...renderProps("messageProcessorName")}
                    />
                    {messageProcessorType != "Scheduled Failover Message Forwarding Processor" && (
                        <Dropdown label="Message Store"
                                  items={messageStoreTypes} {...renderProps('messageStoreType')} />
                    )}
                    {messageProcessorType === "Scheduled Failover Message Forwarding Processor" && (
                        <>
                            <Dropdown label="Source Messages Store"
                                      items={messageStoreTypes} {...renderProps('sourceMessageStoreType')} />
                            <Dropdown label="Target Messages Store"
                                      items={messageStoreTypes} {...renderProps('targetMessageStoreType')} />
                        </>
                    )}
                    {messageProcessorType != "Custom Message Processor" && (
                        <>
                            <RadioButtonGroup
                                label="Processor State"
                                options={[{content: "Activate", value: "Activate"}, {
                                    content: "Deactivate",
                                    value: "Deactivate"
                                }]}
                                {...renderProps('processorState')}
                            />
                            <TextField
                                placeholder="\temp\test-file.txt"
                                label="Quartz configuration file path"
                                {...renderProps('quartzConfigPath')}
                            />
                            <TextField
                                placeholder="0 0 * * FRI"
                                label="Cron Expression"
                                {...renderProps('cron')}
                            />
                        </>
                    )}
                    {(messageProcessorType === "Scheduled Message Forwarding Processor" ||
                        messageProcessorType === "Scheduled Failover Message Forwarding Processor") && (
                        <>
                            <TextField
                                placeholder="10"
                                label="Forwarding Interval (Millis)"
                                {...renderProps('forwardingInterval')}
                            />
                            <TextField
                                placeholder="10"
                                label="Retry Interval (Millis)"
                                {...renderProps('retryInterval')}
                            />
                            <TextField
                                placeholder="10"
                                label="Maximum redelivery attempts"
                                {...renderProps('maxRedeliveryAttempts')}
                            />
                            <TextField
                                placeholder="10"
                                label="Maximum store connection attempts"
                                {...renderProps('maxConnectionAttempts')}
                            />
                            <TextField
                                placeholder="10"
                                label="Store connection attempt interval (Millis)"
                                {...renderProps('connectionAttemptInterval')}
                            />
                            <RadioButtonGroup
                                label="Drop message after maximum delivery attempts"
                                options={[{content: "Enabled", value: "Enabled"}, {
                                    content: "Disabled",
                                    value: "Disabled"
                                }]}
                                {...renderProps('dropMessageOption')}
                            />
                            <RadioButtonGroup
                                label="Fault Sequence Name"
                                options={[{content: "Workspace", value: "Workspace"}, {
                                    content: "Custom",
                                    value: "Custom"
                                }]}
                                {...renderProps('faultSequenceType')}
                            />
                            {watch('faultSequenceType') === "Workspace" && (
                                <Dropdown items={sequences} {...renderProps('faultSequence')} />
                            )}
                            {watch('faultSequenceType') === "Custom" && (
                                <TextField
                                    placeholder="Sequence"
                                    label="Custom Sequence"
                                    {...renderProps('faultSequence')}
                                />
                            )}
                            <RadioButtonGroup
                                label="Deactivate Sequence Name"
                                options={[{content: "Workspace", value: "Workspace"}, {
                                    content: "Custom",
                                    value: "Custom"
                                }]}
                                {...renderProps('deactivateSequenceType')}
                            />
                            {watch('deactivateSequenceType') === "Workspace" && (
                                <Dropdown items={sequences} {...renderProps('deactivateSequence')} />
                            )}
                            {watch('deactivateSequenceType') === "Custom" && (
                                <TextField
                                    placeholder="Sequence"
                                    label="Custom Sequence"
                                    {...renderProps('deactivateSequence')}
                                />
                            )}
                            <TextField
                                placeholder="10"
                                label="Task Count (Cluster Mode)"
                                {...renderProps('taskCount')}
                            />
                        </>
                    )}
                    {messageProcessorType === "Scheduled Message Forwarding Processor" && (
                        <>
                            <TextField
                                placeholder="304,305"
                                label="Non retry http status codes"
                                {...renderProps('statusCodes')}
                            />
                            <TextField
                                placeholder="Client Repository"
                                label="Axis2 Client Repository"
                                {...renderProps('clientRepository')}
                            />
                            <TextField
                                placeholder="Configuration"
                                label="Axis2 Configuration"
                                {...renderProps('axis2Config')}
                            />
                            <RadioButtonGroup
                                label="Endpoint Name"
                                options={[{content: "Workspace", value: "Workspace"}, {
                                    content: "Custom",
                                    value: "Custom"
                                }]}
                                {...renderProps('endpointType')}
                            />
                            {watch('endpointType') === "Workspace" && (
                                <Dropdown items={endpoints} {...renderProps('endpoint')} />
                            )}
                            {watch('endpointType') === "Custom" && (
                                <TextField
                                    placeholder="Endpoint"
                                    label="Custom Endpoint"
                                    {...renderProps('endpoint')}
                                />
                            )}
                            <RadioButtonGroup
                                label="Reply Sequence Name"
                                options={[{content: "Workspace", value: "Workspace"}, {
                                    content: "Custom",
                                    value: "Custom"
                                }]}
                                {...renderProps('replySequenceType')}
                            />
                            {watch('replySequenceType') === "Workspace" && (
                                <Dropdown items={sequences} {...renderProps('replySequence')} />
                            )}
                            {watch('replySequenceType') === "Custom" && (
                                <TextField
                                    placeholder="Sequence"
                                    label="Custom Sequence"
                                    {...renderProps('replySequence')}
                                />
                            )}
                            <Dropdown label="Fail Messages Store"
                                      items={messageStoreTypes} {...renderProps('failMessageStoreType')} />
                        </>
                    )}
                    {messageProcessorType === "Message Sampling Processor" && (
                        <>
                            <RadioButtonGroup
                                label="Sequence Name"
                                options={[{content: "Workspace", value: "Workspace"}, {
                                    content: "Custom",
                                    value: "Custom"
                                }]}
                                {...renderProps('sequenceType')}
                            />
                            {watch('sequenceType') === "Workspace" && (
                                <Dropdown items={sequences} {...renderProps('sequence')} />
                            )}
                            {watch('sequenceType') === "Custom" && (
                                <TextField
                                    placeholder="Sequence"
                                    label="Custom Sequence"
                                    {...renderProps('sequence')}
                                />
                            )}
                            <TextField
                                placeholder="10"
                                label="Sampling Interval (Millis)"
                                {...renderProps('samplingInterval')}
                            />
                            <TextField
                                placeholder="10"
                                label="Sampling Concurrency"
                                {...renderProps('samplingConcurrency')}
                            />
                        </>
                    )}
                    {messageProcessorType === "Custom Message Processor" ? (
                        <>
                            <TextField
                                placeholder="Provider Class"
                                label="Message Processor Provider Class FQN"
                                required
                                {...renderProps('providerClass')}
                            />
                        </>
                    ) : (
                        <RadioButtonGroup
                            label="Require Custom Properties"
                            options={[{content: "Yes", value: "Yes"}, {content: "No", value: "No"}]}
                            onChange={handleSetCustomProperties}
                            value={hasCustomProperties}
                        />
                    )}

                    {(hasCustomProperties === "Yes" || messageProcessorType === "Custom Message Processor") && (
                        <>
                            <span>Parameters</span>
                            <ParamManager
                                paramConfigs={params}
                                readonly={false}
                                onChange={handlePropertiesOnChange}/>
                        </>
                    )}
                    <FormActions>
                        <Button
                            appearance="primary"
                            onClick={handleSubmit(handleCreateMessageProcessor)}
                            disabled={!isDirty}
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
