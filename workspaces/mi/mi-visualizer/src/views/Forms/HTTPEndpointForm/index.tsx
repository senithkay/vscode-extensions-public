/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from "react";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { Button, FormView, FormActions, FormCheckBox } from "@wso2-enterprise/ui-toolkit";
import { EVENT_TYPE, MACHINE_VIEW, UpdateHttpEndpointRequest } from "@wso2-enterprise/mi-core";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { initialEndpoint, InputsFields, paramTemplateConfigs, propertiesConfigs, oauthPropertiesConfigs } from "./Types";
import { TypeChip } from "../Commons";
import Form from "./Form";
import AddToRegistry, {formatRegistryPath, getArtifactNamesAndRegistryPaths, saveToRegistry} from "../AddToRegistry";

export interface HttpEndpointWizardProps {
    path: string;
    type: string;
}

export function HttpEndpointWizard(props: HttpEndpointWizardProps) {

    const schema = yup.object({
        endpointName: props.type === 'endpoint' ? yup.string().required("Endpoint Name is required")
                .matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in Endpoint Name")
                .test('validateEndpointName',
                    'Endpoint with same name already exists', value => {
                        return !isNewEndpoint ? !(endpoints.includes(value) && value !== savedEPName) : !endpoints.includes(value);
                    })
                .test('validateEndpointArtifactName',
                    'Endpoint artifact name already exists', value => {
                        return !isNewEndpoint ? !(endpointArtifactNames.includes(value) && value !== savedEPName) : !endpointArtifactNames.includes(value);
                    }) :
            yup.string().required("Endpoint Name is required")
                .matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in Endpoint Name"),
        traceEnabled: yup.string(),
        statisticsEnabled: yup.string(),
        uriTemplate: yup
            .string()
            .required("URI template is required")
            .matches(/^(https?|ftp):\/\/(([a-z\d]([a-z\d-]*[a-z\d])?\.)+[a-z]{2,}|localhost(:[\d]*)?)(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i, "Invalid URI template format"),
        httpMethod: yup.string().required("HTTP method is required"),
        description: yup.string(),
        requireProperties: yup.boolean(),
        properties: yup.array(),
        authType: yup.string(),
        basicAuthUsername: yup.string().when('authType', {
            is: 'Basic Auth',
            then: (schema) => schema.required('Basic Auth Username is required'),
            otherwise: (schema) => schema.notRequired(),
        }),
        basicAuthPassword: yup.string().when('authType', {
            is: 'Basic Auth',
            then: (schema) => schema.required('Basic Auth Password is required'),
            otherwise: (schema) => schema.notRequired(),
        }),
        authMode: yup.string(),
        grantType: yup.string(),
        clientId: yup.string().when('authType', {
            is: 'OAuth',
            then: (schema) => schema.required('Client ID is required'),
            otherwise: (schema) => schema.notRequired(),
        }),
        clientSecret: yup.string().when('authType', {
            is: 'OAuth',
            then: (schema) => schema.required('Client Secret is required'),
            otherwise: (schema) => schema.notRequired(),
        }),
        tokenUrl: yup.string().when('authType', {
            is: 'OAuth',
            then: (schema) => schema.required('Token URL is required'),
            otherwise: (schema) => schema.notRequired(),
        }),
        refreshToken: yup.string().when(['authType', 'grantType'], {
            is: (authType: any, grantType: any) => grantType === 'Authorization Code' && authType === 'OAuth',
            then: (schema) => schema.required('Refresh token is required'),
            otherwise: (schema) => schema.notRequired(),
        }),
        username: yup.string().when('grantType', {
            is: 'Password',
            then: (schema) => schema.required('Username is required'),
            otherwise: (schema) => schema.notRequired(),
        }),
        password: yup.string().when('grantType', {
            is: 'Password',
            then: (schema) => schema.required('Password is required'),
            otherwise: (schema) => schema.notRequired(),
        }),
        requireOauthParameters: yup.boolean(),
        oauthProperties: yup.array(),
        addressingEnabled: yup.string(),
        addressingVersion: yup.string(),
        addressListener: yup.string(),
        securityEnabled: yup.string(),
        suspendErrorCodes: yup.string(),
        initialDuration: yup.number().typeError('Initial Duration must be a number'),
        maximumDuration: yup.number().typeError('Maximum Duration must be a number').min(0, "Maximum Duration must be greater than or equal to 0"),
        progressionFactor: yup.number().typeError('Progression Factor must be a number'),
        retryErrorCodes: yup.string(),
        retryCount: yup.number().typeError('Retry Count must be a number').min(0, "Retry Count must be greater than or equal to 0"),
        retryDelay: yup.number().typeError('Retry Delay must be a number').min(0, "Retry Delay must be greater than or equal to 0"),
        timeoutDuration: yup.number().typeError('Timeout Duration must be a number').min(0, "Timeout Duration must be greater than or equal to 0"),
        timeoutAction: yup.string(),
        templateName: props.type === 'template' ? yup.string().required("Template Name is required")
                .matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in Template Name")
                .test('validateTemplateName',
                    'Template with same name already exists', value => {
                        return !isNewEndpoint ? !(endpoints.includes(value) && value !== savedEPName) : !endpoints.includes(value);
                    })
                .test('validateTemplateArtifactName',
                    'Template artifact name already exists', value => {
                        return !isNewEndpoint ? !(endpointArtifactNames.includes(value) && value !== savedEPName) : !endpointArtifactNames.includes(value);
                    }) :
            yup.string().notRequired().default(""),
        requireTemplateParameters: yup.boolean(),
        templateParameters: yup.array(),
        saveInReg: yup.boolean(),
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
                    const formattedPath = formatRegistryPath(value, getValues("registryType"), getValues("endpointName"));
                    return !(registryPaths.includes(formattedPath) || registryPaths.includes(formattedPath + "/"));
                }),
        }),
        registryType: yup.mixed<"gov" | "conf">().oneOf(["gov", "conf"])
    });

    const {
        reset,
        register,
        formState: { errors, isDirty },
        handleSubmit,
        watch,
        setValue,
        control,
        getValues
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange"
    });

    const { rpcClient } = useVisualizerContext();
    const isNewEndpoint = !props.path.endsWith(".xml");
    const isTemplate = props.type === 'template';
    const [templateParams, setTemplateParams] = useState(paramTemplateConfigs);
    const [additionalParams, setAdditionalParams] = useState(propertiesConfigs);
    const [additionalOauthParams, setAdditionalOauthParams] = useState(oauthPropertiesConfigs);
    const [endpoints, setEndpoints] = useState([]);
    const [endpointArtifactNames, setEndpointArtifactNames] = useState([]);
    const [artifactNames, setArtifactNames] = useState([]);
    const [registryPaths, setRegistryPaths] = useState([]);
    const [savedEPName, setSavedEPName] = useState<string>("");

    useEffect(() => {
        (async () => {
            if (!isNewEndpoint) {
                const existingEndpoint = await rpcClient.getMiDiagramRpcClient().getHttpEndpoint({ path: props.path });
                setTemplateParams((prev: any) => ({
                    paramFields: prev.paramFields,
                    paramValues: existingEndpoint.templateParameters.map((param: any, index: number) => ({
                        id: prev.paramValues.length + index,
                        parameters: [{ id: 0, value: param, label: "Parameter", type: "TextField", }],
                        key: index + 1,
                        value: param,
                    }))
                }));

                setAdditionalParams((prev: any) => ({
                    paramFields: prev.paramFields,
                    paramValues: existingEndpoint.properties.map((param: any, index: number) => ({
                        id: prev.paramValues.length + index,
                        parameters: [
                            { id: 0, value: param.name, label: "Name", type: "TextField" },
                            { id: 1, value: param.value, label: "Value", type: "TextField" },
                            { id: 2, value: param.scope, label: "Scope", type: "Dropdown", values: ["default", "transport", "axis2", "axis2-client"] }
                        ],
                        key: param.name,
                        value: "value:" + param.value + "; scope:" + param.scope + ";",
                    }))
                }));

                setAdditionalOauthParams((prev: any) => ({
                    paramFields: prev.paramFields,
                    paramValues: existingEndpoint.oauthProperties.map((param: any, index: number) => ({
                        id: prev.paramValues.length + index,
                        parameters: [
                            { id: 0, value: param.key, label: "Name", type: "TextField" },
                            { id: 1, value: param.value, label: "Value", type: "TextField" }
                        ],
                        key: param.key,
                        value: param.value,
                    }))
                }));
                reset(existingEndpoint);
                setSavedEPName(isTemplate ? existingEndpoint.templateName : existingEndpoint.endpointName);
                setValue('saveInReg', false);
                setValue('timeoutAction', existingEndpoint.timeoutAction === '' ? 'Never' :
                    existingEndpoint.timeoutAction.charAt(0).toUpperCase() + existingEndpoint.timeoutAction.slice(1)
                );
            } else {
                reset(initialEndpoint);
            }

            if (isTemplate) {
                const endpointTemplateResponse = await rpcClient.getMiDiagramRpcClient().getAvailableResources({
                    documentIdentifier: props.path,
                    resourceType: "endpointTemplate",
                });
                const sequenceTemplateResponse = await rpcClient.getMiDiagramRpcClient().getAvailableResources({
                    documentIdentifier: props.path,
                    resourceType: "sequenceTemplate",
                });
                let templateNames = [];
                let tempArtifactNames = [];
                if (endpointTemplateResponse.resources) {
                    const templateNames = endpointTemplateResponse.resources.map((resource) => resource.name);
                    tempArtifactNames.push(...templateNames);
                    const templatePaths = endpointTemplateResponse.resources.map((resource) => resource.artifactPath.replace(".xml", ""));
                    templateNames.push(...templatePaths);
                }
                if (sequenceTemplateResponse.resources) {
                    const templateNames = sequenceTemplateResponse.resources.map((resource) => resource.name);
                    tempArtifactNames.push(...templateNames);
                    const templatePaths = sequenceTemplateResponse.resources.map((resource) => resource.artifactPath.replace(".xml", ""));
                    templateNames.push(...templatePaths);
                }
                if (endpointTemplateResponse.registryResources) {
                    const registryKeys = endpointTemplateResponse.registryResources.map((resource) => resource.registryKey);
                    templateNames.push(...registryKeys);
                }
                if (sequenceTemplateResponse.registryResources) {
                    const registryKeys = sequenceTemplateResponse.registryResources.map((resource) => resource.registryKey);
                    templateNames.push(...registryKeys);
                }
                setEndpoints(templateNames);
                setEndpointArtifactNames(tempArtifactNames);
            } else {
                const response = await rpcClient.getMiDiagramRpcClient().getAvailableResources({
                    documentIdentifier: props.path,
                    resourceType: "endpoint",
                });
                let endpointNamesArr = [];
                if (response.resources) {
                    const endpointNames = response.resources.map((resource) => resource.name);
                    setEndpointArtifactNames(endpointNames);
                    const endpointPaths = response.resources.map((resource) => resource.artifactPath.replace(".xml", ""));
                    endpointNamesArr.push(...endpointPaths);
                }
                if (response.registryResources) {
                    const registryKeys = response.registryResources.map((resource) => resource.registryKey);
                    endpointNamesArr.push(...registryKeys);
                }
                setEndpoints(endpointNamesArr);
            }
            const result = await getArtifactNamesAndRegistryPaths(props.path, rpcClient);
            setArtifactNames(result.artifactNamesArr);
            setRegistryPaths(result.registryPaths);
        })();
    }, [props.path]);

    const handleUpdateHttpEndpoint = async (values: any) => {
        const updateHttpEndpointParams: UpdateHttpEndpointRequest = {
            directory: props.path,
            getContentOnly: watch("saveInReg"),
            ...values,
        }

        const result = await rpcClient.getMiDiagramRpcClient().updateHttpEndpoint(updateHttpEndpointParams);
        if (watch("saveInReg")) {
            await saveToRegistry(rpcClient, props.path, values.registryType,
                isTemplate ? values.templateName : values.endpointName,
                result.content, values.registryPath, values.artifactName);
        }
        openOverview();
    };

    const renderProps = (fieldName: keyof InputsFields) => {
        return {
            id: fieldName,
            ...register(fieldName),
            errorMsg: errors[fieldName] && errors[fieldName].message.toString()
        }
    };

    const changeType = () => {
        rpcClient.getMiVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: isTemplate ? MACHINE_VIEW.TemplateForm : MACHINE_VIEW.EndPointForm,
                documentUri: props.path,
                customProps: { type: isTemplate ? 'template' : 'endpoint' }
            }
        });
    }

    const openOverview = () => {
        rpcClient.getMiVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: { view: MACHINE_VIEW.Overview }
        });
    };

    return (
        <FormView
            title={isTemplate ? 'Template Artifact' : 'Endpoint Artifact'}
            onClose={openOverview}
        >
            <TypeChip 
                type={isTemplate ? "HTTP Endpoint Template" : "HTTP Endpoint"} 
                onClick={changeType} 
                showButton={isNewEndpoint} 
            />
            <Form
                renderProps={renderProps}
                register={register}
                watch={watch}
                setValue={setValue}
                isTemplate={isTemplate}
                templateParams={templateParams}
                setTemplateParams={setTemplateParams}
                additionalParams={additionalParams}
                setAdditionalParams={setAdditionalParams}
                additionalOauthParams={additionalOauthParams}
                setAdditionalOauthParams={setAdditionalOauthParams}
            />
            {isNewEndpoint && (
                <>
                    <FormCheckBox
                        label="Save the sequence in registry"
                        {...register("saveInReg")}
                        control={control}
                    />
                    {watch("saveInReg") && (<>
                        <AddToRegistry path={props.path}
                                       fileName={isTemplate ? watch("templateName") : watch("endpointName")}
                                       register={register} errors={errors} getValues={getValues} />
                    </>)}
                </>
            )}
            <FormActions>
                <Button
                    appearance="primary"
                    onClick={handleSubmit(handleUpdateHttpEndpoint)}
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
