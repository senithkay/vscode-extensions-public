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
import { AutoComplete, Button, Codicon, TextField, Typography } from "@wso2-enterprise/ui-toolkit";
import { FieldGroup, SectionWrapper } from "./Commons";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { CreateEndpointRequest, EndpointDirectoryResponse } from "@wso2-enterprise/mi-core";

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

export function EndpointWizard() {

    const { rpcClient } = useVisualizerContext();
    const [endpointName, setEndpointName] = useState("");
    const [endpointType, setEndpointType] = useState("Address Endpoint");
    const [endpointConfiguration, setEndpointConfiguration] = useState("Static Endpoint (Save in an ESB Project)");
    const [address, setAddress] = useState("");
    const [URITemplate, setURITemplate] = useState("");
    const [method, setMethod] = useState("GET");

    const endpointTypes = [
        // Add remaining two types
        'Address Endpoint',
        'Default Endpoint',
        'Fail Over Endpoint',
        'HTTP Endpoint',
        'Load Balance Endpoint',
        'Recipient List Endpoint'
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

    const handleEndpointConfigurationChange = (event: any) => {
        setEndpointConfiguration(event.target.value);
    };

    const handleMethodChange = (type: string) => {
        setMethod(type);
    };

    const handleCreateEndpoint = async () => {
        const projectDir = (await rpcClient.getMiDiagramRpcClient().getProjectRoot()).path;
        const endpointDir = `${projectDir}/src/main/wso2mi/artifacts/endpoints`;
        const createEndpointParams: CreateEndpointRequest = {
            directory: endpointDir,
            name: endpointName,
            type: endpointType,
            configuration: endpointConfiguration,
            address: address,
            uriTemplate: URITemplate,
            method: method
        }
        const file = await rpcClient.getMiDiagramRpcClient().createEndpoint(createEndpointParams);

        rpcClient.getMiVisualizerRpcClient().openView({ view: "Overview" });
        rpcClient.getMiDiagramRpcClient().openFile(file);
    };

    const handleCancel = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ view: "Overview" });
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

    const isValid: boolean = endpointName.length > 0 &&
        endpointType.length > 0 &&
        (!(endpointType === "Address Endpoint") || address.length > 0) &&
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
