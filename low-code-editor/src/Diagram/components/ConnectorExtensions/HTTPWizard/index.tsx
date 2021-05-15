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
import React, { useContext, useState } from "react";
import { FormattedMessage } from "react-intl";

import { CallStatement, CaptureBindingPattern, CheckAction, LocalVarDecl, MethodCall, PositionalArg, RemoteMethodCallAction, SimpleNameReference, STNode, StringLiteral, TypeCastExpression } from "@ballerina/syntax-tree";
import Typography from "@material-ui/core/Typography";
import { CloseRounded } from "@material-ui/icons";

import { ConnectorConfig, FormField, FunctionDefinitionInfo } from "../../../../ConfigurationSpec/types";
import { Context } from "../../../../Contexts/Diagram";
import { STSymbolInfo } from "../../../../Definitions";
import { Connector, STModification } from "../../../../Definitions/lang-client-extended";
import { getAllVariables } from "../../../utils/mixins";
import {
    createCheckedPayloadFunctionInvocation,
    createCheckedRemoteServiceCall,
    createHeaderObjectDeclaration,
    createImportStatement,
    createPropertyStatement,
    createServiceCallForPayload,
    updateCheckedPayloadFunctionInvocation,
    updateCheckedRemoteServiceCall,
    updateHeaderObjectDeclaration,
    updatePropertyStatement,
    updateServiceCallForPayload
} from "../../../utils/modification-util";
import { DraftInsertPosition, DraftUpdateStatement } from "../../../view-state/draft";
import { SelectConnectionForm } from "../../ConnectorConfigWizard/Components/SelectExistingConnection";
import { wizardStyles } from "../../ConnectorConfigWizard/style";
import { ButtonWithIcon } from "../../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { genVariableName, getConnectorIcon, getParams, matchEndpointToFormField } from "../../Portals/utils";

import { CreateConnectorForm } from "./CreateConnectorForm";
import { HeaderObjectConfig } from "./HTTPHeaders";
import { OperationDropdown } from "./OperationDropdown";
import { SelectInputOutputForm } from "./SelectInputOutputForm";
import "./style.scss"
import { useStyles } from "./styles";
interface WizardProps {
    functionDefinitions: Map<string, FunctionDefinitionInfo>;
    connectorConfig: ConnectorConfig;
    onSave: (sourceModifications: STModification[]) => void;
    onClose?: () => void;
    connector: Connector;
    isNewConnectorInitWizard: boolean;
    targetPosition: DraftInsertPosition;
    model?: STNode,
    selectedConnector?: LocalVarDecl;
    isAction?: boolean;
}

enum InitFormState {
    Home = -1,
    Create,
    OperationDropdown,
    SelectInputOutput
}

