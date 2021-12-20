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

import {Box, Divider, FormControl, IconButton, Typography} from "@material-ui/core";
import {
    ActionConfig,
    BallerinaConnectorInfo,
    ConnectorConfig,
    FormField,
    FormFieldReturnType,
    FormHeaderSection,
    STModification,
    WizardType,
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { CaptureBindingPattern, FunctionDefinition, LocalVarDecl, ModulePart, NodePosition, STKindChecker } from "@wso2-enterprise/syntax-tree";

import {DocIcon} from "../../../../../../assets";
import { Context, useDiagramContext } from "../../../../../../Contexts/Diagram";
import { useFunctionContext } from "../../../../../../Contexts/Function";
import { TextPreloaderVertical } from "../../../../../../PreLoader/TextPreloaderVertical";
import {
    CONTINUE_TO_INVOKE_API,
    EVENT_TYPE_AZURE_APP_INSIGHTS,
    FINISH_CONNECTOR_ACTION_ADD_INSIGHTS,
    FINISH_CONNECTOR_INIT_ADD_INSIGHTS,
    LowcodeEvent,
} from "../../../../../models";
import { getAllVariables } from "../../../../../utils/mixins";
import {
    createImportStatement,
    createPropertyStatement,
    createQueryWhileStatement,
    updateFunctionSignature,
    updatePropertyStatement,
} from "../../../../../utils/modification-util";
import { ModuleIcon } from "../../../../LowCodeDiagram/Components/RenderingComponents/Connector/ConnectorHeader/ModuleIcon";
import {
    checkDBConnector,
    genVariableName,
    getActionReturnType,
    getConnectorComponent,
    getFormattedModuleName,
    getInitReturnType,
    getModuleIcon,
    getParams,
} from "../../../../Portals/utils";
import { wizardStyles as useFormStyles } from "../../../ConfigForms/style";
import { ExpressionInjectablesProps, FormGeneratorProps, InjectableItem } from "../../../FormGenerator";
import {generateDocUrl} from "../../../Utils";
import { ConfigWizardState } from "../../index";
import { wizardStyles } from "../../style";
import "../../style.scss";
import { CreateConnectorForm } from "../CreateNewConnection";
import { OperationForm } from "../OperationForm";
import { SelectConnectionForm } from "../SelectExistingConnection";

export interface ConnectorOperation {
    name: string;
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
export interface ConnectorConfigWizardProps {
    connectorInfo: BallerinaConnectorInfo;
    targetPosition: NodePosition;
    configWizardArgs?: ConfigWizardState;
    onClose: () => void;
    onSave: () => void;
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
            webView: { showDocumentationView }
        },
        props: { stSymbolInfo, isMutationProgress },
    } = useContext(Context);
    const { functionNode } = useFunctionContext();

    const {
        targetPosition,
        configWizardArgs,
        onClose,
        onSave,
        selectedConnector,
        isAction,
        expressionInjectables,
        connectorInfo
    } = props.configOverlayFormStatus.formArgs as ConnectorConfigWizardProps;
    const {
        props: { syntaxTree },
    } = useDiagramContext();
    const { connector, functionDefInfo, connectorConfig, wizardType, model, isLoading: isConnectorLoading } = configWizardArgs;
    const isOauthConnector = false;
    const connectorName = connector?.displayAnnotation?.label || `${connector?.package.name} / ${connector?.name}`;
    const connectorModule = connector?.moduleName;
    const config = connectorConfig ? connectorConfig : new ConnectorConfig();
    const selectedOperation = config?.action?.name;
    const isNewConnectorInitWizard = wizardType === WizardType.NEW;

    const [formState, setFormState] = useState<FormStates>(FormStates.CreateNewConnection);
    const [isNewConnection, setIsNewConnection] = useState(isNewConnectorInitWizard);
    const [isLoading, setIsLoading] = useState(true);
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

    const connectorInitFormFields: FormField[] = functionDefInfo?.get("init")?.parameters || [];

    // managing name set by the non oauth connectors
    config.name =
        connector && isNewConnectorInitWizard && !config.name
            ? genVariableName(getFormattedModuleName(connectorModule) + "Endpoint", getAllVariables(stSymbolInfo))
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

    const actionReturnType = getActionReturnType(selectedOperation, functionDefInfo);
    if (
        !isNewConnectorInitWizard &&
        actionReturnType?.hasReturn &&
        STKindChecker.isLocalVarDecl(model) &&
        STKindChecker.isCaptureBindingPattern(model.typedBindingPattern?.bindingPattern)
    ) {
        config.action.returnVariableName = ((model as LocalVarDecl).typedBindingPattern
            .bindingPattern as CaptureBindingPattern).variableName.value;
    }
    if (model && !isNewConnectorInitWizard) {
        config.action.returnType = ((model as LocalVarDecl).typedBindingPattern
            .typeDescriptor.source.trim());
    }
    const onCreateNew = () => {
        setConfigName(genVariableName(connectorModule + "Endpoint", getAllVariables(stSymbolInfo)));
        setConfigName(genVariableName(connectorModule + "Endpoint", getAllVariables(stSymbolInfo)));
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
        setConfigName(value);
        setIsNewConnection(false);
        setFormState(FormStates.OperationForm);
    };

    const addExtraImport = (modifications: STModification[], orgName: string, moduleName: string) => {
        let importCounts: number = 0;
        if (STKindChecker.isModulePart(syntaxTree)) {
            (syntaxTree as ModulePart).imports?.forEach((imp) => {
                if (imp.typeData?.symbol.id.orgName === orgName && imp.typeData?.symbol.id.moduleName === `${moduleName}.driver`) {
                    importCounts = importCounts + 1;
                }
            })
            if (importCounts === 0) {
                if (checkDBConnector(connectorModule)) {
                    const addDriverImport: STModification = createImportStatement(orgName, `${moduleName}.driver as _`, targetPosition);
                    modifications.push(addDriverImport);
                }
            }
        }
    }

    const handleEndpointSave = () => {
        const modifications: STModification[] = [];
        expressionInjectables?.list?.forEach((item: InjectableItem) => {
            modifications.push(item.modification);
        });
        const isInitReturnError = getInitReturnType(functionDefInfo);
        if (isInitReturnError) {
            const functionSignature = updateFunctionSignatureWithError();
            if (functionSignature) {
                modifications.push(functionSignature);
            }
        }

        const moduleName = getFormattedModuleName(connectorModule);
        const endpointStatement = `${moduleName}:${connector.name} ${config.name} = ${isInitReturnError ? "check" : ""} new (${getParams(
            config.connectorInit
        ).join()});`;

        if (isNewConnectorInitWizard && targetPosition) {
            const addImport: STModification = createImportStatement(connector.package.organization, connectorModule, targetPosition);
            addExtraImport(modifications, connector.package.organization, connectorModule);
            modifications.push(addImport);
            const addConnectorInit = createPropertyStatement(endpointStatement, targetPosition);
            modifications.push(addConnectorInit);
            onConnectorAddEvent();
            if (checkDBConnector(moduleName)){
                const closeStatement = `check ${config.name}.close();`
                const addCloseStatement = createPropertyStatement(closeStatement, targetPosition);
                modifications.push(addCloseStatement);
             }
        } else {
            const updateConnectorInit = updatePropertyStatement(endpointStatement, connectorConfig.initPosition);
            modifications.push(updateConnectorInit);
        }

        if (modifications.length > 0) {
            modifyDiagram(modifications);
            onSave();
        }
    };

    const handleActionSave = () => {
        const modifications: STModification[] = [];
        const configActionName = config.action.name;
        const isInitReturnError = getInitReturnType(functionDefInfo);
        const currentActionReturnType = getActionReturnType(config.action.name, functionDefInfo);
        if (checkDBConnector(connectorModule) && config.action.returnType) {
            currentActionReturnType.returnType = config.action.returnType;
        }
        const moduleName = getFormattedModuleName(connectorModule);
        addExtraImport(modifications, connector.package.organization, moduleName);

        expressionInjectables?.list?.forEach((item: InjectableItem) => {
            modifications.push(item.modification);
        });

        if (isInitReturnError || currentActionReturnType.hasError) {
            const functionSignature = updateFunctionSignatureWithError();
            if (functionSignature) {
                modifications.push(functionSignature);
            }
        }

        if (isNewConnectorInitWizard && !isAction) {
            const addImport: STModification = createImportStatement(connector.package.organization, connectorModule, targetPosition);
            modifications.push(addImport);
            const endpointStatement = `${moduleName}:${connector.name} ${config.name} = ${isInitReturnError ? "check" : ""
                } new (${getParams(config.connectorInit).join()});`;
            const addConnectorInit = createPropertyStatement(endpointStatement, targetPosition);
            modifications.push(addConnectorInit);
        }
        let actionStatement = "";
        if (currentActionReturnType.hasReturn) {
            addReturnImportsModifications(modifications, currentActionReturnType);
            actionStatement += `${currentActionReturnType.returnType} ${config.action.returnVariableName} = `;
        }
        actionStatement += `${currentActionReturnType.hasError ? "check" : ""} ${config.name}${
            config.action.isRemote ? "->" : "."
        }${config.action.name}(${getParams(config.action.fields).join()});`;


        if (!isNewConnectorInitWizard && isAction) {
            const updateActionInvocation = updatePropertyStatement(actionStatement, model.position);
            modifications.push(updateActionInvocation);
        } else {
            const addActionInvocation = createPropertyStatement(actionStatement, targetPosition);
            modifications.push(addActionInvocation);
            onActionAddEvent();
        }

        if ((isNewConnectorInitWizard) && (config.action.name === "query" && checkDBConnector(connectorModule))) {
            const resultUniqueName = genVariableName("recordResult", getAllVariables(stSymbolInfo));
            const returnTypeName = config.action.returnVariableName;
            const addQueryWhileStatement = createQueryWhileStatement(resultUniqueName, returnTypeName, targetPosition);
            modifications.push(addQueryWhileStatement);

            const closeStreamStatement = `check ${returnTypeName}.close();`
            const addCloseStreamStatement = createPropertyStatement(closeStreamStatement, targetPosition);
            modifications.push(addCloseStreamStatement);
        }
        if (isNewConnectorInitWizard && !isAction  && checkDBConnector(connectorModule)) {
            const resp = config.name;
            const closeStatement = `check ${resp}.close();`
            const addCloseStatement = createPropertyStatement(closeStatement, targetPosition);
            modifications.push(addCloseStatement);
        }
        if (modifications.length > 0) {
            modifyDiagram(modifications);
            onSave();
        }
    };

    const handleExtensionSave = (modifications: STModification[]) => {
        if (modifications.length > 0) {
            modifyDiagram(modifications);
            onSave();
        }
    };

    const updateFunctionSignatureWithError = () => {
        if (!(functionNode && STKindChecker.isFunctionDefinition(functionNode))) {
            return undefined;
        }
        const activeFunction = functionNode as FunctionDefinition;
        const parametersStr = activeFunction.functionSignature.parameters.map((item) => item.source).join(",");
        let returnTypeStr = activeFunction.functionSignature.returnTypeDesc?.source.trim();

        if (returnTypeStr?.includes("error")) {
            return undefined;
        }

        if (returnTypeStr?.includes("?") || returnTypeStr?.includes("()")) {
            returnTypeStr = returnTypeStr + "|error";
        } else if (returnTypeStr) {
            returnTypeStr = returnTypeStr + "|error?";
        } else {
            returnTypeStr = "returns error?";
        }

        return updateFunctionSignature(activeFunction.functionName.value, parametersStr, returnTypeStr, {
            ...activeFunction.functionSignature.position,
            startColumn: activeFunction.functionName.position.startColumn,
        });
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

    const addReturnImportsModifications = (modifications: STModification[], returnType: FormFieldReturnType) => {
        if (returnType.importTypeInfo) {
            returnType.importTypeInfo?.forEach((typeInfo) => {
                const addImport: STModification = createImportStatement(typeInfo.orgName, typeInfo.moduleName, { startColumn: 0, startLine: 0 });
                // check already exists modification statements
                const existsMod = modifications.find((modification) => JSON.stringify(addImport) === JSON.stringify(modification));
                if (!existsMod) {
                    modifications.push(addImport);
                }
            });
        }
    };

    // TODO: Created common function to send Azure analytics.
    const onActionAddEvent = () => {
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: FINISH_CONNECTOR_ACTION_ADD_INSIGHTS,
            property: connectorName,
        };
        onEvent(event);
    };

    const onConnectorAddEvent = () => {
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: FINISH_CONNECTOR_INIT_ADD_INSIGHTS,
            property: connectorName,
        };
        onEvent(event);
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

    const openDocPanel = () => {
        if (connectorInfo?.package) {
            const {organization, name} = connectorInfo?.package;
            if (organization && name) {
                const docURL = generateDocUrl(organization, name, "");
                if (docURL){
                    showDocumentationView(docURL);
                }
            }
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
        if (connector.moduleName === "http" && connector.name === "Client") {
            connectorComponent = getConnectorComponent(connectorModule + connector.name, {
                functionDefinitions: functionDefInfo,
                connectorConfig: config,
                onSave: handleExtensionSave,
                onClose,
                connector,
                isNewConnectorInitWizard,
                targetPosition,
                model,
                selectedConnector,
                isAction,
            });
        } else {
            connectorComponent = (
                <div className={wizardClasses.fullWidth}>
                    <div className={wizardClasses.topTitleWrapper}>
                        <div className={wizardClasses.titleWrapper}>
                            <div className={wizardClasses.connectorIconWrapper}>
                                <ModuleIcon module={connector} scale={0.5}/>
                            </div>
                            <Typography className={wizardClasses.configTitle} variant="h4">
                                {connectorName}
                            </Typography>
                            <IconButton
                                onClick={openDocPanel}
                            >
                                <img src={DocIcon}/>
                            </IconButton>
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
                            targetPosition={targetPosition}
                            connectorInfo={connectorInfo}
                        />
                    )}

                    {formState === FormStates.ExistingConnection && isNewConnectorInitWizard && (
                        <SelectConnectionForm
                            onCreateNew={onCreateNew}
                            connectorConfig={config}
                            connector={connector}
                            onSelectExisting={onSelectExisting}
                        />
                    )}

                    {formState === FormStates.ExistingConnection && !isNewConnectorInitWizard && (
                        <CreateConnectorForm
                            initFields={connectorInitFormFields}
                            onSave={onCreateConnectorSave}
                            connectorConfig={config}
                            onConfigNameChange={handleConfigNameChange}
                            onBackClick={onCreateConnectorBack}
                            connector={connector}
                            isNewConnectorInitWizard={isNewConnectorInitWizard}
                            isOauthConnector={isOauthConnector}
                            responseStatus={responseStatus}
                            expressionInjectables={expressionInjectables}
                            targetPosition={targetPosition}
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
                            targetPosition={targetPosition}
                        />
                    )}
                </div>
            );
        }
    }

    return (
        <FormControl data-testid="connector-form" className={formClasses.wizardFormControl}>
            <FormHeaderSection
                onCancel={onClose}
                statementEditor={false}
                formTitle={"lowcode.develop.configForms.connector.title"}
                defaultMessage={"Connector"}
            />
            <div className={formClasses.formWrapper}>
                <div className={formClasses.formFeilds}>
                    {(isLoading || isConnectorLoading) && (
                        <div className={wizardClasses.loaderWrapper}>
                            <TextPreloaderVertical position="relative" />
                        </div>
                    )}
                    {!(isLoading || isConnectorLoading) && <div className={wizardClasses.mainApiWrapper}>{connectorComponent}</div>}
                </div>
            </div>
        </FormControl>
    );
}
