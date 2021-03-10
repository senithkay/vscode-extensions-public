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
import React, { useContext, useState } from "react";

import { CallStatement, CaptureBindingPattern, CheckAction, LocalVarDecl, MethodCall, PositionalArg, RemoteMethodCallAction, SimpleNameReference, STNode, StringLiteral, TypeCastExpression } from "@ballerina/syntax-tree";
import Step from "@material-ui/core/Step";
import StepConnector from "@material-ui/core/StepConnector";
import StepLabel from "@material-ui/core/StepLabel";
import Stepper from "@material-ui/core/Stepper";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { CloseRounded } from "@material-ui/icons";
import classNames from "classnames";
import clsx from "clsx";

import { ConnectorConfig, FormField } from "../../../../ConfigurationSpec/types";
import { Context as DiagramContext } from "../../../../Contexts/Diagram";
import { STSymbolInfo } from "../../../../Definitions";
import { Connector, STModification } from "../../../../Definitions/lang-client-extended";
import { getAllVariables } from "../../../utils/mixins";
import {
    createCheckedPayloadFunctionInvocation,
    createCheckedRemoteServiceCall,
    createHeaderObjectDeclaration,
    createImportStatement,
    createObjectDeclaration,
    createPropertyStatement,
    createServiceCallForPayload,
    updateCheckedPayloadFunctionInvocation,
    updateCheckedRemoteServiceCall,
    updateHeaderObjectDeclaration,
    updateObjectDeclaration,
    updateServiceCallForPayload
} from "../../../utils/modification-util";
import { DraftInsertPosition, DraftUpdateStatement } from "../../../view-state/draft";
import { SelectConnectionForm } from "../../ConnectorConfigWizard/Components/SelectExistingConnection";
import { wizardStyles } from "../../ConnectorConfigWizard/style";
import { ButtonWithIcon } from "../../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { genVariableName, getConnectorIcon, getParams } from "../../Portals/utils";

