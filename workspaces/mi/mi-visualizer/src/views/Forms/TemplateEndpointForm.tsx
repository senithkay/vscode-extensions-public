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
import { Button, Dropdown, TextField, FormView, FormGroup, FormActions, ParamManager, FormCheckBox, FormAutoComplete } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { TypeChip } from "./Commons";
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

export interface TemplateEndpointWizardProps {
    path: string;
}

type InputsFields = {
    name?: string;
    uri?: string;
    template?: string;
    description?: string;
    endpoints?: any[];
    parameters?: any[];
    //reg form
    saveInReg?: boolean;
    artifactName?: string;
    registryPath?: string
    registryType?: "gov" | "conf";
};

const initialEndpoint: InputsFields = {
    name: '',
    uri: '',
    template: '',
    description: '',
    endpoints: [],
    parameters: [],
    //reg form
    saveInReg: false,
    artifactName: "",
    registryPath: "/",
    registryType: "gov"
};

export function TemplateEndpointWizard(props: TemplateEndpointWizardProps) {

    const { rpcClient } = useVisualizerContext();
    const isNewEndpoint = !props.path.endsWith(".xml");
    const [templates, setTemplates] = useState<string[]>([]);
    const [paramConfigs, setParamConfigs] = useState<any>({
        paramValues: [],
        paramFields: [
            { id: 1, type: "TextField", label: "Name", defaultValue: "", isRequired: true },
            { id: 2, type: "TextField", label: "Value", defaultValue: "", isRequired: true },
        ]
    });
    const [existingEndpoints, setExistingEndpoints] = useState<string[]>([]);
    const [existingArtifactNames, setExistingArtifactNames] = useState<string[]>([]);
    const [artifactNames, setArtifactNames] = useState([]);
    const [registryPaths, setRegistryPaths] = useState([]);
    const [savedEPName, setSavedEPName] = useState<string>("");

    const schema = yup.object({
        name: yup.string().required("Endpoint name is required").matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in Endpoint name")
            .test('validateEndpointName',
                'Endpoint file name already exists', value => {
                    return !isNewEndpoint ? !(existingEndpoints.includes(value) && value !== savedEPName) : !existingEndpoints.includes(value);
                }).test('validateEndpointName',
                    'Endpoint artifact name already exists', value => {
                        return !isNewEndpoint ? !(existingArtifactNames.includes(value) && value !== savedEPName) : !existingArtifactNames.includes(value);
                    }),
        uri: yup.string(),
        template: yup.string().required("Template is required"),
        description: yup.string(),
        endpoints: yup.array(),
        parameters: yup.array(),
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



    useEffect(() => {
        if (!isNewEndpoint) {
            (async () => {
                const { parameters, ...endpoint } = await rpcClient.getMiDiagramRpcClient().getTemplateEndpoint({ path: props.path });
                reset(endpoint);
                setSavedEPName(endpoint.name);
                setParamConfigs((prev: any) => {
                    return {
                        ...prev,
                        paramValues: parameters.map((property: any, index: Number) => {
                            return {
                                id: prev.paramValues.length + index,
                                parameters: [
                                    { id: 0, label: 'Name', type: 'TextField', value: property.name, isRequired: true },
                                    { id: 1, label: 'Value', type: 'TextField', value: property.value, isRequired: true },
                                ],
                                key: property.name,
                                value: property.value,
                            }
                        })
                    };
                });
            })();
        }
        (async () => {
            const endpointResponse = await rpcClient.getMiDiagramRpcClient().getAvailableResources({
                documentIdentifier: props.path,
                resourceType: "endpoint",
            });
            let endpointNamesArr = [];
            if (endpointResponse.resources) {
                const endpointNames = endpointResponse.resources.map((resource) => resource.name);
                setExistingArtifactNames(endpointNames);
                const epPaths = endpointResponse.resources.map((resource) => resource.artifactPath.replace(".xml", ""));
                endpointNamesArr.push(...epPaths);
            }
            if (endpointResponse.registryResources) {
                const registryKeys = endpointResponse.registryResources.map((resource) => resource.registryKey);
                endpointNamesArr.push(...registryKeys);
            }
            setExistingEndpoints(endpointNamesArr);
            const result = await getArtifactNamesAndRegistryPaths(props.path, rpcClient);
            setArtifactNames(result.artifactNamesArr);
            setRegistryPaths(result.registryPaths);
            let templates = [];
            const response = await rpcClient.getMiDiagramRpcClient().getAvailableResources({
                documentIdentifier: props.path,
                resourceType: "endpointTemplate",
            });
            if (response.resources) {
                const endpointNames = response.resources.map((resource) => resource.name);
                templates.push(...endpointNames);
            }
            if (response.registryResources) {
                const registryKeys = response.registryResources.map((resource) => resource.registryKey);
                templates.push(...registryKeys);
            }
            setTemplates(templates);
        })();
    }, [props.path]);

    const renderProps = (fieldName: keyof InputsFields) => {
        return {
            id: fieldName,
            ...register(fieldName),
            errorMsg: errors[fieldName] && errors[fieldName].message.toString()
        }
    };

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

        setValue('parameters', config.paramValues.map((param: any) => ({
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
        }
        const result = await rpcClient.getMiDiagramRpcClient().updateTemplateEndpoint(updateEndpointParams);
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
                type={"Template Endpoint"}
                onClick={changeType}
                showButton={isNewEndpoint}
            />
            <FormGroup title="Basic Properties" isCollapsed={false}>
                <TextField
                    required
                    autoFocus
                    label="Name"
                    placeholder="Name"
                    {...renderProps("name")}
                    size={100}
                />
                <TextField
                    label="Uri"
                    placeholder="Uri"
                    {...renderProps("uri")}
                />
                <FormAutoComplete
                    label="Template"
                    required={false}
                    isNullable={true}
                    items={templates}
                    control={control}
                    {...renderProps("template")}
                />
                <TextField
                    label="Description"
                    {...renderProps("description")}
                />
                <FieldGroup>
                    <span>Parameters</span>
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
                    disabled={!isDirty}
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
