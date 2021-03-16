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

import { CaptureBindingPattern, LocalVarDecl, STNode } from "@ballerina/syntax-tree";
import Step from "@material-ui/core/Step";
import StepConnector from "@material-ui/core/StepConnector";
import StepLabel from "@material-ui/core/StepLabel";
import Stepper from "@material-ui/core/Stepper";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { CloseRounded } from "@material-ui/icons";
import classNames from "classnames";
import clsx from "clsx";

import { ConnectorConfig, FormField, FunctionDefinitionInfo } from "../../../../ConfigurationSpec/types";
import { Connector, STModification } from "../../../../Definitions/lang-client-extended";
import {
    createCheckedRemoteServiceCall,
    createImportStatement,
    createPropertyStatement,
    createRemoteServiceCall,
    updateCheckedRemoteServiceCall,
    updatePropertyStatement,
    updateRemoteServiceCall
} from "../../../utils/modification-util";
import { DraftInsertPosition } from "../../../view-state/draft";
import { SelectConnectionForm } from "../../ConnectorConfigWizard/Components/SelectExistingConnection";
import { wizardStyles } from "../../ConnectorConfigWizard/style";
import { ButtonWithIcon } from "../../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { checkErrorsReturnType, getConnectorIcon, getParams } from "../../Portals/utils";
import "../HTTPWizard/style.scss"
import { useStyles } from "../HTTPWizard/styles";

import { CreateConnectorForm } from "./CreateConnectorForm";
import { SelectInputOutputForm } from "./SelectInputOutputForm";

interface WizardProps {
    functionDefinitions: Map<string, FunctionDefinitionInfo>;
    connectorConfig: ConnectorConfig;
    onSave: (sourceModifications: STModification[]) => void;
    onClose?: () => void;
    connector: Connector;
    isNewConnectorInitWizard: boolean;
    targetPosition: DraftInsertPosition;
    model: STNode;
}

enum InitFormState {
    Home = -1,
    Create,
    SelectInputOutput
}

const QontoConnector = withStyles({
    alternativeLabel: {
        top: 5,
        left: 'calc(-50% + 16px)',
        right: 'calc(50% + 16px)',
    },
    line: {
        borderColor: '#fff',
        borderTopWidth: 0,
        borderRadius: 0,
        borderLeftWidth: 20,
    },
})(StepConnector);

function QontoStepIcon(props: { active: boolean; completed: boolean; }) {
    const { active, completed } = props;
    const classes = useStyles();

    return (
        <div
            className={clsx(classNames(classes.stepWrapper, "stepWrapper"), { [classNames(classes.stepActive, "stepActive")]: active })}
        >
            {completed ? <div className={classNames(classes.completedStep, "completedStep")} /> : <div className={classNames(classes.currentStep, "currentStep")} />}
        </div>
    );
}

