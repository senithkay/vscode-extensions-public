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
import { Button, Dropdown, TextField, FormView, FormGroup, FormActions, ParamManager } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup";
import { useForm } from "react-hook-form";
import CardWrapper from "../Commons/CardWrapper";
import { TypeChangeButton } from "../Commons";

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
};

const initialEndpoint: InputsFields = {
    name: '',
    uri: '',
    template: '',
    description: '',
};

const schema = yup.object({
    name: yup.string().required("Endpoint Name is required").matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in Endpoint name"),
    uri: yup.string(),
    template: yup.string().required("Template is required"),
    description: yup.string(),
});

export function TemplateEndpointWizard(props: TemplateEndpointWizardProps) {

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

    const [showCards, setShowCards] = useState(false);
    const [isNewEndpoint, setIsNewEndpoint] = useState(!props.path.endsWith(".xml"));
    const [templates, setTemplates] = useState<any[]>([]);
    const [paramConfigs, setParamConfigs] = useState<any>({
        paramValues: [],
        paramFields: [
            { id: 1, type: "TextField", label: "Name", defaultValue: "", isRequired: true },
            { id: 2, type: "TextField", label: "Value", defaultValue: "", isRequired: true },
        ]
    });

    useEffect(() => {
        if (!isNewEndpoint) {
            (async () => {
                const { parameters, ...endpoint } = await rpcClient.getMiDiagramRpcClient().getTemplateEndpoint({ path: props.path });

                reset(endpoint);

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

                const items = await rpcClient.getMiDiagramRpcClient().getTemplates();
                const templates = items.data.map((temp: string) => {
                    temp = temp.replace(".xml", "");
                    return { value: temp }
                });
                setTemplates(templates);
            })();
        }
    }, []);

    const renderProps = (fieldName: keyof InputsFields, value?: any) => {
        const watchedValue = watch(fieldName) ? String(watch(fieldName)) : '';
        return {
            id: fieldName,
            value: value !== undefined ? String(value) : watchedValue,
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
    }

    const setEndpointType = (type: string) => {
        if (type.includes('HTTP')) {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.HttpEndpointForm,
                    documentUri: props.path,
                    customProps: { type: 'endpoint' }
                }
            });
        } else if (type.includes('WSDL Endpoint')) {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.WsdlEndpointForm,
                    documentUri: props.path,
                    customProps: { type: 'endpoint' }
                }
            });
        } else if (type.includes('Address')) {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.AddressEndpointForm,
                    documentUri: props.path,
                    customProps: { type: 'endpoint' }
                }
            });
        } else if (type.includes('Default')) {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.DefaultEndpointForm,
                    documentUri: props.path,
                    customProps: { type: 'endpoint' }
                }
            });
        } else if (type.includes('Failover')) {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.FailoverEndPointForm,
                    documentUri: props.path
                }
            });
        } else if (type.includes('Load Balance')) {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.LoadBalanceEndPointForm,
                    documentUri: props.path
                }
            });
        } else if (type.includes('Recipient List')) {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.RecipientEndPointForm,
                    documentUri: props.path,
                }
            });
        } else if (type.includes('Template')) {
            setShowCards(false);
        } else {
            setShowCards(true);
        }
    };

    const handleUpdateEndpoint = async (values: any) => {
        const updateEndpointParams = {
            directory: props.path,
            ...values,
            parameters: paramConfigs.paramValues.map((param: any) => {
                return {
                    name: param.key,
                    value: param.value,
                }
            })
        }
        rpcClient.getMiDiagramRpcClient().updateTemplateEndpoint(updateEndpointParams);
        openOverview();
    };

    const openOverview = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    return (
        <FormView title="Endpoint Artifact" onClose={openOverview}>
            {showCards ? <CardWrapper cardsType='ENDPOINT' setType={setEndpointType} /> : <>
                {isNewEndpoint && <TypeChangeButton type={"Template Endpoint"} onClick={setEndpointType} />}
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
                    <Dropdown
                        label="Template"
                        items={templates}
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
                <FormActions>
                    <Button
                        appearance="primary"
                        onClick={handleUpdateEndpoint}
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
            </>}
        </FormView>
    );
}
