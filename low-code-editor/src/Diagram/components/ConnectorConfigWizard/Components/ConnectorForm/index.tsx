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
import React, { ReactNode, useContext, useEffect, useState } from 'react';

import { CaptureBindingPattern, LocalVarDecl } from '@ballerina/syntax-tree';
import { Typography } from "@material-ui/core";
import { CloseRounded } from "@material-ui/icons";
import classNames from "classnames";

import {
    AiSuggestionsReq,
    AiSuggestionsRes,
    ConnectionDetails,
    OauthProviderConfig
} from "../../../../../api/models";
import { ActionConfig, ConnectorConfig, FormField, WizardType } from "../../../../../ConfigurationSpec/types";
import { Context as DiagramContext } from '../../../../../Contexts/Diagram';
import { STSymbolInfo } from "../../../../../Definitions";
import { BallerinaConnectorsInfo, STModification } from "../../../../../Definitions/lang-client-extended";
import { ConnectionType, OauthConnectButton } from "../../../../components/OauthConnectButton";
import { getAllVariables } from "../../../../utils/mixins";
import {
    createCheckedPayloadFunctionInvocation,
    createCheckedRemoteServiceCall,
    createImportStatement,
    createPropertyStatement,
    createRemoteServiceCall,
    updateCheckedRemoteServiceCall,
    updatePropertyStatement,
    updateRemoteServiceCall,
} from "../../../../utils/modification-util";
import { DraftInsertPosition } from "../../../../view-state/draft";
import { ButtonWithIcon } from "../../../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { LinePrimaryButton } from "../../../Portals/ConfigForm/Elements/Button/LinePrimaryButton";
import { addAiSuggestion, checkErrorsReturnType, genVariableName, getAllVariablesForAi, getConnectorIcon, getMapTo, getOauthConnectionImports, getOauthParamsFromConnection, getOauthParamsFromFormFields, getParams, matchEndpointToFormField } from '../../../Portals/utils';
import { ConfigWizardState } from "../../index";
import { wizardStyles } from "../../style";
import "../../style.scss";
import { CreateConnectorForm } from "../CreateNewConnection";
import { OperationForm } from "../OperationForm";

export interface OauthProviderConfigState {
    isConfigListLoading: boolean;
    configList: OauthProviderConfig[];
    configListError?: Error;
}

enum FormStates {
    ExistingConnection,

    OauthConnect,
    CreateNewConnection,

