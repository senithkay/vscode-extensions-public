/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, {useEffect, useState} from "react";
import * as path from 'path';
import { Button, TextField, Dropdown, CheckBox, RadioButtonGroup, FormView, FormActions } from "@wso2-enterprise/ui-toolkit";
import {useVisualizerContext} from "@wso2-enterprise/mi-rpc-client";
import {EVENT_TYPE, MACHINE_VIEW, CreateProxyServiceRequest} from "@wso2-enterprise/mi-core";


interface OptionProps {
    value: string;
}

export interface ProxyServiceWizardProps {
    path: string;
}

export function ProxyServiceWizard(props: ProxyServiceWizardProps) {

    const {rpcClient} = useVisualizerContext();
    const [proxyService, setProxyService] = useState<any>({
        proxyServiceName: "",
        proxyServiceType: "Custom Proxy",
        endpointType: "",
        endpoint: "",
        requestLogLevel: "None",
        responseLogLevel: "None",
        securityPolicy: "",
        requestXslt: "",
        responseXslt: "",
        wsdlUri: "",
        wsdlService: "",
        wsdlPort: null,

    })
    const [selectedTransports, setSelectedTransports] = useState(['http', 'https']);
    const [transformResponse, setTransformResponse] = useState([]);
    const [publishContract, setPublishContract] = useState([]);
    const [endpoints, setEndpoints] = useState([]);
    const [directoryPath, setDirectoryPath] = useState("");
    const [message, setMessage] = useState({
        isError: false,
        text: ""
    });
    const validNumericInput = /^\d*$/;

    const isValid: boolean = proxyService.proxyServiceName.length > 0 && selectedTransports.length > 0 &&
        (proxyService.proxyServiceType === 'WSDL Based Proxy' ? (proxyService.wsdlUri.length > 0 && proxyService.wsdlService.length > 0 && proxyService.wsdlPort != null && proxyService.wsdlPort > 0) :
            proxyService.proxyServiceType === 'Transformer Proxy' ? proxyService.requestXslt.length > 0 :
                transformResponse.includes("true") ? proxyService.responseXslt.length > 0 :
                    proxyService.proxyServiceType != 'Custom Proxy' ? proxyService.endpoint.length > 0 : proxyService.proxyServiceType.length > 0);

    useEffect(() => {

        (async () => {
            const projectDir = (await rpcClient.getMiDiagramRpcClient().getProjectRoot({path: props.path})).path;
            const proxyServicesDir = path.join(projectDir, 'src', 'main', 'wso2mi', 'artifacts', 'proxy-services');
            setDirectoryPath(proxyServicesDir);
            const items = await rpcClient.getMiDiagramRpcClient().getEndpointsAndSequences();
            const endpoints = items.data[0].map((seq: string) => {
                seq = seq.replace(".xml", "");
                return {value: seq}
            });
            setEndpoints(endpoints);
        })();

    }, []);

    useEffect(() => {
        const INVALID_CHARS_REGEX = /[@\\^+;:!%&,=*#[\]$?'"<>{}() /]/;
        const VALID_URI_REGEX = /^(https?:\/\/)?www\.[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;
        const VALID_WSDL_URI_REGEX = /\.wsdl$/i;

        if (!isValid) {
            handleMessage("Please fill all the mandatory fields", true);
        } else if (INVALID_CHARS_REGEX.test(proxyService.proxyServiceName)) {
            handleMessage("Invalid proxy service name", true);
        } else if (proxyService.proxyServiceType != 'Custom Proxy' && proxyService.proxyServiceType != 'WSDL Based Proxy' && proxyService.endpointType === 'Custom' && !VALID_URI_REGEX.test(proxyService.endpoint)) {
            handleMessage("Invalid endpoint URI", true);
        } else if (proxyService.proxyServiceType === 'WSDL Based Proxy' && (!VALID_WSDL_URI_REGEX.test(proxyService.wsdlUri) || !VALID_URI_REGEX.test(proxyService.wsdlUri))) {
            handleMessage("Invalid WSDL URI", true);
        } else {
            handleMessage("");
        }

    }, [proxyService.proxyServiceName, proxyService.proxyServiceType, proxyService.endpointType, proxyService.endpoint, proxyService.wsdlUri, isValid]);

    const transportTypes = [
        'http',
        'https',
        'jms',
        'vfs',
        'local',
        'mailto',
        'fix',
        'rabbitmq',
        'hl7'
    ];

    const logLevelOptions: OptionProps[] = [
        {value: "None"},
        {value: "Full"},
        {value: "Simple"}
    ];

    const handleProxyServiceTypeChange = (type: string) => {
        setProxyService((prev: any) => ({...prev, proxyServiceType: type}));
    };

    const handleTransportsChange = (value: string) => {
        if (selectedTransports.includes(value)) {
            setSelectedTransports(selectedTransports.filter(item => item !== value));
        } else {
            setSelectedTransports([...selectedTransports, value]);
        }
    };

    const handleRequestLogLevelChange = (value: string) => {
        setProxyService((prev: any) => ({...prev, requestLogLevel: value}));
    };

    const handleResponseLogLevelChange = (value: string) => {
        setProxyService((prev: any) => ({...prev, responseLogLevel: value}));
    };

    const handleEndpointChange = (value: string) => {
        setProxyService((prev: any) => ({...prev, endpoint: value}));
    };

    const handleEndpointTypeChange = (event: any) => {
        setProxyService((prev: any) => ({...prev, endpointType: event.target.value}));
    };

    const handleSecurityPolicyChange = (value: string) => {
        setProxyService((prev: any) => ({...prev, securityPolicy: value}));
    };

    const handleRequestXsltChange = (value: string) => {
        setProxyService((prev: any) => ({...prev, requestXslt: value}));
    };

    const handleResponseXsltChange = (value: string) => {
        setProxyService((prev: any) => ({...prev, responseXslt: value}));
    };

    const handleTransformResponseOptionChange = (value: string) => {
        if (transformResponse.includes(value)) {
            setTransformResponse(transformResponse.filter(item => item !== value));
        } else {
            setTransformResponse([...transformResponse, value]);
        }
    };

    const handlePublishContractOptionChange = (value: string) => {
        if (publishContract.includes(value)) {
            setPublishContract(publishContract.filter(item => item !== value));
        } else {
            setPublishContract([...publishContract, value]);
        }
    };

    const handleOnChange = (field: any, value: any) => {
        setProxyService((prev: any) => ({...prev, [field]: value}));
    }

    const handleMessage = (text: string, isError: boolean = false) => {
        setMessage({isError, text});
    }

    const handleCreateProxyService = async () => {

        const createProxyServiceParams: CreateProxyServiceRequest = {
            directory: directoryPath,
            selectedTransports: selectedTransports.join(' '),
            transformResponse: transformResponse.length > 0 ? transformResponse.join('') : null,
            publishContract: publishContract.length > 0 ? publishContract.join('') : null,
            ...proxyService
        }
        const file = await rpcClient.getMiDiagramRpcClient().createProxyService(createProxyServiceParams);

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
        <FormView title="Proxy Service" onClose={handleCancel}>
            <TextField
                placeholder="Name"
                label="Proxy Service Name"
                onTextChange={(value: string) => handleOnChange("proxyServiceName", value)}
                value={proxyService.proxyServiceName}
                id="proxy-name-input"
                autoFocus
                required
                validationMessage="Proxy service name is required"
                size={100}
            />
            <span>Select the transports:</span>
            {transportTypes.map(transportType => (
                <CheckBox
                    label={transportType}
                    value={transportType}
                    onChange={() => handleTransportsChange(transportType)}
                    checked={selectedTransports.includes(transportType)}
                />
            ))}
            {!(proxyService.proxyServiceType === "Custom Proxy" || proxyService.proxyServiceType === "WSDL Based Proxy") && (
                <>
                    <RadioButtonGroup
                        label="Target Endpoint"
                        id="target-endpoint"
                        options={[{content: "Workspace", value: "Workspace"}, {content: "Custom", value: "Custom"}]}
                        onChange={handleEndpointTypeChange}
                    />
                    {proxyService.endpointType === "Workspace" && (
                        <Dropdown items={endpoints} value={proxyService.endpoint} onValueChange={handleEndpointChange}
                                  id="endpoint"/>
                    )}
                    {proxyService.endpointType === "Custom" && (
                        <TextField
                            placeholder="Custom Endpoint"
                            label="Custom Endpoint"
                            onTextChange={(value: string) => handleOnChange("endpoint", value)}
                            value={proxyService.endpoint}
                            id="endpoint-custom"
                            size={100}
                        />
                    )}
                </>
            )}
            {proxyService.proxyServiceType === "Logging Proxy" && (
                <>
                    <Dropdown label="Request Log Level" items={logLevelOptions} value={proxyService.requestLogLevel}
                              onValueChange={handleRequestLogLevelChange} id="request-log-level"/>
                    <Dropdown label="Response Log Level" items={logLevelOptions} value={proxyService.responseLogLevel}
                              onValueChange={handleResponseLogLevelChange} id="response-log-level"/>
                </>
            )}
            {proxyService.proxyServiceType === "Transformer Proxy" && (
                <CheckBox
                    label="Transform Responses"
                    value="true"
                    onChange={() => handleTransformResponseOptionChange("true")}
                    checked={transformResponse.includes("true")}
                />
            )}
            {proxyService.proxyServiceType === "WSDL Based Proxy" && (
                <>
                    <TextField
                        placeholder="WSDL URI"
                        label="WSDL URI"
                        onTextChange={(value: string) => handleOnChange("wsdlUri", value)}
                        value={proxyService.wsdlUri}
                        id="wsdl-uri-input"
                        size={100}
                        required
                    />
                    <TextField
                        placeholder="WSDL Service"
                        label="WSDL Service"
                        onTextChange={(value: string) => handleOnChange("wsdlService", value)}
                        value={proxyService.wsdlService}
                        id="wsdl-service-input"
                        size={100}
                        required
                    />
                    <TextField
                        placeholder="WSDL Port"
                        label="WSDL Port"
                        onTextChange={(value) => {
                            if (validNumericInput.test(value)) {
                                handleOnChange("wsdlPort", Number(value))
                            } else {
                                handleOnChange("wsdlPort", null)
                            }
                        }}
                        value={proxyService.wsdlPort}
                        id="wsdl-port-input"
                        size={50}
                        required
                    />
                    <CheckBox
                        label="Publish Same Service Contract"
                        value="true"
                        onChange={() => handlePublishContractOptionChange("true")}
                        checked={transformResponse.includes("true")}
                    />
                </>
            )}
            {message && <span style={{color: message.isError ? "#f48771" : ""}}>{message.text}</span>}
            <FormActions>
                <Button
                    appearance="secondary"
                    onClick={handleCancel}
                >
                    Cancel
                </Button>
                <Button
                    appearance="primary"
                    onClick={handleCreateProxyService}
                    disabled={!isValid}
                >
                    Create
                </Button>
            </FormActions>
        </FormView>
    );
}