export function SMTPWizard(props: WizardProps) {
    const classes = useStyles();
    const wizardClasses = wizardStyles();
    const { functionDefinitions, connectorConfig, connector, onSave, onClose, isNewConnectorInitWizard, targetPosition, model } = props;
    const connectorInitFormFields: FormField[] = functionDefinitions.get("init") ? functionDefinitions.get("init").parameters : functionDefinitions.get("__init").parameters;

    const enableHomePage = connectorConfig.existingConnections !== undefined && isNewConnectorInitWizard;
    const initFormState = enableHomePage ? InitFormState.Home : InitFormState.Create;
    connectorConfig.connectorInit = connectorConfig.connectorInit.length > 0 ? connectorConfig.connectorInit : connectorInitFormFields;
    const [state, setState] = useState<InitFormState>(initFormState);

    if (!isNewConnectorInitWizard) {
        const smtpVar = model as LocalVarDecl;
        connectorConfig.action.returnVariableName =
            (smtpVar.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.value;
    }

    const handleCreateNew = () => {
        setState(InitFormState.Create);
    };

    const handleSelectExisting = () => {
        setState(InitFormState.Create);
    };

    const handleInputOutputForm = () => {
        setState(InitFormState.SelectInputOutput);
    };

    const handleBack = () => {
        if (state === InitFormState.SelectInputOutput) {
            setState(InitFormState.Create);
        } else if (state === InitFormState.Create && enableHomePage) {
            setState(InitFormState.Home);
        }
    };

    const handleOnSave = () => {
        const isInitReturnError = checkErrorsReturnType('init', functionDefinitions);
        const isActionReturnError = checkErrorsReturnType(connectorConfig.action.name, functionDefinitions);
        // insert initialized connector logic
        let modifications: STModification[] = [];
        if (!isNewConnectorInitWizard) {
            if (!connectorConfig.isExistingConnection) {
                const updateConnectorInit = updatePropertyStatement(
                    `${connector.module}:${connector.name} ${connectorConfig.name} = ${isInitReturnError ? 'check' : ''} new (${getParams(connectorConfig.connectorInit).join()});`,
                    connectorConfig.initPosition
                );
                modifications.push(updateConnectorInit);
            }
            // Add an action invocation on the initialized client.
            if (isActionReturnError) {
                const updateActionInvocation: STModification = updateCheckedRemoteServiceCall(
                    "var",
                    connectorConfig.action.returnVariableName,
                    connectorConfig.name,
                    connectorConfig.action.name,
                    getParams(connectorConfig.action.fields),
                    model.position
                );
                modifications.push(updateActionInvocation);
            } else {
                const updateActionInvocation: STModification = updateRemoteServiceCall(
                    "var",
                    connectorConfig.action.returnVariableName,
                    connectorConfig.name,
                    connectorConfig.action.name,
                    getParams(connectorConfig.action.fields),
                    model.position
                );
                modifications.push(updateActionInvocation);
            }
        } else {
            if (targetPosition) {
                modifications = [];
                // Add an import.
                const addImport: STModification = createImportStatement(
                    connector.org,
                    connector.module,
                    targetPosition
                );
                modifications.push(addImport);

                // Add an connector client initialization.
                if (!connectorConfig.isExistingConnection) {
                    const addConnectorInit = createPropertyStatement(
                        `${connector.module}:${connector.name} ${connectorConfig.name} = ${isInitReturnError ? 'check' : ''} new (${getParams(connectorConfig.connectorInit).join()});`,
                        targetPosition
                    );
                    modifications.push(addConnectorInit);
                }
                // Add an action invocation on the initialized client.
                if (isActionReturnError){
                    const addActionInvocation: STModification = createCheckedRemoteServiceCall(
                        "var",
                        connectorConfig.action.returnVariableName,
                        connectorConfig.name,
                        connectorConfig.action.name,
                        getParams(connectorConfig.action.fields), targetPosition
                    );
                    modifications.push(addActionInvocation);
                }else{
                    const addActionInvocation: STModification = createRemoteServiceCall(
                        "var",
                        connectorConfig.action.returnVariableName,
                        connectorConfig.name,
                        connectorConfig.action.name,
                        getParams(connectorConfig.action.fields), targetPosition
                    );
                    modifications.push(addActionInvocation);
                }

                // if (connectorConfig.responsePayloadMap && connectorConfig.responsePayloadMap.isPayloadSelected) {
                //     const addPayload: STModification = createCheckedPayloadFunctionInvocation(
                //         connectorConfig.responsePayloadMap.payloadVariableName,
                //         "var",
                //         connectorConfig.action.returnVariableName,
                //         connectorConfig.responsePayloadMap.payloadTypes.get(connectorConfig.responsePayloadMap.selectedPayloadType),
                //         targetPosition
                //     );
                //     modifications.push(addPayload);
                // }
            }
        }
        onSave(modifications);
    };

    const homeForm = <SelectConnectionForm onCreateNew={handleCreateNew} connectorConfig={connectorConfig} connector={connector} onSelectExisting={handleSelectExisting} />;
    const createConnectorForm = <CreateConnectorForm homePageEnabled={enableHomePage} functionDefinitions={functionDefinitions} onSave={handleInputOutputForm} connectorConfig={connectorConfig} onBackClick={handleBack} connector={connector} isNewConnectorInitWizard={isNewConnectorInitWizard} />;
    const inputOutptForm = <SelectInputOutputForm functionDefinitions={functionDefinitions} onSave={handleOnSave} connectorConfig={connectorConfig} onBackClick={handleBack} isNewConnectorInitWizard={isNewConnectorInitWizard} />;
    const stepper = (
        <Stepper className={classNames(classes.stepperWrapper, "stepperWrapper")} alternativeLabel={true} activeStep={state} connector={<QontoConnector />}>
            <Step className={classNames(classes.stepContainer, "stepContainer")} key={InitFormState.Create}>
                <StepLabel className={classNames(classes.stepLabel, "stepLabel")} StepIconComponent={QontoStepIcon} >CONNECTION</StepLabel>
            </Step>
            <Step className={classNames(classes.stepContainer, "stepContainer")} key={InitFormState.SelectInputOutput}>
                <StepLabel className={classNames(classes.stepLabel, "stepLabel")} StepIconComponent={QontoStepIcon} >EMAIL</StepLabel>
            </Step>
        </Stepper>
    );

    return (
        <div className={classes.root}>
            <div className={wizardClasses.topTitleWrapper}>
                <ButtonWithIcon
                    className={wizardClasses.closeBtnAutoGen}
                    onClick={onClose}
                    icon={<CloseRounded fontSize="small" />}
                />
                <div className={wizardClasses.titleWrapper}>
                    <div className={wizardClasses.connectorIconWrapper}>{getConnectorIcon(`${connector.module}_${connector.name}`)}</div>
                    <Typography className={wizardClasses.configTitle} variant="h4">{isNewConnectorInitWizard ? "New" : "Update"} {connector.displayName} Connection</Typography>
                </div>
            </div>
            {state !== InitFormState.Home && stepper}
            <div className={classes.stepper}>
                {state === InitFormState.Home && homeForm}
                {state === InitFormState.Create && createConnectorForm}
                {state === InitFormState.SelectInputOutput && inputOutptForm}
            </div>
        </div>
    );
}
