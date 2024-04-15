/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, {useState} from "react";
import {Button, TextField, FormView, FormActions} from "@wso2-enterprise/ui-toolkit";
import {useVisualizerContext} from "@wso2-enterprise/mi-rpc-client";
import {EVENT_TYPE, MACHINE_VIEW, CreateTemplateRequest} from "@wso2-enterprise/mi-core";
import CardWrapper from "./Commons/CardWrapper";
import {TypeChip} from "./Commons";
import {useForm} from "react-hook-form";
import * as yup from "yup";
import {yupResolver} from "@hookform/resolvers/yup";

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
}

export function TemplateWizard(props: TemplateWizardProps) {

    const {rpcClient} = useVisualizerContext();
    const [templateType, setTemplateType] = useState("");

    const schema = yup.object({
        templateName: yup.string().required("Template Name is required").matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in Template Name"),
        templateType: yup.string().default(""),
        address: yup.string().notRequired().default(""),
        uriTemplate: yup.string().notRequired().default(""),
        httpMethod: yup.string().notRequired().default("GET"),
        wsdlUri: yup.string().notRequired().default(""),
        wsdlService: yup.string().notRequired().default(""),
        wsdlPort: yup.number().notRequired().default(8080)
    });

    const {
        register,
        formState: {errors, isDirty},
        handleSubmit,
        setValue,
    } = useForm({
        defaultValues: newTemplate,
        resolver: yupResolver(schema),
        mode: "onChange"
    });

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
            ...values
        }
        await rpcClient.getMiDiagramRpcClient().createTemplate(createTemplateParams);

        rpcClient.getMiVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {view: MACHINE_VIEW.Overview}
        });
    };

    const handleCancel = () => {
        rpcClient.getMiVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {view: MACHINE_VIEW.Overview}
        });
    };

    return (
        <FormView title="Template Artifact" onClose={handleCancel}>
            {templateType === '' ? <CardWrapper cardsType="TEMPLATE" setType={setEndpointType}/> : <>
                <TypeChip type="Sequence Template" onClick={setTemplateType} showButton={true}/>
                <TextField
                    placeholder="Name"
                    label="Template Name"
                    autoFocus
                    required
                    id="templateName"
                    errorMsg={errors.templateName?.message.toString()}
                    {...register("templateName")}
                />
                <FormActions>
                    <Button
                        appearance="primary"
                        onClick={handleSubmit(handleCreateTemplate)}
                        disabled={!isDirty}
                    >
                        Create
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
