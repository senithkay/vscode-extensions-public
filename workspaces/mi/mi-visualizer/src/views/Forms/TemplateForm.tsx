/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, {useEffect, useState} from "react";
import {Button, TextField, FormView, FormActions, FormCheckBox} from "@wso2-enterprise/ui-toolkit";
import {useVisualizerContext} from "@wso2-enterprise/mi-rpc-client";
import {EVENT_TYPE, MACHINE_VIEW, CreateTemplateRequest} from "@wso2-enterprise/mi-core";
import CardWrapper from "./Commons/CardWrapper";
import {TypeChip} from "./Commons";
import {useForm} from "react-hook-form";
import * as yup from "yup";
import {yupResolver} from "@hookform/resolvers/yup";
import AddToRegistry, {getArtifactNamesAndRegistryPaths, formatRegistryPath, saveToRegistry} from "./AddToRegistry";
import { ParamConfig, ParamManager } from "@wso2-enterprise/mi-diagram";

export interface TemplateWizardProps {
    path: string;
    type: string;
    onCancel?: () => void;
}

type InputsFields = {
    templateName?: string;
    templateType?: string;
    address?: string;
    uriTemplate?: string;
    httpMethod?: string;
    wsdlUri?: string;
    wsdlService?: string;
    wsdlPort?: number;
    traceEnabled?: boolean;
    statisticsEnabled?: boolean;
    saveInReg?: boolean;
    //reg form
    artifactName?: string;
    registryPath?: string
    registryType?: "gov" | "conf";
};

const newTemplate: InputsFields = {
    templateName: "",
    templateType: "",
    address: "",
    uriTemplate: "",
    httpMethod: "GET",
    wsdlUri: "",
    wsdlService: "",
    wsdlPort: 8080,
    traceEnabled: false,
    statisticsEnabled: false,
    saveInReg: false,
    //reg form
    artifactName: "",
    registryPath: "/",
    registryType: "gov"
}

