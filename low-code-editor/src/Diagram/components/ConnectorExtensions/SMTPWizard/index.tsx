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
import React, { useEffect, useState } from "react";

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
    createImportStatement,
    createPropertyStatement,
    updatePropertyStatement} from "../../../utils/modification-util";
import { DraftInsertPosition } from "../../../view-state/draft";
import { SelectConnectionForm } from "../../ConnectorConfigWizard/Components/SelectExistingConnection";
import { wizardStyles } from "../../ConnectorConfigWizard/style";
import { ButtonWithIcon } from "../../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { getActionReturnType, getConnectorIcon, getInitReturnType, getParams, matchEndpointToFormField } from "../../Portals/utils";
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
    selectedConnector?: LocalVarDecl;
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

export function SMTPWizard(props: WizardProps) {
    const classes = useStyles();
    const wizardClasses = wizardStyles();
    const { functionDefinitions, connectorConfig, connector, onSave, onClose, isNewConnectorInitWizard, targetPosition, model, selectedConnector } = props;
    const connectorInitFormFields: FormField[] = functionDefinitions.get("init") ? functionDefinitions.get("init").parameters : functionDefinitions.get("__init").parameters;

    const enableHomePage = connectorConfig.existingConnections !== undefined && isNewConnectorInitWizard;
    const initFormState = enableHomePage ? InitFormState.Home : InitFormState.Create;
    connectorConfig.connectorInit = connectorConfig.connectorInit.length > 0 ? connectorConfig.connectorInit : connectorInitFormFields;
    const [state, setState] = useState<InitFormState>(initFormState);
    const [isNewConnection, setIsNewConnection] = useState<boolean>(true);

    const actionReturnType = getActionReturnType(connectorConfig.action.name, functionDefinitions);

    if (!isNewConnectorInitWizard && actionReturnType.hasReturn) {
        const smtpVar = model as LocalVarDecl;
        connectorConfig.action.returnVariableName =
            (smtpVar.typedBindingPattern?.bindingPattern as CaptureBindingPattern)?.variableName.value;
    }

    useEffect(() => {
        if (selectedConnector) {

            const actionName = "sendEmailMessage";
            connectorConfig.action = {
                name: actionName,
                fields: functionDefinitions.get(actionName)?.parameters
            }
            connectorConfig.connectorInit = connectorInitFormFields;

            const connectorNameValue = (selectedConnector.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.value;
            connectorConfig.name = connectorNameValue;
            matchEndpointToFormField(selectedConnector, connectorConfig.connectorInit);
            connectorConfig.isExistingConnection = (connectorNameValue !== undefined);
            setState(InitFormState.SelectInputOutput);
        }
    }, [selectedConnector]);

    const handleCreateNew = () => {
        setIsNewConnection(true);
        connectorConfig.name = undefined;
        setState(InitFormState.Create);
    };

    const handleSelectExisting = () => {
        setIsNewConnection(false);
        if (enableHomePage) {
            const actionName = "sendEmailMessage";
            connectorConfig.action = {
                name: actionName,
                fields: functionDefinitions.get(actionName)?.parameters
            }
            setState(InitFormState.SelectInputOutput);
        } else {
            setState(InitFormState.Create);
        }
    };

    const handleConnectionChange = () => {
        if (isNewConnection) {
            setState(InitFormState.Create);
        } else {
            setState(InitFormState.Home);
        }
    };

    const handleOnSaveNext = () => {
        const actionName = "sendEmailMessage";
        connectorConfig.action = {
            name: actionName,
            fields: functionDefinitions.get(actionName)?.parameters
        }
        setState(InitFormState.SelectInputOutput);
    };

    const handleCreateConnectorOnSave = () => {
        const isInitReturnError = getInitReturnType(functionDefinitions);
        const modifications: STModification[] = [];
        if (!isNewConnectorInitWizard && !connectorConfig.isExistingConnection) {
            if (!connectorConfig.isExistingConnection) {
                const updateConnectorInit = updatePropertyStatement(
                    `${connector.module}:${connector.name} ${connectorConfig.name} = ${isInitReturnError ? 'check' : ''} new (${getParams(connectorConfig.connectorInit).join()});`,
                    connectorConfig.initPosition
                );
                modifications.push(updateConnectorInit);
            }
        } else if (targetPosition) {
            // Add an import.
            const addImport: STModification = createImportStatement(
                connector.org,
                connector.module,
                targetPosition
            );
            modifications.push(addImport);

            // Add an connector client initialization.
            if (isNewConnection) {
                const addConnectorInit = createPropertyStatement(
                    `${connector.module}:${connector.name} ${connectorConfig.name} = ${isInitReturnError ? 'check' : ''} new (${getParams(connectorConfig.connectorInit).join()});`,
                    targetPosition
                );
                modifications.push(addConnectorInit);
            }
        }
        onSave(modifications);
    };

    const handleBack = () => {
        if (state === InitFormState.SelectInputOutput) {
            setState(InitFormState.Create);
        } else if (state === InitFormState.Create && enableHomePage) {
            setState(InitFormState.Home);
        }
    };

    const handleOnSave = () => {
        const isInitReturnError = getInitReturnType(functionDefinitions);
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
            const updateActionInvocation = updatePropertyStatement(
                `${actionReturnType.hasError ? 'check' : ''} ${connectorConfig.name}->${connectorConfig.action.name}(${getParams(connectorConfig.action.fields).join()});`,
                model.position
            );
            modifications.push(updateActionInvocation);
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
                const addActionInvocation = createPropertyStatement(
                    `${actionReturnType.hasError ? 'check' : ''} ${connectorConfig.name}->${connectorConfig.action.name}(${getParams(connectorConfig.action.fields).join()});`,
                    targetPosition
                );
                modifications.push(addActionInvocation);
            }
        }
        onSave(modifications);
    };

    const homeForm = <SelectConnectionForm onCreateNew={handleCreateNew} connectorConfig={connectorConfig} connector={connector} onSelectExisting={handleSelectExisting} />;
    const createConnectorForm = <CreateConnectorForm homePageEnabled={enableHomePage} functionDefinitions={functionDefinitions} onSave={handleCreateConnectorOnSave} onSaveNext={handleOnSaveNext} connectorConfig={connectorConfig} onBackClick={handleBack} connector={connector} isNewConnectorInitWizard={isNewConnectorInitWizard} />;
    const inputOutputForm = <SelectInputOutputForm functionDefinitions={functionDefinitions} onSave={handleOnSave} connectorConfig={connectorConfig} onConnectionChange={handleConnectionChange} isNewConnectorInitWizard={isNewConnectorInitWizard} hasReturn={actionReturnType.hasReturn}/>;

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
            <div className={classes.stepper}>
                {state === InitFormState.Home && homeForm}
                {state === InitFormState.Create && createConnectorForm}
                {state === InitFormState.SelectInputOutput && inputOutputForm}
            </div>
        </div>
    );
}
