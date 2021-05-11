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
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import { CaptureBindingPattern, LocalVarDecl, STKindChecker, STNode } from "@ballerina/syntax-tree";
import { Typography } from "@material-ui/core";
import { CloseRounded } from "@material-ui/icons";

import { ActionConfig, ConnectorConfig, FormField, FunctionDefinitionInfo } from "../../../../ConfigurationSpec/types";
import { Context as DiagramContext } from "../../../../Contexts/Diagram";
import { Connector, STModification } from "../../../../Definitions";
import { getAllVariables } from "../../../utils/mixins";
import {
    createCheckedPayloadFunctionInvocation,
    createImportStatement,
    createPropertyStatement,
    updatePropertyStatement} from "../../../utils/modification-util";
import { DraftInsertPosition } from "../../../view-state/draft";
import { SelectConnectionForm } from "../../ConnectorConfigWizard/Components/SelectExistingConnection";
import { wizardStyles } from "../../ConnectorConfigWizard/style";
import { ButtonWithIcon } from "../../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import {
    genVariableName,
    getActionReturnType,
    getConnectorIcon,
    getInitReturnType,
    getKeyFromConnection,
    getOauthParamsFromConnection,
    getParams,
    matchEndpointToFormField
} from "../../Portals/utils";

import { CreateConnectorForm } from "./CreateNewConnection";
import { OperationDropdown } from "./OperationDropdown";
import { OperationForm } from "./OperationForm";

interface WizardProps {
    functionDefinitions: Map<string, FunctionDefinitionInfo>;
    connectorConfig: ConnectorConfig;
    onSave: (sourceModifications: STModification[]) => void;
    onClose?: () => void;
    connector: Connector;
    isNewConnectorInitWizard: boolean;
    targetPosition: DraftInsertPosition;
    model?: STNode;
    selectedConnector?: LocalVarDecl;
}

enum FormStates {
    ExistingConnection,
    OauthConnect,
    CreateNewConnection,
    OperationDropdown,
    OperationForm,
}

