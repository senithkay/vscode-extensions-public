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
import { EVENT_TYPE, MACHINE_VIEW, UpdateDefaultEndpointRequest } from "@wso2-enterprise/mi-core";

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

const DivContent = styled.div`
    display: flex;
    justify-content: center;
`;

export interface Region {
    label: string;
    value: string;
}

interface OptionProps {
    value: string;
}

export interface DefaultEndpointWizardProps {
    path: string;
}

interface Property {
    name: string;
    value: any;
    scope: string;
}

export function DefaultEndpointWizard(props: DefaultEndpointWizardProps) {

    const { rpcClient } = useVisualizerContext();
    const [ endpoint, setEndpoint ] = useState<any>({
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
    const [isTemplate, setIsTemplate] = useState(false);
    const [directoryPath, setDirectoryPath] = useState("");
    const [properties, setProperties] = useState<Property[]>([]);
    const [parameters, setParameters] = useState<string[]>([]);
    const [message, setMessage] = useState({
        isError: false,
        text: ""
    });
    const validNumericInput = /^\d*$/;

    const isValid: boolean = endpoint.endpointName.length > 0 && endpoint.templateName.length > 0;

    useEffect(() => {

        (async () => {
            setDirectoryPath(props.path);
            const syntaxTree = await rpcClient.getMiDiagramRpcClient().getSyntaxTree({ documentUri: props.path });
            if (syntaxTree.syntaxTree.template != undefined) {
                setIsTemplate(true);
            }
            const existingEndpoint = await rpcClient.getMiDiagramRpcClient().getDefaultEndpoint({ path: props.path });
            setEndpoint(existingEndpoint);
            handleTimeoutActionChange(existingEndpoint.timeoutAction === '' ? 'Never' :
                existingEndpoint.timeoutAction.charAt(0).toUpperCase() + existingEndpoint.timeoutAction.slice(1));
            handleFormatChange(existingEndpoint.format);
            handleOptimizeChange(existingEndpoint.optimize);
            setProperties(existingEndpoint.properties);
            setParameters(existingEndpoint.templateParameters);
        })();
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
        { value: "final"},
        { value: "submission"},
    ];

    const timeoutOptions: OptionProps[] = [
        { value: "Never"},
        { value: "Discard"},
        { value: "Fault"}
    ];

    const formatOptions: OptionProps[] = [
        { value: "LEAVE_AS_IS"},
        { value: "SOAP 1.1"},
        { value: "SOAP 1.2"},
        { value: "POX"},
        { value: "GET"},
        { value: "REST"}
    ];

    const optimizeOptions: OptionProps[] = [
        { value: "LEAVE_AS_IS"},
        { value: "MTOM"},
        { value: "SWA"}
    ];

    const scopes: OptionProps[] = [
        { value: "default"},
        { value: "transport"},
        { value: "axis2"},
        { value: "axis2-client"},
    ];

    const removePropertyValue = (keyToRemove: string) => {
        setProperties(prevState =>
            prevState.filter(pair => pair.name !== keyToRemove)
        );
    };

    const removeParameter = (keyToRemove: string) => {
        setParameters(prevState =>
            prevState.filter(item => item !== keyToRemove)
        );
    };

    const editParameter = (oldKey: string, newKey: string) => {
        const indexToEdit = parameters.indexOf(oldKey);
        let existingParameters = [...parameters];
        existingParameters[indexToEdit] = newKey;
        setParameters(existingParameters);
    };

    const addParameter = () => {
        setParameters([...parameters, 'parameter']);
    }

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

    const handleFormatChange = (value: string) => {
        setEndpoint((prev: any) => ({ ...prev, format: value }));
    };

    const handleOptimizeChange = (value: string) => {
        setEndpoint((prev: any) => ({ ...prev, optimize: value }));
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

    const handleParametersChange = (value: boolean) => {
        if (!value) {
            setParameters([]);
        }
        setEndpoint((prev: any) => ({ ...prev, requireTemplateParameters: value }));
    };

    const handleOnChange = (field: any, value: any) => {
        setEndpoint((prev: any) => ({ ...prev, [field]: value }));
    }

    const handleMessage = (text: string, isError: boolean = false) => {
        setMessage({ isError, text });
    }

    const handleUpdateDefaultEndpoint = async () => {

        endpoint.properties = properties;
        endpoint.templateParameters = parameters;
        const updateDefaultEndpointParams: UpdateDefaultEndpointRequest = {
            directory: directoryPath,
            ...endpoint
        }
        const file = await rpcClient.getMiDiagramRpcClient().updateDefaultEndpoint(updateDefaultEndpointParams);

        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
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
                        <Typography variant="h3">
                            {isTemplate ? "Default Endpoint Template Artifact" : "Default Endpoint Artifact"}
                        </Typography>
                    </div>
                </Container>
                {isTemplate && (
                    <>
                        <Typography variant="h4">Template Properties</Typography>
                        <TextField
                            placeholder="Template Name"
                            label="Template Name"
                            onChange={(value: string) => handleOnChange("templateName", value)}
                            value={endpoint.templateName}
                            id="template-name-input"
                            autoFocus
                            required
                            validationMessage="Template name is required"
                            size={100}
                        />
                        <span>Require Template Parameters</span>
                        <RadioBtnContainer>
                            <RadioLabel>
                                <input
                                    type="radio"
                                    checked={endpoint.requireTemplateParameters === true}
                                    onChange={() => handleParametersChange(true)}
                                />
                                Yes
                            </RadioLabel>
                            <RadioLabel>
                                <input
                                    type="radio"
                                    checked={endpoint.requireTemplateParameters === false}
                                    onChange={() => handleParametersChange(false)}
                                />
                                No
                            </RadioLabel>
                        </RadioBtnContainer>
                        {endpoint.requireTemplateParameters && (
                            <>
                                <span>Parameters</span>
                                <Button onClick={addParameter}>Add Parameter</Button>
                                <Table>
                                    <thead>
                                    <tr>
                                        <Th>Name</Th>
                                        <ThButton>Remove</ThButton>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {parameters.map(item => (
                                        <tr>
                                            <Td contentEditable={true} onBlur={(e) => editParameter(item, e.currentTarget.textContent || '')}>{item}</Td>
                                            <TdButton>
                                                <DivContent>
                                                    <Button onClick={() => removeParameter(item)}>Remove</Button>
                                                </DivContent>
                                            </TdButton>
                                        </tr>
                                    ))}
                                    </tbody>
                                </Table>
                            </>
                        )}
                    </>
                )}
                <Typography variant="h4">Basic Properties</Typography>
                <TextField
                    placeholder="Endpoint Name"
                    label="Endpoint Name"
                    onChange={(value: string) => handleOnChange("endpointName", value)}
                    value={endpoint.endpointName}
                    id="endpoint-name-input"
                    autoFocus
                    required
                    validationMessage="Endpoint name is required"
                    size={100}
                />
                <span>Format</span>
                <Dropdown items={formatOptions} value={endpoint.format} onChange={handleFormatChange} id="format"/>
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
                            checked={endpoint.traceEnabled === 'disable'}
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
                <span>Optimize</span>
                <Dropdown items={optimizeOptions} value={endpoint.optimize} onChange={handleOptimizeChange} id="optimize"/>
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
                    onClick={handleUpdateDefaultEndpoint}
                    disabled={!isValid}
                >
                    Save Changes
                </Button>
            </ActionContainer>
        </WizardContainer>
    );
}
