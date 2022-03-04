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

import React, { useState } from "react";
import { useIntl } from "react-intl";

import { FormControl } from "@material-ui/core";
import { FormActionButtons, FormHeaderSection } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NamedWorkerDeclaration, NodePosition } from "@wso2-enterprise/syntax-tree";

import { useDiagramContext } from "../../../../../../../Contexts/Diagram";
import { useStyles as useFormStyles } from "../../../../DynamicConnectorForm/style";
import { ProcessConfig, WorkerConfig } from "../../../../Types";
import { VariableNameInput } from "../../../Components/VariableNameInput";

interface WorkerConfigFormProps {
    config: ProcessConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
    onWizardClose: () => void;
}

export function AddWorkerConfigForm(props: WorkerConfigFormProps) {
    const { onCancel, formArgs, onSave, onWizardClose, config } = props;
    const intl = useIntl();
    const {
        props: {
            experimentalEnabled,
            isMutationProgress,
        }
    } = useDiagramContext();
    const formClasses = useFormStyles();
    const saveLogButtonLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.log.saveButton.label",
        defaultMessage: "Save"
    });
    const [isExpressionsValid, setExpressionValidity] = useState(false);

    const workerConfig = config.config as WorkerConfig;
    const model = config.model as NamedWorkerDeclaration;

    const onWorkerNameChange = (name: string) => {
        workerConfig.name = name;
    }

    let namePosition: NodePosition = {
        startLine: 0,
        startColumn: 0,
        endLine: 0,
        endColumn: 0
    };

    if (model) {
        namePosition = model.workerName.position;
    } else {
        namePosition.startLine = formArgs.targetPosition.startLine;
        namePosition.endLine = formArgs.targetPosition.startLine;
    }

    const updateExpressionValidity = (fieldName: string, isInValid: boolean) => {
        setExpressionValidity(!isInValid);
    }

    const codeTemplate = {
        defaultCodeSnippet: 'worker {}',
        targetColumn: 8
    };

    return (
        <FormControl data-testid="log-form" className={formClasses.wizardFormControl}>
            <FormHeaderSection
                onCancel={onCancel}
                statementEditor={false}
                formTitle={"lowcode.develop.configForms.worker.title"}
                defaultMessage={"Worker"}
                toggleChecked={false}
                experimentalEnabled={experimentalEnabled}
            />
            <div className={formClasses.formContentWrapper}>
                <VariableNameInput
                    displayName={'Worker Name'}
                    value={workerConfig.name}
                    onValueChange={onWorkerNameChange}
                    validateExpression={updateExpressionValidity}
                    position={namePosition}
                    isEdit={!!model}
                    initialDiagnostics={model?.workerName?.typeData?.diagnostics}
                    overrideTemplate={model ? undefined : codeTemplate}
                />
            </div>
            <FormActionButtons
                cancelBtnText="Cancel"
                cancelBtn={true}
                saveBtnText={saveLogButtonLabel}
                isMutationInProgress={isMutationProgress}
                validForm={isExpressionsValid}
                onSave={() => { }}
                onCancel={onCancel}
            />
        </FormControl>
    )
}
