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
import { Button, Codicon, Dropdown, TextField, Typography } from "@wso2-enterprise/ui-toolkit";
import { SectionWrapper } from "../Commons";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import Endpoint from "../Commons/Endpoint";
import PropertiesTable from "../Commons/PropertiesTable";
import EndpointList from "../Commons/EndpointList";
import InlineButtonGroup from "../Commons/InlineButtonGroup";

const WizardContainer = styled.div`
    display: flex;
    flex-direction: column;
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
    width: 100%;
    margin-top: 20px;
`;

const SubTitle = styled.h3`
    margin: 0px;
`;

const FieldGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
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

export interface LoadBalanceWizardProps {
    path: string;
}

type Endpoint = {
    type: string;
    value: string;
}

const initialInlineEndpoint: Endpoint = {
    type: 'inline',
    value: '',
};

export function LoadBalanceWizard(props: LoadBalanceWizardProps) {

    const { rpcClient } = useVisualizerContext();

    const [endpoint, setEndpoint] = useState<any>({
        name: '',
        algorithm: 'roundRobin',
        failover: 'false',
        buildMessage: 'true',
        sessionManagement: 'none',
        sessionTimeout: '',
        description: '',
    });

    const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
    const [properties, setProperties] = useState<any[]>([]);

    const [expandEndpointsView, setExpandEndpointsView] = useState<boolean>(false);
    const [expandPropertiesView, setExpandPropertiesView] = useState<boolean>(false);
    const [showAddNewEndpointView, setShowAddNewEndpointView] = useState<boolean>(false);
    const [newEndpoint, setNewEndpoint] = useState<Endpoint>(initialInlineEndpoint);

    useEffect(() => {
        (async () => {
            const { properties, endpoints, ...endpoint } = await rpcClient.getMiDiagramRpcClient().getLoadBalanceEndpoint({ path: props.path });

            setEndpoint(endpoint);
            setProperties(properties);
            setEndpoints(endpoints);

            if (endpoints.length > 0) {
                setExpandEndpointsView(true);
            }

            if (properties.length > 0) {
                setExpandPropertiesView(true);
            }
        })();
    }, []);

    const algorithms = [
        { content: 'Round Robin', value: 'org.apache.synapse.endpoints.algorithms.RoundRobin' },
        { content: 'Weighted RRLC Algorithm', value: 'org.apache.synapse.endpoints.algorithms.WeightedRRLCAlgorithm' },
        { content: 'Weighted Round Robin', value: 'org.apache.synapse.endpoints.algorithms.WeightedRoundRobin' },
    ];

    const trueFalseDropdown = [
        { content: 'True', value: 'true' },
        { content: 'False', value: 'false' },
    ];

    const sessionManagementOptions = [
        { content: 'None', value: 'none' },
        { content: 'Transport', value: 'http' },
        { content: 'SOAP', value: 'soap' },
        { content: 'Client ID', value: 'simpleClientSession' },
    ];

    const handleOnChange = (field: string, value: any) => {
        setEndpoint((prev: any) => ({ ...prev, [field]: value }));
    }

    const handleNewEndpointChange = (field: string, value: string) => {
        setNewEndpoint((prev: any) => ({ ...prev, [field]: value }));
    }

    const handleAddNewEndpoint = () => {
        setEndpoints((prev: any) => [...prev, newEndpoint]);
        setShowAddNewEndpointView(false);
        setNewEndpoint(initialInlineEndpoint);
    }

    const handleAddNewProperty = () => {
        if (properties.length > 0 && properties[properties.length - 1].name === "" && properties[properties.length - 1].value === "") {
            return;
        }

        setProperties((prev: any) => [...prev, { name: '', value: '', scope: 'default' }]);
        setExpandPropertiesView(true);
    }

    const handleUpdateEndpoint = async () => {
        const updateEndpointParams = {
            directory: props.path,
            ...endpoint,
            endpoints,
            properties,
        }
        rpcClient.getMiDiagramRpcClient().updateLoadBalanceEndpoint(updateEndpointParams);
        openOverview();
    };

    const openOverview = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const handleBackButtonClick = () => {
        openOverview();
    }

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

    const isValid: boolean = validateEndpointName(endpoint.name) === '';;

    return (
        <WizardContainer>
            <SectionWrapper>
                <Container>
                    <Codicon iconSx={{ marginTop: -3, fontWeight: "bold", fontSize: 22 }} name='arrow-left' onClick={handleBackButtonClick} />
                    <div style={{ marginLeft: 30 }}>
                        <Typography variant="h3">Load Balance Endpoint Artifact</Typography>
                    </div>
                </Container>
                <SubTitle>Basic Properties</SubTitle>
                <TextField
                    id='name-input'
                    label="Name"
                    placeholder="Name"
                    value={endpoint.name}
                    onTextChange={(text: string) => handleOnChange('name', text)}
                    errorMsg={validateEndpointName(endpoint.name)}
                    size={100}
                    autoFocus
                    required
                />
                <FieldGroup>
                    <span>Algorithm</span>
                    <Dropdown
                        id="algorithm"
                        value={endpoint.algorithm}
                        onValueChange={(text: string) => handleOnChange("algorithm", text)}
                        items={algorithms}
                    />
                </FieldGroup>
                <FieldGroup>
                    <span>Fail Over</span>
                    <Dropdown
                        id="fail-over"
                        value={endpoint.failover}
                        onValueChange={(text: string) => handleOnChange("failover", text)}
                        items={trueFalseDropdown}
                    />
                </FieldGroup>
                <FieldGroup>
                    <span>Build Message</span>
                    <Dropdown
                        id="build-message"
                        value={endpoint.buildMessage}
                        onValueChange={(text: string) => handleOnChange("buildMessage", text)}
                        items={trueFalseDropdown}
                    />
                </FieldGroup>
                <FieldGroup>
                    <InlineButtonGroup
                        label="Endpoints"
                        isHide={expandEndpointsView}
                        onShowHideToggle={() => {
                            setExpandEndpointsView(!expandEndpointsView);
                            setShowAddNewEndpointView(false);
                            setNewEndpoint({ type: 'inline', value: '' });
                        }}
                        addNewFunction={() => {
                            setShowAddNewEndpointView(true);
                            setExpandEndpointsView(true);
                        }}
                    />
                    {expandEndpointsView && <EndpointList
                        endpoints={endpoints}
                        setEndpoints={setEndpoints}
                    />}
                    {showAddNewEndpointView && <Endpoint
                        endpoint={newEndpoint}
                        handleEndpointChange={handleNewEndpointChange}
                        handleSave={handleAddNewEndpoint}
                    />}
                </FieldGroup>

                <SubTitle>Session Properties</SubTitle>
                <FieldGroup>
                    <span>Session Management</span>
                    <Dropdown
                        id="session-management"
                        value={endpoint.sessionManagement}
                        onValueChange={(text: string) => handleOnChange("sessionManagement", text)}
                        items={sessionManagementOptions}
                    />
                </FieldGroup>
                {endpoint.sessionManagement !== 'none' && <TextField
                    id='session-timeout'
                    value={endpoint.sessionTimeout}
                    label="Session Timeout"
                    onTextChange={(text: string) => handleOnChange('sessionTimeout', text)}
                />}

                <SubTitle>Miscellaneous Properties</SubTitle>
                <TextField
                    id='description'
                    value={endpoint.description}
                    label="Description"
                    onTextChange={(text: string) => handleOnChange('description', text)}
                />
                <FieldGroup>
                    <InlineButtonGroup
                        label="Properties"
                        isHide={expandPropertiesView}
                        onShowHideToggle={() => {
                            setExpandPropertiesView(!expandPropertiesView);
                        }}
                        addNewFunction={handleAddNewProperty}
                    />
                    {expandPropertiesView && <PropertiesTable properties={properties} setProperties={setProperties} />}
                </FieldGroup>
            </SectionWrapper>
            <ActionContainer>
                <Button
                    appearance="secondary"
                    onClick={openOverview}
                >
                    Cancel
                </Button>
                <Button
                    appearance="primary"
                    onClick={handleUpdateEndpoint}
                    disabled={!isValid}
                >
                    Update
                </Button>
            </ActionContainer>
        </WizardContainer>
    );
}
