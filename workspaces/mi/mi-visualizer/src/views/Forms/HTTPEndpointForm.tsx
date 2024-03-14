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
import { EVENT_TYPE, MACHINE_VIEW, UpdateHttpEndpointRequest } from "@wso2-enterprise/mi-core";

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

export interface Region {
    label: string;
    value: string;
}

interface OptionProps {
    value: string;
}

export interface HttpEndpointWizardProps {
    path: string;
}

interface KeyValuePair {
    key: string;
    value: any;
}

interface Property {
    name: string;
    value: any;
    scope: string;
}

export function HttpEndpointWizard(props: HttpEndpointWizardProps) {

    const { rpcClient } = useVisualizerContext();
    const [ endpoint, setEndpoint ] = useState<any>({
        endpointName: "",
        traceEnabled: "",
        statisticsEnabled: "",
        uriTemplate: "",
        httpMethod: "",
        description: "",
        requireProperties: false,
        properties: [],
        authType: "",
        basicAuthUsername: "",
        basicAuthPassword: "",
        authMode: "",
        grantType: "",
        clientId: "",
        clientSecret: "",
        refreshToken: "",
        tokenUrl: "",
        username: "",
        password: "",
        requireOauthParameters: false,
        oauthProperties: [],
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
        timeoutAction: ""

    })
    const [directoryPath, setDirectoryPath] = useState("");
    const [oauthProperties, setOauthProperties] = useState<KeyValuePair[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [message, setMessage] = useState({
        isError: false,
        text: ""
    });
    const validNumericInput = /^\d*$/;

    const isValid: boolean = endpoint.endpointName.length > 0;

    useEffect(() => {

        (async () => {
            setDirectoryPath(props.path);
            const existingEndpoint = await rpcClient.getMiDiagramRpcClient().getHttpEndpoint({ path: props.path });
            setEndpoint(existingEndpoint);
            handleTimeoutActionChange(existingEndpoint.timeoutAction === '' ? 'Never' :
                existingEndpoint.timeoutAction.charAt(0).toUpperCase() + existingEndpoint.timeoutAction.slice(1));
            handleHttpMethodChange(existingEndpoint.httpMethod);
            setOauthProperties(existingEndpoint.oauthProperties);
            setProperties(existingEndpoint.properties);
        })();
    }, []);

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
        { value: "final"},
        { value: "submission"},
    ];

    const grantTypes: OptionProps[] = [
        { value: "Authorization Code"},
        { value: "Client Credentials"},
        { value: "Password"}
    ];

    const authorizationModes: OptionProps[] = [
        { value: "Header"},
        { value: "Payload"},
    ];

    const authTypes: OptionProps[] = [
        { value: "None"},
        { value: "Basic Auth"},
        { value: "OAuth"}
    ];

    const timeoutOptions: OptionProps[] = [
        { value: "Never"},
        { value: "Discard"},
        { value: "Fault"}
    ];

    const httpMethods: OptionProps[] = [
        { value: "GET"},
        { value: "POST"},
        { value: "PUT"},
        { value: "DELETE"},
        { value: "HEAD"},
        { value: "OPTIONS"},
        { value: "PATCH"},
        { value: "leave_as_is"}
    ];

    const scopes: OptionProps[] = [
        { value: "default"},
        { value: "transport"},
        { value: "axis2"},
        { value: "axis2-client"},
    ];

    const removeValue = (keyToRemove: string) => {
        setOauthProperties(prevState =>
            prevState.filter(pair => pair.key !== keyToRemove)
        );
    };

    const addValue = () => {
        setOauthProperties(prevState => [...prevState, { key: 'Parameter_Key', value: 'Parameter_Value' }]);
    };

    const editKey = (oldKey: string, newKey: string) => {
        setOauthProperties(prevState =>
            prevState.map(pair =>
                pair.key === oldKey ? { ...pair, key: newKey } : pair
            )
        );
    };

    const editValue = (key: string, newValue: string) => {
        setOauthProperties(prevState =>
            prevState.map(pair =>
                pair.key === key ? { ...pair, value: newValue } : pair
            )
        );
    };

    const removePropertyValue = (keyToRemove: string) => {
        setProperties(prevState =>
            prevState.filter(pair => pair.name !== keyToRemove)
        );
    };

    const addPropertyValue = () => {
        setProperties(prevState => [...prevState, { name: 'Parameter_Key', value: 'Parameter_Value', scope: 'default' }]);
    };

    const editPropertyKey = (oldKey: string, newKey: string) => {
        setProperties(prevState =>
            prevState.map(pair =>
                pair.name === oldKey ? { ...pair, name: newKey } : pair
            )
        );
    };

    const editPropertyValue = (key: string, newValue: string) => {
        setProperties(prevState =>
            prevState.map(pair =>
                pair.name === key ? { ...pair, value: newValue } : pair
            )
        );
    };

    const editPropertyScope = (key: string, newScope: string) => {
        setProperties(prevState =>
            prevState.map(pair =>
                pair.name === key ? { ...pair, scope: newScope } : pair
            )
        );
    };

    const handleTraceEnabledChange = (value: string) => {
        setEndpoint((prev: any) => ({ ...prev, traceEnabled: value }));
    };

    const handleStatsEnabledChange = (value: string) => {
        setEndpoint((prev: any) => ({ ...prev, statisticsEnabled: value }));
    };

    const handleHttpMethodChange = (value: string) => {
        setEndpoint((prev: any) => ({ ...prev, httpMethod: value }));
    };

    const handleAuthTypeChange = (type: string) => {
        setEndpoint((prev: any) => ({ ...prev, authType: type }));
    };

    const handleAuthModeChange = (value: any) => {
        setEndpoint((prev: any) => ({ ...prev, authMode: value }));
    };

    const handleAuthGrantTypeChange = (value: string) => {
        setEndpoint((prev: any) => ({ ...prev, grantType: value }));
    };

    const handleAddressingEnabledChange = (value: string) => {
        setEndpoint((prev: any) => ({ ...prev, addressingEnabled: value }));
    };

    const handleAddressingVersionChange = (value: string) => {
        setEndpoint((prev: any) => ({ ...prev, addressingVersion: value }));
    };

    const handleAddressListenerChange = (value: string) => {
        setEndpoint((prev: any) => ({ ...prev, addressListener: value }));
    };

    const handleSecurityEnabledChange = (value: string) => {
        setEndpoint((prev: any) => ({ ...prev, securityEnabled: value }));
    };

    const handleTimeoutActionChange = (value: string) => {
        setEndpoint((prev: any) => ({ ...prev, timeoutAction: value }));
    };

    const handlePropertiesChange = (value: boolean) => {
        if (!value) {
            setProperties([]);
        }
        setEndpoint((prev: any) => ({ ...prev, requireProperties: value }));
    };

    const handleOauthPropertiesChange = (value: boolean) => {
        if (!value) {
            setOauthProperties([]);
        }
        setEndpoint((prev: any) => ({ ...prev, requireOauthParameters: value }));
    };

    const handleOnChange = (field: any, value: any) => {
        setEndpoint((prev: any) => ({ ...prev, [field]: value }));
    }

    const handleMessage = (text: string, isError: boolean = false) => {
        setMessage({ isError, text });
    }

    const handleUpdateHttpEndpoint = async () => {

        endpoint.properties = properties;
        endpoint.oauthProperties = oauthProperties;
        const updateHttpEndpointParams: UpdateHttpEndpointRequest = {
            directory: directoryPath,
            ...endpoint
        }
        const file = await rpcClient.getMiDiagramRpcClient().updateHttpEndpoint(updateHttpEndpointParams);

        setDirectoryPath(file.path);
        handleMessage("HTTP Endpoint updated successfully");
    };

    const handleCancel = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    return (
        <WizardContainer>
            <SectionWrapper>
                <Container>
                    <Codicon iconSx={{ marginTop: -3, fontWeight: "bold", fontSize: 22 }} name='arrow-left' onClick={handleCancel} />
                    <div style={{ marginLeft: 30 }}>
                        <Typography variant="h3">HTTP Endpoint Artifact</Typography>
                    </div>
                </Container>
                <Typography variant="h4">Basic Properties</Typography>
                <TextField
                    placeholder="Name"
                    label="Endpoint Name"
                    onChange={(value: string) => handleOnChange("endpointName", value)}
                    value={endpoint.endpointName}
                    id="endpoint-name-input"
                    autoFocus
                    required
                    validationMessage="Endpoint name is required"
                    size={100}
                />
                <span>Trace Enabled</span>
                <RadioBtnContainer>
                    <RadioLabel>
                        <input
                            type="radio"
                            checked={endpoint.traceEnabled === 'enable'}
                            onChange={() => handleTraceEnabledChange('enable')}
                        />
                        Enable
                    </RadioLabel>
                    <RadioLabel>
                        <input
                            type="radio"
                            checked={endpoint.requireProperties === 'disable'}
                            onChange={() => handleTraceEnabledChange('disable')}
                        />
                        Disable
                    </RadioLabel>
                </RadioBtnContainer>
                <span>Statistics Enabled</span>
                <RadioBtnContainer>
                    <RadioLabel>
                        <input
                            type="radio"
                            checked={endpoint.statisticsEnabled === 'enable'}
                            onChange={() => handleStatsEnabledChange('enable')}
                        />
                        Enable
                    </RadioLabel>
                    <RadioLabel>
                        <input
                            type="radio"
                            checked={endpoint.statisticsEnabled === 'disable'}
                            onChange={() => handleStatsEnabledChange('disable')}
                        />
                        Disable
                    </RadioLabel>
                </RadioBtnContainer>
                <Typography variant="h4">Miscellaneous Properties</Typography>
                <TextField
                    placeholder="URI Template"
                    label="URI Template"
                    onChange={(value: string) => handleOnChange("uriTemplate", value)}
                    value={endpoint.uriTemplate}
                    id="uri-template"
                    size={100}
                />
                <span>HTTP Method</span>
                <Dropdown items={httpMethods} value={endpoint.httpMethod} onChange={handleHttpMethodChange} id="http-method"/>
                <TextField
                    placeholder="Description"
                    label="Description"
                    onChange={(value: string) => handleOnChange("description", value)}
                    value={endpoint.description}
                    id="description"
                    size={100}
                />
                <span>Require Additional Properties</span>
                <RadioBtnContainer>
                    <RadioLabel>
                        <input
                            type="radio"
                            checked={endpoint.requireProperties === true}
                            onChange={() => handlePropertiesChange(true)}
                        />
                        Yes
                    </RadioLabel>
                    <RadioLabel>
                        <input
                            type="radio"
                            checked={endpoint.requireProperties === false}
                            onChange={() => handlePropertiesChange(false)}
                        />
                        No
                    </RadioLabel>
                </RadioBtnContainer>
                {endpoint.requireProperties && (
                    <>
                        <span>Properties</span>
                        <Button onClick={addPropertyValue}>Add Property</Button>
                        <Table>
                            <thead>
                            <tr>
                                <Th>Name</Th>
                                <Th>Value</Th>
                                <Th>Scope</Th>
                                <ThButton>Remove</ThButton>
                            </tr>
                            </thead>
                            <tbody>
                            {properties.map(pair => (
                                <tr>
                                    <Td contentEditable={true} onBlur={(e) => editPropertyKey(pair.name, e.currentTarget.textContent || '')}>{pair.name}</Td>
                                    <Td contentEditable={true} onBlur={(e) => editPropertyValue(pair.name, e.currentTarget.textContent || '')}>{pair.value}</Td>
                                    <Td>
                                        <Dropdown items={scopes} value={pair.scope} onChange={(value) => editPropertyScope(pair.name, value)} id="scope"/>
                                    </Td>
                                    <TdButton>
                                        <Button onClick={() => removePropertyValue(pair.name)}>Remove</Button>
                                    </TdButton>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </>
                )}
                <Typography variant="h4">Auth Configuration</Typography>
                <span>Auth Type</span>
                <Dropdown items={authTypes} value={endpoint.authType} onChange={handleAuthTypeChange} id="auth-type"/>
                {endpoint.authType === 'Basic Auth' && (
                    <>
                        <TextField
                            placeholder="Username"
                            label="Basic Auth Username"
                            onChange={(value: string) => handleOnChange("basicAuthUsername", value)}
                            value={endpoint.basicAuthUsername}
                            id="basic-auth-username"
                            size={100}
                        />
                        <TextField
                            placeholder="Password"
                            label="Basic Auth Password"
                            onChange={(value: string) => handleOnChange("basicAuthPassword", value)}
                            value={endpoint.basicAuthPassword}
                            id="basic-auth-password"
                            size={100}
                        />
                    </>
                )}
                {endpoint.authType === 'OAuth' && (
                    <>
                        <span>OAuth Authorization Mode</span>
                        <Dropdown items={authorizationModes} value={endpoint.authMode} onChange={handleAuthModeChange} id="auth-mode"/>
                        <span>OAuth Grant Type</span>
                        <Dropdown items={grantTypes} value={endpoint.grantType} onChange={handleAuthGrantTypeChange} id="grant-type"/>
                        <TextField
                            placeholder="Client ID"
                            label="Client ID"
                            onChange={(value: string) => handleOnChange("clientId", value)}
                            value={endpoint.clientId}
                            id="client-id"
                            size={100}
                        />
                        <TextField
                            placeholder="Client Secret"
                            label="Client Secret"
                            onChange={(value: string) => handleOnChange("clientSecret", value)}
                            value={endpoint.clientSecret}
                            id="client-secret"
                            size={100}
                        />
                        <TextField
                            placeholder="Token Url"
                            label="Token Url"
                            onChange={(value: string) => handleOnChange("tokenUrl", value)}
                            value={endpoint.tokenUrl}
                            id="token-url"
                            size={100}
                        />
                        {endpoint.grantType === 'Authorization Code' && (
                            <TextField
                                placeholder="Refresh Token"
                                label="Refresh Token"
                                onChange={(value: string) => handleOnChange("refreshToken", value)}
                                value={endpoint.refreshToken}
                                id="refresh-token"
                                size={100}
                            />
                        )}
                        {endpoint.grantType === 'Password' && (
                            <>
                                <TextField
                                    placeholder="Username"
                                    label="Username"
                                    onChange={(value: string) => handleOnChange("username", value)}
                                    value={endpoint.username}
                                    id="username"
                                    size={100}
                                />
                                <TextField
                                    placeholder="Password"
                                    label="Password"
                                    onChange={(value: string) => handleOnChange("password", value)}
                                    value={endpoint.password}
                                    id="password"
                                    size={100}
                                />
                            </>
                        )}
                        <span>Require Additional OAuth Properties</span>
                        <RadioBtnContainer>
                            <RadioLabel>
                                <input
                                    type="radio"
                                    checked={endpoint.requireOauthParameters === true}
                                    onChange={() => handleOauthPropertiesChange(true)}
                                />
                                Yes
                            </RadioLabel>
                            <RadioLabel>
                                <input
                                    type="radio"
                                    checked={endpoint.requireOauthParameters === false}
                                    onChange={() => handleOauthPropertiesChange(false)}
                                />
                                No
                            </RadioLabel>
                        </RadioBtnContainer>
                        {endpoint.requireOauthParameters && (
                            <>
                                <span>OAuth Parameters</span>
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
                                    {oauthProperties.map(pair => (
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
                    </>
                )}
                <Typography variant="h4">Quality of Service Properties</Typography>
                <span>Addressing</span>
                <RadioBtnContainer>
                    <RadioLabel>
                        <input
                            type="radio"
                            checked={endpoint.addressingEnabled === 'enable'}
                            onChange={() => handleAddressingEnabledChange('enable')}
                        />
                        Enable
                    </RadioLabel>
                    <RadioLabel>
                        <input
                            type="radio"
                            checked={endpoint.addressingEnabled === 'disable'}
                            onChange={() => handleAddressingEnabledChange('disable')}
                        />
                        Disable
                    </RadioLabel>
                </RadioBtnContainer>
                {endpoint.addressingEnabled === 'enable' && (
                    <>
                        <span>Addressing Version</span>
                        <Dropdown items={addressingVersions} value={endpoint.addressingVersion} onChange={handleAddressingVersionChange} id="addressing-version"/>
                        <span>Addressing Separate Listener</span>
                        <RadioBtnContainer>
                            <RadioLabel>
                                <input
                                    type="radio"
                                    checked={endpoint.addressListener === 'enable'}
                                    onChange={() => handleAddressListenerChange('enable')}
                                />
                                Enable
                            </RadioLabel>
                            <RadioLabel>
                                <input
                                    type="radio"
                                    checked={endpoint.addressListener === 'disable'}
                                    onChange={() => handleAddressListenerChange('disable')}
                                />
                                Disable
                            </RadioLabel>
                        </RadioBtnContainer>
                    </>
                )}
                <span>Security</span>
                <RadioBtnContainer>
                    <RadioLabel>
                        <input
                            type="radio"
                            checked={endpoint.securityEnabled === 'enable'}
                            onChange={() => handleSecurityEnabledChange('enable')}
                        />
                        Enable
                    </RadioLabel>
                    <RadioLabel>
                        <input
                            type="radio"
                            checked={endpoint.securityEnabled === 'disable'}
                            onChange={() => handleSecurityEnabledChange('disable')}
                        />
                        Disable
                    </RadioLabel>
                </RadioBtnContainer>
                <Typography variant="h4">Endpoint Error Handling</Typography>
                <TextField
                    placeholder="304,305"
                    label="Suspend Error Codes"
                    onChange={(value: string) => handleOnChange("suspendErrorCodes", value)}
                    value={endpoint.suspendErrorCodes}
                    id="suspend-error-codes"
                    size={100}
                />
                <TextField
                    placeholder="-1"
                    label="Suspend Initial Duration"
                    onChange={(value) => {
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
                    onChange={(value) => {
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
                    onChange={(value) => {
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
                    onChange={(value: string) => handleOnChange("retryErrorCodes", value)}
                    value={endpoint.retryErrorCodes}
                    id="retry-error-codes"
                    size={100}
                />
                <TextField
                    placeholder="10"
                    label="Retry Count"
                    onChange={(value) => {
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
                    onChange={(value) => {
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
                    onChange={(value) => {
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
                <span>Timeout Action</span>
                <Dropdown items={timeoutOptions} value={endpoint.timeoutAction} onChange={handleTimeoutActionChange} id="timeout-action"/>
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
                    onClick={handleUpdateHttpEndpoint}
                    disabled={!isValid}
                >
                    Save Changes
                </Button>
            </ActionContainer>
        </WizardContainer>
    );
}
