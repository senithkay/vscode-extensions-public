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
import { AutoComplete, Button, TextField } from "@wso2-enterprise/ui-toolkit";
import MIWebViewAPI from "./utils/WebViewRpc";

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


export const SectionWrapper: React.FC<React.HTMLAttributes<HTMLDivElement>> = styled.div`
    // Flex Props
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    position: relative;
    gap: 10px;
    // End Flex Props
    // Sizing Props
    padding: 20px;
    // End Sizing Props
    // Border Props
    border-radius: 10px;
    border-style: solid;
    border-width: 1px;
    border-color: transparent;
    background-color: var(--vscode-welcomePage-tileBackground);
    &.active {
        border-color: var(--vscode-focusBorder);
    }
`;

export interface Region {
    label: string;
    value: string;
}

export function EndpointWizard() {


    const [endpointName, setEndpointName] = useState("");
    const [endpointType, setEndpointType] = useState("Address Endpoint");
    const [endpointConfiguration, setEndpointConfiguration] = useState("Static Endpoint (Save in an ESB Project)");
    const [address, setAddress] = useState("");
    const [URITemplate, setURITemplate] = useState("");
    const [method, setMethod] = useState("GET");
    const [projectDir, setProjectDir] = useState("");

    useEffect(() => {
        (async () => {
            const synapseEndpointsPath = await MIWebViewAPI.getInstance().getEndpointDirectory();
            setProjectDir(synapseEndpointsPath);
        })();

    }, []);

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
        const createEndpointParams = {
            directory: projectDir,
            name: endpointName,
            type: endpointType,
            configuration: endpointConfiguration,
            address: address,
            uriTemplate: URITemplate,
            method: method
        }
        const file = await MIWebViewAPI.getInstance().createEndpoint(createEndpointParams);
        MIWebViewAPI.getInstance().openFile(file);
        MIWebViewAPI.getInstance().closeWebView();
    };

    const handleCancel = () => {
        MIWebViewAPI.getInstance().closeWebView();
    };

    const isValid: boolean = endpointName.length > 0 &&
        endpointType.length > 0 &&
        (!(endpointType === "Address Endpoint") || address.length > 0) &&
        (!(endpointType === "HTTP Endpoint") || (method.length > 0 && URITemplate.length > 0));

    return (
        <WizardContainer>
            <TitleWrapper>
                <h2>New Endpoint Artifact</h2>
            </TitleWrapper>
            <SectionWrapper>
                <h3>Endpoint Artifact</h3>
                <TextField
                    value={endpointName}
                    id='name-input'
                    label="Endpoint Name"
                    placeholder="Name"
                    validationMessage="Endpoint name is required"
                    onChange={(text: string) => setEndpointName(text)}
                    autoFocus
                    required
                />
                <span>Endpoint Type</span>
                <AutoComplete items={endpointTypes} selectedItem={endpointType} onChange={handleEndpointTypeChange}></AutoComplete>
                {endpointType === "Address Endpoint" && (
                    <TextField
                        placeholder="Address"
                        label="Address"
                        onChange={(text: string) => setAddress(text)}
                        value={address}
                        id='address-input'
                    />)}
                <h5>Endpoint Configuration</h5>
                {endpointType === "HTTP Endpoint" && (
                    <>
                        <TextField
                            placeholder="URI Template"
                            label="URI Template"
                            onChange={(text: string) => setURITemplate(text)}
                            value={URITemplate}
                            id='uri-template-input'
                        />
                        <span>Endpoint Type</span>
                        <AutoComplete items={methodsTypes} selectedItem={method} onChange={handleMethodChange}></AutoComplete>
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
            </SectionWrapper>
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
        </WizardContainer>
    );
}
