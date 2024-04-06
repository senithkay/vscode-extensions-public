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
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { Button, Dropdown, TextField, FormView, FormGroup, FormActions, ParamManager } from "@wso2-enterprise/ui-toolkit";
import { Endpoint, EndpointList, InlineButtonGroup } from "../Commons";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup";
import { useForm } from "react-hook-form";

const FieldGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
`;

export interface Region {
    label: string;
    value: string;
}

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

type InputsFields = {
    name?: string;
    algorithm?: string;
    failover?: string;
    buildMessage?: string;
    sessionManagement?: string;
    sessionTimeout?: number;
    description?: string;
};

const initialEndpoint: InputsFields = {
    name: '',
    algorithm: 'roundRobin',
    failover: 'false',
    buildMessage: 'true',
    sessionManagement: 'none',
    sessionTimeout: 0,
    description: '',
};

const schema = yup.object({
    name: yup.string().required("Endpoint Name is required").matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in Endpoint name"),
    algorithm: yup.string().required("Algorithm is required"),
    failover: yup.string().required("Failover is required"),
    buildMessage: yup.string().required("Build Message is required"),
    sessionManagement: yup.string().required("Session Management is required"),
    sessionTimeout: yup.number().typeError('Session Timeout must be a number').min(0, "Session Timeout must be greater than or equal to 0"),
    description: yup.string(),
});

export function LoadBalanceWizard(props: LoadBalanceWizardProps) {

    const { rpcClient } = useVisualizerContext();

    const {
        reset,
        register,
        formState: { errors, isDirty },
        handleSubmit,
        watch,
        getValues
    } = useForm({
        defaultValues: initialEndpoint,
        resolver: yupResolver(schema),
        mode: "onChange"
    });

    const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
    const [expandEndpointsView, setExpandEndpointsView] = useState<boolean>(false);
    const [showAddNewEndpointView, setShowAddNewEndpointView] = useState<boolean>(false);
    const [newEndpoint, setNewEndpoint] = useState<Endpoint>(initialInlineEndpoint);

    const [paramConfigs, setParamConfigs] = useState<any>({
        paramValues: [],
        paramFields: [
            { id: 1, type: "TextField", label: "Name", defaultValue: "", isRequired: true },
            { id: 2, type: "TextField", label: "Value", defaultValue: "", isRequired: true },
            { id: 3, type: "Dropdown", label: "Scope", defaultValue: "default", values: ["default", "transport", "axis2", "axis2-client"], isRequired: true },
        ]
    });

    useEffect(() => {
        (async () => {
            const { properties, endpoints, ...endpoint } = await rpcClient.getMiDiagramRpcClient().getLoadBalanceEndpoint({ path: props.path });

            reset(endpoint);
            setEndpoints(endpoints);

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

            if (endpoints.length > 0) {
                setExpandEndpointsView(true);
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

    const renderProps = (fieldName: keyof InputsFields, value?: any) => {
        const watchedValue = watch(fieldName) || watch(fieldName) === 0 ? String(watch(fieldName)) : '';
        return {
            id: fieldName,
            value: value !== undefined ? String(value) : watchedValue,
            ...register(fieldName),
            errorMsg: errors[fieldName] && errors[fieldName].message.toString()
        }
    };

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

    const handleUpdateEndpoint = async (values: any) => {
        const updateEndpointParams = {
            directory: props.path,
            ...values,
            endpoints,
            properties: paramConfigs.paramValues.map((param: any) => {
                return {
                    name: param.key,
                    value: param.value,
                    scope: param.parameters[2].value ?? 'default',
                }
            })
        }
        rpcClient.getMiDiagramRpcClient().updateLoadBalanceEndpoint(updateEndpointParams);
        openOverview();
    };

    const openOverview = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const handleOnClose = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    };

    return (
        <FormView title="Loadbalance Endpoint" onClose={handleOnClose}>
            <FormGroup title="Basic Properties" isCollapsed={false}>
                <TextField
                    required
                    autoFocus
                    label="Name"
                    placeholder="Name"
                    {...renderProps("name")}
                    size={100}
                />
                <Dropdown
                    label="Algorithm"
                    items={algorithms}
                    {...renderProps("algorithm")}
                />
                <Dropdown
                    label="Fail Over"
                    items={trueFalseDropdown}
                    {...renderProps("failover")}
                />
                <Dropdown
                    label="Build Message"
                    items={trueFalseDropdown}
                    {...renderProps("buildMessage")}
                />
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
            <FormGroup title="Session Properties" isCollapsed={false}>
                <Dropdown
                    label="Session Management"
                    items={sessionManagementOptions}
                    {...renderProps("sessionManagement")}
                />
                {watch('sessionManagement') !== 'none' && <TextField
                    label="Session Timeout"
                    {...renderProps("sessionTimeout")}
                />}
            </FormGroup>
            <FormGroup title="Miscellaneous Properties" isCollapsed={false}>
                <TextField
                    label="Description"
                    {...renderProps("description")}
                />
                <FieldGroup>
                    <span>Parameters</span>
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
                    onClick={handleSubmit(handleUpdateEndpoint)}
                    disabled={!isDirty}
                >
                    Update
                </Button>
            </FormActions>
        </FormView>
    );
}