export function NetSuiteWizard(props: WizardProps) {
    const wizardClasses = wizardStyles();
    const { functionDefinitions, connectorConfig, connector, onSave, onClose, isNewConnectorInitWizard, targetPosition, model, selectedConnector } = props;
    const { state } = useContext(DiagramContext);
    const { stSymbolInfo: symbolInfo, isMutationProgress, syntaxTree } = state;
    let connectorInitFormFields: FormField[] = functionDefinitions.get("init") ? functionDefinitions.get("init").parameters : functionDefinitions.get("__init").parameters;

    const [config] = useState<ConnectorConfig>(connectorConfig ? connectorConfig : new ConnectorConfig());

    const [formState, setFormState] = useState<FormStates>(FormStates.CreateNewConnection);

    useEffect(() => {
        if (config.existingConnections) {
            setFormState(FormStates.ExistingConnection);
            setIsNewConnection(false);
        }
    }, [config.existingConnections]);

    useEffect(() => {
        if (selectedConnector) {
            config.connectorInit = connectorInitFormFields;

            const connectorNameValue = (selectedConnector.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.value;
            config.name = connectorNameValue;
            setConfigName(connectorNameValue);
            setIsNewConnection(false);
            matchEndpointToFormField(selectedConnector, config.connectorInit);
            config.isExistingConnection = (connectorNameValue !== undefined);
            setFormState(FormStates.OperationDropdown);
        }
    }, [selectedConnector]);

    const [connectionDetails, setConnectionDetails] = useState(null);
    const [selectedOperation, setSelectedAction] = useState(isNewConnectorInitWizard ? null : config.action.name);
    const [isManualConnection, setIsManualConnection] = useState(false);
    const [isNewConnection, setIsNewConnection] = useState(true);

    // managing name set by the non oauth connectors
    config.name = isNewConnectorInitWizard ?
        genVariableName(connector.module + "Endpoint", getAllVariables(symbolInfo)) :
        config.name;
    const [configName, setConfigName] = useState(config.name);
    const handleConfigNameChange = (name: string) => {
        setConfigName(name);
    }
    config.name = configName;

    const operations: string[] = [];
    if (functionDefinitions) {
        functionDefinitions.forEach((value, key) => {
            if (key !== "init" && key !== "__init") {
                operations.push(key);
            }
        });
    }

    let formFields: FormField[] = [];
    if (selectedOperation) {
        formFields = functionDefinitions.get(selectedOperation).parameters;
        config.action = new ActionConfig();
        config.action.fields = formFields;
    }

    const onOperationSelect = (operation: string) => {
        setSelectedAction(operation);
        setFormState(FormStates.OperationForm);
    };

    const onOperationChange = () => {
        setFormState(FormStates.OperationDropdown);
    };

    const onCreateNew = () => {
        setConfigName(genVariableName(connector.module + "Endpoint", getAllVariables(symbolInfo)));
        setIsManualConnection(false);
        setFormState(FormStates.CreateNewConnection);
        setIsNewConnection(true);
    };

    const onSelectExisting = (value: any) => {
        setConfigName(value);
        setIsNewConnection(false);
        setFormState(FormStates.OperationDropdown);
    };

    const handleCreateConnectorOnSaveNext = () => {
        setFormState(isNewConnectorInitWizard ? FormStates.OperationDropdown : FormStates.OperationForm);
    };

    const handleCreateConnectorOnSave = () => {
        const isInitReturnError = getInitReturnType(functionDefinitions);
        const modifications: STModification[] = [];
        if (!isNewConnectorInitWizard) {
            const updateConnectorInit = updatePropertyStatement(
                `${connector.module}:${connector.name} ${configName} = ${isInitReturnError ? 'check' : ''} new (${getParams(config.connectorInit).join()});`,
                connectorConfig.initPosition
            );
            modifications.push(updateConnectorInit);
        } else {
            if (targetPosition) {
                // Add an import.
                const addImport: STModification = createImportStatement(
                    connector.org,
                    connector.module,
                    targetPosition
                );
                modifications.push(addImport);

                // Add an connector client initialization.
                if (isNewConnection) {
                    let addConnectorInit: STModification;
                    addConnectorInit = createPropertyStatement(
                        `${connector.module}:${connector.name} ${configName} = ${isInitReturnError ? 'check' : ''} new (${getParams(config.connectorInit).join()});`,
                        targetPosition
                    );
                    modifications.push(addConnectorInit);
                }
            }
        }
        onSave(modifications);
    };

    const onConnectionNameChange = () => {
        if ((isNewConnection) || (isNewConnection && isManualConnection)) {
            setFormState(FormStates.CreateNewConnection);
        } else if (isNewConnection && !isManualConnection) {
            setFormState(FormStates.CreateNewConnection);
        } else {
            setFormState(FormStates.ExistingConnection);
        }
    };

    const onCreateConnectorBack = () => {
        setIsManualConnection(false);
        setIsNewConnection(true);
        setFormState(FormStates.ExistingConnection);
    };

    const showConnectionName = isManualConnection || !isNewConnection;

    const actionReturnType = getActionReturnType(selectedOperation, functionDefinitions);

    const handleOnSave = () => {
        const isInitReturnError = getInitReturnType(functionDefinitions);
        const modifications: STModification[] = [];
        if (!isNewConnectorInitWizard) {
            const updateConnectorInit = updatePropertyStatement(
                `${connector.module}:${connector.name} ${config.name} = ${isInitReturnError ? 'check' : ''} new (${getParams(config.connectorInit).join()});`,
                connectorConfig.initPosition
            );
            modifications.push(updateConnectorInit);

            if (actionReturnType.hasReturn) {
                const updateActionInvocation = updatePropertyStatement(
                    `${actionReturnType.returnType} ${config.action.returnVariableName} = ${actionReturnType.hasError ? 'check' : ''} ${config.name}->${config.action.name}(${getParams(config.action.fields).join()});`,
                    model.position
                );
                modifications.push(updateActionInvocation);
            } else {
                const updateActionInvocation = updatePropertyStatement(
                    `${actionReturnType.hasError ? 'check' : ''} ${config.name}->${config.action.name}(${getParams(config.action.fields).join()});`,
                    model.position
                );
                modifications.push(updateActionInvocation);
            }
        } else {
            if (targetPosition) {
                // Add an import.
                const addImport: STModification = createImportStatement(
                    connector.org,
                    connector.module,
                    targetPosition
                );
                modifications.push(addImport);

                // Add an connector client initialization.
                if (isNewConnection) {
                    let addConnectorInit: STModification;
                    addConnectorInit = createPropertyStatement(
                        `${connector.module}:${connector.name} ${config.name} = ${isInitReturnError ? 'check' : ''} new (${getParams(config.connectorInit).join()});`,
                        targetPosition
                    );
                    modifications.push(addConnectorInit);
                }

                // Add an action invocation on the initialized client.
                if (actionReturnType.hasReturn) {
                    const addActionInvocation = createPropertyStatement(
                        `${actionReturnType.returnType} ${config.action.returnVariableName} = ${actionReturnType.hasError ? 'check' : ''} ${config.name}->${config.action.name}(${getParams(config.action.fields).join()});`,
                        targetPosition
                    );
                    modifications.push(addActionInvocation);
                } else {
                    const addActionInvocation = createPropertyStatement(
                        `${actionReturnType.hasError ? 'check' : ''} ${config.name}->${config.action.name}(${getParams(config.action.fields).join()});`,
                        targetPosition
                    );
                    modifications.push(addActionInvocation);
                }
            }
        }
        onSave(modifications);
    };

    if (isNewConnectorInitWizard) {
        config.connectorInit = connectorInitFormFields;
    } else if (actionReturnType.hasReturn) {
        connectorInitFormFields = config.connectorInit;
        if (STKindChecker.isLocalVarDecl(model) && (config.action.name === selectedOperation)) {
            config.action.returnVariableName =
                (((model as LocalVarDecl).typedBindingPattern.bindingPattern) as
                    CaptureBindingPattern).variableName.value;
        } else {
            config.action.returnVariableName = undefined;
        }
    }

    config.action.name = selectedOperation;

    return (
        <div className={wizardClasses.fullWidth}>
            <div className={wizardClasses.topTitleWrapper}>
                <ButtonWithIcon
                    className={wizardClasses.closeBtnAutoGen}
                    onClick={onClose}
                    icon={<CloseRounded fontSize="small" />}
                />
                <div className={wizardClasses.titleWrapper}>
                    <div className={wizardClasses.connectorIconWrapper}>
                        {getConnectorIcon(`${connector.module}_${connector.name}`)}
                    </div>
                    <Typography className={wizardClasses.configTitle} variant="h4">
                        {connector.displayName} <FormattedMessage id="lowcode.develop.connectorForms.NetSuite.connectionName.title" defaultMessage="Connection"/>
                    </Typography>
                </div>
            </div>
            {(formState === FormStates.OperationDropdown) && (
                <OperationDropdown
                    operations={operations}
                    onOperationSelect={onOperationSelect}
                    connectionDetails={config}
                    onConnectionChange={onConnectionNameChange}
                    showConnectionName={showConnectionName}
                />
            )}
            {(formState === FormStates.OperationForm) && (
                <OperationForm
                    connectionDetails={config}
                    showConnectionName={showConnectionName}
                    formFields={formFields}
                    selectedOperation={config.action.name}
                    onSave={handleOnSave}
                    onConnectionChange={onConnectionNameChange}
                    onOperationChange={onOperationChange}
                    mutationInProgress={isMutationProgress}
                    isManualConnection={isManualConnection}
                    isNewConnectorInitWizard={isNewConnectorInitWizard}
                    connectionInfo={connectionDetails}
                    hasReturn={actionReturnType.hasReturn}
                />
            )}
            {(formState === FormStates.ExistingConnection && isNewConnectorInitWizard) && (
                <SelectConnectionForm
                    onCreateNew={onCreateNew}
                    connectorConfig={config}
                    connector={connector}
                    onSelectExisting={onSelectExisting}
                />
            )}
            {(formState === FormStates.ExistingConnection && !isNewConnectorInitWizard) && (
                <CreateConnectorForm
                    initFields={connectorInitFormFields}
                    onSave={handleCreateConnectorOnSave}
                    onSaveNext={handleCreateConnectorOnSaveNext}
                    connectorConfig={config}
                    onConfigNameChange={handleConfigNameChange}
                    onBackClick={onCreateConnectorBack}
                    connector={connector}
                    isNewConnectorInitWizard={isNewConnectorInitWizard}
                    isOauthConnector={false}
                />
            )}
            {(formState === FormStates.CreateNewConnection) && (
                <CreateConnectorForm
                    initFields={connectorInitFormFields}
                    onSave={handleCreateConnectorOnSave}
                    onSaveNext={handleCreateConnectorOnSaveNext}
                    connectorConfig={config}
                    onConfigNameChange={handleConfigNameChange}
                    onBackClick={onCreateConnectorBack}
                    connector={connector}
                    isNewConnectorInitWizard={isNewConnectorInitWizard}
                    isOauthConnector={false}
                />
            )}
        </div>
    );
}
