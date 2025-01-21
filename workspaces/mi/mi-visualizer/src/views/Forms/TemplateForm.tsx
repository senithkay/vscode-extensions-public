/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { useEffect, useState } from "react";
import { Button, TextField, FormView, FormActions, FormCheckBox } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { EVENT_TYPE, MACHINE_VIEW, CreateTemplateRequest, POPUP_EVENT_TYPE } from "@wso2-enterprise/mi-core";
import CardWrapper from "./Commons/CardWrapper";
import { TypeChip } from "./Commons";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import AddToRegistry, { getArtifactNamesAndRegistryPaths, formatRegistryPath, saveToRegistry } from "./AddToRegistry";
import { ParamConfig, ParamManager } from "@wso2-enterprise/mi-diagram";
import { AddressEndpointWizard } from "./AddressEndpointForm";
import { DefaultEndpointWizard } from "./DefaultEndpointForm";
import { HttpEndpointWizard } from "./HTTPEndpointForm";
import { WsdlEndpointWizard } from "./WSDLEndpointForm";

export interface TemplateWizardProps {
    path: string;
    type?: string;
    isPopup?: boolean;
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
}

export function TemplateWizard(props: TemplateWizardProps) {

    const schema = yup.object({
        templateName: yup.string().required("Template Name is required")
            .matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in Template Name")
            .test('validateTemplateName',
                'An artifact with same name already exists', value => {
                    return !isNewTemplate ? !(workspaceFileNames.includes(value) && value !== savedTemplateName) : !workspaceFileNames.includes(value);
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
    });

    const {
        register,
        formState: { errors, isDirty },
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

    const { rpcClient } = useVisualizerContext();
    const isNewTemplate = !props.path.endsWith(".xml");
    const [savedTemplateName, setSavedTemplateName] = useState<string>("");
    const [workspaceFileNames, setWorkspaceFileNames] = useState([]);
    const [paramsUpdated, setParamsUpdated] = useState(false);
    const [prevName, setPrevName] = useState<string | null>(null);
    const [endpointType, setEndpointType] = useState<string>(props.type);

    const params: ParamConfig = {
        paramValues: [],
        paramFields: [
            {
                id: 0,
                type: "TextField",
                label: "Parameter",
                placeholder: "parameter_value",
                defaultValue: "",
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
                const existingTemplates = await rpcClient.getMiDiagramRpcClient().getTemplate({ path: props.path });
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
            } else {
                params.paramValues = [];
                setSequenceParams(params);
                reset(newTemplate);
            }

            const artifactRes = await rpcClient.getMiDiagramRpcClient().getAllArtifacts({
                path: props.path,
            });
            setWorkspaceFileNames(artifactRes.artifacts);
        })();
    }, [props.path]);

    useEffect(() => {
        setPrevName(watch("templateName"));
    }, [watch("templateName")]);

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
            getContentOnly: false,
            ...values,
            parameters
        }

        await rpcClient.getMiDiagramRpcClient().createTemplate(createTemplateParams);

        if (props.isPopup) {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: POPUP_EVENT_TYPE.CLOSE_VIEW,
                location: { view: null, recentIdentifier: getValues("templateName") },
                isPopup: true
            });
        }
        handleCancel();
    };

    const handleCancel = () => {
        if (props.onCancel) {
            return props.onCancel();
        }
        rpcClient.getMiVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: { view: MACHINE_VIEW.Overview }
        });
    };

    const clearEndpointType = () => {
        setEndpointType("");
    }

    if (isNewTemplate && !endpointType) {
        return (
            <FormView title="Template" onClose={handleCancel}>
                <CardWrapper cardsType="TEMPLATE" setType={setEndpointType} />
            </FormView>
        );
    }

    switch (endpointType) {
        case 'Address Endpoint Template':
            return <AddressEndpointWizard path={props.path} type="template" isPopup={true} handleChangeType={clearEndpointType} handlePopupClose={handleCancel} />;
        case 'Default Endpoint Template':
            return <DefaultEndpointWizard path={props.path} type="template" isPopup={true} handleChangeType={clearEndpointType} handlePopupClose={handleCancel} />;
        case 'HTTP Endpoint Template':
            return <HttpEndpointWizard path={props.path} type="template" isPopup={true} handleChangeType={clearEndpointType} handlePopupClose={handleCancel} />;
        case 'WSDL Endpoint Template':
            return <WsdlEndpointWizard path={props.path} type="template" isPopup={true} handleChangeType={clearEndpointType} handlePopupClose={handleCancel} />;
        case 'Sequence Template':
            return (
                <FormView title="Template" onClose={handleCancel}>
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
                        onChange={handleParametersChange} />
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
                </FormView>
            );
    }

}
