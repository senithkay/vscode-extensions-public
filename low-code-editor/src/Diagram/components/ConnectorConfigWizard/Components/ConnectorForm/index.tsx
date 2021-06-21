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
import React, { ReactNode, useContext, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { CaptureBindingPattern, LocalVarDecl, STKindChecker } from '@ballerina/syntax-tree';
import { Divider, Typography } from "@material-ui/core";
import classNames from "classnames";
import { triggerErrorNotification, triggerSuccessNotification } from "store/actions";
import { store } from "store/index";

import { createManualConnection, MANUAL_TYPE, updateManualConnection } from '../../../../../../../../src/api/connector';
import {
    AiSuggestionsReq,
    AiSuggestionsRes,
    ConnectionDetails,
    OauthProviderConfig
} from "../../../../../api/models";
import { CloseRounded } from "../../../../../assets/icons";
import { ActionConfig, ConnectorConfig, FormField, WizardType } from "../../../../../ConfigurationSpec/types";
import { Context } from '../../../../../Contexts/Diagram';
import { STSymbolInfo } from "../../../../../Definitions";
import { BallerinaConnectorsInfo, STModification } from "../../../../../Definitions/lang-client-extended";
import { TextPreloaderVertical } from "../../../../../PreLoader/TextPreloaderVertical";
import { DiagramContext } from "../../../../../providers/contexts";
import { ConnectionType, OauthConnectButton } from "../../../../components/OauthConnectButton";
import {
    EVENT_TYPE_AZURE_APP_INSIGHTS,
    FINISH_CONNECTOR_ACTION_ADD_INSIGHTS,
    FINISH_CONNECTOR_INIT_ADD_INSIGHTS,
    LowcodeEvent
} from "../../../../models";
import { getAllVariables, getModuleVariable } from "../../../../utils/mixins";
import {
    createCheckedPayloadFunctionInvocation,
    createImportStatement,
    createObjectDeclaration,
    createPropertyStatement,
    updatePropertyStatement,
} from "../../../../utils/modification-util";
import { DraftInsertPosition } from "../../../../view-state/draft";
import { ButtonWithIcon } from "../../../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import {
    addAiSuggestion, genVariableName, getActionReturnType, getAllVariablesForAi,
    getConnectorComponent, getConnectorIcon, getFormattedModuleName, getInitReturnType,
    getManualConnectionDetailsFromFormFields,
    getManualConnectionTypeFromFormFields,
    getMapTo, getOauthConnectionConfigurables, getOauthConnectionFromFormField, getOauthParamsFromConnection,
    getParams, matchEndpointToFormField
} from '../../../Portals/utils';
import { connectorCategories } from '../../../Portals/utils/constants';
import { ConfigWizardState } from "../../index";
import { wizardStyles } from "../../style";
import "../../style.scss";
import { CreateConnectorForm } from "../CreateNewConnection";
import { OperationForm } from "../OperationForm";
import { SelectConnectionForm } from '../SelectExistingConnection';
import { SingleForm } from "../SingleForm";

export interface OauthProviderConfigState {
    isConfigListLoading: boolean;
    configList: OauthProviderConfig[];
    configListError?: Error;
}
export interface ConnectorOperation {
    name: string,
    label?: string;
}

enum FormStates {
    ExistingConnection,
    OauthConnect,
    CreateNewConnection,
    OperationDropdown,
    OperationForm,
    SingleForm,
}

enum ConnectionAction {
    create,
    update
}

export interface ConnectorConfigWizardProps {
    connectorInfo: BallerinaConnectorsInfo;
    targetPosition: DraftInsertPosition;
    configWizardArgs?: ConfigWizardState;
    onClose: () => void;
    selectedConnector: LocalVarDecl;
    isAction?: boolean;
}

