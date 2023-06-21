/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useContext, useEffect, useState } from "react";

import { FormControl } from "@material-ui/core";
import {
    dynamicConnectorStyles as useFormStyles,
    FormHeaderSection
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { ModulePart, ServiceDeclaration, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { FormEditorContext } from "../../../store/form-editor-context";
import { getServiceTypeFromModel } from "../Utils/FormUtils";

import { GraphqlServiceForm } from "./GraphqlServiceForm";
import { HttpServiceForm } from "./HTTPServiceForm";

interface ServiceConfigFormProps {
    model?: ServiceDeclaration | ModulePart;
}

export enum ServiceTypes {
    HTTP = 'http',
    GRAPHQL = 'graphql'
}

export function ServiceConfigForm(props: ServiceConfigFormProps) {
    const formClasses = useFormStyles();
    const { model } = props;
    const { isEdit, stSymbolInfo, onCancel } = useContext(FormEditorContext);

    let serviceModel : ServiceDeclaration;
    if (model && STKindChecker.isModulePart(model)) {
        model.members.forEach(m => {
            if (STKindChecker.isServiceDeclaration(m)) {
                serviceModel = m;
            }
        });
    } else if (model && STKindChecker.isServiceDeclaration(model)) {
        serviceModel = model;
    }
    const [serviceType, setServiceType] = useState<string>(getServiceTypeFromModel(serviceModel, stSymbolInfo));

    let configForm;

    switch (serviceType) {
        case ServiceTypes.HTTP:
            configForm = <HttpServiceForm model={model} />
            break;
        case ServiceTypes.GRAPHQL:
            configForm = <GraphqlServiceForm model={model}/>
            break;
        default:
            // configForm = <TriggerServiceForm onSave={onSave} onCancel={onCancel} model={model} targetPosition={targetPosition} />
    }

    useEffect(() => {
        setServiceType(getServiceTypeFromModel(serviceModel, stSymbolInfo));
    }, [model]);

    return (
        <FormControl data-testid="service-config-form" className={formClasses.wizardFormControl}>
            <FormHeaderSection
                onCancel={onCancel}
                formTitle={"lowcode.develop.configForms.ServiceConfigForm.title"}
                defaultMessage={"Service"}
            />
            {serviceType && configForm}
        </FormControl>
    )
}
