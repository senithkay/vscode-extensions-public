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

export function TemplateEndpointWizard(props: TemplateEndpointWizardProps) {

    const { rpcClient } = useVisualizerContext();

    const [endpoint, setEndpoint] = useState<any>({
        name: '',
        uri: '',
        template: '',
        description: '',
    });

    const [templates, setTemplates] = useState<any[]>([]);
    const [paramConfigs, setParamConfigs] = useState<any>({
        paramValues: [],
        paramFields: [
            { id: 1, type: "TextField", label: "Name", defaultValue: "", isRequired: true },
            { id: 2, type: "TextField", label: "Value", defaultValue: "", isRequired: true },
        ]
    });

    useEffect(() => {
        (async () => {
            const { parameters, ...endpoint } = await rpcClient.getMiDiagramRpcClient().getTemplateEndpoint({ path: props.path });

            setEndpoint(endpoint);
            
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
    }, []);

    const handleOnChange = (field: string, value: any) => {
        setEndpoint((prev: any) => ({ ...prev, [field]: value }));
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
    }

    const handleUpdateEndpoint = async () => {
        const updateEndpointParams = {
            directory: props.path,
            ...endpoint,
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

    const validateEndpointName = (name: string) => {
        // Check if the name is empty
        if (!name.trim()) {
            return "Enpoint name is required";
        }

        // Check if the name contains spaces or special characters
        if (/[\s~`!@#$%^&*()_+={}[\]:;'",.<>?/\\|]+/.test(name)) {
            return "Endpoint name cannot contain spaces or special characters";
        }
        return "";
    };

    const isValid: boolean = validateEndpointName(endpoint.name) === '' && endpoint.template.length > 0;

    return (
        <FormView title="Template Endpoint Artifact" onClose={openOverview}>
            <FormGroup title="Basic Properties" isCollapsed={false}>
                <TextField
                    id='name-input'
                    label="Name"
                    placeholder="Name"
                    value={endpoint.name}
                    onTextChange={(text: string) => handleOnChange('name', text)}
                    errorMsg={validateEndpointName(endpoint.name)}
                    size={100}
                    autoFocus
                    required
                />
                <TextField
                    id='uri-input'
                    label="Uri"
                    placeholder="Uri"
                    value={endpoint.uri}
                    onTextChange={(text: string) => handleOnChange('uri', text)}
                />
                <FieldGroup>
                    <span>Template</span>
                    <Dropdown
                        id="template"
                        value={endpoint.template}
                        onValueChange={(text: string) => handleOnChange("template", text)}
                        items={templates}
                    />
                </FieldGroup>
                <TextField
                    id='description'
                    value={endpoint.description}
                    label="Description"
                    onTextChange={(text: string) => handleOnChange('description', text)}
                />
                <FieldGroup>
                    <span>Parameters</span>
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
                    onClick={handleUpdateEndpoint}
                    disabled={!isValid}
                >
                    Update
                </Button>
            </FormActions>
        </FormView>
    );
}