import { CreateConnectorForm } from "./CreateConnectorForm";
import { HeaderObjectConfig } from "./HTTPHeaders";
import { SelectInputOutputForm } from "./SelectInputOutputForm";
import "./style.scss"
import { useStyles } from "./styles";
interface WizardProps {
    actions: Map<string, FormField[]>;
    connectorConfig: ConnectorConfig;
    onSave: (sourceModifications: STModification[]) => void;
    onClose?: () => void;
    connector: Connector;
    isNewConnectorInitWizard: boolean;
    targetPosition: DraftInsertPosition;
    model?: STNode
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

function QontoStepIcon(props: { active: boolean; completed: boolean; }) {
    const { active, completed } = props;
    const classes = useStyles();

    return (
        <div
            className={clsx(classNames(classes.stepWrapper, "stepWrapper"), { [classNames(classes.stepActive, "stepActive")]: active })}
        >
            {completed ? <div className={classNames(classes.completedStep, "completedStep")} /> : <div className={classNames(classes.currentStep, "currentStep")} />}
        </div>
    );
}

export function HTTPWizard(props: WizardProps) {
    const classes = useStyles();
    const wizardClasses = wizardStyles();
    const { actions, connectorConfig, connector, onSave, onClose, isNewConnectorInitWizard, targetPosition,
            model } = props;
    const { state: diagramState } = useContext(DiagramContext);
    const symbolInfo: STSymbolInfo = diagramState.stSymbolInfo;
    const connectorInitFormFields: FormField[] = actions.get("init") ? actions.get("init") : actions.get("__init");

    const enableHomePage = connectorConfig.existingConnections !== undefined && isNewConnectorInitWizard;
    const initFormState = enableHomePage ? InitFormState.Home : InitFormState.Create;
    connectorConfig.connectorInit = connectorConfig.connectorInit.length > 0 ? connectorConfig.connectorInit
        : connectorInitFormFields;
    const [state, setState] = useState<InitFormState>(initFormState);

    const [headerObject] = useState<HeaderObjectConfig[]>([]);
    const httpVar = model as LocalVarDecl;
    const [previousAction, setPreviousAction] = useState(isNewConnectorInitWizard ? undefined
        : connectorConfig.action.name);

    React.useEffect(() => {
        if (!isNewConnectorInitWizard) {
            let actionInitializer: CheckAction;
            connectorConfig.action.returnVariableName =
                (httpVar.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.value;
            connectorConfig.responsePayloadMap.selectedPayloadType = '';

            switch (httpVar.initializer.kind) {
                case 'TypeCastExpression':
                    actionInitializer = (httpVar.initializer as TypeCastExpression).expression as CheckAction;
                    connectorConfig.responsePayloadMap.isPayloadSelected = true;

                    // payload population logic stuff
                    const varName = (httpVar.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.value;
                    symbolInfo.variables.forEach((value, key) => {
                        if (key === 'var' || key === 'string' || key === 'xml' || key === 'json') {
                            const usedVariables = value.filter(variable => variable.source.includes(`${varName}.`));

                            const variableStatement: LocalVarDecl = usedVariables[0] as LocalVarDecl;

                            if (variableStatement) {
                                connectorConfig
                                    .responsePayloadMap
                                    .payloadVariableName = (variableStatement.typedBindingPattern
                                        .bindingPattern as CaptureBindingPattern).variableName.value


                                if (variableStatement.source.includes('getTextPayload')) {
                                    connectorConfig.responsePayloadMap.selectedPayloadType = 'Text';
                                } else if (variableStatement.source.includes('getXmlPayload')) {
                                    connectorConfig.responsePayloadMap.selectedPayloadType = 'XML';
                                } else if (variableStatement.source.includes('getJsonPayload')) {
                                    connectorConfig.responsePayloadMap.selectedPayloadType = 'JSON';
                                } else {
                                    connectorConfig.responsePayloadMap.selectedPayloadType = '';
                                }
                            }
                        }
                    });
                    break;
                default:
                    actionInitializer = httpVar.initializer as CheckAction;
                // ignored
            }

            if (actionInitializer) {
                const actionExpression = actionInitializer.expression as RemoteMethodCallAction;
                const message = actionExpression.arguments.length > 1 ? (actionExpression.arguments[2] as PositionalArg).expression : undefined;

                if (message) {
                    if (message.kind === 'SimpleNameReference') {
                        const refName = (message as SimpleNameReference).name.value;
                        const refCallStatements: STNode[] = symbolInfo.callStatement.get(refName);

                        if (connectorConfig.action.name === 'forward') {
                            connectorConfig.action.fields[3].value = refName;
                        }

                        if (refCallStatements) {
                            refCallStatements
                                .filter(callStatement =>
                                    (((callStatement as CallStatement).expression) as MethodCall).methodName.name.value === 'setHeader')
                                .forEach(callStatement => {
                                    const callStatementExp: any = (callStatement as CallStatement).expression;
                                    headerObject.push({
                                        requestName: refName,
                                        objectKey: ((callStatementExp.arguments[0] as PositionalArg).expression as StringLiteral).literalToken.value,
                                        objectValue: ((callStatementExp.arguments[2] as PositionalArg).expression as StringLiteral).literalToken.value
                                    })
                                });

                            refCallStatements
                                .filter(callStatement =>
                                    (((callStatement as CallStatement).expression) as MethodCall).methodName.name.value === 'setPayload')
                                .forEach(callStatement => {
                                    // expression types StringLiteral, XmlTemplateExpression, MappingConstructor
                                    const callStatementExp: any = (callStatement as CallStatement).expression;
                                    // connectorConfig.action. (callStatementExp.arguments[0] as PositionalArg).expression.source
                                    connectorConfig.action.fields.filter(field => field.name === 'message').forEach(field => {
                                        field.requestName = refName;

                                        switch ((callStatementExp.arguments[0] as PositionalArg).expression.kind) {
                                            case 'XmlTemplateExpression':
                                                field.selectedDataType = 'xml';
                                                break;
                                            case 'MappingConstructor':
                                                field.selectedDataType = 'json';
                                                break;
                                            default:
                                                field.selectedDataType = 'string';
                                        }

                                        field.fields.filter(unionField => unionField.type === field.selectedDataType)
                                            .forEach(unionField => {
                                                unionField.value = (callStatementExp.arguments[0] as PositionalArg).expression.source
                                            })
                                    })
                                });
                        }
                    } else {
                        if (connectorConfig.action.name !== 'get') {
                            connectorConfig.action.fields.filter(field => field.name === 'message').forEach(field => {
                                switch (message.kind) {
                                    case 'XmlTemplateExpression':
                                        field.selectedDataType = 'xml';
                                        break;
                                    case 'MappingConstructor':
                                        field.selectedDataType = 'json';
                                        break;
                                    default:
                                        field.selectedDataType = 'string';
                                }

                                field.fields.filter(unionField => unionField.type === field.selectedDataType)
                                    .forEach(unionField => {
                                        unionField.value = message.source
                                    })
                            });
                        }
                    }
                }
            }
        }
    }, [isNewConnectorInitWizard])

    const handleCreateNew = () => {
        setState(InitFormState.Create);
    };

    const handleSelectExisting = () => {
        setState(InitFormState.Create);
    };

    const handleInputOutputForm = () => {
        setState(InitFormState.SelectInputOutput);
    };

    const handleBack = () => {
        if (state === InitFormState.SelectInputOutput) {
            setState(InitFormState.Create);
        } else if (state === InitFormState.Create && enableHomePage) {
            setState(InitFormState.Home);
        }
    };

    const handleOnSave = () => {
        // insert initialized connector logic
        let modifications: STModification[] = [];
        if (!isNewConnectorInitWizard) {
            let actionInitializer: CheckAction;

            const addConnectorInit: STModification = updateObjectDeclaration(
                (connector.module + ":" + connector.name),
                connectorConfig.name,
                getParams(connectorConfig.connectorInit),
                connectorConfig.initPosition
            );
            modifications.push(addConnectorInit);

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
                const requestNameGen: string = genVariableName("request", getAllVariables(symbolInfo));
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
                            modifications.push(createPropertyStatement(
                                `http:Request ${requestNameGen} = new;\n`,
                                { line: startLine, column: 0 }
                            ));

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
                    const addActionInvo: STModification = updateServiceCallForPayload(
                        "var",
                        connectorConfig.action.returnVariableName,
                        connectorConfig.name,
                        connectorConfig.action.name,
                        [serviceCallParams],
                        model.position
                    );
                    modifications.push(addActionInvo);
                    let responseModel: STNode;
                    symbolInfo.variables.forEach((value, key) => {
                        if (key === 'var' || key === 'string' || key === 'xml' || key === 'json') {
                            value.forEach(val => {
                                const varName = (((val as LocalVarDecl).typedBindingPattern.bindingPattern) as CaptureBindingPattern).variableName.value
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
                    const addActionInvo: STModification = updateCheckedRemoteServiceCall(
                        "var",
                        connectorConfig.action.returnVariableName,
                        connectorConfig.name,
                        connectorConfig.action.name,
                        [serviceCallParams],
                        model.position
                    );
                    modifications.push(addActionInvo);
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
                    const addConnectorInit: STModification = createObjectDeclaration(
                        (connector.module + ":" + connector.name),
                        connectorConfig.name,
                        getParams(connectorConfig.connectorInit),
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
                    const addActionInvo: STModification = createServiceCallForPayload(
                        "var",
                        connectorConfig.action.returnVariableName,
                        connectorConfig.name,
                        connectorConfig.action.name,
                        [serviceCallParams],
                        targetPosition
                    );
                    modifications.push(addActionInvo);
                    const addPayload: STModification = createCheckedPayloadFunctionInvocation(
                        connectorConfig.responsePayloadMap.payloadVariableName,
                        "var",
                        connectorConfig.action.returnVariableName,
                        connectorConfig.responsePayloadMap.payloadTypes.get(connectorConfig.responsePayloadMap.selectedPayloadType),
                        targetPosition
                    );
                    modifications.push(addPayload);
                } else {
                    const addActionInvo: STModification = createCheckedRemoteServiceCall(
                        "var",
                        connectorConfig.action.returnVariableName,
                        connectorConfig.name,
                        connectorConfig.action.name,
                        [serviceCallParams],
                        targetPosition
                    );
                    modifications.push(addActionInvo);
                }
            }
        }
        onSave(modifications);
    };

    const homeForm = <SelectConnectionForm onCreateNew={handleCreateNew} connectorConfig={connectorConfig} connector={connector} onSelectExisting={handleSelectExisting} />;
    const createConnectorForm = <CreateConnectorForm homePageEnabled={enableHomePage} actions={actions} onSave={handleInputOutputForm} connectorConfig={connectorConfig} onBackClick={handleBack} connector={connector} isNewConnectorInitWizard={isNewConnectorInitWizard} />;
    const inputOutptForm = <SelectInputOutputForm actions={actions} onSave={handleOnSave} headerObject={headerObject} onBackClick={handleBack} connectorConfig={connectorConfig} isNewConnectorInitWizard={isNewConnectorInitWizard} />;
    const stepper = (
        <Stepper className={classNames(classes.stepperWrapper, "stepperWrapper")} alternativeLabel={true} activeStep={state} connector={<QontoConnector />}>
            <Step className={classNames(classes.stepContainer, "stepContainer")} key={InitFormState.Create}>
                <StepLabel className={classNames(classes.stepLabel, "stepLabel")} StepIconComponent={QontoStepIcon} >CONNECTION</StepLabel>
            </Step>
            <Step className={classNames(classes.stepContainer, "stepContainer")} key={InitFormState.SelectInputOutput}>
                <StepLabel className={classNames(classes.stepLabel, "stepLabel")} StepIconComponent={QontoStepIcon} >INPUT/OUTPUT</StepLabel>
            </Step>
        </Stepper>
    );

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
            {state !== InitFormState.Home && stepper}
            <div className={classes.stepper}>
                {state === InitFormState.Home && homeForm}
                {state === InitFormState.Create && createConnectorForm}
                {state === InitFormState.SelectInputOutput && inputOutptForm}
            </div>
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
