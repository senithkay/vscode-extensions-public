/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import {Button, TextField, Dropdown, FormView, FormActions} from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { EVENT_TYPE, MACHINE_VIEW, CreateTemplateRequest } from "@wso2-enterprise/mi-core";

interface OptionProps {
    value: string;
}

export interface TemplateWizardProps {
    path: string;
}

export function TemplateWizard(props: TemplateWizardProps) {

    const { rpcClient } = useVisualizerContext();
    const [existingFilePath, setExistingFilePath] = useState(props.path);
    const isNewTask = !existingFilePath.endsWith(".xml");
    const [changesOccurred, setChangesOccurred] = useState(false);
    const [ template, setTemplate ] = useState<any>({
        templateName: "",
        templateType: "Address Endpoint Template",
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
    const validNumericInput = /^\d*$/;

    const isValid: boolean = template.templateName.length > 0 &&
        (template.templateType === 'WSDL Endpoint Template' ? (template.wsdlUri.length > 0 && template.wsdlService.length > 0 && template.wsdlPort != null && template.wsdlPort > 0) :
            template.templateType === 'HTTP Endpoint Template' ? template.uriTemplate.length > 0 :
                template.templateType === 'Address Endpoint Template' ? template.address.length > 0 : template.templateType.length > 0);

    useEffect(() => {

        (async () => {
            if (!isNewTask) {
                const existingTemplate = await rpcClient.getMiDiagramRpcClient().getTemplate({ path: existingFilePath });
                setTemplate(existingTemplate);
            }
        })();

    }, []);

    useEffect(() => {
        const INVALID_CHARS_REGEX = /[@\\^+;:!%&,=*#[\]$?'"<>{}() /]/;
        const VALID_URI_REGEX = /^(https?:\/\/)?www\.[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;
        const VALID_WSDL_URI_REGEX = /\.wsdl$/i;

        if (!isValid) {
            handleMessage("Please fill all the mandatory fields", true);
        } else if (INVALID_CHARS_REGEX.test(template.templateName)) {
            handleMessage("Invalid template name", true);
        } else if (template.templateType === 'Address Endpoint Template' && !VALID_URI_REGEX.test(template.address)) {
            handleMessage("Invalid address URI", true);
        } else if (template.templateType === 'HTTP Endpoint Template' && !VALID_URI_REGEX.test(template.uriTemplate)) {
            handleMessage("Invalid URI template", true);
        } else if (template.templateType === 'WSDL Endpoint Template' && (!VALID_WSDL_URI_REGEX.test(template.wsdlUri) || !VALID_URI_REGEX.test(template.wsdlUri))) {
            handleMessage("Invalid WSDL URI", true);
        } else {
            handleMessage("");
        }

    }, [template.templateName, template.templateType, template.address, template.uriTemplate, template.wsdlUri, isValid]);

    const templateTypes: OptionProps[] = [
        { value: "Address Endpoint Template"},
        { value: "Default Endpoint Template"},
        { value: "HTTP Endpoint Template"},
        { value: "Sequence Template"},
        { value: "WSDL Endpoint Template"}
    ];

    const httpMethods = [
        { value: "GET"},
        { value: "POST"},
        { value: "PUT"},
        { value: "DELETE"},
        { value: "HEAD"},
        { value: "OPTIONS"},
        { value: "PATCH"},
        { value: "leave_as_is"}
    ];

    const updateChangeStatus = () => {
        if(!isNewTask && !changesOccurred) {
            setChangesOccurred(true);
        }
    }

    const handleTemplateTypeChange = (type: string) => {
        updateChangeStatus();
        setTemplate((prev: any) => ({ ...prev, templateType: type }));
    };

    const handleHttpMethodChange = (type: string) => {
        updateChangeStatus();
        setTemplate((prev: any) => ({ ...prev, httpMethod: type }));
    };

    const handleOnChange = (field: any, value: any) => {
        updateChangeStatus();
        setTemplate((prev: any) => ({ ...prev, [field]: value }));
    }

    const handleMessage = (text: string, isError: boolean = false) => {
        setMessage({ isError, text });
    }

    const handleCreateTemplate = async () => {

        const createTemplateParams: CreateTemplateRequest = {
            directory: existingFilePath,
            ...template
        }
        await rpcClient.getMiDiagramRpcClient().createTemplate(createTemplateParams);

        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const handleCancel = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    return (
        <FormView title="Template Artifact" onClose={handleCancel}>
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
                <span>Template Type</span>
                <Dropdown items={templateTypes} value={template.templateType} onValueChange={handleTemplateTypeChange} id="template-type"/>
                {template.templateType === "HTTP Endpoint Template" && (
                    <>
                        <TextField
                            placeholder="URI Template"
                            label="URI Template"
                            onTextChange={(value: string) => handleOnChange("uriTemplate", value)}
                            value={template.uriTemplate}
                            id="uri-template"
                            size={100}
                            required
                        />

                        <span>Method</span>
                        <Dropdown items={httpMethods} value={template.httpMethod} onValueChange={handleHttpMethodChange} id="endpoint"/>
                    </>
                )}
                {template.templateType === "Address Endpoint Template" && (
                    <>
                        <TextField
                            placeholder="Address"
                            label="Address"
                            onTextChange={(value: string) => handleOnChange("address", value)}
                            value={template.address}
                            id="uri-template"
                            size={100}
                            required
                        />
                    </>
                )}
                {template.templateType === "WSDL Endpoint Template" && (
                    <>
                        <TextField
                            placeholder="WSDL URI"
                            label="WSDL URI"
                            onTextChange={(value: string) => handleOnChange("wsdlUri", value)}
                            value={template.wsdlUri}
                            id="wsdl-uri-input"
                            size={100}
                            required
                        />
                        <TextField
                            placeholder="WSDL Service"
                            label="WSDL Service"
                            onTextChange={(value: string) => handleOnChange("wsdlService", value)}
                            value={template.wsdlService}
                            id="wsdl-service-input"
                            size={100}
                            required
                        />
                        <TextField
                            placeholder="WSDL Port"
                            label="WSDL Port"
                            onTextChange={(value) => {
                                if (validNumericInput.test(value)) {
                                    handleOnChange("wsdlPort", Number(value))
                                } else {
                                    handleOnChange("wsdlPort", null)
                                }
                            }}
                            value={template.wsdlPort}
                            id="wsdl-port-input"
                            size={50}
                            required
                        />
                    </>
                )}
            {message && <span style={{ color: message.isError ? "#f48771" : "" }}>{message.text}</span>}
            <FormActions>
                <Button
                    appearance="primary"
                    onClick={handleCreateTemplate}
                    disabled={!isValid || (!changesOccurred && !isNewTask)}
                >
                    {isNewTask ? "Create" : "Save Changes"}
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