export function TemplateWizard(props: TemplateWizardProps) {

    const schema = yup.object({
        templateName: yup.string().required("Template Name is required")
            .matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in Template Name")
            .test('validateTemplateName',
                'An artifact with same name already exists', value => {
                    return !isNewTemplate ? !(workspaceFileNames.includes(value) && value !== savedTemplateName) : !workspaceFileNames.includes(value);
                })
            .test('validateTemplateArtifactName',
                'A registry resource with this artifact name already exists', value => {
                    return !isNewTemplate ? !(artifactNames.includes(value) && value !== savedTemplateName) : !artifactNames.includes(value);
                }),
        templateType: yup.string().default(""),
        address: yup.string().notRequired().default(""),
        uriTemplate: yup.string().notRequired().default(""),
        httpMethod: yup.string().notRequired().default("GET"),
        wsdlUri: yup.string().notRequired().default(""),
        wsdlService: yup.string().notRequired().default(""),
        wsdlPort: yup.number().notRequired().default(8080),
        traceEnabled: yup.boolean().default(false),
        statisticsEnabled: yup.boolean().default(false),
        saveInReg: yup.boolean().default(false),
        artifactName: yup.string().when('saveInReg', {
            is: false,
            then: () =>
                yup.string().notRequired(),
            otherwise: () =>
                yup.string().required("Artifact Name is required")
                    .test('validateArtifactName',
                        'Artifact name already exists', value => {
                            return !artifactNames.includes(value);
                        })
                    .test('validateFileName',
                        'A file already exists in the workspace with this artifact name', value => {
                            return !workspaceFileNames.includes(value);
                        }),
        }),
        registryPath: yup.string().when('saveInReg', {
            is: false,
            then: () =>
                yup.string().notRequired(),
            otherwise: () =>
                yup.string().test('validateRegistryPath', 'Resource already exists in registry', value => {
                    const formattedPath = formatRegistryPath(value, getValues("registryType"), getValues("templateName"));
                    if (formattedPath === undefined) return true;
                    return !(registryPaths.includes(formattedPath) || registryPaths.includes(formattedPath + "/"));
                }),
        }),
        registryType: yup.mixed<"gov" | "conf">().oneOf(["gov", "conf"]),
    });

    const {
        register,
        formState: {errors, isDirty},
        handleSubmit,
        setValue,
        getValues,
        watch,
        control,
        reset
    } = useForm({
        defaultValues: newTemplate,
        resolver: yupResolver(schema),
        mode: "onChange"
    });

    const {rpcClient} = useVisualizerContext();
    const [templateType, setTemplateType] = useState("");
    const [artifactNames, setArtifactNames] = useState([]);
    const [registryPaths, setRegistryPaths] = useState([]);
    const isNewTemplate = !props.path.endsWith(".xml");
    const [savedTemplateName, setSavedTemplateName] = useState<string>("");
    const [workspaceFileNames, setWorkspaceFileNames] = useState([]);
    const [paramsUpdated, setParamsUpdated] = useState(false);

    const params: ParamConfig = {
        paramValues: [],
        paramFields: [
            {
                id: 0,
                type: "TextField",
                label: "Parameter",
                defaultValue: "parameter_value",
                isRequired: true
            },
            {
                id: 1,
                type: "Checkbox",
                label: "Is Mandatory",
                isRequired: false
            },
            {
                id: 2,
                type: "TextField",
                label: "Default Value",
                isRequired: false
            }]
    }
    const [sequenceParams, setSequenceParams] = useState(params);

    useEffect(() => {
        (async () => {

            if (!isNewTemplate) {
                const existingTemplates = await rpcClient.getMiDiagramRpcClient().getTemplate({path: props.path});
                params.paramValues = [];
                setSequenceParams(params);
                let i = 1;
                existingTemplates.parameters.map((param: any) => {
                    setSequenceParams((prev: any) => {
                        return {
                            ...prev,
                            paramValues: [...prev.paramValues, {
                                id: prev.paramValues.length,
                                paramValues: [
                                    { value: param.name },
                                    { value: param.isMandatory === "true" ?? undefined },
                                    { value: param.default }
                                ],
                                key: i++,
                                value: param.name,
                            }
                            ]
                        }
                    });
                });
                reset(existingTemplates);
                setSavedTemplateName(existingTemplates.templateName);
                setValue('saveInReg', false);
            } else {
                params.paramValues = [];
                setSequenceParams(params);
                reset(newTemplate);
            }

            const result = await getArtifactNamesAndRegistryPaths(props.path, rpcClient);
            setArtifactNames(result.artifactNamesArr);
            setRegistryPaths(result.registryPaths);
            const artifactRes = await rpcClient.getMiDiagramRpcClient().getAllArtifacts({
                path: props.path,
            });
            setWorkspaceFileNames(artifactRes.artifacts);
        })();
    }, [props.path]);

    const setEndpointType = (type: string) => {

        if (type === 'Sequence Template') {
            setTemplateType(type);
        } else {
            const endpointMappings: { [key: string]: MACHINE_VIEW } = {
                'HTTP Endpoint Template': MACHINE_VIEW.HttpEndpointForm,
                'WSDL Endpoint Template': MACHINE_VIEW.WsdlEndpointForm,
                'Address Endpoint Template': MACHINE_VIEW.AddressEndpointForm,
                'Default Endpoint Template': MACHINE_VIEW.DefaultEndpointForm,
            };

            const view = endpointMappings[type];
            if (view) {
                rpcClient.getMiVisualizerRpcClient().openView({
                    type: EVENT_TYPE.OPEN_VIEW,
                    location: {
                        view,
                        documentUri: props.path,
                        customProps: {type: 'template'}
                    }
                });
            }
        }
    };

    const handleParametersChange = (params: any) => {
        let i = 1;
        const modifiedParams = {
            ...params, paramValues: params.paramValues.map((param: any) => {
                return {
                    ...param,
                    key: i++,
                    value: param.paramValues[0].value
                }
            })
        };
        setSequenceParams(modifiedParams);
        setParamsUpdated(true);
    };

    const handleCreateTemplate = async (values: any) => {

        let parameters: any = [];
        sequenceParams.paramValues.map((param: any) => {
            parameters.push({
                name: param.paramValues[0].value,
                isMandatory: param.paramValues[1].value ?? "false",
                default: param.paramValues[2].value
            });
        })

        setValue('templateType', 'Sequence Template');
        const createTemplateParams: CreateTemplateRequest = {
            directory: props.path,
            getContentOnly: watch("saveInReg"),
            ...values,
            parameters
        }

        const result = await rpcClient.getMiDiagramRpcClient().createTemplate(createTemplateParams);
        if (watch("saveInReg")) {
            await saveToRegistry(rpcClient, props.path, values.registryType, values.templateName, result.content, values.registryPath, values.artifactName);
        }
        handleCancel();
    };

    const handleCancel = () => {
        if (props.onCancel) {
            return props.onCancel();
        }
        rpcClient.getMiVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {view: MACHINE_VIEW.Overview}
        });
    };

    return (
        <FormView title="Template Artifact" onClose={handleCancel}>
            {templateType === '' && isNewTemplate ? <CardWrapper cardsType="TEMPLATE" setType={setEndpointType}/> : <>
                <TypeChip type="Sequence Template" onClick={setTemplateType} showButton={isNewTemplate}/>
                <TextField
                    placeholder="Name"
                    label="Template Name"
                    autoFocus
                    required
                    id="templateName"
                    errorMsg={errors.templateName?.message.toString()}
                    {...register("templateName")}
                />
                <FormCheckBox
                    label="Trace Enabled"
                    {...register("traceEnabled")}
                    control={control}
                />
                <FormCheckBox
                    label="Statistics Enabled"
                    {...register("statisticsEnabled")}
                    control={control}
                />
                <span>Parameters</span>
                <ParamManager
                    paramConfigs={sequenceParams}
                    readonly={false}
                    onChange={handleParametersChange}/>
                {isNewTemplate && (
                    <>
                        <FormCheckBox
                            label="Save the sequence in registry"
                            {...register("saveInReg")}
                            control={control}
                        />
                        {watch("saveInReg") && (<>
                            <AddToRegistry path={props.path} fileName={watch("templateName")} register={register} errors={errors} getValues={getValues} />
                        </>)}
                    </>
                )}
                <FormActions>
                    <Button
                        appearance="primary"
                        onClick={handleSubmit(handleCreateTemplate)}
                        disabled={!(isDirty || paramsUpdated)}
                    >
                        {isNewTemplate ? "Create" : "Save Changes"}
                    </Button>
                    <Button
                        appearance="secondary"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                </FormActions>
            </>}
        </FormView>
    );
}
