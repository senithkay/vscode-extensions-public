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
// tslint:disable: jsx-wrap-multiline
import React, { useContext } from "react";

import { STNode } from "@ballerina/syntax-tree";

import { WizardType } from "../../../../ConfigurationSpec/types";
import { Context as DiagramContext } from "../../../../Contexts/Diagram";
import { ConfigOverlayFormStatus } from "../../../../Definitions";
import { STModification } from "../../../../Definitions/lang-client-extended";
import {
    createImportStatement,
    createLogStatement,
    createPropertyStatement,
    updateLogStatement,
    updatePropertyStatement
} from "../../../utils/modification-util";
import { DraftInsertPosition } from "../../../view-state/draft";
import { LogConfig, ProcessConfig } from "../../Portals/ConfigForm/types";
import { DiagramOverlayPosition } from "../../Portals/Overlay";

import { ProcessOverlayForm } from "./ProcessOverlayForm";

export interface AddProcessFormProps {
    type: string;
    targetPosition: DraftInsertPosition;
    scopeSymbols?: string[];
    onCancel: () => void;
    onSave: () => void;
    model?: STNode;
    wizardType: WizardType;
    position: DiagramOverlayPosition;
    configOverlayFormStatus: ConfigOverlayFormStatus;
}

export function ProcessConfigForm(props: any) {
    const { state: { onMutate: dispatchMutations, trackAddStatement } } = useContext(DiagramContext);

    const { onCancel, onSave, wizardType, position, configOverlayFormStatus } = props as AddProcessFormProps;
    const { formArgs, formType } = configOverlayFormStatus;

    const processConfig: ProcessConfig = {
        type: formType,
        scopeSymbols: [],
        model: formArgs?.model,
        wizardType,
    };

    const onSaveClick = () => {
        const modifications: STModification[] = [];
        if (wizardType === WizardType.EXISTING) {
            // todo: handle if the property already exists
            switch (processConfig.type) {
                case 'Variable':
                    const propertyConfig: string = processConfig.config as string;
                    const updatePropertyStmt: STModification = updatePropertyStatement(
                        propertyConfig, formArgs?.model.position
                    );
                    modifications.push(updatePropertyStmt);
                    break;
                case 'Log':
                    const logConfig: LogConfig = processConfig.config as LogConfig;
                    const updateLogStmt: STModification = updateLogStatement(
                        logConfig.type, logConfig.expression, formArgs?.model.position
                    );
                    modifications.push(updateLogStmt);
                    break;
            }
        } else {
            if (formArgs?.targetPosition) {
                // todo: make this ST modification
                if (processConfig.type === "Variable") {
                    const propertyConfig: string = processConfig.config as string;
                    const addPropertyStatement: STModification = createPropertyStatement(
                        propertyConfig, formArgs?.targetPosition);
                    modifications.push(addPropertyStatement);
                } else if (processConfig.type === "Log") {
                    const logConfig: LogConfig = processConfig.config as
                        LogConfig;
                    const addLogStatement: STModification = createLogStatement(
                        logConfig.type, logConfig.expression, formArgs?.targetPosition);
                    const addImportStatement: STModification = createImportStatement(
                        "ballerina", "log", formArgs?.targetPosition);
                    modifications.push(addImportStatement);
                    modifications.push(addLogStatement);
                }
                trackAddStatement(processConfig.type);
            }
        }
        dispatchMutations(modifications);
        onSave()
    };

    return (
        <ProcessOverlayForm position={position} config={processConfig} onCancel={onCancel} onSave={onSaveClick} configOverlayFormStatus={configOverlayFormStatus} />
    );
}