    OperationDropdown,
    OperationForm,
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
    const { state } = useContext(DiagramContext);
    const {
        stSymbolInfo,
        isMutationProgress,
        oauthProviderConfigs,
        userInfo,
        onMutate: dispatchMutations,
        getAiSuggestions,
        trackAddConnector,
        syntaxTree
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

    const [config] = useState(connectorConfig ? connectorConfig : new ConnectorConfig())
    const isNewConnectorInitWizard = config.existingConnections ? (wizardType === WizardType.NEW) : true;

    const [formState, setFormState] = useState<FormStates>(FormStates.CreateNewConnection);

    const [connection, setConnection] = useState<ConnectionDetails>();
    const [selectedOperation, setSelectedOperation] = useState(connectorConfig?.action?.name);
    const [isManualConnection, setIsManualConnection] = useState(false);
    const [isNewConnection, setIsNewConnection] = useState(isNewConnectorInitWizard);

    useEffect(() => {
        if (isAction) {
            setFormState(FormStates.OperationForm);
            return;
        } else if (isOauthConnector) {
            // update oauth flow client with manual form
            // TODO: update oauth flow with oauth connect button
            if (connectorConfig?.connectorInit?.length > 0) {
                setIsManualConnection(true);
                setIsNewConnection(false);
                setFormState(FormStates.CreateNewConnection);
                return;
            }
            setFormState(FormStates.OauthConnect);
        } else {
            setFormState(FormStates.CreateNewConnection);
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
        genVariableName(connectorInfo.module + "Endpoint", getAllVariables(symbolInfo))
        : config.name;
    const [configName, setConfigName] = useState(config.name);
    const handleConfigNameChange = (name: string) => {
        setConfigName(name);
    }

    const operations: string[] = [];
    if (functionDefInfo && isAction) {
        functionDefInfo.forEach((value, key) => {
            if (key !== "init" && key !== "__init") {
                operations.push(key);
            }
        });
    }
    if (!config.action && isAction) {
        config.action = new ActionConfig();
    }

    const handleOnConnection = (type: ConnectionType, connectionDetails: ConnectionDetails) => {
        setConnection(connectionDetails);
        handleClientOnSave(connectionDetails);
    };

    const handleConnectionUpdate = () => {
        setIsManualConnection(false);
        setConnection(undefined);
    };

    const handleOnFailure = () => {
        setConnection(undefined);
    };

    const onManualConnection = () => {
        setConfigName(genVariableName(connectorInfo.module + "Endpoint", getAllVariables(symbolInfo)));
        setIsManualConnection(true);
        setFormState(FormStates.CreateNewConnection);
    };

    const onCreateNew = () => {
        config.name = undefined;
        setConfigName(genVariableName(connectorInfo.module + "Endpoint", getAllVariables(symbolInfo)));
        if (isOauthConnector) {
            setIsManualConnection(false);
            setFormState(FormStates.OauthConnect);
        } else {
            setConfigName(genVariableName(connectorInfo.module + "Endpoint", getAllVariables(symbolInfo)));
            setFormState(FormStates.CreateNewConnection);
        }
        setIsNewConnection(true);
    };

    const onSelectExisting = (value: any) => {
        setConfigName(value);
        setIsNewConnection(false);
        setFormState(FormStates.OperationForm);
    };

    const handleCreateConnectorSaveNext = () => {
        if (isNewConnection) {
            setFormState(FormStates.OperationDropdown);
        } else {
            setFormState(FormStates.OperationForm);
        }
    };

    const handleClientOnSave = (connectionDetails?: ConnectionDetails) => {
        const modifications: STModification[] = [];
        const isInitReturnError = checkErrorsReturnType('init', functionDefInfo);
        trackAddConnector(connectorInfo.displayName);

        // check oauth flow and manual flow
        if (isOauthConnector && !isManualConnection && connectionDetails) {
            // oauth flow
            if (isNewConnectorInitWizard && targetPosition) {
                // new connector client initialization
                const addImport: STModification = createImportStatement(
                    connectorInfo.org,
                    connectorInfo.module,
                    targetPosition
                );
                modifications.push(addImport);

                const addConfigurableVars = createPropertyStatement(
                    getOauthConnectionImports(connectorInfo.displayName.toLocaleLowerCase(), connectionDetails),
                    { column: 0, line: syntaxTree?.configurablePosition?.startLine || 1 }
                );
                modifications.push(addConfigurableVars);

                const addConnectorInit: STModification = createPropertyStatement(
                    `${connectorInfo.module}:${connectorInfo.name} ${config.name} = ${isInitReturnError ? 'check' : ''} new (
                        ${getOauthParamsFromConnection(connectorInfo.displayName.toLocaleLowerCase(), connectionDetails)}\n);`,
                    targetPosition
                );
                modifications.push(addConnectorInit);
            } else {
                // update connector client initialization
                const updateConnectorInit = updatePropertyStatement(
                    `${connectorInfo.module}:${connectorInfo.name} ${config.name} = ${isInitReturnError ? 'check' : ''} new (
                        ${getOauthParamsFromFormFields(connectorInfo.displayName.toLocaleLowerCase(), config.connectorInit)}\n);`,
                    config.initPosition
                );
                modifications.push(updateConnectorInit);
            }
        } else {
            // manual flow
            if (isNewConnectorInitWizard && targetPosition) {
                // new connector client initialization
                const addImport: STModification = createImportStatement(
                    connectorInfo.org,
                    connectorInfo.module,
                    targetPosition
                );
                modifications.push(addImport);

                const addConnectorInit: STModification = createPropertyStatement(
                    `${connectorInfo.module}:${connectorInfo.name} ${config.name} = ${isInitReturnError ? 'check' : ''} new (${getParams(config.connectorInit).join()});`,
                    targetPosition
                );
                modifications.push(addConnectorInit);
            } else {
                // update connector client initialization
                const updateConnectorInit = updatePropertyStatement(
                    `${connectorInfo.module}:${connectorInfo.name} ${config.name} = ${isInitReturnError ? 'check' : ''} new (${getParams(config.connectorInit).join()});`,
                    connectorConfig.initPosition
                );
                modifications.push(updateConnectorInit);
            }
        }
        if (modifications.length > 0) {
            dispatchMutations(modifications);
            onClose();
        }
    }

    const handleActionOnSave = () => {
        const modifications: STModification[] = [];
        const isActionReturnError = checkErrorsReturnType(config.action.name, functionDefInfo);
        trackAddConnector(connectorInfo.displayName);
        if (!isNewConnectorInitWizard) {
            if (isActionReturnError) {
                const updateActionInvocation: STModification = updateCheckedRemoteServiceCall(
                    "var",
                    config.action.returnVariableName,
                    config.name,
                    config.action.name,
                    getParams(config.action.fields),
                    model.position
                );
                modifications.push(updateActionInvocation);
            } else {
                const updateActionInvocation: STModification = updateRemoteServiceCall(
                    "var",
                    config.action.returnVariableName,
                    config.name,
                    config.action.name,
                    getParams(config.action.fields),
                    model.position
                );
                modifications.push(updateActionInvocation);
            }
        } else {
            if (targetPosition) {
                // Add an action invocation on the initialized client.
                if (isActionReturnError) {
                    const addActionInvocation: STModification = createCheckedRemoteServiceCall(
                        "var",
                        config.action.returnVariableName,
                        config.name,
                        config.action.name,
                        getParams(config.action.fields), targetPosition
                    );
                    modifications.push(addActionInvocation);
                } else {
                    const addActionInvocation: STModification = createRemoteServiceCall(
                        "var",
                        config.action.returnVariableName,
                        config.name,
                        config.action.name,
                        getParams(config.action.fields), targetPosition
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
        dispatchMutations(modifications);
        onClose();
    }

    const onConnectionNameChange = () => {
        if ((isNewConnection && !isOauthConnector) || (isNewConnection && isOauthConnector && isManualConnection)) {
            setFormState(FormStates.CreateNewConnection);
        } else if (isNewConnection && isOauthConnector && !isManualConnection) {
            setFormState(FormStates.OauthConnect);
        } else {
            setFormState(FormStates.ExistingConnection);
        }
    };

    const onCreateConnectorBack = () => {
        if (isOauthConnector) {
            setIsManualConnection(false);
            setIsNewConnection(true);
            setFormState(FormStates.OauthConnect);
        }
    };

    if (!isNewConnectorInitWizard && isAction) {
        connectorConfig.action.returnVariableName =
            (((model as LocalVarDecl).typedBindingPattern.bindingPattern) as CaptureBindingPattern).variableName.value;
    }

    const showConnectionName = !isOauthConnector || isManualConnection || !isNewConnection;

    useEffect(() => {
        const varAi: { [key: string]: any } = getAllVariablesForAi(symbolInfo)
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
                    addAiSuggestion(variable, varMap[variable], allFormFields)
                })
            })
        });
    }, [functionDefInfo]);

    const onSave = (sourceModifications: STModification[]) => {
        const isInitReturnError = checkErrorsReturnType('init', functionDefInfo);
        // const isActionReturnError = checkErrorsReturnType(config.action.name, functionDefInfo);
        trackAddConnector(connectorInfo.displayName);
        if (sourceModifications) {
            // Modifications for special Connectors
            dispatchMutations(sourceModifications);
            onClose();
        }
    };

    let connectorComponent: ReactNode = null;

    if (functionDefInfo) {
        // connectorComponent = getConnectorComponent(
        //     connectorInfo.module + connectorInfo.name, {
        //     functionDefinitions: functionDefInfo,
        //     connectorConfig: config,
        //     onSave,
        //     onClose,
        //     connector: connectorInfo,
        //     isNewConnectorInitWizard,
        //     targetPosition,
        //     model,
        //     selectedConnector,
        //     isAction
        // });
        // if (!connectorComponent) {
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
                            <Typography className={wizardClasses.configTitle} variant="h4">{connectorInfo.displayName} Connection</Typography>
                        </div>
                    </div>
                    <div>
                        {isNewConnection && isOauthConnector && !isManualConnection && !isAction && (
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
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        {(formState === FormStates.OauthConnect) && !isAction &&
                            (
                                <div className={classNames(wizardClasses.manualBtnWrapper)}>
                                    <p className={wizardClasses.subTitle}>Or use manual configurations</p>
                                    <LinePrimaryButton
                                        className={wizardClasses.fullWidth}
                                        text="Manual Connection"
                                        fullWidth={false}
                                        onClick={onManualConnection}
                                    />
                                </div>
                            )
                        }
                    </div>
                    {(formState === FormStates.OperationForm) && (
                        <OperationForm
                            functionDefInfo={functionDefInfo}
                            connectionDetails={config}
                            showConnectionName={showConnectionName}
                            selectedOperation={config.action?.name}
                            onSave={handleActionOnSave}
                            onConnectionChange={onConnectionNameChange}
                            mutationInProgress={isMutationProgress}
                            isNewConnectorInitWizard={isNewConnectorInitWizard}
                            operations={operations}
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
                </div>
            )
        // }
    }

    return (
        <div className={wizardClasses.mainApiWrapper}>
            {connectorComponent}
        </div>
    );
}
