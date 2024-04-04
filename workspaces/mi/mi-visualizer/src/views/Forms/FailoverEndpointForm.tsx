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
import { Button, Dropdown, TextField, FormView, FormGroup, FormActions, ParamManager } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { Endpoint, EndpointList, InlineButtonGroup } from "./Commons";

const FieldGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
`;

export interface Region {
    label: string;
    value: string;
}

export interface FailoverWizardProps {
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

export function FailoverWizard(props: FailoverWizardProps) {

    const { rpcClient } = useVisualizerContext();

    const [endpoint, setEndpoint] = useState<any>({
        name: '',
        buildMessage: 'true',
        description: '',
    });

    const [endpoints, setEndpoints] = useState<Endpoint[]>([]);

    const [paramConfigs, setParamConfigs] = useState<any>({
        paramValues: [],
        paramFields: [
            { id: 1, type: "TextField", label: "Name", defaultValue: "", isRequired: true },
            { id: 2, type: "TextField", label: "Value", defaultValue: "", isRequired: true },
            { id: 3, type: "Dropdown", label: "Scope", defaultValue: "default", values: ["default", "transport", "axis2", "axis2-client"], isRequired: true },
        ]
    });

    const [expandEndpointsView, setExpandEndpointsView] = useState<boolean>(false);
    const [showAddNewEndpointView, setShowAddNewEndpointView] = useState<boolean>(false);
    const [newEndpoint, setNewEndpoint] = useState<Endpoint>(initialInlineEndpoint);

    useEffect(() => {
        (async () => {
            const { properties, endpoints, ...endpoint } = await rpcClient.getMiDiagramRpcClient().getFailoverEndpoint({ path: props.path });

            setEndpoint(endpoint);
            
            setParamConfigs((prev: any) => {
                return {
                    ...prev,
                    paramValues: properties.map((property: any, index: Number) => {
                        return {
                            id: prev.paramValues.length + index,
                            parameters: [
                                { id: 0, label: 'Name', type: 'TextField', value: property.name, isRequired: true },
                                { id: 1, label: 'Value', type: 'TextField', value: property.value, isRequired: true },
                                { id: 2, label: 'Scope', type: 'Dropdown', value: property.scope, values: ["default", "transport", "axis2", "axis2-client"], isRequired: true },
                            ],
                            key: property.name,
                            value: property.value,
                        }
                    })
                };
            });

            setEndpoints(endpoints);

            if (endpoints.length > 0) {
                setExpandEndpointsView(true);
            }
        })();
    }, []);

    const buildMessageOptions = [
        { content: 'True', value: 'true' },
        { content: 'False', value: 'false' },
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

    const handleParamChange = (config: any) => {
        setParamConfigs((prev: any) => {
            return {
                ...prev,
                paramValues: config.paramValues.map((param: any) => {
                    return {
                        ...param,
                        key: param.parameters[0].value,
                        value: param.parameters[1].value ?? '',
                    }
                })
            };
        })
    }

    const handleUpdateEndpoint = async () => {
        const updateEndpointParams = {
            directory: props.path,
            ...endpoint,
            endpoints,
            properties: paramConfigs.paramValues.map((param: any) => {
                return {
                    name: param.key,
                    value: param.value,
                    scope: param.parameters[2].value ?? 'default',
                }
            })
        }
        rpcClient.getMiDiagramRpcClient().updateFailoverEndpoint(updateEndpointParams);
        openOverview();
    };

    const openOverview = () => {
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

    const isValid: boolean = validateEndpointName(endpoint.name) === '';;

    return (
        <FormView title="Failover Endpoint Artifact" onClose={openOverview}>
            <FormGroup title="Basic Properties" isCollapsed={false}>
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
                    <span>Build Message</span>
                    <Dropdown
                        id="build-message"
                        value={endpoint.buildMessage}
                        onValueChange={(text: string) => handleOnChange("buildMessage", text)}
                        items={buildMessageOptions}
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
            </FormGroup>
            <FormGroup title="Miscellaneous Properties" isCollapsed={false}>
                <TextField
                    id='description'
                    value={endpoint.description}
                    label="Description"
                    onTextChange={(text: string) => handleOnChange('description', text)}
                />
                <FieldGroup>
                    <span>Properties</span>
                    <ParamManager paramConfigs={paramConfigs} onChange={handleParamChange} />
                </FieldGroup>
            </FormGroup>
            <FormActions>
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
            </FormActions>
        </FormView>
    );
}
