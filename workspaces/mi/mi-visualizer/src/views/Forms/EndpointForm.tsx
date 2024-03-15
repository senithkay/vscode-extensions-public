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
import { AutoComplete, Button, Codicon, Dropdown, TextField, Typography } from "@wso2-enterprise/ui-toolkit";
import { FieldGroup, SectionWrapper } from "./Commons";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { CreateEndpointRequest, EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";

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

const RadioBtnContainer = styled.div`
    display  : flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 10px;
    padding-bottom: 5px;
`;

const TitleWrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
`;

export interface Region {
    label: string;
    value: string;
}

const Container = styled.div`
    display: flex;
    flex-direction: row;
    height: 50px;
    align-items: center;
    justify-content: flex-start;
`;

export interface EndpointWizardProps {
    path: string;
}

export function EndpointWizard(props: EndpointWizardProps) {

    const { rpcClient } = useVisualizerContext();
    const [endpointName, setEndpointName] = useState("");
    const [endpointType, setEndpointType] = useState("Address Endpoint");
    const [endpointConfiguration, setEndpointConfiguration] = useState("Static Endpoint (Save in an ESB Project)");
    const [address, setAddress] = useState("");
    const [URITemplate, setURITemplate] = useState("");
    const [method, setMethod] = useState("GET");
    const [wsdlUri, setWsdlUri] = useState("");
    const [wsdlService, setWsdlService] = useState("");
    const [wsdlPort, setWsdlPort] = useState("");
    const [targetTemplate, setTargetTemplate] = useState("");
    const [uri, setUri] = useState("");
    const isNewTask = !props.path.endsWith(".xml");
    const [templates, setTemplates] = useState();

    useEffect(() => {

        (async () => {
            if (!isNewTask) {
                const syntaxTree = await rpcClient.getMiDiagramRpcClient().getSyntaxTree({ documentUri: props.path});
                if (syntaxTree.syntaxTree.endpoint.type === 'HTTP_ENDPOINT') {
                    rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.HttpEndpointForm, documentUri: props.path} });
                } else if (syntaxTree.syntaxTree.endpoint.type === 'ADDRESS_ENDPOINT') {
                    rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.AddressEndpointForm, documentUri: props.path} });
                } else if (syntaxTree.syntaxTree.endpoint.type === 'WSDL_ENDPOINT') {
                    rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.WsdlEndpointForm, documentUri: props.path} });
                } else if (syntaxTree.syntaxTree.endpoint.type === 'DEFAULT_ENDPOINT') {
                    rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.DefaultEndpointForm, documentUri: props.path} });
                } else if (syntaxTree.syntaxTree.endpoint.type === 'LOAD_BALANCE_ENDPOINT') {
                    rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.LoadBalanceEndPointForm, documentUri: props.path} });
                } else if (syntaxTree.syntaxTree.endpoint.type === 'FAIL_OVER_ENDPOINT') {
                    rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.FailoverEndPointForm, documentUri: props.path} });
                }
            }
            const items = await rpcClient.getMiDiagramRpcClient().getTemplates();
            const templates = items.data.map((temp: string) => {
                temp = temp.replace(".xml", "");
                return { value: temp }
            });
            setTemplates(templates);
        })();

    }, []);

    const endpointTypes = [
        // Add remaining two types
        'Address Endpoint',
        'Default Endpoint',
        'Fail Over Endpoint',
        'HTTP Endpoint',
        'Load Balance Endpoint',
        'Recipient List Endpoint',
        'Template Endpoint',
        'WSDL Endpoint'
    ];

    const methodsTypes = [
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'OPTIONS',
        'PATCH',
        'Leave_as_is'
    ];

    const endpointConfigurations = [
        // Support dynamic endpoints
        'Static Endpoint (Save in an ESB Project)',
        'Dynamic Endpoint (Save in a Registry Resources Project)'
    ];

    const handleEndpointTypeChange = (type: string) => {
        setEndpointType(type);
    };

    const handleTemplateChange = (type: string) => {
        setTargetTemplate(type);
    };

    const handleEndpointConfigurationChange = (event: any) => {
        setEndpointConfiguration(event.target.value);
    };

    const handleMethodChange = (type: string) => {
        setMethod(type);
    };

    const handleCreateEndpoint = async () => {
        const projectDir = (await rpcClient.getMiDiagramRpcClient().getProjectRoot({path: props.path})).path;
        const endpointDir = `${projectDir}/src/main/wso2mi/artifacts/endpoints`;
        const createEndpointParams: CreateEndpointRequest = {
            directory: endpointDir,
            name: endpointName,
            type: endpointType,
            configuration: endpointConfiguration,
            address: address,
            uriTemplate: URITemplate,
            method: method,
            wsdlUri: wsdlUri,
            wsdlService: wsdlService,
            wsdlPort: wsdlPort,
            targetTemplate: targetTemplate,
            uri: uri
        }
        const file = await rpcClient.getMiDiagramRpcClient().createEndpoint(createEndpointParams);

        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
        rpcClient.getMiDiagramRpcClient().openFile(file);
    };

    const handleCancel = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const validateEndpointName = (name: string) => {
        // Check if the name is empty
        if (!name.trim()) {
            return "Enpoint name is required";
        }

        // Check if the name contains spaces or special characters
        if (/[\s~`!@#$%^&*()_+={}[\]:;'",.<>?/\\|]+/.test(name)) {
            return "Endpoint name cannot contain spaces or special characters";
        }
        return "";
    };

    const validateAddress = (name: string) => {
        // Check if the name is empty
        if (!name.trim()) {
            return "Address is required";
        }

        // Check if the name is a valid HTTP address
        const httpRegex = /^(http:\/\/|https:\/\/)/;
        if (!httpRegex.test(name)) {
            return "Provide a valid HTTP address";
        }
    };

    const handleBackButtonClick = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    }

    const isValid: boolean = !validateEndpointName(endpointName) && endpointType.length > 0 &&
        (!(endpointType === "Address Endpoint") || !validateAddress(address)) &&
        (!(endpointType === "HTTP Endpoint") || (method.length > 0 && URITemplate.length > 0));

    return (
        <WizardContainer>
            <SectionWrapper>
                <Container>
                    <Codicon iconSx={{ marginTop: -3, fontWeight: "bold", fontSize: 22 }} name='arrow-left' onClick={handleBackButtonClick} />
                    <div style={{ marginLeft: 30 }}>
                        <Typography variant="h3">Endpoint Artifact</Typography>
                    </div>
                </Container>
                <TextField
                    value={endpointName}
                    id='name-input'
                    label="Endpoint Name"
                    placeholder="Name"
                    onChange={(text: string) => setEndpointName(text)}
                    errorMsg={validateEndpointName(endpointName)}
                    size={46}
                    autoFocus
                    required
                />
                <FieldGroup>
                    <span>Endpoint Type</span>
                    <AutoComplete sx={{ width: '370px' }} items={endpointTypes} selectedItem={endpointType} onChange={handleEndpointTypeChange}></AutoComplete>
                </FieldGroup>
                {endpointType === "Address Endpoint" && (
                    <TextField
                        placeholder="Address"
                        label="Address"
                        onChange={(text: string) => setAddress(text)}
                        value={address}
                        id='address-input'
                        errorMsg={validateAddress(address)}
                        size={46}
                    />)}

                {endpointType === 'WSDL Endpoint' && (
                    <>
                        <TextField
                            placeholder="WSDL URI"
                            label="WSDL URI"
                            onChange={(text: string) => setWsdlUri(text)}
                            value={wsdlUri}
                            id='wsdl-uri'
                        />
                        <TextField
                            placeholder="WSDL Service"
                            label="WSDL Service"
                            onChange={(text: string) => setWsdlService(text)}
                            value={wsdlService}
                            id='wsdl-service'
                        />
                        <TextField
                            placeholder="WSDL Port"
                            label="WSDL Port"
                            onChange={(text: string) => setWsdlPort(text)}
                            value={wsdlPort}
                            id='wsdl-port'
                        />
                    </>
                )}

                {endpointType === 'Template Endpoint' && (
                    <>
                        <TextField
                            placeholder="URI"
                            label="URI"
                            onChange={(text: string) => setUri(text)}
                            value={uri}
                            id='template-uri'
                        />
                        <span>Target Template</span>
                        <Dropdown items={templates} value={targetTemplate} onChange={handleTemplateChange} id="target-template"></Dropdown>
                    </>
                )}

                <FieldGroup>
                    <h5>Endpoint Configuration</h5>
                    {endpointType === "HTTP Endpoint" && (
                        <>
                            <TextField
                                placeholder="URI Template"
                                label="URI Template"
                                onChange={(text: string) => setURITemplate(text)}
                                value={URITemplate}
                                id='uri-template-input'
                                size={46}
                            />
                            <span>Endpoint Type</span>
                            <AutoComplete sx={{ width: '370px' }} items={methodsTypes} selectedItem={method} onChange={handleMethodChange}></AutoComplete>
                        </>
                    )}
                    <RadioBtnContainer>
                        <label>
                            <input
                                type="radio"
                                value={endpointConfigurations[0]}
                                checked={endpointConfiguration === endpointConfigurations[0]}
                                onChange={handleEndpointConfigurationChange}
                            />
                            {endpointConfigurations[0]}
                        </label>
                        <label>
                            <input
                                type="radio"
                                value={endpointConfigurations[1]}
                                checked={endpointConfiguration === endpointConfigurations[1]}
                                onChange={handleEndpointConfigurationChange}
                            />
                            {endpointConfigurations[1]}
                        </label>
                    </RadioBtnContainer>
                </FieldGroup>
                <ActionContainer>
                    <Button
                        appearance="secondary"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        appearance="primary"
                        onClick={handleCreateEndpoint}
                        disabled={!isValid}
                    >
                        Create
                    </Button>
                </ActionContainer>
            </SectionWrapper>
        </WizardContainer>
    );
}
