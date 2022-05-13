/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import React, { useState } from "react";

import { FormControl } from "@material-ui/core";
import { dynamicConnectorStyles as useFormStyles, FormHeaderSection } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { NodePosition, ServiceDeclaration } from "@wso2-enterprise/syntax-tree";

import { HttpServiceForm } from "./HTTPServiceForm";
import { ServiceTypeSelector } from "./ServiceTypeSelector";

interface ServiceConfigFormProps {
    model?: ServiceDeclaration;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: () => void;
    formType: string;
    isLastMember?: boolean;
}

export enum ServiceTypes {
    HTTP = 'http'
}

export function ServiceConfigForm(props: ServiceConfigFormProps) {
    const formClasses = useFormStyles();
    const { model, targetPosition, onSave, onCancel, formType, isLastMember } = props;
    const [serviceType, setServiceType] = useState<string>("http");

    let configForm;

    switch (serviceType) {
        case ServiceTypes.HTTP:
            configForm = <HttpServiceForm onSave={onSave} onCancel={onCancel} model={model} targetPosition={targetPosition} isLastMember={isLastMember} />
            break;
        default:
            // configForm = <TriggerServiceForm onSave={onSave} onCancel={onCancel} model={model} targetPosition={targetPosition} />
    }

    return (
        <FormControl data-testid="service-config-form" className={formClasses.wizardFormControl}>
            <FormHeaderSection
                onCancel={onCancel}
                formTitle={"lowcode.develop.configForms.ServiceConfigForm.title"}
                defaultMessage={"Service"}
                formType={formType}
            />
            {!serviceType && <ServiceTypeSelector onSelect={setServiceType} />}
            {serviceType && configForm}
        </FormControl>
    )
}