export function ConnectorForm(props: ConnectorConfigWizardProps) {
    const wizardClasses = wizardStyles();
    const intl = useIntl();
    const { modifyDiagram } = useContext(DiagramContext).callbacks;
    const { state } = useContext(Context);
    const {
        stSymbolInfo,
        isMutationProgress,
        oauthProviderConfigs,
        userInfo,
        getAiSuggestions,
        onEvent,
        syntaxTree,
        getAllConnections
    } = state;
    const symbolInfo: STSymbolInfo = stSymbolInfo;
    const configurations: OauthProviderConfigState = oauthProviderConfigs;
    const { connectorInfo, targetPosition, configWizardArgs, onClose, selectedConnector, isAction } = props;
    const { functionDefInfo, connectorConfig, wizardType, model } = configWizardArgs;

    let isOauthConnector = false;
    configurations.configList.forEach((configuration) => {
        if (connectorInfo?.displayName.toLocaleLowerCase() === configuration.connectorName.toLocaleLowerCase()) {
            isOauthConnector = true;
        }
    });

    const [config] = useState(connectorConfig ? connectorConfig : new ConnectorConfig());
    const isNewConnectorInitWizard = config.existingConnections ? (wizardType === WizardType.NEW) : true;

    const [formState, setFormState] = useState<FormStates>(FormStates.CreateNewConnection);
    const [connection, setConnection] = useState<ConnectionDetails>();
    const [isManualConnection, setIsManualConnection] = useState(false);
    const [isNewConnection, setIsNewConnection] = useState(isNewConnectorInitWizard);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOperation, setSelectedOperation] = useState(config?.action?.name);
    const [selectedActiveConnection, setSelectedActiveConnection] = useState<ConnectionDetails>();
    const [selectedConnectionType, setSelectedConnectionType] = useState<ConnectionType>();
    // TODO:In the first phase of supporting manual connection saving functionality , only the following connectors are supported.
    const connectorTypes = ["Google Sheets", "Google Calendar", "Gmail", "GitHub"];
    const [activeConnectionHandler, setActiveConnectionHandler] = useState("");
    const updateConfigSuccessMessage = intl.formatMessage({
        id: "lowcode.develop.connectorForms.manualConnection.updateConfig.success",
        defaultMessage: "Successfully updated the connection configuration."
    });
    const updateConfigErrorMessage = intl.formatMessage({
        id: "lowcode.develop.connectorForms.manualConnection.updateConfig.error",
        defaultMessage: "An error occurred while updating the connection configuration. Please try again."
    });
    const createConfigSuccessMessage = intl.formatMessage({
        id: "lowcode.develop.connectorForms.manualConnection.createConfig.success",
        defaultMessage: "Successfully saved the connection configuration."
    });
    const createConfigErrorMessage = intl.formatMessage({
        id: "lowcode.develop.connectorForms.manualConnection.create Config.error",
        defaultMessage: "An error occurred while saving the connection configuration. Please try again."
    });

    useEffect(() => {
        if (isNewConnection && isOauthConnector) {
            setFormState(FormStates.OauthConnect);
            setIsLoading(false);
            return;
        } else if (connectorInfo.category === connectorCategories.CHOREO_CONNECTORS) {
            setFormState(FormStates.SingleForm);
            setIsLoading(false);
        } else if (isAction) {
            setFormState(FormStates.OperationForm);
            setIsLoading(false);
            return;
        } else if (isOauthConnector) {
            if (connectorConfig?.connectorInit?.length > 0) {
                (async () => {
                    const allConnections = await getAllConnections(userInfo?.selectedOrgHandle) as ConnectionDetails[];
                    const activeConnection = getOauthConnectionFromFormField(connectorConfig.connectorInit[0], allConnections);
                    if (activeConnection) {
                        setConnection(activeConnection);
                        setActiveConnectionHandler(activeConnection.handle);
                        if (activeConnection.type === MANUAL_TYPE) {
                            setIsManualConnection(true);
                            setFormState(FormStates.CreateNewConnection);
                            connectorConfig.connectionName = activeConnection.displayName;
                            config.connectionName = activeConnection.displayName;
                        } else {
                            setIsManualConnection(false);
                            setFormState(FormStates.OauthConnect);
                        }
                    } else {
                        setFormState(FormStates.CreateNewConnection);
                    }
                    setIsLoading(false);
                })();
            }
        } else {
            setFormState(FormStates.CreateNewConnection);
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedConnector) {
            const connectorNameValue = (selectedConnector.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.value;
            config.name = connectorNameValue;
            matchEndpointToFormField(selectedConnector, config.connectorInit);
            config.isExistingConnection = (connectorNameValue !== undefined);
            onSelectExisting(connectorNameValue);
        }
    }, [selectedConnector]);

    const connectorInitFormFields: FormField[] = functionDefInfo?.get("init") ?
        functionDefInfo?.get("init").parameters : functionDefInfo?.get("__init").parameters;

    // managing name set by the non oauth connectors
    config.name = (isNewConnectorInitWizard && !config.name) ?
        genVariableName(getFormattedModuleName(connectorInfo.module) + "Endpoint", getAllVariables(symbolInfo))
        : config.name;
    const [configName, setConfigName] = useState(config.name);
    const handleConfigNameChange = (name: string) => {
        setConfigName(name);
    };

    const operations: ConnectorOperation[] = [];
    if (functionDefInfo) {
        functionDefInfo.forEach((value, key) => {
            if (key !== "init" && key !== "__init") {
                operations.push({ name: key, label: value.label });
            }
        });
    }
    if (!config.action) {
        config.action = new ActionConfig();
    }

    const onCreateNew = () => {
        setConfigName(genVariableName(connectorInfo.module + "Endpoint", getAllVariables(symbolInfo)));
        if (isOauthConnector) {
            // setIsManualConnection(false);
            setFormState(FormStates.OauthConnect);
        } else {
            setConfigName(genVariableName(connectorInfo.module + "Endpoint", getAllVariables(symbolInfo)));
            setFormState(FormStates.CreateNewConnection);
        }
        setIsNewConnection(true);
    };

    const onCreateConnectorSave = () => {
        if (isNewConnection) {
            setFormState(FormStates.OperationDropdown);
        } else {
            setFormState(FormStates.OperationForm);
        }
    };

    const handleOnConnection = (type: ConnectionType, connectionDetails: ConnectionDetails) => {
        setConnection(connectionDetails);
        if (type === ConnectionType.UPDATED || type === ConnectionType.NEW) {
            setSelectedActiveConnection(connectionDetails);
        }
        setSelectedConnectionType(type);
    };

    const handleConnectionUpdate = () => {
        setConnection(undefined);
    };

    const handleOnFailure = () => {
        //    todo handle error
    };

    const onOperationSelect = (operation: string) => {
        setSelectedOperation(operation);
        setFormState(FormStates.OperationForm);
        config.action.returnVariableName = undefined;
    };

    const onOperationChange = () => {
        setFormState(FormStates.OperationDropdown);
    };

    const onManualConnection = () => {
        setConfigName(genVariableName(getFormattedModuleName(connectorInfo.module) + "Endpoint", getAllVariables(symbolInfo)));
        setIsManualConnection(true);
        setFormState(FormStates.CreateNewConnection);
    };

    const onSelectExisting = (value: any) => {
        if (connectorInfo.category === connectorCategories.CHOREO_CONNECTORS) {
            setIsNewConnection(true);
            setFormState(FormStates.SingleForm);
        } else {
            setConfigName(value);
            setIsNewConnection(false);
            setFormState(FormStates.OperationForm);
        }
    };

    const handleCreateConnectorSaveNext = () => {
        setFormState(FormStates.OperationForm);
    };

    const showNotification = (status: number, action: ConnectionAction) => {
        if (action === ConnectionAction.create) {
            if (status === 200 || status === 201) {
                store.dispatch(triggerSuccessNotification(createConfigSuccessMessage));
            } else if (status !== 200) {
                store.dispatch(triggerErrorNotification(createConfigErrorMessage));
            }
        } else if (action === ConnectionAction.update) {
            if (status === 200 || status === 201) {
                store.dispatch(triggerSuccessNotification(updateConfigSuccessMessage));
            } else if (status !== 200) {
                store.dispatch(triggerErrorNotification(updateConfigErrorMessage));
            }
        }
    }

    const handleClientOnSave = () => {
        const modifications: STModification[] = [];
        const isInitReturnError = getInitReturnType(functionDefInfo);
        const moduleName = getFormattedModuleName(connectorInfo.module);
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: FINISH_CONNECTOR_INIT_ADD_INSIGHTS,
            property: connectorInfo.displayName
        };
        onEvent(event);

        // check oauth flow and manual flow

        if (isOauthConnector && !isManualConnection && connection) {
            let OAuthtype;
            if (connection.codeVariableKeys.find(field => field.name === "tokenKey")?.name) {
                OAuthtype = "BearerTokenConfig"
            }
            else if (connection.codeVariableKeys.find(field => field?.name === "clientIdKey")?.name) {
                OAuthtype = "OAuth2RefreshTokenGrantConfig"
            }
            const connectorConfigurables = getOauthConnectionConfigurables(connectorInfo.displayName.toLocaleLowerCase(), connection, symbolInfo.configurables, OAuthtype);

            // oauth flow
            if (isNewConnectorInitWizard && targetPosition) {
                // new connector client initialization
                const addImport: STModification = createImportStatement(
                    connectorInfo.org,
                    connectorInfo.module,
                    targetPosition
                );
                modifications.push(addImport);

                if (connectorConfigurables) {
                    const addConfigurableVars = createPropertyStatement(
                        connectorConfigurables,
                        { column: 0, line: syntaxTree?.configurablePosition?.startLine || 1 }
                    );
                    modifications.push(addConfigurableVars);
                }

                const addConnectorInit: STModification = createPropertyStatement(
                    `${moduleName}:${connectorInfo.name} ${config.name} = ${isInitReturnError ? 'check' : ''} new (
                        ${getOauthParamsFromConnection(connectorInfo.displayName.toLocaleLowerCase(), connection, OAuthtype)});`,
                    targetPosition
                );
                modifications.push(addConnectorInit);
            } else {
                if (connectorConfigurables) {
                    const addConfigurableVars = createPropertyStatement(
                        connectorConfigurables,
                        { column: 0, line: syntaxTree?.configurablePosition?.startLine || 1 }
                    );
                    modifications.push(addConfigurableVars);
                }
                // update connector client initialization
                const updateConnectorInit = updatePropertyStatement(
                    `${moduleName}:${connectorInfo.name} ${config.name} = ${isInitReturnError ? 'check' : ''} new (
                        ${getOauthParamsFromConnection(connectorInfo.displayName.toLocaleLowerCase(), connection, OAuthtype)});`,
                    config.initPosition
                );
                modifications.push(updateConnectorInit);
            }
        } else {
            // manual flow
            let connectorConfigurables;
            let configSource = getParams(config.connectorInit).join();
            let response;
            if ((connectorTypes.includes(connectorInfo.displayName))) {
                const selectedType = getManualConnectionTypeFromFormFields(config.connectorInit);
                const manualConnectionFormFieldValues = getManualConnectionDetailsFromFormFields(config.connectorInit);
                const formattedFieldValues: { name: string; value: string; }[] = [];
                manualConnectionFormFieldValues.selectedFields.forEach((item: any) => {
                    if (item.value.slice(0, 1) === '\"' && item.value.slice(-1) === '\"') {
                        formattedFieldValues.push({
                            name: item.name,
                            value: item.value.substring(1, (item.value.length - 1))
                        });
                    }
                });
                (async () => {
                    if (isNewConnectorInitWizard && targetPosition) {
                        if (formattedFieldValues.length > 0) {
                            response = await createManualConnection(userInfo?.selectedOrgHandle, connectorInfo.displayName,
                                config.connectionName, userInfo.user.email, formattedFieldValues);
                            configSource = getOauthParamsFromConnection(connectorInfo.displayName.toLocaleLowerCase(),
                                response.data, selectedType);
                            connectorConfigurables = getOauthConnectionConfigurables(connectorInfo.displayName.toLocaleLowerCase(),
                                response.data, symbolInfo.configurables, selectedType);
                            showNotification(response.status, ConnectionAction.create);
                        }
                        else {
                            // tslint:disable-next-line: no-shadowed-variable
                            const addImport: STModification = createImportStatement(
                                connectorInfo.org,
                                connectorInfo.module,
                                targetPosition
                            );
                            modifications.push(addImport);

                            if (connectorConfigurables) {
                                const addConfigurableVars = createPropertyStatement(
                                    connectorConfigurables,
                                    { column: 0, line: syntaxTree?.configurablePosition?.startLine || 1 }
                                );
                                modifications.push(addConfigurableVars);
                            }
                            // tslint:disable-next-line: no-shadowed-variable
                            const addConnectorInit: STModification = createPropertyStatement(
                                `${moduleName}:${connectorInfo.name} ${config.name} = ${isInitReturnError ? 'check' : ''} new (${configSource});`,
                                targetPosition
                            );
                            modifications.push(addConnectorInit);
                        }
                        // new connector client initialization
                        const addImport: STModification = createImportStatement(
                            connectorInfo.org,
                            connectorInfo.module,
                            targetPosition
                        );
                        modifications.push(addImport);
                        if (connectorConfigurables) {
                            const addConfigurableVars = createPropertyStatement(
                                connectorConfigurables,
                                { column: 0, line: syntaxTree?.configurablePosition?.startLine || 1 }
                            );
                            modifications.push(addConfigurableVars);
                        }

                        const addConnectorInit: STModification = createPropertyStatement(
                            `${moduleName}:${connectorInfo.name} ${config.name} = ${isInitReturnError ? 'check' : ''} new (${configSource});`,
                            targetPosition
                        );
                        modifications.push(addConnectorInit);

                    } else {
                        // update connector client initialization
                          const updatedFields: { name: string; value: string; }[] = [];
                          manualConnectionFormFieldValues.selectedFields.forEach((item: any) => {
                              if (item.value.slice(0, 1) === '\"' && item.value.slice(-1) === '\"'){
                                  updatedFields.push({
                                      name: item.name,
                                      value: item.value.substring(1, (item.value.length - 1))
                                  });
                              }
                          });
                          if (updatedFields.length > 0 && config.connectionName) {
                              onClose();
                              response = await updateManualConnection(userInfo?.selectedOrgHandle, connectorInfo.displayName,
                                  config?.connectionName, userInfo.user.email, updatedFields, selectedType, activeConnectionHandler);
                              configSource = getOauthParamsFromConnection(connectorInfo.displayName.toLocaleLowerCase(),
                                  response.data, selectedType);
                              showNotification(response.status, ConnectionAction.update);
                          } else {
                              const updateConnectorInit = updatePropertyStatement(
                                  `${moduleName}:${connectorInfo.name} ${config.name} = ${isInitReturnError ? 'check' : ''} new (${configSource});`,
                                  connectorConfig.initPosition
                              );
                              modifications.push(updateConnectorInit);
                          }
                    }
                    if (modifications.length > 0) {
                        modifyDiagram(modifications);
                        onClose();
                    }
                })();
            }
            else {
                if (isNewConnectorInitWizard && targetPosition) {
                    // new connector client initialization
                    const addImport: STModification = createImportStatement(
                        connectorInfo.org,
                        connectorInfo.module,
                        targetPosition
                    );
                    modifications.push(addImport);

                    if (connectorConfigurables) {
                        const addConfigurableVars = createPropertyStatement(
                            connectorConfigurables,
                            { column: 0, line: syntaxTree?.configurablePosition?.startLine || 1 }
                        );
                        modifications.push(addConfigurableVars);
                    }

                    const addConnectorInit: STModification = createPropertyStatement(
                        `${moduleName}:${connectorInfo.name} ${config.name} = ${isInitReturnError ? 'check' : ''} new (${configSource});`,
                        targetPosition
                    );
                    modifications.push(addConnectorInit);
                } else {
                    // update connector client initialization
                    const updateConnectorInit = updatePropertyStatement(
                        `${moduleName}:${connectorInfo.name} ${config.name} = ${isInitReturnError ? 'check' : ''} new (${configSource});`,
                        connectorConfig.initPosition
                    );
                    modifications.push(updateConnectorInit);
                }
            }
        }
        if (modifications.length > 0) {
            modifyDiagram(modifications);
            onClose();
        }
    };

    const handleActionOnSave = () => {
        const modifications: STModification[] = [];
        const isInitReturnError = getInitReturnType(functionDefInfo);
        const currentActionReturnType = getActionReturnType(config.action.name, functionDefInfo);
        const moduleName = getFormattedModuleName(connectorInfo.module);
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: FINISH_CONNECTOR_ACTION_ADD_INSIGHTS,
            property: connectorInfo.displayName
        };
        let connectorConfigurables;
        let configSource = getParams(config.connectorInit).join();
        let response;
        onEvent(event);
        if (!isNewConnectorInitWizard) {
            if (currentActionReturnType.hasReturn) {
                const updateActionInvocation = updatePropertyStatement(
                    `${currentActionReturnType.returnType} ${config.action.returnVariableName} = ${currentActionReturnType.hasError ? 'check' : ''} ${config.name}->${config.action.name}(${getParams(config.action.fields).join()});`,
                    model.position
                );
                modifications.push(updateActionInvocation);
            } else {
                const updateActionInvocation = updatePropertyStatement(
                    `${currentActionReturnType.hasError ? 'check' : ''} ${config.name}->${config.action.name}(${getParams(config.action.fields).join()});`,
                    model.position
                );
                modifications.push(updateActionInvocation);
            }
        } else {
            if (targetPosition) {
                if ((connectorTypes.includes(connectorInfo.displayName)) && !connection){
                    const selectedType = getManualConnectionTypeFromFormFields(config.connectorInit);
                    const manualConnectionFormFieldValues = getManualConnectionDetailsFromFormFields(config.connectorInit);
                    const formattedFieldValues: { name: string; value: string; }[] = [];
                    manualConnectionFormFieldValues.selectedFields.forEach((item: any) => {
                        if (item.value.slice(0, 1) === '\"' && item.value.slice(-1) === '\"') {
                            formattedFieldValues.push({
                                name: item.name,
                                value: item.value.substring(1, (item.value.length - 1))
                            });
                        }
                    });
                    (async () => {
                        if (config.connectorInit.length > 0){
                            // save action with client path
                            response = await createManualConnection(userInfo?.selectedOrgHandle, connectorInfo.displayName,
                                config.connectionName, userInfo.user.email, formattedFieldValues);
                            configSource = getOauthParamsFromConnection(connectorInfo.displayName.toLocaleLowerCase(),
                                response.data, selectedType);
                            connectorConfigurables = getOauthConnectionConfigurables(connectorInfo.displayName.toLocaleLowerCase(),
                                response.data, symbolInfo.configurables, selectedType);
                            const addImport: STModification = createImportStatement(
                                connectorInfo.org,
                                connectorInfo.module,
                                targetPosition
                            );
                            modifications.push(addImport);

                            if (connectorConfigurables) {
                                const addConfigurableVars = createPropertyStatement(
                                    connectorConfigurables,
                                    { column: 0, line: syntaxTree?.configurablePosition?.startLine || 1 }
                                );
                                modifications.push(addConfigurableVars);
                            }

                            const addConnectorInit: STModification = createPropertyStatement(
                                `${moduleName}:${connectorInfo.name} ${config.name} = ${isInitReturnError ? 'check' : ''} new (${configSource});`,
                                targetPosition
                            );
                            modifications.push(addConnectorInit);
                        }
                        // Add an action invocation on the initialized client.
                        if (currentActionReturnType.hasReturn) {
                            const addActionInvocation = createPropertyStatement(
                                `${currentActionReturnType.returnType} ${config.action.returnVariableName} = ${currentActionReturnType.hasError ? 'check' : ''} ${config.name}->${config.action.name}(${getParams(config.action.fields).join()});`,
                                targetPosition
                            );
                            modifications.push(addActionInvocation);
                        } else {
                            const addActionInvocation = createPropertyStatement(
                                `${currentActionReturnType.hasError ? 'check' : ''} ${config.name}->${config.action.name}(${getParams(config.action.fields).join()});`,
                                targetPosition
                            );
                            modifications.push(addActionInvocation);
                        }

                        if (config.responsePayloadMap && config.responsePayloadMap.isPayloadSelected) {
                            const addPayload: STModification = createCheckedPayloadFunctionInvocation(
                                config.responsePayloadMap.payloadVariableName,
                                "var",
                                config.action.returnVariableName,
                                config.responsePayloadMap.payloadTypes.get(
                                    config.responsePayloadMap.selectedPayloadType),
                                targetPosition
                            );
                            modifications.push(addPayload);
                        }
                        if (modifications.length > 0) {
                            modifyDiagram(modifications);
                            onClose();
                        }
                        showNotification(response.status, ConnectionAction.create);
                    })();
                }
                else{
                    if (isOauthConnector && connection) {
                        let OAuthtype;
                        if (connection.codeVariableKeys.find(field => field.name === "tokenKey")?.name) {
                            OAuthtype = "BearerTokenConfig";
                        }
                        else if (connection.codeVariableKeys.find(field => field?.name === "clientIdKey")?.name) {
                            OAuthtype = "OAuth2RefreshTokenGrantConfig";
                        }
                        const connectorConfigurablesInvoke = getOauthConnectionConfigurables(connectorInfo.displayName.toLocaleLowerCase(), connection, symbolInfo.configurables, OAuthtype);
                        const addImport: STModification = createImportStatement(
                            connectorInfo.org,
                            connectorInfo.module,
                            targetPosition
                        );
                        modifications.push(addImport);

                        if (connectorConfigurablesInvoke) {
                            const addConfigurableVarsInvoke = createPropertyStatement(
                                connectorConfigurablesInvoke,
                                { column: 0, line: syntaxTree?.configurablePosition?.startLine || 1 }
                            );
                            modifications.push(addConfigurableVarsInvoke);
                        }

                        const addConnectorInit: STModification = createPropertyStatement(
                            `${moduleName}:${connectorInfo.name} ${config.name} = ${isInitReturnError ? 'check' : ''} new (
                                ${getOauthParamsFromConnection(connectorInfo.displayName.toLocaleLowerCase(), connection, OAuthtype)}\n);`,
                            targetPosition
                        );
                        modifications.push(addConnectorInit);
                    }
                    if (currentActionReturnType.hasReturn) {
                        const addActionInvocation = createPropertyStatement(
                            `${currentActionReturnType.returnType} ${config.action.returnVariableName} = ${currentActionReturnType.hasError ? 'check' : ''} ${config.name}->${config.action.name}(${getParams(config.action.fields).join()});`,
                            targetPosition
                        );
                        modifications.push(addActionInvocation);
                    } else {
                        const addActionInvocation = createPropertyStatement(
                            `${currentActionReturnType.hasError ? 'check' : ''} ${config.name}->${config.action.name}(${getParams(config.action.fields).join()});`,
                            targetPosition
                        );
                        modifications.push(addActionInvocation);
                    }

                    if (config.responsePayloadMap && config.responsePayloadMap.isPayloadSelected) {
                        const addPayload: STModification = createCheckedPayloadFunctionInvocation(
                            config.responsePayloadMap.payloadVariableName,
                            "var",
                            config.action.returnVariableName,
                            config.responsePayloadMap.payloadTypes.get(
                                config.responsePayloadMap.selectedPayloadType),
                            targetPosition
                        );
                        modifications.push(addPayload);
                    }
                    if (modifications.length > 0) {
                        modifyDiagram(modifications);
                        onClose();
                    }
                }
            }
        }
    };

    // code generate for single forms
    // this will generate both client and action source code
    // only one client will be create for each module
    const handleSingleFormOnSave = () => {
        const modifications: STModification[] = [];
        const moduleName = getFormattedModuleName(connectorInfo.module);
        const existingEndpointName = getModuleVariable(symbolInfo, connectorInfo);
        const isInitReturnError = getInitReturnType(functionDefInfo);
        const currentActionReturnType = getActionReturnType(config.action.name, functionDefInfo);
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: FINISH_CONNECTOR_ACTION_ADD_INSIGHTS,
            property: connectorInfo.displayName
        };
        onEvent(event);
        if (!isNewConnectorInitWizard) {
            if (currentActionReturnType.hasReturn) {
                const updateActionInvocation = updatePropertyStatement(
                    `${currentActionReturnType.returnType} ${config.action.returnVariableName} = ${currentActionReturnType.hasError ? 'check' : ''} ${config.name}->${config.action.name}(${getParams(config.action.fields).join()});`,
                    model.position
                );
                modifications.push(updateActionInvocation);
            } else {
                const updateActionInvocation = updatePropertyStatement(
                    `${currentActionReturnType.hasError ? 'check' : ''} ${config.name}->${config.action.name}(${getParams(config.action.fields).join()});`,
                    model.position
                );
                modifications.push(updateActionInvocation);
            }
        } else {
            if (targetPosition) {
                if (!existingEndpointName) {
                    // new connector client initialization
                    const addImport: STModification = createImportStatement(
                        connectorInfo.org,
                        connectorInfo.module,
                        targetPosition
                    );
                    modifications.push(addImport);

                    const addConnectorInit: STModification = createPropertyStatement(
                        `${moduleName}:${connectorInfo.name} ${config.name} = ${isInitReturnError ? 'check' : ''} new (${getParams(config.connectorInit).join()});`,
                        targetPosition
                    );
                    modifications.push(addConnectorInit);
                }
                // Add an action invocation on the initialized client.
                if (currentActionReturnType.hasReturn) {
                    const addActionInvocation = createPropertyStatement(
                        `${currentActionReturnType.returnType} ${config.action.returnVariableName} = ${currentActionReturnType.hasError ? 'check' : ''} ${existingEndpointName || config.name}->${config.action.name}(${getParams(config.action.fields).join()});`,
                        targetPosition
                    );
                    modifications.push(addActionInvocation);
                } else {
                    const addActionInvocation = createPropertyStatement(
                        `${currentActionReturnType.hasError ? 'check' : ''} ${existingEndpointName || config.name}->${config.action.name}(${getParams(config.action.fields).join()});`,
                        targetPosition
                    );
                    modifications.push(addActionInvocation);
                }
            }
        }
        modifyDiagram(modifications);
        onClose();
    };

    const onConnectionNameChange = () => {
        if ((isNewConnection && !isOauthConnector) || (isNewConnection && isOauthConnector && isManualConnection)) {
            setFormState(FormStates.CreateNewConnection);
        } else if (isNewConnection && isOauthConnector && !isManualConnection) {
            setFormState(FormStates.OauthConnect);
        } else if (connectorInfo.category === connectorCategories.CHOREO_CONNECTORS) {
            setFormState(FormStates.SingleForm);
        } else {
            setFormState(FormStates.ExistingConnection);
        }
    };

    const onCreateConnectorBack = () => {
        if (isOauthConnector) {
            // setIsManualConnection(false);
            setIsNewConnection(true);
            setFormState(FormStates.OauthConnect);
        }
    };

    const actionReturnType = getActionReturnType(selectedOperation, functionDefInfo);
    if (!isNewConnectorInitWizard && actionReturnType?.hasReturn) {
        if (STKindChecker.isLocalVarDecl(model) && (config.action.name === selectedOperation)) {
            config.action.returnVariableName =
                (((model as LocalVarDecl).typedBindingPattern.bindingPattern) as
                    CaptureBindingPattern).variableName.value;
        } else {
            config.action.returnVariableName = undefined;
        }
    }

    const showConnectionName = !isOauthConnector || isManualConnection || !isNewConnection;

    useEffect(() => {
        const varAi: { [key: string]: any; } = getAllVariablesForAi(symbolInfo);
        let allFormFields: FormField[] = [];
        Array.from(functionDefInfo.keys()).forEach((key: string) => {
            allFormFields = allFormFields.concat(functionDefInfo.get(key).parameters);
        });
        const aiSuggestionsReq: AiSuggestionsReq = {
            userID: userInfo?.user?.email,
            mapFrom: [varAi],
            mapTo: [getMapTo(allFormFields, model ? model.position : targetPosition)]
        };
        getAiSuggestions(aiSuggestionsReq).then((res: AiSuggestionsRes) => {
            res.suggestedMappings.forEach((schema: string) => {
                const varMap = JSON.parse(schema);
                const varKeys = Object.keys(varMap);
                varKeys.forEach((variable: string) => {
                    addAiSuggestion(variable, varMap[variable], allFormFields);
                });
            });
        });
    }, [functionDefInfo]);

    const onSave = (sourceModifications: STModification[]) => {
        const isInitReturnError = getInitReturnType(functionDefInfo);
        const moduleName = getFormattedModuleName(connectorInfo.module);
        if (sourceModifications) {
            // Modifications for special Connectors
            modifyDiagram(sourceModifications);
            onClose();
        } else {
            // insert initialized connector logic
            const modifications: STModification[] = [];

            if (!isNewConnectorInitWizard) {
                const updateConnectorInit = updatePropertyStatement(
                    `${moduleName}:${connectorInfo.name} ${config.name} = ${isInitReturnError ? 'check' : ''} new (${getParams(config.connectorInit).join()});`,
                    config.initPosition
                );
                modifications.push(updateConnectorInit);

                if (actionReturnType?.hasReturn) {
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
                        connectorInfo.org,
                        connectorInfo.module,
                        targetPosition
                    );
                    modifications.push(addImport);

                    // Add an connector client initialization.
                    if (isNewConnection) {
                        let addConnectorInit: STModification;
                        if (isOauthConnector && !isManualConnection) {
                            addConnectorInit = createObjectDeclaration(
                                (moduleName + ":" + connectorInfo.name),
                                config.name,
                                getOauthConnectionParams(connectorInfo.displayName.toLocaleLowerCase(), connection),
                                targetPosition
                            );
                        } else {
                            addConnectorInit = createPropertyStatement(
                                `${moduleName}:${connectorInfo.name} ${config.name} = ${isInitReturnError ? 'check' : ''} new (${getParams(config.connectorInit).join()});`,
                                targetPosition
                            );
                        }
                        modifications.push(addConnectorInit);
                    }

                    // Add an action invocation on the initialized client.
                    if (actionReturnType?.hasReturn) {
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

                    if (config.responsePayloadMap && config.responsePayloadMap.isPayloadSelected) {
                        const addPayload: STModification = createCheckedPayloadFunctionInvocation(
                            config.responsePayloadMap.payloadVariableName,
                            "var",
                            config.action.returnVariableName,
                            config.responsePayloadMap.payloadTypes.get(
                                config.responsePayloadMap.selectedPayloadType),
                            targetPosition
                        );
                        modifications.push(addPayload);
                    }

                }
            }
            modifyDiagram(modifications);
            onClose();
        }
    };

    const manualConnectionButtonLabel = intl.formatMessage({
        id: "lowcode.develop.connectorForms.manualConnection.button.label",
        defaultMessage: "Manual Configuration"
    });

    const backButtonLabel = intl.formatMessage({
        id: "lowcode.develop.connectorForms.backButton.label",
        defaultMessage: "Back"
    });

    let connectorComponent: ReactNode = null;

    if (functionDefInfo) {
        if (connectorInfo.module === "http") {
            connectorComponent = getConnectorComponent(
                connectorInfo.module + connectorInfo.name, {
                functionDefinitions: functionDefInfo,
                connectorConfig: config,
                onSave,
                onClose,
                connector: connectorInfo,
                isNewConnectorInitWizard,
                targetPosition,
                model,
                selectedConnector,
                isAction
            });
        } else {
            connectorComponent = (
                <div className={wizardClasses.fullWidth}>
                    <div className={wizardClasses.topTitleWrapper}>
                        <ButtonWithIcon
                            className={wizardClasses.closeBtnAutoGen}
                            onClick={onClose}
                            icon={<CloseRounded fontSize="small" />}
                        />
                        <div className={wizardClasses.titleWrapper}>
                            <div className={wizardClasses.connectorIconWrapper}>{getConnectorIcon(`${connectorInfo.module}_${connectorInfo.name}`)}</div>
                            <Typography className={wizardClasses.configTitle} variant="h4">{connectorInfo.displayName}<FormattedMessage id="lowcode.develop.connectorForms.title" defaultMessage="&nbsp;Connection" /></Typography>
                        </div>
                        <Divider variant='fullWidth' />
                    </div>
                    {(formState === FormStates.OauthConnect) && (
                        <div>
                            {isOauthConnector && !isManualConnection && !isAction && (
                                <div className={classNames(wizardClasses.bottomBtnWrapper, wizardClasses.bottomRadius)}>
                                    <div className={wizardClasses.fullWidth}>
                                        <div className={wizardClasses.mainOauthBtnWrapper}>
                                            <OauthConnectButton
                                                className={classNames(wizardClasses.fullWidth, wizardClasses.oauthBtnWrapper)}
                                                currentConnection={connection}
                                                connectorName={connectorInfo.displayName}
                                                onSelectConnection={handleOnConnection}
                                                onFailure={handleOnFailure}
                                                onDeselectConnection={handleConnectionUpdate}
                                                selectedConnectionType={selectedConnectionType}
                                                onSave={handleClientOnSave}
                                                onClickManualConnection={onManualConnection}
                                                onSaveNext={handleCreateConnectorSaveNext}
                                                initFormFields={connectorInitFormFields}
                                                connectorConfig={config}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {(formState === FormStates.OperationForm) && (
                        <OperationForm
                            functionDefInfo={functionDefInfo}
                            connectionDetails={config}
                            showConnectionName={showConnectionName}
                            selectedOperation={selectedOperation}
                            onSave={handleActionOnSave}
                            onConnectionChange={onConnectionNameChange}
                            mutationInProgress={isMutationProgress}
                            isNewConnectorInitWizard={isNewConnectorInitWizard}
                            operations={operations}
                        />
                    )}
                    {(formState === FormStates.ExistingConnection) && isNewConnectorInitWizard && (
                        <SelectConnectionForm
                            onCreateNew={onCreateNew}
                            connectorConfig={config}
                            connector={connectorInfo}
                            onSelectExisting={onSelectExisting}
                        />
                    )}
                    {(formState === FormStates.ExistingConnection) && !isNewConnectorInitWizard && (
                        <CreateConnectorForm
                            initFields={connectorInitFormFields}
                            onSave={onCreateConnectorSave}
                            connectorConfig={config}
                            onConfigNameChange={handleConfigNameChange}
                            onBackClick={onCreateConnectorBack}
                            connector={connectorInfo}
                            isNewConnectorInitWizard={isNewConnectorInitWizard}
                            isOauthConnector={isOauthConnector}
                        />
                    )}
                    {(formState === FormStates.CreateNewConnection) && (
                        <CreateConnectorForm
                            initFields={connectorInitFormFields}
                            onSave={handleClientOnSave}
                            onSaveNext={handleCreateConnectorSaveNext}
                            connectorConfig={config}
                            onConfigNameChange={handleConfigNameChange}
                            onBackClick={onCreateConnectorBack}
                            connector={connectorInfo}
                            isNewConnectorInitWizard={isNewConnectorInitWizard}
                            isOauthConnector={isOauthConnector}
                        />
                    )}
                    {(formState === FormStates.SingleForm) && (
                        <SingleForm
                            functionDefInfo={functionDefInfo}
                            connectionDetails={config}
                            showConnectionName={showConnectionName}
                            mutationInProgress={isMutationProgress}
                            isNewConnectorInitWizard={isNewConnectorInitWizard}
                            operations={operations}
                            onSave={handleSingleFormOnSave}
                        />
                    )}
                </div>
            );
        }
    }

    return (
        <>
            {isLoading && (<div className={wizardClasses.loaderWrapper}>
                <TextPreloaderVertical position='relative' />
            </div>)}
            {!isLoading && (<div className={wizardClasses.mainApiWrapper}>
                {connectorComponent}
            </div>)}
        </>
    );
}
function getOauthConnectionParams(arg0: string, connectionDetails: any): string[] {
    throw new Error('Function not implemented.');
}
