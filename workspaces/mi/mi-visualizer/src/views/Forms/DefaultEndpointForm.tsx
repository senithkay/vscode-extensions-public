/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, {useEffect, useState} from "react";
import { Button, TextField, Dropdown, RadioButtonGroup, FormView, FormGroup, FormActions, ParamConfig, ParamManager } from "@wso2-enterprise/ui-toolkit";
import {useVisualizerContext} from "@wso2-enterprise/mi-rpc-client";
import {EVENT_TYPE, MACHINE_VIEW, UpdateDefaultEndpointRequest} from "@wso2-enterprise/mi-core";
import CardWrapper from "./Commons/CardWrapper";
import {TypeChangeButton} from "./Commons";

interface OptionProps {
    value: string;
}

export interface DefaultEndpointWizardProps {
    path: string;
    type: string;
}

export function DefaultEndpointWizard(props: DefaultEndpointWizardProps) {

    const {rpcClient} = useVisualizerContext();
    const [endpoint, setEndpoint] = useState<any>({
        endpointName: "",
        format: "LEAVE_AS_IS",
        traceEnabled: "",
        statisticsEnabled: "",
        optimize: "LEAVE_AS_IS",
        description: "",
        requireProperties: false,
        properties: [],
        addressingEnabled: "",
        addressingVersion: "",
        addressListener: "",
        securityEnabled: "",
        suspendErrorCodes: "",
        initialDuration: "",
        maximumDuration: "",
        progressionFactor: "",
        retryErrorCodes: "",
        retryCount: "",
        retryDelay: "",
        timeoutDuration: "",
        timeoutAction: "",
        templateName: "",
        requireTemplateParameters: false,
        templateParameters: []

    })
    const [showCards, setShowCards] = useState(false);
    const [isNewEndpoint, setIsNewEndpoint] = useState(!props.path.endsWith(".xml"));
    const [isTemplate, setIsTemplate] = useState(false);
    const [directoryPath, setDirectoryPath] = useState("");
    const [message, setMessage] = useState({
        isError: false,
        text: ""
    });
    const validNumericInput = /^\d*$/;

    const isValid: boolean = endpoint.endpointName.length > 0 || endpoint.templateName.length > 0;

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

        if (props.type === 'template') {
            setIsTemplate(true);
        }

        if (!isNewEndpoint) {
            (async () => {
                setDirectoryPath(props.path);
                const syntaxTree = await rpcClient.getMiDiagramRpcClient().getSyntaxTree({documentUri: props.path});
                if (syntaxTree.syntaxTree.template != undefined) {
                    setIsTemplate(true);
                }
                const existingEndpoint = await rpcClient.getMiDiagramRpcClient().getDefaultEndpoint({path: props.path});
                setEndpoint(existingEndpoint);
                handleTimeoutActionChange(existingEndpoint.timeoutAction === '' ? 'Never' :
                    existingEndpoint.timeoutAction.charAt(0).toUpperCase() + existingEndpoint.timeoutAction.slice(1));
                handleFormatChange(existingEndpoint.format);
                handleOptimizeChange(existingEndpoint.optimize);
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
            })();
        }
    }, [props.path]);

    useEffect(() => {
        const INVALID_CHARS_REGEX = /[@\\^+;:!%&,=*#[\]$?'"<>{}() /]/;

        if (!isValid) {
            handleMessage("Please fill all the mandatory fields", true);
        } else if (INVALID_CHARS_REGEX.test(endpoint.endpointName)) {
            handleMessage("Invalid endpoint name", true);
        } else {
            handleMessage("");
        }

    }, [endpoint.endpointName, isValid]);

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

    const setEndpointType = (type: string) => {
        if (type.includes('Sequence')) {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.TemplateForm,
                    documentUri: props.path,
                    customProps: {type: 'sequence'}
                }
            });
        } else if (type.includes('HTTP')) {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.HttpEndpointForm,
                    documentUri: props.path,
                    customProps: {type: isTemplate ? 'template' : 'endpoint'}
                }
            });
        } else if (type.includes('WSDL Endpoint')) {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.WsdlEndpointForm,
                    documentUri: props.path,
                    customProps: {type: isTemplate ? 'template' : 'endpoint'}
                }
            });
        } else if (type.includes('Address')) {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.AddressEndpointForm,
                    documentUri: props.path,
                    customProps: {type: isTemplate ? 'template' : 'endpoint'}
                }
            });
        } else if (type.includes('Default')) {
            setShowCards(false);
        } else if (type.includes('Failover')) {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.FailoverEndPointForm,
                    documentUri: props.path
                }
            });
        } else if (type.includes('Load Balance')) {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.LoadBalanceEndPointForm,
                    documentUri: props.path
                }
            });
        } else if (type.includes('Recipient List')) {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.RecipientEndPointForm,
                    documentUri: props.path,
                }
            });
        } else if (type.includes('Template')) {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.TemplateEndPointForm,
                    documentUri: props.path
                }
            });
        } else {
            setShowCards(true);
        }
    };

    const handleTraceEnabledChange = (event: any) => {
        setEndpoint((prev: any) => ({...prev, traceEnabled: event.target.value}));
    };

    const handleStatsEnabledChange = (event: any) => {
        setEndpoint((prev: any) => ({...prev, statisticsEnabled: event.target.value}));
    };

    const handleFormatChange = (value: string) => {
        setEndpoint((prev: any) => ({...prev, format: value}));
    };

    const handleOptimizeChange = (value: string) => {
        setEndpoint((prev: any) => ({...prev, optimize: value}));
    };

    const handleAddressingEnabledChange = (event: any) => {
        setEndpoint((prev: any) => ({...prev, addressingEnabled: event.target.value}));
    };

    const handleAddressingVersionChange = (value: string) => {
        setEndpoint((prev: any) => ({...prev, addressingVersion: value}));
    };

    const handleAddressListenerChange = (event: any) => {
        setEndpoint((prev: any) => ({...prev, addressListener: event.target.value}));
    };

    const handleSecurityEnabledChange = (event: any) => {
        setEndpoint((prev: any) => ({...prev, securityEnabled: event.target.value}));
    };

    const handleTimeoutActionChange = (value: string) => {
        setEndpoint((prev: any) => ({...prev, timeoutAction: value}));
    };

    const handlePropertiesChange = (event: any) => {
        if (!event.target.value) {
            propertiesConfigs.paramValues = [];
            setAdditionalParams(propertiesConfigs);
        }
        setEndpoint((prev: any) => ({...prev, requireProperties: event.target.value}));
    };

    const handleParametersChange = (event: any) => {
        if (!event.target.value) {
            paramTemplateConfigs.paramValues = [];
            setAdditionalParams(paramTemplateConfigs);
        }
        setEndpoint((prev: any) => ({...prev, requireTemplateParameters: event.target.value}));
    };

    const handleOnChange = (field: any, value: any) => {
        setEndpoint((prev: any) => ({...prev, [field]: value}));
    }

    const handleMessage = (text: string, isError: boolean = false) => {
        setMessage({isError, text});
    }

    const handleUpdateDefaultEndpoint = async () => {

        let templateParameters: any = [];
        templateParams.paramValues.map((param: any) => {
            templateParameters.push(param.parameters[0].value);
        })
        endpoint.templateParameters = templateParameters;

        let endpointProperties: any = [];
        additionalParams.paramValues.map((param: any) => {
            endpointProperties.push({
                name: param.parameters[0].value,
                value: param.parameters[1].value,
                scope: param.parameters[2].value
            });
        })
        endpoint.properties = endpointProperties;

        const updateDefaultEndpointParams: UpdateDefaultEndpointRequest = {
            directory: directoryPath,
            ...endpoint
        }
        await rpcClient.getMiDiagramRpcClient().updateDefaultEndpoint(updateDefaultEndpointParams);

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

    return (
        <FormView title={(showCards && isTemplate) ? 'Template Artifact' : (showCards && !isTemplate) ? 'Endpoint Artifact' : isTemplate ? "Template Artifact" : "Endpoint Artifact"} onClose={handleCancel}>
            { showCards ? <CardWrapper cardsType={props.type === 'template' ? 'TEMPLATE' : 'ENDPOINT'} setType={setEndpointType} /> : <>
            { isNewEndpoint && <TypeChangeButton type={isTemplate ? "Default Endpoint Template" : "Default Endpoint"} onClick={setEndpointType} /> }
            {isTemplate && (
                <>
                    <FormGroup title="Template Properties" isCollapsed={false}>
                        <TextField
                            placeholder="Template Name"
                            label="Template Name"
                            onTextChange={(value: string) => handleOnChange("templateName", value)}
                            value={endpoint.templateName}
                            id="template-name-input"
                            autoFocus
                            required
                            validationMessage="Template name is required"
                            size={100}
                        />
                        <RadioButtonGroup
                            label="Require Template Parameters"
                            id="template-parameters"
                            options={[{content: "Yes", value: true}, {content: "No", value: false}]}
                            onChange={handleParametersChange}
                            value={endpoint.requireTemplateParameters}
                        />
                        {endpoint.requireTemplateParameters && (
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
                    onTextChange={(value: string) => handleOnChange("endpointName", value)}
                    value={endpoint.endpointName}
                    id="endpoint-name-input"
                    autoFocus
                    required
                    validationMessage="Endpoint name is required"
                    size={100}
                />
                <Dropdown label="Format" items={formatOptions} value={endpoint.format} onValueChange={handleFormatChange} id="format"/>
                <RadioButtonGroup
                    label="Trace Enabled"
                    id="trace-enabled"
                    options={[{content: "Enable", value: "enable"}, {content: "Disable", value: "disable"}]}
                    onChange={handleTraceEnabledChange}
                    value={endpoint.traceEnabled}
                />
                <RadioButtonGroup
                    label="Statistics Enabled"
                    id="statistics-enabled"
                    options={[{content: "Enable", value: "enable"}, {content: "Disable", value: "disable"}]}
                    onChange={handleStatsEnabledChange}
                    value={endpoint.statisticsEnabled}
                />
            </FormGroup>
            <FormGroup title="Miscellaneous Properties" isCollapsed={false}>
                <Dropdown label="Optimize" items={optimizeOptions} value={endpoint.optimize} onValueChange={handleOptimizeChange}
                          id="optimize"/>
                <TextField
                    placeholder="Description"
                    label="Description"
                    onTextChange={(value: string) => handleOnChange("description", value)}
                    value={endpoint.description}
                    id="description"
                    size={100}
                />
                <RadioButtonGroup
                    label="Require Additional Properties"
                    id="additional-properties"
                    options={[{content: "Yes", value: true}, {content: "No", value: false}]}
                    onChange={handlePropertiesChange}
                    value={endpoint.requireProperties}
                />
                {endpoint.requireProperties && (
                    <ParamManager
                        paramConfigs={additionalParams}
                        readonly={false}
                        onChange={handleAdditionalPropertiesChange}/>
                )}
            </FormGroup>
            <FormGroup title="Quality of Service Properties" isCollapsed={false}>
                <RadioButtonGroup
                    label="Addressing"
                    id="addressing-enabled"
                    options={[{content: "Enable", value: "enable"}, {content: "Disable", value: "disable"}]}
                    onChange={handleAddressingEnabledChange}
                    value={endpoint.addressingEnabled}
                />
                {endpoint.addressingEnabled === 'enable' && (
                    <>
                        <Dropdown label="Addressing Version" items={addressingVersions} value={endpoint.addressingVersion}
                                  onValueChange={handleAddressingVersionChange} id="addressing-version"/>
                        <RadioButtonGroup
                            label="Addressing Separate Listener"
                            id="address-separate"
                            options={[{content: "Enable", value: "enable"}, {content: "Disable", value: "disable"}]}
                            onChange={handleAddressListenerChange}
                            value={endpoint.addressListener}
                        />
                    </>
                )}
                <RadioButtonGroup
                    label="Security"
                    id="security-enabled"
                    options={[{content: "Enable", value: "enable"}, {content: "Disable", value: "disable"}]}
                    onChange={handleSecurityEnabledChange}
                    value={endpoint.securityEnabled}
                />
            </FormGroup>
            <FormGroup title="Endpoint Error Handling" isCollapsed={false}>
                <TextField
                    placeholder="304,305"
                    label="Suspend Error Codes"
                    onTextChange={(value: string) => handleOnChange("suspendErrorCodes", value)}
                    value={endpoint.suspendErrorCodes}
                    id="suspend-error-codes"
                    size={100}
                />
                <TextField
                    placeholder="-1"
                    label="Suspend Initial Duration"
                    onTextChange={(value) => {
                        if (validNumericInput.test(value)) {
                            handleOnChange("initialDuration", Number(value))
                        } else {
                            handleOnChange("initialDuration", null)
                        }
                    }}
                    value={endpoint.initialDuration}
                    id="initial-duration"
                    size={100}
                />
                <TextField
                    placeholder="1000"
                    label="Suspend Maximum Duration"
                    onTextChange={(value) => {
                        if (validNumericInput.test(value)) {
                            handleOnChange("maximumDuration", Number(value))
                        } else {
                            handleOnChange("maximumDuration", null)
                        }
                    }}
                    value={endpoint.maximumDuration}
                    id="maximum-duration"
                    size={100}
                />
                <TextField
                    placeholder="1"
                    label="Suspend Progression Factor"
                    onTextChange={(value) => {
                        if (validNumericInput.test(value)) {
                            handleOnChange("progressionFactor", Number(value))
                        } else {
                            handleOnChange("progressionFactor", null)
                        }
                    }}
                    value={endpoint.progressionFactor}
                    id="progression-factor"
                    size={100}
                />
                <TextField
                    placeholder="304,305"
                    label="Retry Error Codes"
                    onTextChange={(value: string) => handleOnChange("retryErrorCodes", value)}
                    value={endpoint.retryErrorCodes}
                    id="retry-error-codes"
                    size={100}
                />
                <TextField
                    placeholder="10"
                    label="Retry Count"
                    onTextChange={(value) => {
                        if (validNumericInput.test(value)) {
                            handleOnChange("retryCount", Number(value))
                        } else {
                            handleOnChange("retryCount", null)
                        }
                    }}
                    value={endpoint.retryCount}
                    id="retry-count"
                    size={100}
                />
                <TextField
                    placeholder="1000"
                    label="Retry Delay"
                    onTextChange={(value) => {
                        if (validNumericInput.test(value)) {
                            handleOnChange("retryDelay", Number(value))
                        } else {
                            handleOnChange("retryDelay", null)
                        }
                    }}
                    value={endpoint.retryDelay}
                    id="retry-delay"
                    size={100}
                />
                <TextField
                    placeholder="1000"
                    label="Timeout Duration"
                    onTextChange={(value) => {
                        if (validNumericInput.test(value)) {
                            handleOnChange("timeoutDuration", Number(value))
                        } else {
                            handleOnChange("timeoutDuration", null)
                        }
                    }}
                    value={endpoint.timeoutDuration}
                    id="timeout-duration"
                    size={100}
                />
                <Dropdown label="Timeout Action" items={timeoutOptions} value={endpoint.timeoutAction}
                          onValueChange={handleTimeoutActionChange} id="timeout-action"/>
            </FormGroup>
            {message && <span style={{color: message.isError ? "#f48771" : ""}}>{message.text}</span>}
            <FormActions>
                <Button
                    appearance="primary"
                    onClick={handleUpdateDefaultEndpoint}
                    disabled={!isValid}
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
            </>}
        </FormView>
    );
}
