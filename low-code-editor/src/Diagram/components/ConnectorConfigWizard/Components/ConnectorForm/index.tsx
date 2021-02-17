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
    createObjectDeclaration,
    updateCheckedRemoteServiceCall,
    updateObjectDeclaration
} from "../../../../utils/modification-util";
import { DraftInsertPosition } from "../../../../view-state/draft";
import { ButtonWithIcon } from "../../../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { LinePrimaryButton } from "../../../Portals/ConfigForm/Elements/Button/LinePrimaryButton";
import { SecondaryButton } from "../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import {
    addAiSuggestion,
    genVariableName,
    getAllVariablesForAi,
    getConnectorComponent,
    // getConnectorConfig,
    getConnectorIcon, getMapTo,
    getOauthConnectionParams,
    getParams
} from "../../../Portals/utils";
import { ConfigWizardState } from "../../index";
import { wizardStyles } from "../../style";
import "../../style.scss";
import { CreateConnectorForm } from "../CreateNewConnection";
import { OperationDropdown } from "../OperationDropdown";
import { OperationForm } from "../OperationForm";
import { SelectConnectionForm } from "../SelectExistingConnection";

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
        trackAddConnector
    } = state;
    const symbolInfo: STSymbolInfo = stSymbolInfo;
    const configurations: OauthProviderConfigState = oauthProviderConfigs;
    const { connectorInfo, targetPosition, configWizardArgs, onClose } = props;
    const { fieldsForFunction, connectorConfig, wizardType, model } = configWizardArgs;

    let isOauthConnector = false;
    configurations.configList.forEach((configuration) => {
        if (connectorInfo.displayName.toLocaleLowerCase() === configuration.connectorName.toLocaleLowerCase()) {
            isOauthConnector = true;
        }
    });

    const config: ConnectorConfig = connectorConfig ? connectorConfig : new ConnectorConfig();
    const isNewConnectorInitWizard = config.existingConnections ? (wizardType === WizardType.NEW) : true;

    const [formState, setFormState] = useState<FormStates>(FormStates.CreateNewConnection);
    const [connectionDetails, setConnectionDetails] = useState(null);
    const [selectedOperation, setSelectedAction] = useState(connectorConfig?.action?.name);
    const [isManualConnection, setIsManualConnection] = useState(false);
    const [isNewConnection, setIsNewConnection] = useState(isNewConnectorInitWizard);

    useEffect(() => {
        if (isOauthConnector) {
            setFormState(FormStates.OauthConnect);
        } else {
            setFormState(FormStates.CreateNewConnection);
        }
    }, []);

    useEffect(() => {
        if (config.existingConnections) {
            setFormState(FormStates.ExistingConnection);
        }
    }, [config.existingConnections]);

    const fieldsForFunctions: Map<string, FormField[]> = fieldsForFunction;

    const connectorInitFormFields: FormField[] = fieldsForFunction?.get("init") ?
        fieldsForFunction?.get("init") : fieldsForFunction?.get("__init");

    // managing name set by the non oauth connectors
    config.name = isNewConnectorInitWizard ?
        genVariableName(connectorInfo.module + "Endpoint", getAllVariables(symbolInfo))
        : config.name;
    const [configName, setConfigName] = useState(config.name);
    const handleConfigNameChange = (name: string) => {
        setConfigName(name);
    }
    config.name = configName;

    const operations: string[] = [];
    if (fieldsForFunctions) {
        fieldsForFunctions.forEach((value, key) => {
            if (key !== "init" && key !== "__init") {
                operations.push(key);
            }
        });
    }

    let formFields: FormField[] = null;
    if (selectedOperation) {
        formFields = fieldsForFunctions.get(selectedOperation);
        config.action = new ActionConfig();
        config.action.name = selectedOperation;
        config.action.fields = formFields;
    }

    const handleOnConnection = (type: ConnectionType, connection: ConnectionDetails) => {
        setConnectionDetails(connection);
        setFormState(FormStates.OperationDropdown);
    };

    const handleConnectionUpdate = () => {
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
        setConfigName(genVariableName(connectorInfo.module + "Endpoint", getAllVariables(symbolInfo)));
        setIsManualConnection(true);
        setFormState(FormStates.CreateNewConnection);
    };

    const onCreateNew = () => {
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
        if (isNewConnection) {
            setFormState(FormStates.OperationDropdown);
        } else {
            setFormState(FormStates.OperationForm);
        }
    };

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
        } else {
            setFormState(FormStates.ExistingConnection);
        }
    };

    if (!isNewConnectorInitWizard) {
        connectorConfig.action.returnVariableName =
            (((model as LocalVarDecl).typedBindingPattern.bindingPattern) as CaptureBindingPattern).variableName.value;
    }

    const showConnectionName = !isOauthConnector || isManualConnection || !isNewConnection;

    useEffect(() => {
        const varAi: { [key: string]: any } = getAllVariablesForAi(symbolInfo)
        let allFormFields: FormField[] = [];
        Array.from(fieldsForFunctions.keys()).forEach((key: string) => {
            allFormFields = allFormFields.concat(fieldsForFunctions.get(key));
        })
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
    }, [fieldsForFunctions]);

    const onSave = (sourceModifications: STModification[]) => {
        trackAddConnector(connectorInfo.displayName);
        if (sourceModifications) {
            // Modifications for special Connectors
            dispatchMutations(sourceModifications);
            onClose();
        } else {
            // insert initialized connector logic
            const modifications: STModification[] = [];

            if (!isNewConnectorInitWizard) {
                const updateConnectorInit = updateObjectDeclaration(
                    (connectorInfo.module + ":" + connectorInfo.name),
                    config.name,
                    getParams(config.connectorInit),
                    connectorConfig.initPosition
                );
                modifications.push(updateConnectorInit)

                const updateActionInvo: STModification = updateCheckedRemoteServiceCall(
                    "var",
                    config.action.returnVariableName,
                    config.name,
                    config.action.name,
                    getParams(config.action.fields),
                    model.position
                );
                modifications.push(updateActionInvo);
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
                        let addConnectorInit: STModification
                        if (isOauthConnector && !isManualConnection) {
                            addConnectorInit = createObjectDeclaration(
                                (connectorInfo.module + ":" + connectorInfo.name),
                                config.name,
                                getOauthConnectionParams(connectorInfo.displayName.toLocaleLowerCase(),
                                    connectionDetails),
                                targetPosition
                            );
                            const configImport: STModification = createImportStatement(
                                "ballerina",
                                "config",
                                targetPosition
                            );
                            modifications.push(configImport);
                        } else {
                            addConnectorInit = createObjectDeclaration(
                                (connectorInfo.module + ":" + connectorInfo.name),
                                config.name,
                                getParams(config.connectorInit),
                                targetPosition
                            );
                        }
                        modifications.push(addConnectorInit);
                    }

                    // Add an action invocation on the initialized client.
                    const addActionInvo: STModification = createCheckedRemoteServiceCall(
                        "var",
                        config.action.returnVariableName,
                        config.name,
                        config.action.name,
                        getParams(config.action.fields), targetPosition
                    );
                    modifications.push(addActionInvo);

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
    };

    let connectorComponent: ReactNode = null;

    if (fieldsForFunctions) {
        connectorComponent = getConnectorComponent(
            connectorInfo.module + connectorInfo.name, {
            actions: fieldsForFunctions,
            connectorConfig: config,
            onSave,
            onClose,
            connector: connectorInfo,
            isNewConnectorInitWizard,
            targetPosition,
            model
        });
        if (!connectorComponent) {
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
                        {isNewConnection && isOauthConnector && !isManualConnection && (
                            <div className={classNames(wizardClasses.bottomBtnWrapper, wizardClasses.bottomRadius)}>
                                <div className={wizardClasses.fullWidth}>
                                    <div className={wizardClasses.mainOauthBtnWrapper}>
                                        <OauthConnectButton
                                            className={classNames(wizardClasses.fullWidth, wizardClasses.oauthBtnWrapper)}
                                            currentConnection={connectionDetails}
                                            connectorName={connectorInfo.displayName}
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
                            selectedOperation={config.action.name}
                            onSave={onSave}
                            onConnectionChange={onConnectionNameChange}
                            onOperationChange={onOperationChange}
                            mutationInProgress={isMutationProgress}
                            isNewConnectorInitWizard={isNewConnectorInitWizard}
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
                            onSave={onCreateConnectorSave}
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
        }
    }

    return (
        <div className={wizardClasses.mainApiWrapper}>
            {connectorComponent}
        </div>
    );
}
