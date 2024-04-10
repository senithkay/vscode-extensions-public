/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, {useEffect, useState} from "react";
import {Button, TextField, FormView, FormActions} from "@wso2-enterprise/ui-toolkit";
import {useVisualizerContext} from "@wso2-enterprise/mi-rpc-client";
import {EVENT_TYPE, MACHINE_VIEW, CreateTemplateRequest} from "@wso2-enterprise/mi-core";
import CardWrapper from "./Commons/CardWrapper";
import {TypeChip} from "./Commons";

export interface TemplateWizardProps {
    path: string;
    type: string;
}

export function TemplateWizard(props: TemplateWizardProps) {

    const {rpcClient} = useVisualizerContext();
    const [template, setTemplate] = useState<any>({
        templateName: "",
        templateType: "",
        address: "",
        uriTemplate: "",
        httpMethod: "GET",
        wsdlUri: "",
        wsdlService: "",
        wsdlPort: null

    })
    const [message, setMessage] = useState({
        isError: false,
        text: ""
    });

    const isValid: boolean = template.templateName.length > 0;

    useEffect(() => {
        setTemplate((prev: any) => ({...prev, templateType: props.type}));
    }, []);

    useEffect(() => {
        const INVALID_CHARS_REGEX = /[@\\^+;:!%&,=*#[\]$?'"<>{}() /]/;

        if (!isValid) {
            handleMessage("Please fill all the mandatory fields", true);
        } else if (INVALID_CHARS_REGEX.test(template.templateName)) {
            handleMessage("Invalid template name", true);
        } else {
            handleMessage("");
        }

    }, [template.templateName, isValid]);

    const setTemplateType = (type: string) => {
        if (type === 'HTTP Endpoint Template') {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.HttpEndpointForm,
                    documentUri: props.path,
                    customProps: {type: 'template'}
                }
            });
        } else if (type === 'WSDL Endpoint Template') {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.WsdlEndpointForm,
                    documentUri: props.path,
                    customProps: {type: 'template'}
                }
            });
        } else if (type === 'Address Endpoint Template') {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.AddressEndpointForm,
                    documentUri: props.path,
                    customProps: {type: 'template'}
                }
            });
        } else if (type === 'Default Endpoint Template') {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.DefaultEndpointForm,
                    documentUri: props.path,
                    customProps: {type: 'template'}
                }
            });
        } else {
            setTemplate((prev: any) => ({...prev, templateType: type}));
        }
    };

    const handleOnChange = (field: any, value: any) => {
        setTemplate((prev: any) => ({...prev, [field]: value}));
    }

    const handleMessage = (text: string, isError: boolean = false) => {
        setMessage({isError, text});
    }

    const handleCreateTemplate = async () => {

        const createTemplateParams: CreateTemplateRequest = {
            directory: props.path,
            ...template
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
            {template.templateType === '' ? <CardWrapper cardsType="TEMPLATE" setType={setTemplateType}/> : <>
                <TypeChip type="Sequence Template" onClick={setTemplateType} showButton={true}/>
                <TextField
                    placeholder="Name"
                    label="Template Name"
                    onTextChange={(value: string) => handleOnChange("templateName", value)}
                    value={template.templateName}
                    id="template-name-input"
                    autoFocus
                    required
                    validationMessage="Template name is required"
                    size={100}
                />
                {message && <span style={{color: message.isError ? "#f48771" : ""}}>{message.text}</span>}
                <FormActions>
                    <Button
                        appearance="primary"
                        onClick={handleCreateTemplate}
                        disabled={!isValid}
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
