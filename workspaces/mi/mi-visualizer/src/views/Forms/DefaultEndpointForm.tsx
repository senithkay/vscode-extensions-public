/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, {useEffect, useState} from "react";
import {Button, TextField, Dropdown, RadioButtonGroup, FormView, FormGroup, FormActions, ParamConfig, ParamManager} from "@wso2-enterprise/ui-toolkit";
import {useVisualizerContext} from "@wso2-enterprise/mi-rpc-client";
import {EVENT_TYPE, MACHINE_VIEW, UpdateDefaultEndpointRequest} from "@wso2-enterprise/mi-core";
import {TypeChip} from "./Commons";
import {useForm} from "react-hook-form";
import * as yup from "yup";
import {yupResolver} from "@hookform/resolvers/yup"

interface OptionProps {
    value: string;
}

export interface DefaultEndpointWizardProps {
    path: string;
    type: string;
}

type InputsFields = {
    endpointName?: string;
    format?: string;
    traceEnabled?: string;
    statisticsEnabled?: string;
    optimize?: string;
    description?: string;
    requireProperties?: boolean;
    addressingEnabled?: string;
    addressingVersion?: string;
    addressListener?: string;
    securityEnabled?: string;
    suspendErrorCodes?: string;
    initialDuration?: number;
    maximumDuration?: number;
    progressionFactor?: number;
    retryErrorCodes?: string;
    retryCount?: number;
    retryDelay?: number;
    timeoutDuration?: number;
    timeoutAction?: string;
    templateName?: string;
    requireTemplateParameters?: boolean;
};

const newDefaultEndpoint: InputsFields = {
    endpointName: "",
    format: "LEAVE_AS_IS",
    traceEnabled: "disable",
    statisticsEnabled: "disable",
    optimize: "LEAVE_AS_IS",
    description: "",
    requireProperties: false,
    addressingEnabled: "disable",
    addressingVersion: "",
    addressListener: "disable",
    securityEnabled: "disable",
    suspendErrorCodes: "",
    initialDuration: -1,
    maximumDuration: Number.MAX_SAFE_INTEGER,
    progressionFactor: 1.0,
    retryErrorCodes: "",
    retryCount: 0,
    retryDelay: 0,
    timeoutDuration: Number.MAX_SAFE_INTEGER,
    timeoutAction: "",
    templateName: "",
    requireTemplateParameters: false
}

