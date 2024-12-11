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
import { Button, Dropdown, TextField, FormView, FormGroup, FormActions, FormCheckBox } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { EVENT_TYPE, MACHINE_VIEW, POPUP_EVENT_TYPE } from "@wso2-enterprise/mi-core";
import { Endpoint, EndpointList, InlineButtonGroup, TypeChip } from "./Commons";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { ParamManager } from "@wso2-enterprise/mi-diagram";

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
    isPopup?: boolean;
    handlePopupClose?: () => void;
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
    buildMessage?: string;
    description?: string;
    endpoints?: Endpoint[];
    properties?: any[];
};

const initialEndpoint: InputsFields = {
    name: '',
    buildMessage: 'false',
    description: '',
    endpoints: [],
    properties: [],
};

export function FailoverWizard(props: FailoverWizardProps) {

    const { rpcClient } = useVisualizerContext();

    const isNewEndpoint = !props.path.endsWith(".xml");
    const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
    const [expandEndpointsView, setExpandEndpointsView] = useState<boolean>(false);
    const [showAddNewEndpointView, setShowAddNewEndpointView] = useState<boolean>(false);
    const [newEndpoint, setNewEndpoint] = useState<Endpoint>(initialInlineEndpoint);
    const [savedEPName, setSavedEPName] = useState<string>("");
    const [endpointsUpdated, setEndpointsUpdated] = useState(false);
    const [workspaceFileNames, setWorkspaceFileNames] = useState([]);
    const [prevName, setPrevName] = useState<string | null>(null);

    const schema = yup.object({
        name: yup.string().required("Endpoint name is required")
            .matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in Endpoint Name")
            .test('validateEndpointName',
                'An artifact with same name already exists', value => {
                    return !isNewEndpoint ? !(workspaceFileNames.includes(value) && value !== savedEPName) : !workspaceFileNames.includes(value);
                }),
        buildMessage: yup.string().required("Build Message is required"),
        description: yup.string(),
        endpoints: yup.array(),
        properties: yup.array(),
    });

    const {
        reset,
        register,
        formState: { errors, isDirty },
        handleSubmit,
        getValues,
        control,
        watch,
        setValue,
    } = useForm({
        defaultValues: initialEndpoint,
        resolver: yupResolver(schema),
        mode: "onChange"
    });

    const [paramConfigs, setParamConfigs] = useState<any>({
        paramValues: [],
        paramFields: [
            { id: 1, type: "TextField", label: "Name", placeholder: "parameter_key", defaultValue: "", isRequired: true },
            { id: 2, type: "TextField", label: "Value", placeholder: "parameter_value", defaultValue: "", isRequired: true },
            { id: 3, type: "Dropdown", label: "Scope", defaultValue: "default", values: ["default", "transport", "axis2", "axis2-client"], isRequired: true },
        ]
    });

    useEffect(() => {
        if (!isNewEndpoint) {
            (async () => {
                const { endpoints, ...endpoint } = await rpcClient.getMiDiagramRpcClient().getFailoverEndpoint({ path: props.path });

                reset(endpoint);
                setSavedEPName(endpoint.name);
                setEndpoints(endpoints);

                setParamConfigs((prev: any) => {
                    return {
                        ...prev,
                        paramValues: endpoint.properties.map((property: any, index: Number) => {
                            return {
                                id: prev.paramValues.length + index,
                                paramValues: [
                                    { value: property.name },
                                    { value: property.value },
                                    { value: property.scope }
                                ],
                                key: property.name,
                                value: "value:" + property.value + "; scope:" + property.scope + ";"
                            }
                        })
                    };
                });

                if (endpoints.length > 0) {
                    setExpandEndpointsView(true);
                }
            })();
        }
        (async () => {
            const artifactRes = await rpcClient.getMiDiagramRpcClient().getAllArtifacts({
                path: props.path,
            });
            setWorkspaceFileNames(artifactRes.artifacts);
        })();
    }, [props.path]);

    useEffect(() => {
        setPrevName(watch("name"));
    }, [watch("name")]);

    const buildMessageOptions = [
        { content: 'True', value: 'true' },
        { content: 'False', value: 'false' },
    ];

    const renderProps = (fieldName: keyof InputsFields) => {
        return {
            id: fieldName,
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
        setEndpointsUpdated(true);
    }

    const handleParamChange = (config: any) => {
        setParamConfigs((prev: any) => {
            return {
                ...prev,
                paramValues: config.paramValues.map((param: any) => {
                    return {
                        ...param,
                        key: param.paramValues[0].value,
                        value: generateDisplayValue(param)
                    }
                })
            };
        })

        setValue('properties', config.paramValues.map((param: any) => ({
            name: param.paramValues[0].value,
            value: param.paramValues[1].value,
            scope: param.paramValues[2].value ?? 'default',
        })), { shouldDirty: true });
    }

    const generateDisplayValue = (paramValues: any) => {
        const result: string = "value:" + paramValues.paramValues[1].value + "; scope:" + paramValues.paramValues[2].value + ";";
        return result.trim();
    };

    const handleUpdateEndpoint = async (values: any) => {
        const updateEndpointParams = {
            directory: props.path,
            ...values,
            getContentOnly: false,
            endpoints,
        }
        await rpcClient.getMiDiagramRpcClient().updateFailoverEndpoint(updateEndpointParams);
        
        if (props.isPopup) {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: POPUP_EVENT_TYPE.CLOSE_VIEW,
                location: { view: null, recentIdentifier: getValues("name") },
                isPopup: true
            });
        } else {
            openOverview();
        }
    };

    const openOverview = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview }, isPopup: props.isPopup });
    };

    const changeType = () => {
        rpcClient.getMiVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.EndPointForm,
                documentUri: props.path,
                customProps: { type: 'endpoint' }
            },
            isPopup: props.isPopup
        });
    }

    return (
        <FormView title="Endpoint" onClose={props.handlePopupClose ?? openOverview}>
            <TypeChip
                type={"Failover Endpoint"}
                onClick={changeType}
                showButton={isNewEndpoint}
            />
            <FormGroup title="Basic Properties" isCollapsed={false}>
                <TextField
                    required
                    autoFocus
                    label="Name"
                    placeholder="Name"
                    {...renderProps('name')}
                    size={100}
                />
                <Dropdown
                    label="Build Message"
                    {...renderProps('buildMessage')}
                    items={buildMessageOptions}
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
                    {expandEndpointsView && (
                        <EndpointList
                            endpoints={endpoints}
                            setEndpoints={setEndpoints}
                            setEndpointUpdated={setEndpointsUpdated}
                        />
                    )}
                    {showAddNewEndpointView && (
                        <Endpoint
                            endpoint={newEndpoint}
                            handleEndpointChange={handleNewEndpointChange}
                            handleSave={handleAddNewEndpoint}
                        />
                    )}
                </FieldGroup>
            </FormGroup>
            <FormGroup title="Miscellaneous Properties" isCollapsed={false}>
                <TextField
                    label="Description"
                    {...renderProps('description')}
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
                    onClick={handleSubmit(handleUpdateEndpoint)}
                    disabled={!(isDirty || endpointsUpdated)}
                >
                    {isNewEndpoint ? "Create" : "Save Changes"}
                </Button>
            </FormActions>
        </FormView>
    );
}