export function HTTPWizard(props: WizardProps) {
    const classes = useStyles();
    const wizardClasses = wizardStyles();
    const { functionDefinitions, connectorConfig, connector, onSave, onClose, isNewConnectorInitWizard, targetPosition,
            model, selectedConnector, isAction } = props;
    const { state: diagramState } = useContext(Context);

    const symbolInfo: STSymbolInfo = diagramState.stSymbolInfo;
    const connectorInitFormFields: FormField[] = functionDefinitions.get("init") ? functionDefinitions.get("init").parameters : functionDefinitions.get("__init").parameters;
    const enableConnectorInitalizePage = !isAction;

    const initFormState = enableConnectorInitalizePage ? InitFormState.Create : InitFormState.SelectInputOutput;

    connectorConfig.connectorInit = connectorConfig.connectorInit.length > 0 ? connectorConfig.connectorInit
        : connectorInitFormFields;
    const [state, setState] = useState<InitFormState>(initFormState);
    const [isNewConnection, setIsNewConnection] = useState<boolean>(true);
    const [selectedOperation, setSelectedOperation] = useState<string>(connectorConfig?.action?.name);

    const [headerObject] = useState<HeaderObjectConfig[]>([]);
    const httpVar = model as LocalVarDecl;
    const [previousAction, setPreviousAction] = useState(isNewConnectorInitWizard ? undefined
        : connectorConfig?.action?.name);

    React.useEffect(() => {
        if (!isNewConnectorInitWizard && isAction) {
            setState(InitFormState.SelectInputOutput);
        } else if (selectedConnector) {
            connectorConfig.isExistingConnection = true;
            setState(InitFormState.SelectInputOutput);
        }
    }, [isNewConnectorInitWizard, selectedConnector])

    const handleCreateConnectorOnSaveNext = () => {
        setState(isNewConnectorInitWizard ? InitFormState.OperationDropdown : InitFormState.SelectInputOutput);
    };

    const handleConnectionChange = () => {
        if (isNewConnection) {
            setState(InitFormState.Create);
        } else {
            setState(InitFormState.Home);
        }
    };

    const handleCreateConnectorOnSave = () => {
        const modifications: STModification[] = [];
        if (!isNewConnectorInitWizard) {
            const updatedConnectorInit = updatePropertyStatement(
                `${connector.module}:${connector.name} ${connectorConfig.name} = check new (${getParams(
                    connectorConfig.connectorInit).join()});`, connectorConfig.initPosition);
            modifications.push(updatedConnectorInit);
        } else {
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
                    `${connector.module}:${connector.name} ${connectorConfig.name} = check new (${getParams(connectorConfig.connectorInit).join()});`,
                    targetPosition
                );
                modifications.push(addConnectorInit);
            }
        }
        onSave(modifications);
    };

    const handleActionOnSave = () => {
        const headerField = connectorConfig.action.fields.find(field => field.name === "headers");

        const modifications: STModification[] = [];
        if (!isNewConnectorInitWizard) {
            let actionInitializer: CheckAction;
            switch (httpVar.initializer.kind) {
                case 'CheckAction':
                    // has response variable
                    actionInitializer = (httpVar.initializer as TypeCastExpression).expression as CheckAction;
                    break;
                default:
                    actionInitializer = httpVar.initializer as CheckAction;
            }

            if (actionInitializer) {
                const params: string[] = getParams(connectorConfig.action.fields);
                let serviceCallParams: string = params.toString();

                if (headerField?.value) {
                    // updating headers
                    serviceCallParams = serviceCallParams + `, headers=${headerField.value}`;
                }

                const addActionInvocation: STModification = updateCheckedRemoteServiceCall(
                    "http:Response",
                    connectorConfig.action.returnVariableName,
                    connectorConfig.name,
                    connectorConfig.action.name,
                    [serviceCallParams],
                    model.position
                );
                modifications.push(addActionInvocation);

                if (connectorConfig.responsePayloadMap && connectorConfig.responsePayloadMap.isPayloadSelected) {
                    // payload update
                    let responseModel: STNode;
                    symbolInfo.variables.forEach((value, key) => {
                        if (key === 'var' || key === 'string' || key === 'xml' || key === 'json') {
                            value.forEach(val => {
                                const varName = (((val as LocalVarDecl).typedBindingPattern?.bindingPattern) as CaptureBindingPattern)?.variableName.value;
                                if (varName === connectorConfig.responsePayloadMap.payloadVariableName) {
                                    responseModel = val;
                                }
                            })
                        }
                    })
                    if (responseModel) {
                        const addPayload: STModification = updateCheckedPayloadFunctionInvocation(
                            connectorConfig.responsePayloadMap.payloadVariableName,
                            "var",
                            connectorConfig.action.returnVariableName,
                            connectorConfig.responsePayloadMap.payloadTypes.get(connectorConfig.responsePayloadMap.selectedPayloadType),
                            responseModel.position
                        );
                        modifications.push(addPayload);
                    } else {
                        const addPayload: STModification = createCheckedPayloadFunctionInvocation(
                            connectorConfig.responsePayloadMap.payloadVariableName,
                            "var",
                            connectorConfig.action.returnVariableName,
                            connectorConfig.responsePayloadMap.payloadTypes.get(connectorConfig.responsePayloadMap.selectedPayloadType),
                            { line: model.position.startLine + 1, column: 0 }
                        );
                        modifications.push(addPayload);
                    }
                }
            }
        } else {
            if (targetPosition) {
                if (targetPosition) {
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
                            `${connector.module}:${connector.name} ${connectorConfig.name} = check new (${getParams(connectorConfig.connectorInit).join()});`,
                            targetPosition
                        );
                        modifications.push(addConnectorInit);
                    }

                    // Add an action invocation on the initialized client.
                    const params: string[] = getParams(connectorConfig.action.fields);
                    let serviceCallParams = params.toString();

                    // Header addition
                    if (headerField?.value) {
                        serviceCallParams = serviceCallParams + `, headers=${headerField.value}`;
                    }

                    const addActionInvocation: STModification = createCheckedRemoteServiceCall(
                        "http:Response",
                        connectorConfig.action.returnVariableName,
                        connectorConfig.name,
                        connectorConfig.action.name,
                        [serviceCallParams],
                        targetPosition
                    );
                    modifications.push(addActionInvocation);

                    if (connectorConfig.responsePayloadMap && connectorConfig.responsePayloadMap.isPayloadSelected) {
                        const addPayload: STModification = createCheckedPayloadFunctionInvocation(
                            connectorConfig.responsePayloadMap.payloadVariableName,
                            "var",
                            connectorConfig.action.returnVariableName,
                            connectorConfig.responsePayloadMap.payloadTypes.get(connectorConfig.responsePayloadMap.selectedPayloadType),
                            targetPosition
                        );
                        modifications.push(addPayload);
                    }
                }
            }
        }
        onSave(modifications);
    }

    const handleOnSave = () => {
        // insert initialized connector logic
        let modifications: STModification[] = [];
        if (!isNewConnectorInitWizard && isAction) {
            let actionInitializer: CheckAction;

            const updatedConnectorInit = updatePropertyStatement(
                `${connector.module}:${connector.name} ${connectorConfig.name} = check new (${getParams(connectorConfig.connectorInit).join()});`,
                connectorConfig.initPosition
            );
            modifications.push(updatedConnectorInit);

            switch (httpVar.initializer.kind) {
                case 'TypeCastExpression':
                    // has response variable
                    actionInitializer = (httpVar.initializer as TypeCastExpression).expression as CheckAction;
                    break;
                default:
                    actionInitializer = httpVar.initializer as CheckAction;
            }

            if (actionInitializer) {
                const actionExpression = actionInitializer.expression as RemoteMethodCallAction;
                const message = actionExpression.arguments.length > 1 ? (actionExpression.arguments[2] as PositionalArg).expression : undefined;
                const params: string[] = getParams(connectorConfig.action.fields);
                // only generates the request object name if there is no request object created for the connector
                const requestNameGen: string = !headerObject[0]?.requestName ? genVariableName("request", getAllVariables(symbolInfo)) : headerObject[0]?.requestName;
                let serviceCallParams: string;
                if (message) {
                    if (message.kind === 'SimpleNameReference') {
                        let refName = (message as SimpleNameReference).name.value;
                        const refCallStatements: STNode[] = symbolInfo.callStatement.get(refName);
                        if (headerObject.length > 0) {
                            serviceCallParams = ", " + (connectorConfig.action.name === "forward" ?
                                connectorConfig.action.fields[3]?.value
                                : refName);
                            serviceCallParams = params[0] + serviceCallParams;
                        } else {
                            serviceCallParams = params.toString();
                        }

                        let firstCall = true;
                        let startLine: number = 0;
                        let startColumn: number = 0;
                        let endLine: number = 0;
                        let endColumn: number = 0;

                        if (refCallStatements) {
                            refCallStatements
                                .forEach(callStatement => {
                                    if (firstCall) {
                                        startLine = callStatement.position.startLine;
                                        startColumn = callStatement.position.startColumn;
                                        firstCall = false;
                                    }
                                    endLine = callStatement.position.endLine;
                                    endColumn = callStatement.position.endColumn;
                                });
                        } else {
                            if (headerObject.length > 0) {
                                startLine = model.position.startLine;
                                endLine = model.position.startLine;
                            }
                        }

                        if (previousAction === 'forward' && headerObject.length > 0) {
                            // only creates the request object if there is no request object created for the connector
                            if (!headerObject[0]?.requestName) {
                                modifications.push(createPropertyStatement(
                                    `http:Request ${requestNameGen} = new;\n`,
                                    { line: startLine, column: 0 }
                                ));
                            }

                            refName = requestNameGen;
                            params[1] = requestNameGen;
                            serviceCallParams = params.toString();
                            setPreviousAction(connectorConfig.action.name);

                        } else if (previousAction !== 'forward' && connectorConfig.action.name === 'forward' && headerObject.length > 0) {
                            refName = connectorConfig.action.fields[3]?.value
                        }

                        if (headerObject.length > 0) {
                            const updatePosition: DraftUpdateStatement = {
                                startLine,
                                startColumn,
                                endColumn,
                                endLine
                            }

                            if (connectorConfig.action.name !== "forward") {
                                modifications.push(
                                    updateHeaderObjectDeclaration(
                                        headerObject,
                                        refName,
                                        connectorConfig.action.name,
                                        connectorConfig.action.fields[1],
                                        updatePosition
                                    )
                                )
                            } else {
                                modifications.push(
                                    updateHeaderObjectDeclaration(
                                        headerObject,
                                        refName,
                                        connectorConfig.action.name,
                                        connectorConfig.action.fields[3],
                                        updatePosition
                                    )
                                );
                            }
                        }
                    } else {
                        if (headerObject.length > 0) {
                            serviceCallParams = ", " + (connectorConfig.action.name === "forward" ?
                                connectorConfig.action.fields[3]?.value
                                : requestNameGen);
                            serviceCallParams = params[0] + serviceCallParams;
                            if (connectorConfig.action.name === "forward") {
                                createHeaderObjectDeclaration(
                                    headerObject,
                                    connectorConfig.action.fields[3]?.value,
                                    connectorConfig.action.name,
                                    connectorConfig.action.fields[3],
                                    { line: model.position.startLine, column: 0 },
                                    modifications
                                );
                            } else {
                                createHeaderObjectDeclaration(
                                    headerObject,
                                    requestNameGen,
                                    connectorConfig.action.name,
                                    connectorConfig.action.fields[1],
                                    { line: model.position.startLine, column: 0 },
                                    modifications
                                );
                            }
                        } else {
                            serviceCallParams = params.toString();
                        }
                    }
                } else {
                    // when editing a request without payload
                    if (headerObject.length > 0) {
                        if (connectorConfig.action.name === "forward") {
                            createHeaderObjectDeclaration(
                                headerObject,
                                connectorConfig.action.fields[3]?.value,
                                connectorConfig.action.name,
                                connectorConfig.action.fields[3],
                                { line: model.position.startLine - 1, column: 0 },
                                modifications
                            );
                        } else {
                            createHeaderObjectDeclaration(
                                headerObject,
                                requestNameGen,
                                connectorConfig.action.name,
                                connectorConfig.action.fields[1],
                                { line: model.position.startLine - 1, column: 0 },
                                modifications
                            );
                        }
                    }

                    if (headerObject.length > 0) {
                        serviceCallParams = ", " + (connectorConfig.action.name === "forward" ?
                            connectorConfig.action.fields[3]?.value
                            : requestNameGen);
                        serviceCallParams = params[0] + serviceCallParams;
                    } else {
                        serviceCallParams = params.toString();
                    }
                }

                if (connectorConfig.responsePayloadMap && connectorConfig.responsePayloadMap.isPayloadSelected) {
                    const addActionInvocation: STModification = updateServiceCallForPayload(
                        "var",
                        connectorConfig.action.returnVariableName,
                        connectorConfig.name,
                        connectorConfig.action.name,
                        [serviceCallParams],
                        model.position
                    );
                    modifications.push(addActionInvocation);
                    let responseModel: STNode;
                    symbolInfo.variables.forEach((value, key) => {
                        if (key === 'var' || key === 'string' || key === 'xml' || key === 'json') {
                            value.forEach(val => {
                                const varName = (((val as LocalVarDecl).typedBindingPattern?.bindingPattern) as CaptureBindingPattern)?.variableName.value
                                if (varName === connectorConfig.responsePayloadMap.payloadVariableName) {
                                    responseModel = val;
                                }
                            })
                        }
                    })

                    if (responseModel) {
                        const addPayload: STModification = updateCheckedPayloadFunctionInvocation(
                            connectorConfig.responsePayloadMap.payloadVariableName,
                            "var",
                            connectorConfig.action.returnVariableName,
                            connectorConfig.responsePayloadMap.payloadTypes.get(connectorConfig.responsePayloadMap.selectedPayloadType),
                            responseModel.position
                        );
                        modifications.push(addPayload);
                    } else {
                        const addPayload: STModification = createCheckedPayloadFunctionInvocation(
                            connectorConfig.responsePayloadMap.payloadVariableName,
                            "var",
                            connectorConfig.action.returnVariableName,
                            connectorConfig.responsePayloadMap.payloadTypes.get(connectorConfig.responsePayloadMap.selectedPayloadType),
                            { line: model.position.startLine + 1, column: 0 }
                        );
                        modifications.push(addPayload);
                    }
                } else {
                    const addActionInvocation: STModification = updateCheckedRemoteServiceCall(
                        "var",
                        connectorConfig.action.returnVariableName,
                        connectorConfig.name,
                        connectorConfig.action.name,
                        [serviceCallParams],
                        model.position
                    );
                    modifications.push(addActionInvocation);
                }
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
                        `${connector.module}:${connector.name} ${connectorConfig.name} = check new (${getParams(connectorConfig.connectorInit).join()});`,
                        targetPosition
                    );
                    modifications.push(addConnectorInit);
                }
                // Add an http header.
                const requestNameGen: string = genVariableName("request", getAllVariables(symbolInfo));
                if (headerObject.length > 0) {
                    if (connectorConfig.action.name === "forward") {
                        createHeaderObjectDeclaration(
                            headerObject,
                            connectorConfig.action.fields[3]?.value,
                            connectorConfig.action.name,
                            connectorConfig.action.fields[3],
                            targetPosition,
                            modifications
                        );
                    } else {
                        createHeaderObjectDeclaration(
                            headerObject,
                            requestNameGen,
                            connectorConfig.action.name,
                            connectorConfig.action.fields[1],
                            targetPosition,
                            modifications
                        );
                    }
                }
                // Add an action invocation on the initialized client.
                const params: string[] = getParams(connectorConfig.action.fields);
                let serviceCallParams: string;
                if (headerObject.length > 0) {
                    serviceCallParams = ", " + (connectorConfig.action.name === "forward" ? connectorConfig.action.fields[3]?.value
                        : requestNameGen);
                    serviceCallParams = params[0] + serviceCallParams;
                } else {
                    serviceCallParams = params.toString();
                }
                if (connectorConfig.responsePayloadMap && connectorConfig.responsePayloadMap.isPayloadSelected) {
                    const addActionInvocation: STModification = createServiceCallForPayload(
                        "var",
                        connectorConfig.action.returnVariableName,
                        connectorConfig.name,
                        connectorConfig.action.name,
                        [serviceCallParams],
                        targetPosition
                    );
                    modifications.push(addActionInvocation);
                    const addPayload: STModification = createCheckedPayloadFunctionInvocation(
                        connectorConfig.responsePayloadMap.payloadVariableName,
                        "var",
                        connectorConfig.action.returnVariableName,
                        connectorConfig.responsePayloadMap.payloadTypes.get(connectorConfig.responsePayloadMap.selectedPayloadType),
                        targetPosition
                    );
                    modifications.push(addPayload);
                } else {
                    const addActionInvocation: STModification = createCheckedRemoteServiceCall(
                        "var",
                        connectorConfig.action.returnVariableName,
                        connectorConfig.name,
                        connectorConfig.action.name,
                        [serviceCallParams],
                        targetPosition
                    );
                    modifications.push(addActionInvocation);
                }
            }
        }
        onSave(modifications);
    };

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
                    <Typography className={wizardClasses.configTitle} variant="h4">{isNewConnectorInitWizard ? "New" : "Update"} {connector.displayName} <FormattedMessage id="lowcode.develop.connectorForms.HTTP.connection.title" defaultMessage="Connection"/></Typography>
                </div>
            </div>
            <>
                {state === InitFormState.Create && (
                    <CreateConnectorForm
                        homePageEnabled={enableConnectorInitalizePage}
                        functionDefinitions={functionDefinitions}
                        onSaveNext={handleCreateConnectorOnSaveNext}
                        onSave={handleCreateConnectorOnSave}
                        connectorConfig={connectorConfig}
                        // onBackClick={handleBack}
                        connector={connector}
                        isNewConnectorInitWizard={isNewConnectorInitWizard}
                    />
                )}
                {state === InitFormState.SelectInputOutput && (
                    <SelectInputOutputForm
                        functionDefinitions={functionDefinitions}
                        onSave={handleActionOnSave}
                        onConnectionChange={handleConnectionChange}
                        connectorConfig={connectorConfig}
                        isNewConnectorInitWizard={isNewConnectorInitWizard}
                        model={model}
                    />
                )}
            </>
        </div>
    );
}

export function getVariableWithName(varName: string, variables: Map<string, STNode[]>): STNode {
    let variableST;

    variables.forEach((value) => {
        value.forEach(val => {
            if (varName === (((val as LocalVarDecl).typedBindingPattern.bindingPattern) as CaptureBindingPattern).variableName.value) {
                variableST = val;
            }
        })
    })

    return variableST;
}