export function DefaultEndpointWizard(props: DefaultEndpointWizardProps) {

    const schema = yup.object({
        endpointName: yup.string().required("Endpoint Name is required").matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in Endpoint Name"),
        format: yup.string().notRequired().default("LEAVE_AS_IS"),
        traceEnabled: yup.string().notRequired().default("disable"),
        statisticsEnabled: yup.string().notRequired().default("disable"),
        optimize: yup.string().notRequired().default("LEAVE_AS_IS"),
        description: yup.string().notRequired().default(""),
        requireProperties: yup.boolean().notRequired().default(false),
        addressingEnabled: yup.string().notRequired().default("disable"),
        addressingVersion: yup.string().notRequired().default(""),
        addressListener: yup.string().notRequired().default("disable"),
        securityEnabled: yup.string().notRequired().default("disable"),
        suspendErrorCodes: yup.string().notRequired().default(""),
        initialDuration: yup.number().typeError('Initial Duration must be a number').min(-1, "Initial Duration must be greater than -1").notRequired().default(-1),
        maximumDuration: yup.number().typeError('Maximum Duration must be a number').min(1, "Maximum Duration must be greater than 0").notRequired().default(Number.MAX_SAFE_INTEGER),
        progressionFactor: yup.number().typeError('Progression Factor must be a number').min(1, "Progression Factor must be greater than 0").notRequired().default(1.0),
        retryErrorCodes: yup.string().notRequired().default(""),
        retryCount: yup.number().typeError('Retry Count must be a number').min(0, "Retry Count must be greater than or equal to 0").notRequired().default(0),
        retryDelay: yup.number().typeError('Retry Delay must be a number').min(0, "Retry Delay Interval must be greater than or equal to 0").notRequired().default(0),
        timeoutDuration: yup.number().typeError('Timeout Duration must be a number').min(1, "Timeout Duration must be greater than 0").notRequired().default(Number.MAX_SAFE_INTEGER),
        timeoutAction: yup.string().notRequired().default(""),
        templateName: props.type === 'template' ? yup.string().required("Template Name is required").matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in Template Name") : yup.string().notRequired().default(""),
        requireTemplateParameters: yup.boolean().notRequired().default(false)
    });

    const {
        reset,
        register,
        formState: {errors, isDirty},
        handleSubmit,
        setValue,
        watch,
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange"
    });

    const {rpcClient} = useVisualizerContext();
    const isNewEndpoint = !props.path.endsWith(".xml")
    const isTemplate = props.type === 'template';

    const paramTemplateConfigs: ParamConfig = {
        paramValues: [],
        paramFields: [
            {
                id: 0,
                type: "TextField",
                label: "Parameter",
                defaultValue: "parameter_value",
                isRequired: true
            }]
    }
    const [templateParams, setTemplateParams] = useState(paramTemplateConfigs);

    const propertiesConfigs: ParamConfig = {
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
            },
            {
                id: 2,
                type: "Dropdown",
                label: "Scope",
                values: ["default", "transport", "axis2", "axis2-client"],
                defaultValue: "default",
                isRequired: true
            }]
    }
    const [additionalParams, setAdditionalParams] = useState(propertiesConfigs);

    useEffect(() => {

        if (!isNewEndpoint) {
            (async () => {
                const existingEndpoint = await rpcClient.getMiDiagramRpcClient().getDefaultEndpoint({path: props.path});
                templateParams.paramValues = [];
                setTemplateParams(templateParams);
                let i = 1;
                existingEndpoint.templateParameters.map((param: any) => {
                    setTemplateParams((prev: any) => {
                        return {
                            ...prev,
                            paramValues: [...prev.paramValues, {
                                id: prev.paramValues.length,
                                parameters: [{
                                    id: 0,
                                    value: param,
                                    label: "Parameter",
                                    type: "TextField",
                                }],
                                key: i++,
                                value: param,
                            }
                            ]
                        }
                    });
                });
                additionalParams.paramValues = [];
                setAdditionalParams(additionalParams);
                existingEndpoint.properties.map((param: any) => {
                    setAdditionalParams((prev: any) => {
                        return {
                            ...prev,
                            paramValues: [...prev.paramValues, {
                                id: prev.paramValues.length,
                                parameters: [{
                                    id: 0,
                                    value: param.name,
                                    label: "Name",
                                    type: "TextField",
                                },
                                    {
                                        id: 1,
                                        value: param.value,
                                        label: "Value",
                                        type: "TextField",
                                    },
                                    {
                                        id: 2,
                                        value: param.scope,
                                        label: "Scope",
                                        type: "Dropdown",
                                        values: ["default", "transport", "axis2", "axis2-client"]
                                    }],
                                key: param.name,
                                value: "value:" + param.value + "; scope:" + param.scope + ";",
                            }
                            ]
                        }
                    });
                });
                reset(existingEndpoint);
                setValue('timeoutAction', existingEndpoint.timeoutAction === '' ? 'Never' :
                    existingEndpoint.timeoutAction.charAt(0).toUpperCase() + existingEndpoint.timeoutAction.slice(1));
            })();
        } else {
            reset(newDefaultEndpoint);
        }
    }, [props.path]);

    const addressingVersions: OptionProps[] = [
        {value: "final"},
        {value: "submission"},
    ];

    const timeoutOptions: OptionProps[] = [
        {value: "Never"},
        {value: "Discard"},
        {value: "Fault"}
    ];

    const formatOptions: OptionProps[] = [
        {value: "LEAVE_AS_IS"},
        {value: "SOAP 1.1"},
        {value: "SOAP 1.2"},
        {value: "POX"},
        {value: "GET"},
        {value: "REST"}
    ];

    const optimizeOptions: OptionProps[] = [
        {value: "LEAVE_AS_IS"},
        {value: "MTOM"},
        {value: "SWA"}
    ];

    const handleTemplateParametersChange = (params: any) => {
        let i = 1;
        const modifiedParams = {
            ...params, paramValues: params.paramValues.map((param: any) => {
                return {
                    ...param,
                    key: i++,
                    value: param.parameters[0].value
                }
            })
        };
        setTemplateParams(modifiedParams);
    };

    const handleAdditionalPropertiesChange = (params: any) => {
        const modifiedParams = {
            ...params, paramValues: params.paramValues.map((param: any) => {
                return {
                    ...param,
                    key: param.parameters[0].value,
                    value: generateDisplayValue(param)
                }
            })
        };
        setAdditionalParams(modifiedParams);
    };

    const generateDisplayValue = (paramValues: any) => {
        const result: string = "value:" + paramValues.parameters[1].value + "; scope:" + paramValues.parameters[2].value + ";";
        return result.trim();
    };

    const handleUpdateDefaultEndpoint = async (values: any) => {

        let templateParameters: any = [];
        templateParams.paramValues.map((param: any) => {
            templateParameters.push(param.parameters[0].value);
        })

        let endpointProperties: any = [];
        additionalParams.paramValues.map((param: any) => {
            endpointProperties.push({
                name: param.parameters[0].value,
                value: param.parameters[1].value,
                scope: param.parameters[2].value
            });
        })

        const updateDefaultEndpointParams: UpdateDefaultEndpointRequest = {
            ...values,
            templateParameters: templateParameters,
            properties: endpointProperties,
            directory: props.path
        }
        await rpcClient.getMiDiagramRpcClient().updateDefaultEndpoint(updateDefaultEndpointParams);

        rpcClient.getMiVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {view: MACHINE_VIEW.Overview}
        });
    };

    const renderProps = (fieldName: keyof InputsFields) => {
        return {
            id: fieldName,
            value: String(watch(fieldName)),
            errorMsg: errors[fieldName] && errors[fieldName].message.toString(),
            ...register(fieldName)
        }
    };

    const changeType = () => {
        rpcClient.getMiVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: isTemplate ? MACHINE_VIEW.TemplateForm : MACHINE_VIEW.EndPointForm,
                documentUri: props.path,
                customProps: {type: isTemplate ? 'template' : 'endpoint'}
            }
        });
    }

    const handleCancel = () => {
        rpcClient.getMiVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {view: MACHINE_VIEW.Overview}
        });
    };

    return (
        <FormView title={isTemplate ? 'Template Artifact' : 'Endpoint Artifact'} onClose={handleCancel}>
            <TypeChip
                type={isTemplate ? "Default Endpoint Template" : "Default Endpoint"}
                onClick={changeType}
                showButton={isNewEndpoint}
            />
            {isTemplate && (
                <>
                    <FormGroup title="Template Properties" isCollapsed={false}>
                        <TextField
                            placeholder="Template Name"
                            label="Template Name"
                            autoFocus
                            required
                            {...renderProps('templateName')}
                        />
                        <RadioButtonGroup
                            label="Require Template Parameters"
                            options={[{content: "Yes", value: true}, {content: "No", value: false}]}
                            {...register('requireTemplateParameters')}
                        />
                        {watch('requireTemplateParameters') && (
                            <ParamManager
                                paramConfigs={templateParams}
                                readonly={false}
                                onChange={handleTemplateParametersChange}/>
                        )}
                    </FormGroup>
                </>
            )}
            <FormGroup title="Basic Properties" isCollapsed={false}>
                <TextField
                    placeholder="Endpoint Name"
                    label="Endpoint Name"
                    autoFocus
                    required
                    {...renderProps('endpointName')}
                />
                <Dropdown label="Format" items={formatOptions} {...renderProps('format')} />
                <RadioButtonGroup
                    label="Trace Enabled"
                    options={[{content: "Enable", value: "enable"}, {content: "Disable", value: "disable"}]}
                    {...renderProps('traceEnabled')}
                />
                <RadioButtonGroup
                    label="Statistics Enabled"
                    options={[{content: "Enable", value: "enable"}, {content: "Disable", value: "disable"}]}
                    {...renderProps('statisticsEnabled')}
                />
            </FormGroup>
            <FormGroup title="Miscellaneous Properties" isCollapsed={false}>
                <Dropdown label="Optimize" items={optimizeOptions} {...renderProps('optimize')} />
                <TextField
                    placeholder="Description"
                    label="Description"
                    {...renderProps('description')}
                />
                <RadioButtonGroup
                    label="Require Additional Properties"
                    options={[{content: "Yes", value: true}, {content: "No", value: false}]}
                    {...register('requireProperties')}
                />
                {watch('requireProperties') && (
                    <ParamManager
                        paramConfigs={additionalParams}
                        readonly={false}
                        onChange={handleAdditionalPropertiesChange}/>
                )}
            </FormGroup>
            <FormGroup title="Quality of Service Properties" isCollapsed={false}>
                <RadioButtonGroup
                    label="Addressing"
                    options={[{content: "Enable", value: "enable"}, {content: "Disable", value: "disable"}]}
                    {...renderProps('addressingEnabled')}
                />
                {watch('addressingEnabled') === 'enable' && (
                    <>
                        <Dropdown label="Addressing Version"
                                  items={addressingVersions} {...renderProps('addressingVersion')} />
                        <RadioButtonGroup
                            label="Addressing Separate Listener"
                            options={[{content: "Enable", value: "enable"}, {content: "Disable", value: "disable"}]}
                            {...renderProps('addressListener')}
                        />
                    </>
                )}
                <RadioButtonGroup
                    label="Security"
                    options={[{content: "Enable", value: "enable"}, {content: "Disable", value: "disable"}]}
                    {...renderProps('securityEnabled')}
                />
            </FormGroup>
            <FormGroup title="Endpoint Error Handling" isCollapsed={false}>
                <TextField
                    placeholder="304,305"
                    label="Suspend Error Codes"
                    {...renderProps('suspendErrorCodes')}
                />
                <TextField
                    placeholder="-1"
                    label="Suspend Initial Duration"
                    {...renderProps('initialDuration')}
                />
                <TextField
                    placeholder="1000"
                    label="Suspend Maximum Duration"
                    {...renderProps('maximumDuration')}
                />
                <TextField
                    placeholder="1"
                    label="Suspend Progression Factor"
                    {...renderProps('progressionFactor')}
                />
                <TextField
                    placeholder="304,305"
                    label="Retry Error Codes"
                    {...renderProps('retryErrorCodes')}
                />
                <TextField
                    placeholder="10"
                    label="Retry Count"
                    {...renderProps('retryCount')}
                />
                <TextField
                    placeholder="1000"
                    label="Retry Delay"
                    {...renderProps('retryDelay')}
                />
                <TextField
                    placeholder="1000"
                    label="Timeout Duration"
                    {...renderProps('timeoutDuration')}
                />
                <Dropdown label="Timeout Action" items={timeoutOptions} {...renderProps('timeoutAction')} />
            </FormGroup>
            <FormActions>
                <Button
                    appearance="primary"
                    onClick={handleSubmit(handleUpdateDefaultEndpoint)}
                    disabled={!isDirty}
                >
                    {isNewEndpoint ? "Create" : "Save Changes"}
                </Button>
                <Button
                    appearance="secondary"
                    onClick={handleCancel}
                >
                    Cancel
                </Button>
            </FormActions>
        </FormView>
    );
}
