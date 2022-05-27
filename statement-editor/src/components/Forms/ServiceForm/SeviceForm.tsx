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
import React, {useEffect, useState} from "react";

import { FormControl } from "@material-ui/core";
import {
    ExpressionEditorLangClientInterface,
    STModification,
    STSymbolInfo,
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    dynamicConnectorStyles as useFormStyles,
    FormHeaderSection
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { ModulePart, NodePosition, ServiceDeclaration, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { getServiceTypeFromModel } from "../Utils/FormUtils";

import { HttpServiceForm } from "./HTTPServiceForm";
import { ServiceTypeSelector } from "./ServiceTypeSelector";

interface ServiceConfigFormProps {
    model?: ServiceDeclaration | ModulePart;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: () => void;
    formType: string;
    isLastMember?: boolean;
    stSymbolInfo?: STSymbolInfo;
    syntaxTree?: STNode;
    isEdit?: boolean;
    currentFile: {
        content: string,
        path: string,
        size: number
    };
    onChange: (genSource: string, partialST: STNode, moduleList?: Set<string>) => void;
    applyModifications: (modifications: STModification[]) => void;
    getLangClient: () => Promise<ExpressionEditorLangClientInterface>;
}

export enum ServiceTypes {
    HTTP = 'http'
}

export function ServiceConfigForm(props: ServiceConfigFormProps) {
    const formClasses = useFormStyles();
    const { model, targetPosition, onSave, onCancel, formType, isLastMember, stSymbolInfo, isEdit, currentFile,
            syntaxTree, onChange, applyModifications, getLangClient } = props;

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
            configForm = <HttpServiceForm onSave={onSave} onCancel={onCancel} model={model} targetPosition={targetPosition} stSymbolInfo={stSymbolInfo} isLastMember={isLastMember} onChange={onChange} isEdit={isEdit} applyModifications={applyModifications} getLangClient={getLangClient} currentFile={currentFile} syntaxTree={syntaxTree}/>
            break;
        default:
            // configForm = <TriggerServiceForm onSave={onSave} onCancel={onCancel} model={model} targetPosition={targetPosition} />
    }

    useEffect(() => {
        if (isEdit) {
            setServiceType(getServiceTypeFromModel(serviceModel, stSymbolInfo));
        }
    }, [model]);

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
