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

import { CaptureBindingPattern, LocalVarDecl, STKindChecker, STNode } from "@ballerina/syntax-tree";
import { Typography } from "@material-ui/core";
import { CloseRounded } from "@material-ui/icons";
import classNames from "classnames";
import { v4 as uuidv4 } from "uuid";

import { ConnectionDetails } from "../../../../api/models";
import { ActionConfig, ConnectorConfig, FormField, FunctionDefinitionInfo } from "../../../../ConfigurationSpec/types";
import { Context as DiagramContext } from "../../../../Contexts/Diagram"
import { Connector, STModification } from "../../../../Definitions/lang-client-extended";
import { getAllVariables } from "../../../utils/mixins";
import {
    createImportStatement,
    createPropertyStatement,
    updatePropertyStatement} from "../../../utils/modification-util";
import { DraftInsertPosition } from "../../../view-state/draft";
import { SelectConnectionForm } from "../../ConnectorConfigWizard/Components/SelectExistingConnection";
import { wizardStyles } from "../../ConnectorConfigWizard/style";
import { ConnectionType, OauthConnectButton } from "../../OauthConnectButton";
import { ButtonWithIcon } from "../../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { LinePrimaryButton } from "../../Portals/ConfigForm/Elements/Button/LinePrimaryButton";
import { SecondaryButton } from "../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import {
    genVariableName,
    getActionReturnType,
    getConnectorIcon,
    getInitReturnType,
    getKeyFromConnection,
    getOauthConnectionParams,
    getParams
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
}

enum FormStates {
    ExistingConnection,

    OauthConnect,
    CreateNewConnection,

    OperationDropdown,
    OperationForm,
}

