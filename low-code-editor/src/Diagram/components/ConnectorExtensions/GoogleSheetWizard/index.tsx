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
import { FormattedMessage, useIntl } from "react-intl";

import { CaptureBindingPattern, LocalVarDecl, STKindChecker, STNode } from "@ballerina/syntax-tree";
import { Typography } from "@material-ui/core";
import { CloseRounded } from "@material-ui/icons";
import classNames from "classnames";

import { ConnectionDetails } from "../../../../api/models";
import { ActionConfig, ConnectorConfig, FormField, FunctionDefinitionInfo } from "../../../../ConfigurationSpec/types";
import { Context } from "../../../../Contexts/Diagram";
import { Connector, STModification } from "../../../../Definitions/lang-client-extended";
import { getAllVariables } from "../../../utils/mixins"
import {
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
import { ConnectionType, OauthConnectButton } from "../../OauthConnectButton";
import { ButtonWithIcon } from "../../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { LinePrimaryButton } from "../../Portals/ConfigForm/Elements/Button/LinePrimaryButton";
import {PrimaryButton} from "../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import {useStyles} from "../../Portals/ConfigForm/forms/style";
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
    isMutationProgress: boolean;
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


export function GoogleSheet(props: WizardProps) {
    const wizardClasses = wizardStyles();
    const classes = useStyles();
    const intl = useIntl();
    const { functionDefinitions, connectorConfig, connector, onSave, onClose, isNewConnectorInitWizard, targetPosition, model, selectedConnector } = props;
    const { props: { stSymbolInfo: symbolInfo, isMutationProgress, syntaxTree } } = useContext(Context);
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

    let formFields: FormField[] = [];
    if (selectedOperation) {
        formFields = functionDefinitions.get(selectedOperation).parameters;
        config.action = new ActionConfig();
        config.action.fields = formFields;
    }

    const handleOnConnection = (type: ConnectionType, connection: ConnectionDetails) => {
        setConnectionDetails(connection);
    };

    const handleConnectionUpdate = () => {
        setConnectionDetails(null);
        setIsManualConnection(false);
        setFormState(FormStates.OauthConnect);
    };

    const handleOnFailure = () => {
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

    const handleManualConnectorSaveNext = () => {
        setFormState(isNewConnectorInitWizard ? FormStates.OperationDropdown : FormStates.OperationForm);
    };

    const handleOauthConnectorOnSave = () => {
        const isInitReturnError = getInitReturnType(functionDefinitions);
        const modifications: STModification[] = [];
        if (isNewConnectorInitWizard) {
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
                            `${connector.module}:${connector.name} ${configName} = ${isInitReturnError ? 'check' : ''} new (
                                ${getOauthParamsFromConnection(connector.displayName.toLocaleLowerCase(), connectionDetails)}\n);`,
                            targetPosition
                        );
                    }
                    modifications.push(addConnectorInit);
                }
            }
        } else {
            const updateConnectorInit = updatePropertyStatement(
                `${connector.module}:${connector.name} ${configName} = ${isInitReturnError ? 'check' : ''} new ({
                    oauthClientConfig: {
                        clientId: ${getFormFieldValue("clientId")},
                        clientSecret: ${getFormFieldValue("clientSecret")},
                        refreshToken: ${getFormFieldValue("refreshUrl")},
                        refreshUrl: ${getFormFieldValue("refreshToken")}
                    }
                 });`,
                config.initPosition
            );
            modifications.push(updateConnectorInit);
        }
        onSave(modifications);
    };

    const handleManualConnectorOnSave = () => {
        const isInitReturnError = getInitReturnType(functionDefinitions);
        const modifications: STModification[] = [];
        if (isNewConnectorInitWizard) {
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
                    if (isManualConnection) {
                        addConnectorInit = createPropertyStatement(
                            `${connector.module}:${connector.name} ${configName} = ${isInitReturnError ? 'check' : ''} new ({
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
            }
        } else {
            const updateConnectorInit = updatePropertyStatement(
                `${connector.module}:${connector.name} ${configName} = ${isInitReturnError ? 'check' : ''} new ({
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
        }
        onSave(modifications);
    };

    const handleOauthConnectorSaveNext = () => {
        setFormState(FormStates.OperationDropdown);
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
        return connectorInitFormFields.find(field => field.name === "spreadsheetConfig").fields
            .find(field => field.name === "oauthClientConfig").fields
            .find(field => field.name === key).value || "";
    }

    const actionReturnType = getActionReturnType(selectedOperation, functionDefinitions);

    const handleOnSave = () => {
        const isInitReturnError = getInitReturnType(functionDefinitions);
        const modifications: STModification[] = [];
        if (isNewConnectorInitWizard) {
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
                    let addConfigurableVars: STModification;
                    let addConnectorInit: STModification;
                    if (!isManualConnection) {
                        if (!symbolInfo.configurables.get(getKeyFromConnection(connectionDetails, 'clientIdKey'))) {
                            addConfigurableVars = createPropertyStatement(
                                `configurable string ${getKeyFromConnection(connectionDetails, 'clientIdKey')} = ?;
                                configurable string ${getKeyFromConnection(connectionDetails, 'clientSecretKey')} = ?;
                                configurable string ${getKeyFromConnection(connectionDetails, 'tokenEpKey')} = ?;
                                configurable string ${getKeyFromConnection(connectionDetails, 'refreshTokenKey')} = ?;`,
                                { column: 0, line: syntaxTree?.configurablePosition?.startLine || 1 }
                            );
                            modifications.push(addConfigurableVars);
                        }

                        addConnectorInit = createPropertyStatement(
                            `${connector.module}:${connector.name} ${config.name} = ${isInitReturnError ? 'check' : ''} new (
                                ${getOauthParamsFromConnection(connector.displayName.toLocaleLowerCase(), connectionDetails)}\n);`,
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
        connectorInitFormFields = config.connectorInit;
        config.action.returnVariableName =
            (((model as LocalVarDecl).typedBindingPattern.bindingPattern) as CaptureBindingPattern).variableName.value;
    };

    const manualConnectionButtonText = intl.formatMessage({
        id: "lowcode.develop.connectorForms.GSheet.manualConnection.button.text",
        defaultMessage: "Manual Connection"
    });

    const backButtonText = intl.formatMessage({
        id: "lowcode.develop.connectorForms.GSheet.backButton.text",
        defaultMessage: "Back"
    });

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
                        {connector.displayName} <FormattedMessage id="lowcode.develop.connectorForms.GSheet.title" defaultMessage="Connection"/>
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
                        {(connectionDetails === null) && (
                            <>
                                <p className={wizardClasses.subTitle}>Or use manual configurations</p>
                                <LinePrimaryButton
                                    testId={"sheet-manual-btn"}
                                    className={wizardClasses.fullWidth}
                                    text="Manual Connection"
                                    fullWidth={false}
                                    onClick={onManualConnection}
                                />
                            </>
                        )}
                        <>
                            {(connectionDetails && isNewConnection) && (
                                <div className={classes.wizardBtnHolder}>
                                    <SecondaryButton
                                        text="Save"
                                        fullWidth={false}
                                        onClick={handleOauthConnectorOnSave}
                                    />
                                    <PrimaryButton
                                        text="Save &amp; Next"
                                        fullWidth={false}
                                        onClick={handleOauthConnectorSaveNext}
                                    />
                                </div>
                            )}
                            {(config.existingConnections && isNewConnection && !connectionDetails) && (
                                <div className={wizardClasses.connectBackBtn}>
                                    <SecondaryButton
                                        text={backButtonText}
                                        fullWidth={false}
                                        onClick={onOauthConnectorBack}
                                    />
                                </div>
                            )}
                        </>
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
                    selectedOperation={config.action.name}
                    onSave={handleOnSave}
                    onConnectionChange={onConnectionNameChange}
                    onOperationChange={onOperationChange}
                    mutationInProgress={isMutationProgress}
                    isManualConnection={isManualConnection}
                    connectionInfo={connectionDetails}
                    hasReturnType={actionReturnType.hasReturn}
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
                    onSave={handleManualConnectorOnSave}
                    onSaveNext={handleManualConnectorSaveNext}
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
                    onSave={handleManualConnectorOnSave}
                    onSaveNext={handleManualConnectorSaveNext}
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
