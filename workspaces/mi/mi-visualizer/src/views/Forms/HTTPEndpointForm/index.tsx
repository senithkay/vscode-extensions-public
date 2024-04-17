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
import { Button, FormView, FormActions } from "@wso2-enterprise/ui-toolkit";
import { EVENT_TYPE, MACHINE_VIEW, UpdateHttpEndpointRequest } from "@wso2-enterprise/mi-core";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup"
import { initialEndpoint, InputsFields, getSchema, paramTemplateConfigs, propertiesConfigs, oauthPropertiesConfigs } from "./Types";
import { TypeChip } from "../Commons";
import Form from "./Form";

export interface HttpEndpointWizardProps {
    path: string;
    type: string;
}

export function HttpEndpointWizard(props: HttpEndpointWizardProps) {

    const { rpcClient } = useVisualizerContext();

    const isNewEndpoint = !props.path.endsWith(".xml");
    const isTemplate = props.type === 'template';

    const {
        reset,
        register,
        formState: { errors, isDirty },
        handleSubmit,
        watch,
        setValue
    } = useForm({
        resolver: yupResolver(getSchema(props.type)),
        mode: "onChange"
    });

    const [templateParams, setTemplateParams] = useState(paramTemplateConfigs);
    const [additionalParams, setAdditionalParams] = useState(propertiesConfigs);
    const [additionalOauthParams, setAdditionalOauthParams] = useState(oauthPropertiesConfigs);

    useEffect(() => {
        if (!isNewEndpoint) {
            (async () => {
                const existingEndpoint = await rpcClient.getMiDiagramRpcClient().getHttpEndpoint({ path: props.path });
                reset(existingEndpoint);

                setValue('timeoutAction', existingEndpoint.timeoutAction === ''
                    ? 'Never'
                    : existingEndpoint.timeoutAction.charAt(0).toUpperCase() + existingEndpoint.timeoutAction.slice(1)
                );

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
            })();
        } else {
            reset(initialEndpoint);
        }
    }, [props.path]);

    const handleUpdateHttpEndpoint = async (values: any) => {
        const updateHttpEndpointParams: UpdateHttpEndpointRequest = {
            directory: props.path,
            ...values,
        }
        await rpcClient.getMiDiagramRpcClient().updateHttpEndpoint(updateHttpEndpointParams);
        openOverview();
    };

    const renderProps = (fieldName: keyof InputsFields) => {
        return {
            id: fieldName,
            ...register(fieldName),
            errorMsg: errors[fieldName] && errors[fieldName].message.toString()
        }
    };

    const openOverview = () => {
        rpcClient.getMiVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: { view: MACHINE_VIEW.Overview }
        });
    };

    const handleOnClose = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
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

    return (
        <FormView
            title={isTemplate ? 'Template Artifact' : 'Endpoint Artifact'}
            onClose={handleOnClose}
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
