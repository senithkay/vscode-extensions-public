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

export interface TemplateWizardProps {
    path: string;
    type: string;
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
                'Template with same name already exists', value => {
                    return !isNewTemplate ? !(templates.includes(value) && value !== savedTemplateName) : !templates.includes(value);
                })
            .test('validateTemplateArtifactName',
                'Template artifact name already exists', value => {
                    return !isNewTemplate ? !(templateArtifactNames.includes(value) && value !== savedTemplateName) : !templateArtifactNames.includes(value);
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
                    const formattedPath = formatRegistryPath(value, getValues("registryType"), getValues("templateName"));
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
    const [templates, setTemplates] = useState([]);
    const [templateArtifactNames, setTemplateArtifactNames] = useState([]);
    const [artifactNames, setArtifactNames] = useState([]);
    const [registryPaths, setRegistryPaths] = useState([]);
    const isNewTemplate = !props.path.endsWith(".xml");
    const [savedTemplateName, setSavedTemplateName] = useState<string>("");

    useEffect(() => {
        (async () => {

            if (!isNewTemplate) {
                const existingTemplates = await rpcClient.getMiDiagramRpcClient().getTemplate({path: props.path});
                reset(existingTemplates);
                setSavedTemplateName(existingTemplates.templateName);
                setValue('saveInReg', false);
            } else {
                reset(newTemplate);
            }

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
            setTemplates(templateNames);
            setTemplateArtifactNames(tempArtifactNames);

            const result = await getArtifactNamesAndRegistryPaths(props.path, rpcClient);
            setArtifactNames(result.artifactNamesArr);
            setRegistryPaths(result.registryPaths);
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

    const handleCreateTemplate = async (values: any) => {

        setValue('templateType', 'Sequence Template');
        const createTemplateParams: CreateTemplateRequest = {
            directory: props.path,
            getContentOnly: watch("saveInReg"),
            ...values
        }

        const result = await rpcClient.getMiDiagramRpcClient().createTemplate(createTemplateParams);
        if (watch("saveInReg")) {
            await saveToRegistry(rpcClient, props.path, values.registryType, values.templateName, result.content, values.registryPath, values.artifactName);
        }
        handleCancel();
    };

    const handleCancel = () => {
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
                        disabled={!isDirty}
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
