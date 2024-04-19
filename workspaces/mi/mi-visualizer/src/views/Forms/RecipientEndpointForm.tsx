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
import { Button, TextField, FormView, FormGroup, FormActions, ParamManager, FormCheckBox } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { Endpoint, EndpointList, InlineButtonGroup, TypeChip } from "./Commons";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup";
import { useForm } from "react-hook-form";
import AddToRegistry, { getArtifactNamesAndRegistryPaths, formatRegistryPath, saveToRegistry } from "./AddToRegistry";
import { set } from "lodash";

const FieldGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
`;

export interface Region {
    label: string;
    value: string;
}

export interface RecipientWizardProps {
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
    description?: string;
    endpoints?: Endpoint[];
    properties?: any[];
    //reg form
    saveInReg?: boolean;
    artifactName?: string;
    registryPath?: string
    registryType?: "gov" | "conf";
};

const initialEndpoint: InputsFields = {
    name: '',
    description: '',
    endpoints: [],
    properties: [],
    //reg form
    saveInReg: false,
    artifactName: "",
    registryPath: "/",
    registryType: "gov"
};

export function RecipientWizard(props: RecipientWizardProps) {

    const { rpcClient } = useVisualizerContext();
    const isNewEndpoint = !props.path.endsWith(".xml");
    const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
    const [expandEndpointsView, setExpandEndpointsView] = useState<boolean>(false);
    const [showAddNewEndpointView, setShowAddNewEndpointView] = useState<boolean>(false);
    const [newEndpoint, setNewEndpoint] = useState<Endpoint>(initialInlineEndpoint);
    const [existingEndpoints, setExistingEndpoints] = useState<string[]>([]);
    const [existingArtifactNames, setExistingArtifactNames] = useState<string[]>([]);
    const [artifactNames, setArtifactNames] = useState([]);
    const [registryPaths, setRegistryPaths] = useState([]);
    const [savedEPName, setSavedEPName] = useState<string>("");
    const [endpointsUpdated, setEndpointsUpdated] = useState(false);

    const schema = yup.object({
        name: yup.string().required("Endpoint name is required").matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in Endpoint name")
            .test('validateEndpointName',
                'Endpoint file name already exists', value => {
                    return !isNewEndpoint ? !(existingEndpoints.includes(value) && value !== savedEPName) : !existingEndpoints.includes(value);
                }).test('validateEndpointName',
                    'Endpoint artifact name already exists', value => {
                        return !isNewEndpoint ? !(existingArtifactNames.includes(value) && value !== savedEPName) : !existingArtifactNames.includes(value);
                    }),
        description: yup.string(),
        endpoints: yup.array(),
        properties: yup.array(),
        saveInReg: yup.boolean().default(false),
        artifactName: yup.string().when('saveInReg', {
            is: false,
            then: () =>
                yup.string().notRequired(),
            otherwise: () =>
                yup.string().required("Artifact Name is required").test('validateArtifactName',
                    'Artifact name already exists', value => {
                        return !artifactNames.includes(value);
                    }),
        }),
        registryPath: yup.string().when('saveInReg', {
            is: false,
            then: () =>
                yup.string().notRequired(),
            otherwise: () =>
                yup.string().test('validateRegistryPath', 'Resource already exists in registry', value => {
                    const formattedPath = formatRegistryPath(value, getValues("registryType"), getValues("name"));
                    return !(registryPaths.includes(formattedPath) || registryPaths.includes(formattedPath + "/"));
                }),
        }),
        registryType: yup.mixed<"gov" | "conf">().oneOf(["gov", "conf"]),
    });

    const {
        reset,
        register,
        formState: { errors, isDirty },
        handleSubmit,
        watch,
        getValues,
        control,
        setValue
    } = useForm({
        defaultValues: initialEndpoint,
        resolver: yupResolver(schema),
        mode: "onChange"
    });

    const [paramConfigs, setParamConfigs] = useState<any>({
        paramValues: [],
        paramFields: [
            { id: 1, type: "TextField", label: "Name", defaultValue: "", isRequired: true },
            { id: 2, type: "TextField", label: "Value", defaultValue: "", isRequired: true },
            { id: 3, type: "Dropdown", label: "Scope", defaultValue: "default", values: ["default", "transport", "axis2", "axis2-client"], isRequired: true },
        ]
    });

    useEffect(() => {
        if (!isNewEndpoint) {
            (async () => {
                const { properties, endpoints, ...endpoint } = await rpcClient.getMiDiagramRpcClient().getRecipientEndpoint({ path: props.path });

                reset(endpoint);
                setSavedEPName(endpoint.name);
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
        }
        (async () => {
            const endpointResponse = await rpcClient.getMiDiagramRpcClient().getAvailableResources({
                documentIdentifier: props.path,
                resourceType: "endpoint",
            });
            let endpointArtifactNamesArr = [];
            if (endpointResponse.resources) {
                const endpointNames = endpointResponse.resources.map((resource) => resource.name);
                endpointArtifactNamesArr.push(...endpointNames);
                const epPaths = endpointResponse.resources.map((resource) => resource.artifactPath.replace(".xml", ""));
                setExistingEndpoints(epPaths);
            }
            if (endpointResponse.registryResources) {
                const registryKeys = endpointResponse.registryResources.map((resource) => resource.name);
                endpointArtifactNamesArr.push(...registryKeys);
            }
            setExistingArtifactNames(endpointArtifactNamesArr);
            const result = await getArtifactNamesAndRegistryPaths(props.path, rpcClient);
            setArtifactNames(result.artifactNamesArr);
            setRegistryPaths(result.registryPaths);
        })();
    }, [props.path]);

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
                        key: param.parameters[0].value,
                        value: param.parameters[1].value ?? '',
                    }
                })
            };
        })

        setValue('properties', config.paramValues.map((param: any) => ({
            name: param.parameters[0].value,
            value: param.parameters[1].value,
            scope: param.parameters[2].value ?? 'default',
        })), { shouldDirty: true });
    }

    const handleUpdateEndpoint = async (values: any) => {
        const updateEndpointParams = {
            directory: props.path,
            ...values,
            getContentOnly: watch("saveInReg") && isNewEndpoint,
            endpoints,
        }
        const result = await rpcClient.getMiDiagramRpcClient().updateRecipientEndpoint(updateEndpointParams);
        if (watch("saveInReg") && isNewEndpoint) {
            await saveToRegistry(rpcClient, props.path, values.registryType, values.name, result.content, values.registryPath, values.artifactName);
        }
        openOverview();
    };

    const openOverview = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const changeType = () => {
        rpcClient.getMiVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.EndPointForm,
                documentUri: props.path,
                customProps: { type: 'endpoint' }
            }
        });
    }

    return (
        <FormView title="Endpoint Artifact" onClose={openOverview}>
            <TypeChip
                type={"Recipient List Endpoint"}
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
            {isNewEndpoint && (<>
                <FormCheckBox
                    label="Save the endpoint in registry"
                    {...register("saveInReg")}
                    control={control}
                />
                {watch("saveInReg") && (<>
                    <AddToRegistry path={props.path} fileName={watch("name")} register={register} errors={errors} getValues={getValues} />
                </>)}
            </>)}
            <FormActions>
                <Button
                    appearance="primary"
                    onClick={handleSubmit(handleUpdateEndpoint)}
                    disabled={!(isDirty || endpointsUpdated)}
                >
                    {isNewEndpoint ? "Create" : "Save Changes"}
                </Button>
                <Button
                    appearance="secondary"
                    onClick={openOverview}
                >
                    Cancel
                </Button>
            </FormActions>
        </FormView>
    );
}
