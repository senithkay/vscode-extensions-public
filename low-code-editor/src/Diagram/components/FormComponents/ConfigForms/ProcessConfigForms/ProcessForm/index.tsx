/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js
import React, { useContext } from "react";

import { ConfigOverlayFormStatus, WizardType } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { LocalVarDecl } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../../Contexts/Diagram";
import { TextPreloaderVertical } from "../../../../../../PreLoader/TextPreloaderVertical";
import { ProcessConfig } from "../../../Types";

import { AddAssignmentConfig } from "./AddAssignmentConfig";
import { AddCustomStatementConfig } from "./AddCustomStatementConfig";
import { AddDataMappingConfig } from "./AddDataMappingConfig";
import { AddLogConfig } from "./AddLogConfig";
import { AddVariableConfig } from "./AddVariableConfig";

interface ProcessFormProps {
    config: ProcessConfig;
    onCancel: () => void;
    onSave: () => void;
    onWizardClose: () => void;
    configOverlayFormStatus: ConfigOverlayFormStatus;
}

export function ProcessForm(props: ProcessFormProps) {
    const { config, onCancel, onSave, onWizardClose, configOverlayFormStatus } = props;
    const { isLoading, error, formType: type, formArgs } = configOverlayFormStatus;
    const {
        api: {
            panNZoom: {
                pan,
                fitToScreen
            }
        }
    } = useContext(Context);

    let formType: string = type;

    if (formType === "Variable") {
        if (config.wizardType === WizardType.EXISTING) {
            const existingVariableModelValue: LocalVarDecl = config.model as LocalVarDecl;
            const existingVariableValue = existingVariableModelValue?.initializer?.source;
            config.config = existingVariableValue ? existingVariableValue : "";
        }
        else {
            config.config = "";
        }


    } else if (formType === "Log") {
        config.config = {
            type: "",
            expression: ""
        };
    } else if (formType === "Call" || formType === "Custom") {
        config.config = {
            expression: ""
        };
    } else {
        formType = "Custom";
        config.config = {
            expression: ""
        };
    }

    if (isLoading) {
        return (
            <TextPreloaderVertical position='relative' />
        );

    } else if (error) {
        return (
            <>
                {error?.message}
            </>
        );
    } else {
        return (
            <>
                {
                    formType === "Variable" && (
                        <AddVariableConfig
                            config={config}
                            formArgs={formArgs}
                            onSave={onSave}
                            onWizardClose={onWizardClose}
                            onCancel={onCancel}
                        />
                    )
                }
                {
                    formType === "AssignmentStatement" && (
                        <AddAssignmentConfig
                            config={config}
                            formArgs={formArgs}
                            onSave={onSave}
                            onWizardClose={onWizardClose}
                            onCancel={onCancel}
                        />
                    )
                }
                {
                    formType === "Log" && (
                        <AddLogConfig
                            config={config}
                            formArgs={formArgs}
                            onSave={onSave}
                            onWizardClose={onWizardClose}
                            onCancel={onCancel}
                        />
                    )
                }
                {
                    (formType === "Custom" || formType === "Call") && (
                        <AddCustomStatementConfig
                            config={config}
                            formArgs={formArgs}
                            onSave={onSave}
                            onWizardClose={onWizardClose}
                            onCancel={onCancel}
                        />
                    )
                }
            </>
        );
    }
}
