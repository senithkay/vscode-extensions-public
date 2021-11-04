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
import React, { ReactNode, useContext, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import {
    CaptureBindingPattern,
    LocalVarDecl,
    NodePosition,
    STKindChecker,
} from "@ballerina/syntax-tree";
import { Box, Divider, FormControl, Typography } from "@material-ui/core";

import {
    ConnectionDetails,
    OauthProviderConfig,
} from "../../../../../api/models";
import {
    ActionConfig,
    ConnectorConfig,
    FormField,
    FormFieldReturnType,
    WizardType,
} from "../../../../../ConfigurationSpec/types";
import { Context } from "../../../../../Contexts/Diagram";
import { STSymbolInfo } from "../../../../../Definitions";
import {
    BallerinaConnectorInfo,
    STModification,
} from "../../../../../Definitions/lang-client-extended";
import { TextPreloaderVertical } from "../../../../../PreLoader/TextPreloaderVertical";
import { ConnectionType } from "../../../../components/OauthConnectButton";
import {
    CONTINUE_TO_INVOKE_API,
    EVENT_TYPE_AZURE_APP_INSIGHTS,
    FINISH_CONNECTOR_ACTION_ADD_INSIGHTS,
    FINISH_CONNECTOR_INIT_ADD_INSIGHTS,
    LowcodeEvent,
} from "../../../../models";
import { getAllVariables } from "../../../../utils/mixins";
import {
    createCheckedPayloadFunctionInvocation,
    createImportStatement,
    createPropertyStatement,
    updatePropertyStatement,
} from "../../../../utils/modification-util";
import {
    ExpressionInjectablesProps,
    FormGeneratorProps,
    InjectableItem,
} from "../../../FormGenerator";
import { useStyles as useFormStyles } from "../../../Portals/ConfigForm/forms/style";
import {
    genVariableName,
    getActionReturnType,
    getConnectorComponent,
    getConnectorIcon,
    getFormattedModuleName,
    getInitReturnType,
    getParams,
    matchEndpointToFormField,
} from "../../../Portals/utils";
import { defaultOrgs } from "../../../Portals/utils/constants";
import { ConfigWizardState } from "../../index";
import { wizardStyles } from "../../style";
import "../../style.scss";
import { CreateConnectorForm } from "../CreateNewConnection";
import { OperationForm } from "../OperationForm";
import { SelectConnectionForm } from "../SelectExistingConnection";

export interface OauthProviderConfigState {
    isConfigListLoading: boolean;
    configList: OauthProviderConfig[];
    configListError?: Error;
}
export interface ConnectorOperation {
    name: string;
    label?: string;
}

export const MANUAL_TYPE = "manual";

enum FormStates {
    ExistingConnection,
    OauthConnect,
    CreateNewConnection,
    OperationDropdown,
    OperationForm,
    SingleForm,
}
export interface ConnectorConfigWizardProps {
    connectorInfo: BallerinaConnectorInfo;
    targetPosition: NodePosition;
    configWizardArgs?: ConfigWizardState;
    onClose: () => void;
    selectedConnector: LocalVarDecl;
    isAction?: boolean;
    expressionInjectables?: ExpressionInjectablesProps;
}

export function ConnectorForm(props: FormGeneratorProps) {
    const wizardClasses = wizardStyles();
    const formClasses = useFormStyles();
    const {
        api: {
            code: { modifyDiagram },
            insights: { onEvent },
        },
        props: { stSymbolInfo, isMutationProgress },
    } = useContext(Context);

    const symbolInfo: STSymbolInfo = stSymbolInfo;
    const {
        targetPosition,
        configWizardArgs,
        onClose,
        selectedConnector,
        isAction,
        expressionInjectables,
    } = props.configOverlayFormStatus.formArgs as ConnectorConfigWizardProps;
    const {
        connector,
        functionDefInfo,
        connectorConfig,
        wizardType,
        model,
        isLoading: isConnectorLoading,
    } = configWizardArgs;

    const isOauthConnector = false;
    // TODO:  need to update connector name with display annotation
    const connectorName = connector?.moduleName || connector?.package.name;
    const connectorModule = connector?.moduleName || connector?.package.name;

    const [config, setConfig] = useState(
        connectorConfig ? connectorConfig : new ConnectorConfig()
    );
    const isNewConnectorInitWizard = config.existingConnections
        ? wizardType === WizardType.NEW
        : true;

    const [formState, setFormState] = useState<FormStates>(
        FormStates.CreateNewConnection
    );
    const [isNewConnection, setIsNewConnection] = useState(
        isNewConnectorInitWizard
    );
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOperation, setSelectedOperation] = useState(
        config?.action?.name
    );
    const [
        selectedActiveConnection,
        setSelectedActiveConnection,
    ] = useState<ConnectionDetails>();
    const [
        selectedConnectionType,
        setSelectedConnectionType,
    ] = useState<ConnectionType>();

    const [responseStatus, setResponseStatus] = useState<number>();

    useEffect(() => {
        if (isAction) {
            setFormState(FormStates.OperationForm);
            setIsLoading(false);
            return;
        } else {
            setFormState(FormStates.CreateNewConnection);
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedConnector) {
            const connectorNameValue = (selectedConnector.typedBindingPattern
                .bindingPattern as CaptureBindingPattern).variableName.value;
            config.name = connectorNameValue;
            matchEndpointToFormField(selectedConnector, config.connectorInit);
            config.isExistingConnection = connectorNameValue !== undefined;
            onSelectExisting(connectorNameValue);
        }
    }, [selectedConnector]);

    const connectorInitFormFields: FormField[] = functionDefInfo?.get("init")
        ?.parameters;

    // managing name set by the non oauth connectors
    config.name =
        connector && isNewConnectorInitWizard && !config.name
            ? genVariableName(
                  getFormattedModuleName(connectorModule) + "Endpoint",
                  getAllVariables(symbolInfo)
              )
            : config.name;
    const [configName, setConfigName] = useState(config.name);
    const handleConfigNameChange = (name: string) => {
        setConfigName(name);
    };

    const operations: ConnectorOperation[] = [];
    if (functionDefInfo) {
        functionDefInfo.forEach((value, key) => {
            if (key !== "init") {
                operations.push({ name: key, label: value.name });
            }
        });
    }
    if (!config.action) {
        config.action = new ActionConfig();
    }

    const onCreateNew = () => {
        setConfigName(
            genVariableName(
                connectorModule + "Endpoint",
                getAllVariables(symbolInfo)
            )
        );
        setConfigName(
            genVariableName(
                connectorModule + "Endpoint",
                getAllVariables(symbolInfo)
            )
        );
        setFormState(FormStates.CreateNewConnection);
        setIsNewConnection(true);
    };

    const onCreateConnectorSave = () => {
        if (isNewConnection) {
            setFormState(FormStates.OperationDropdown);
        } else {
            setFormState(FormStates.OperationForm);
        }
    };

    const onSelectExisting = (value: any) => {
        if (connector.package.organization === defaultOrgs.WSO2) {
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
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: CONTINUE_TO_INVOKE_API,
            property: connectorName,
        };
        onEvent(event);
    };

    const handleEndpointSave = () => {
        const modifications: STModification[] = [];
        expressionInjectables?.list?.forEach((item: InjectableItem) => {
            modifications.push(item.modification);
        });
        const isInitReturnError = getInitReturnType(functionDefInfo);
        const moduleName = getFormattedModuleName(connectorModule);
        const endpointStatement = `${moduleName}:${connector.name} ${
            config.name
        } = ${isInitReturnError ? "check" : ""} new (${getParams(
            config.connectorInit
        ).join()});`;

        if (isNewConnectorInitWizard && targetPosition) {
            const addImport: STModification = createImportStatement(
                connector.package.organization,
                connectorModule,
                targetPosition
            );
            modifications.push(addImport);
            const addConnectorInit = createPropertyStatement(
                endpointStatement,
                targetPosition
            );
            modifications.push(addConnectorInit);
            onConnectorAddEvent();
        } else {
            const updateConnectorInit = updatePropertyStatement(
                endpointStatement,
                connectorConfig.initPosition
            );
            modifications.push(updateConnectorInit);
        }

        if (modifications.length > 0) {
            modifyDiagram(modifications);
            onClose();
        }
    };

    const handleActionSave = () => {
        const modifications: STModification[] = [];
        const isInitReturnError = getInitReturnType(functionDefInfo);
        const currentActionReturnType = getActionReturnType(
            config.action.name,
            functionDefInfo
        );
        const moduleName = getFormattedModuleName(connectorModule);

        expressionInjectables?.list?.forEach((item: InjectableItem) => {
            modifications.push(item.modification);
        });

        let actionStatement = "";
        if (currentActionReturnType.hasReturn) {
            addReturnImportsModifications(
                modifications,
                currentActionReturnType
            );
            actionStatement += `${currentActionReturnType.returnType} ${config.action.returnVariableName} = `;
        }
        actionStatement += `${
            currentActionReturnType.hasError ? "check" : ""
        } ${config.name}->${config.action.name}(${getParams(
            config.action.fields
        ).join()});`;

        if (isNewConnectorInitWizard) {
            const endpointStatement = `${moduleName}:${connector.name} ${
                config.name
            } = ${isInitReturnError ? "check" : ""} new (${getParams(
                config.connectorInit
            ).join()});`;
            const addConnectorInit = createPropertyStatement(
                endpointStatement,
                targetPosition
            );
            modifications.push(addConnectorInit);
            const addActionInvocation = createPropertyStatement(
                actionStatement,
                targetPosition
            );
            modifications.push(addActionInvocation);
            onActionAddEvent();
        } else {
            const updateActionInvocation = updatePropertyStatement(
                actionStatement,
                model.position
            );
            modifications.push(updateActionInvocation);
        }

        if (modifications.length > 0) {
            modifyDiagram(modifications);
            onClose();
        }
    };

    const onConnectionNameChange = () => {
        if (isNewConnection) {
            setFormState(FormStates.CreateNewConnection);
        } else {
            setFormState(FormStates.ExistingConnection);
        }
    };

    const onCreateConnectorBack = () => {
        if (isOauthConnector) {
            setIsNewConnection(true);
            setFormState(FormStates.OauthConnect);
        }
    };

    const addReturnImportsModifications = (
        modifications: STModification[],
        returnType: FormFieldReturnType
    ) => {
        if (returnType.importTypeInfo) {
            returnType.importTypeInfo?.forEach((typeInfo) => {
                const addImport: STModification = createImportStatement(
                    typeInfo.orgName,
                    typeInfo.moduleName,
                    { startColumn: 0, startLine: 0 }
                );
                // check already exists modification statements
                const existsMod = modifications.find(
                    (modification) =>
                        JSON.stringify(addImport) ===
                        JSON.stringify(modification)
                );
                if (!existsMod) {
                    modifications.push(addImport);
                }
            });
        }
    };

    const actionReturnType = getActionReturnType(
        selectedOperation,
        functionDefInfo
    );

    if (!isNewConnectorInitWizard && actionReturnType?.hasReturn) {
        if (
            STKindChecker.isLocalVarDecl(model) &&
            config.action.name === selectedOperation
        ) {
            config.action.returnVariableName = ((model as LocalVarDecl)
                .typedBindingPattern
                .bindingPattern as CaptureBindingPattern).variableName.value;
        } else {
            config.action.returnVariableName = undefined;
        }
    }

    // TODO: fix AI suggestion issue with vscode implementation
    // useEffect(() => {
    //     if (connector) {
    //         let allFormFields: FormField[] = [];
    //         Array.from(functionDefInfo.keys()).forEach((key: string) => {
    //             allFormFields = allFormFields.concat(
    //                 functionDefInfo.get(key).parameters
    //             );
    //         });
    //     }
    //     getAiSuggestions(aiSuggestionsReq).then((res: AiSuggestionsRes) => {
    //       res.suggestedMappings.forEach((schema: string) => {
    //         const varMap = JSON.parse(schema);
    //         const varKeys = Object.keys(varMap);
    //         varKeys.forEach((variable: string) => {
    //           addAiSuggestion(variable, varMap[variable], allFormFields);
    //         });
    //       });
    //     });
    // }, [functionDefInfo]);

    let connectorComponent: ReactNode = null;

    if (functionDefInfo) {
        if (connectorModule === "http") {
            connectorComponent = getConnectorComponent(
                connectorModule + connector.name,
                {
                    functionDefinitions: functionDefInfo,
                    connectorConfig: config,
                    handleActionSave,
                    onClose,
                    connector,
                    isNewConnectorInitWizard,
                    targetPosition,
                    model,
                    selectedConnector,
                    isAction,
                }
            );
        } else {
            connectorComponent = (
                <div className={wizardClasses.fullWidth}>
                    <div className={wizardClasses.topTitleWrapper}>
                        <div className={wizardClasses.titleWrapper}>
                            <div className={wizardClasses.connectorIconWrapper}>
                                {getConnectorIcon(connectorName)}
                            </div>
                            <Typography
                                className={wizardClasses.configTitle}
                                variant="h4"
                            >
                                {connectorName}
                            </Typography>
                        </div>
                        <Divider variant="fullWidth" />
                    </div>

                    {formState === FormStates.OperationForm && (
                        <OperationForm
                            functionDefInfo={functionDefInfo}
                            connectionDetails={config}
                            showConnectionName={!isNewConnection}
                            selectedOperation={selectedOperation}
                            onSave={handleActionSave}
                            onConnectionChange={onConnectionNameChange}
                            mutationInProgress={isMutationProgress}
                            isNewConnectorInitWizard={isNewConnectorInitWizard}
                            operations={operations}
                            expressionInjectables={expressionInjectables}
                        />
                    )}

                    {formState === FormStates.ExistingConnection &&
                        isNewConnectorInitWizard && (
                            <SelectConnectionForm
                                onCreateNew={onCreateNew}
                                connectorConfig={config}
                                connector={connector}
                                onSelectExisting={onSelectExisting}
                            />
                        )}

                    {formState === FormStates.ExistingConnection &&
                        !isNewConnectorInitWizard && (
                            <CreateConnectorForm
                                initFields={connectorInitFormFields}
                                onSave={onCreateConnectorSave}
                                connectorConfig={config}
                                onConfigNameChange={handleConfigNameChange}
                                onBackClick={onCreateConnectorBack}
                                connector={connector}
                                isNewConnectorInitWizard={
                                    isNewConnectorInitWizard
                                }
                                isOauthConnector={isOauthConnector}
                                responseStatus={responseStatus}
                                expressionInjectables={expressionInjectables}
                            />
                        )}

                    {formState === FormStates.CreateNewConnection && (
                        <CreateConnectorForm
                            initFields={connectorInitFormFields}
                            onSave={handleEndpointSave}
                            onSaveNext={handleCreateConnectorSaveNext}
                            connectorConfig={config}
                            onConfigNameChange={handleConfigNameChange}
                            onBackClick={onCreateConnectorBack}
                            connector={connector}
                            isNewConnectorInitWizard={isNewConnectorInitWizard}
                            isOauthConnector={isOauthConnector}
                            responseStatus={responseStatus}
                            expressionInjectables={expressionInjectables}
                        />
                    )}
                </div>
            );
        }
    }

    return (
        <>
            <FormControl
                data-testid="log-form"
                className={formClasses.wizardFormControl}
            >
                <div className={formClasses.formWrapper}>
                    <div className={formClasses.formFeilds}>
                        <div className={formClasses.formWrapper}>
                            <div className={formClasses.formTitleWrapper}>
                                <div className={formClasses.mainTitleWrapper}>
                                    <Typography variant="h4">
                                        <Box paddingTop={2} paddingBottom={2}>
                                            <FormattedMessage
                                                id="lowcode.develop.configForms.connector.title"
                                                defaultMessage="API Call"
                                            />
                                        </Box>
                                    </Typography>
                                </div>
                            </div>

                            {(isLoading || isConnectorLoading) && (
                                <div className={wizardClasses.loaderWrapper}>
                                    <TextPreloaderVertical position="relative" />
                                </div>
                            )}
                            {!(isLoading || isConnectorLoading) && (
                                <div className={wizardClasses.mainApiWrapper}>
                                    {connectorComponent}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </FormControl>
        </>
    );

    function onActionAddEvent() {
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: FINISH_CONNECTOR_ACTION_ADD_INSIGHTS,
            property: connectorName,
        };
        onEvent(event);
    }

    function onConnectorAddEvent() {
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: FINISH_CONNECTOR_INIT_ADD_INSIGHTS,
            property: connectorName,
        };
        onEvent(event);
    }
}