export function GmailWizard(props: WizardProps) {
    const { state: { stSymbolInfo: symbolInfo, isMutationProgress, syntaxTree } } = useContext(DiagramContext);

    const wizardClasses = wizardStyles();
    const { functionDefinitions, connectorConfig, connector, onSave, onClose, isNewConnectorInitWizard, targetPosition, model } = props;
    let connectorInitFormFields: FormField[] = functionDefinitions.get("init") ? functionDefinitions.get("init").parameters : functionDefinitions.get("__init").parameters;

    const config: ConnectorConfig = connectorConfig ? connectorConfig : new ConnectorConfig();

    const [formState, setFormState] = useState<FormStates>(FormStates.CreateNewConnection);

    useEffect(() => {
        setFormState(FormStates.OauthConnect);
    }, []);

    useEffect(() => {
        if (config.existingConnections) {
            setFormState(FormStates.ExistingConnection);
            setIsNewConnection(false);
        }
    }, [config.existingConnections]);

    const [connectionDetails, setConnectionDetails] = useState(null);
    const [selectedOperation, setSelectedAction] = useState(isNewConnectorInitWizard ? null : config.action.name);
    const [isManualConnection, setIsManualConnection] = useState(false);
    const [isNewConnection, setIsNewConnection] = useState(true);

    // managing name set by the non oauth connectors
    config.name = isNewConnectorInitWizard ?
        genVariableName(connector.module + "Endpoint", getAllVariables(symbolInfo))
        : config.name;
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

    let formFields: FormField[] = null;
    if (selectedOperation) {
        formFields = functionDefinitions.get(selectedOperation).parameters;
        config.action = new ActionConfig();
        config.action.fields = formFields;
    }

    const sessionId: string = uuidv4();
    const handleOnConnection = (type: ConnectionType, connection: ConnectionDetails) => {
        setConnectionDetails(connection);
        setFormState(FormStates.OperationDropdown);
    };

    const handleConnectionUpdate = () => {
        setIsManualConnection(false);
        setFormState(FormStates.OauthConnect);
    };

    const handleOnFailure = (e: Error) => {
        //    todo handle error
    };

    const onOperationSelect = (operation: string) => {
        setSelectedAction(operation);
        setFormState(FormStates.OperationForm);
    };

    const onOperationChange = () => {
        setFormState(FormStates.OperationDropdown);
    };

    const onManualConnection = () => {
        setConfigName(genVariableName(connector.module + "Endpoint", getAllVariables(symbolInfo)));
        setIsManualConnection(true);
        setFormState(FormStates.CreateNewConnection);
    };

    const onCreateNew = () => {
        setConfigName(genVariableName(connector.module + "Endpoint", getAllVariables(symbolInfo)));
        setIsManualConnection(false);
        setFormState(FormStates.OauthConnect);
        setIsNewConnection(true);
    };

    const onOauthConnectorBack = () => {
        if (config.existingConnections) {
            setIsNewConnection(false);
            setFormState(FormStates.ExistingConnection);
        }
    };

    const onSelectExisting = (value: any) => {
        setConfigName(value);
        setIsNewConnection(false);
        setFormState(FormStates.OperationDropdown);
    };

    const onCreateConnectorSave = () => {
        setFormState(isNewConnectorInitWizard ? FormStates.OperationDropdown : FormStates.OperationForm);
    };

    const onConnectionNameChange = () => {
        if ((isNewConnection) || (isNewConnection && isManualConnection)) {
            setFormState(FormStates.CreateNewConnection);
        } else if (isNewConnection && !isManualConnection) {
            setFormState(FormStates.OauthConnect);
        } else {
            setFormState(FormStates.ExistingConnection);
        }
    };

    const onCreateConnectorBack = () => {
        setIsManualConnection(false);
        setIsNewConnection(true);
        setFormState(FormStates.OauthConnect);
    };

    const showConnectionName = isManualConnection || !isNewConnection;

    const getFormFieldValue = (key: string) => {
        return connectorInitFormFields.find(field => field.name === "gmailConfig").fields
            .find(field => field.name === "oauthClientConfig").fields
            .find(field => field.name === key).value || "";
    }

    const actionReturnType = getActionReturnType(selectedOperation, functionDefinitions);

    const handleOnSave = () => {
        const isInitReturnError = getInitReturnType(functionDefinitions);
        let modifications: STModification[] = [];
        if (isNewConnectorInitWizard) {
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
                if (isNewConnection) {
                    let addConfigurableVars: STModification;
                    let addConnectorInit: STModification;
                    if (!isManualConnection) {
                        if (!symbolInfo.configurables.get(getKeyFromConnection(connectionDetails, 'clientIdKey'))){
                            addConfigurableVars = createPropertyStatement(
                                `configurable string ${getKeyFromConnection(connectionDetails, 'clientIdKey')} = ?;
                                configurable string ${getKeyFromConnection(connectionDetails, 'clientSecretKey')} = ?;
                                configurable string ${getKeyFromConnection(connectionDetails, 'tokenEpKey')} = ?;
                                configurable string ${getKeyFromConnection(connectionDetails, 'refreshTokenKey')} = ?;`,
                                {column: 0, line: syntaxTree?.configurablePosition?.startLine || 1}
                            );
                            modifications.push(addConfigurableVars);
                        }

                        addConnectorInit = createPropertyStatement(
                            `${connector.module}:${connector.name} ${config.name} = ${isInitReturnError ? 'check' : ''} new (
                                ${getOauthConnectionParams(connector.displayName.toLocaleLowerCase(), connectionDetails)}\n);`,
                            targetPosition
                        );
                    } else {
                        addConnectorInit = createPropertyStatement(
                            `${connector.module}:${connector.name} ${config.name} = ${isInitReturnError ? 'check' : ''} new ({
                                oauthClientConfig: {
                                    clientId: ${getFormFieldValue("clientId")},
                                    clientSecret: ${getFormFieldValue("clientSecret")},
                                    refreshToken: ${getFormFieldValue("refreshToken")},
                                    refreshUrl: ${getFormFieldValue("refreshUrl")}
                                }
                             });`,
                            targetPosition
                        );
                    }
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
        } else {
            const updateConnectorInit = updatePropertyStatement(
                `${connector.module}:${connector.name} ${config.name} = ${isInitReturnError ? 'check' : ''} new ({
                    oauthClientConfig: {
                        clientId: ${getFormFieldValue("clientId")},
                        clientSecret: ${getFormFieldValue("clientSecret")},
                        refreshToken: ${getFormFieldValue("refreshToken")},
                        refreshUrl: ${getFormFieldValue("refreshUrl")}
                    }
                 });`,
                config.initPosition
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
        }
        onSave(modifications);
    };

    if (isNewConnectorInitWizard) {
        config.connectorInit = connectorInitFormFields;
    } else if (actionReturnType.hasReturn) {
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
                        {connector.displayName} Connection
                    </Typography>
                </div>
            </div>
            <div>
                {isNewConnection && !isManualConnection && (
                    <div className={classNames(wizardClasses.bottomBtnWrapper, wizardClasses.bottomRadius)}>
                        <div className={wizardClasses.fullWidth}>
                            <div className={wizardClasses.mainOauthBtnWrapper}>
                                <OauthConnectButton
                                    className={classNames(wizardClasses.fullWidth, wizardClasses.oauthBtnWrapper)}
                                    currentConnection={connectionDetails}
                                    connectorName={connector.displayName}
                                    onSelectConnection={handleOnConnection}
                                    onFailure={handleOnFailure}
                                    onDeselectConnection={handleConnectionUpdate}
                                />
                            </div>
                        </div>
                    </div>
                )}
                {(formState === FormStates.OauthConnect) &&
                    (
                        <div className={classNames(wizardClasses.manualBtnWrapper)}>
                            <p className={wizardClasses.subTitle}>Or use manual configurations</p>
                            <LinePrimaryButton
                                testId={"gmail-manual-btn"}
                                className={wizardClasses.fullWidth}
                                text="Manual Connection"
                                fullWidth={false}
                                onClick={onManualConnection}
                            />
                            {(config.existingConnections && isNewConnection) && (
                                <div className={wizardClasses.connectBackBtn}>
                                    <SecondaryButton
                                        text="Back"
                                        fullWidth={false}
                                        onClick={onOauthConnectorBack}
                                    />
                                </div>
                            )}
                        </div>
                    )
                }
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
                    selectedOperation={selectedOperation}
                    hasReturn={actionReturnType.hasReturn}
                    onSave={handleOnSave}
                    onConnectionChange={onConnectionNameChange}
                    onOperationChange={onOperationChange}
                    mutationInProgress={isMutationProgress}
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
                    onSave={onCreateConnectorSave}
                    connectorConfig={config}
                    onConfigNameChange={handleConfigNameChange}
                    onBackClick={onCreateConnectorBack}
                    connector={connector}
                    isNewConnectorInitWizard={isNewConnectorInitWizard}
                />
            )}
            {(formState === FormStates.CreateNewConnection) && (
                <CreateConnectorForm
                    initFields={connectorInitFormFields}
                    onSave={onCreateConnectorSave}
                    connectorConfig={config}
                    onConfigNameChange={handleConfigNameChange}
                    onBackClick={onCreateConnectorBack}
                    connector={connector}
                    isNewConnectorInitWizard={isNewConnectorInitWizard}
                />
            )}
        </div>
    );
}
