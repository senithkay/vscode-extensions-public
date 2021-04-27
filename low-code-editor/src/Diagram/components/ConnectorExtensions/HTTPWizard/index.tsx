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

import { ConnectorConfig, FormField, FunctionDefinitionInfo } from "../../../../ConfigurationSpec/types";
import { Context as DiagramContext } from "../../../../Contexts/Diagram";
import { STSymbolInfo } from "../../../../Definitions";
import { Connector, STModification } from "../../../../Definitions/lang-client-extended";
import { getAllVariables } from "../../../utils/mixins";
import {
    createCheckedRemoteServiceCall,
    createHeaderObjectDeclaration,
    createImportStatement,
    createPropertyStatement,
    updateCheckedRemoteServiceCall,
    updateHeaderObjectDeclaration,
    updatePropertyStatement,
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
    functionDefinitions: Map<string, FunctionDefinitionInfo>;
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
    const { functionDefinitions, connectorConfig, connector, onSave, onClose, isNewConnectorInitWizard, targetPosition,
            model } = props;
    const connectorInitFormFields: FormField[] = functionDefinitions.get("init") ? functionDefinitions.get("init").parameters : functionDefinitions.get("__init").parameters;
    const enableHomePage = connectorConfig.existingConnections !== undefined && isNewConnectorInitWizard;
    const initFormState = enableHomePage ? InitFormState.Home : InitFormState.Create;
    connectorConfig.connectorInit = connectorConfig.connectorInit.length > 0 ? connectorConfig.connectorInit
        : connectorInitFormFields;
    const [state, setState] = useState<InitFormState>(initFormState);

    const [headerObject] = useState<HeaderObjectConfig[]>([]);
    const httpVar = model as LocalVarDecl;

    React.useEffect(() => {
        if (!isNewConnectorInitWizard) {
            let actionInitializer: CheckAction;
            connectorConfig.action.returnVariableName =
                (httpVar.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.value;
            connectorConfig.responsePayloadMap.selectedPayloadType = '';

            switch (httpVar.initializer.kind) {
                case 'TypeCastExpression':
                    actionInitializer = (httpVar.initializer as TypeCastExpression).expression as CheckAction;
                    break;
                default:
                    actionInitializer = httpVar.initializer as CheckAction;
                // ignored
            }

            // payload population logic stuff
            const targetTypeValue = connectorConfig.action.fields.find(field => field.name === "targetType").value;
            if (targetTypeValue === "xml") {
                connectorConfig.responsePayloadMap.isPayloadSelected = true;
                connectorConfig.responsePayloadMap.selectedPayloadType = 'XML';
            } else if (targetTypeValue === "string") {
                connectorConfig.responsePayloadMap.isPayloadSelected = true;
                connectorConfig.responsePayloadMap.selectedPayloadType = 'Text';
            } else if (targetTypeValue === "json") {
                connectorConfig.responsePayloadMap.isPayloadSelected = true;
                connectorConfig.responsePayloadMap.selectedPayloadType = 'JSON';
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
        const headerField = connectorConfig.action.fields.find(field => field.name === "headers");

        if (!isNewConnectorInitWizard) {
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
                const params: string[] = getParams(connectorConfig.action.fields);
                let serviceCallParams: string = params.toString();

                if (connectorConfig.action.name === "forward") {
                    serviceCallParams += `, ${connectorConfig.action.fields.find(field => field.name === "request").value}`;
                }
                if (headerField.value) {
                    // updating headers
                    serviceCallParams = serviceCallParams + `, headers=${headerField.value}`;
                }

                let responseVarType = "http:Response";
                if (connectorConfig.responsePayloadMap && connectorConfig.responsePayloadMap.isPayloadSelected) {
                    if (connectorConfig.responsePayloadMap.selectedPayloadType === "Text") {
                        responseVarType = "string";
                        serviceCallParams = serviceCallParams + `, targetType = string`;
                    } else {
                        responseVarType = connectorConfig.responsePayloadMap.selectedPayloadType.toLocaleLowerCase();
                        serviceCallParams = serviceCallParams + ` , targetType = ${connectorConfig.responsePayloadMap.selectedPayloadType.toLocaleLowerCase()}`;
                    }
                }

                const addActionInvocation: STModification = updateCheckedRemoteServiceCall(
                    responseVarType,
                    connectorConfig.action.returnVariableName,
                    connectorConfig.name,
                    connectorConfig.action.name,
                    [serviceCallParams],
                    model.position
                );
                modifications.push(addActionInvocation);
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

                // Add an action invocation on the initialized client.
                const params: string[] = getParams(connectorConfig.action.fields);
                let serviceCallParams = params.toString();

                if (connectorConfig.action.name === "forward") {
                    serviceCallParams += `, ${connectorConfig.action.fields.find(field => field.name === "request").value}`
                } else {
                    // Header addition
                    if (headerField.value) {
                        serviceCallParams = serviceCallParams + `, headers=${headerField.value}`;
                    }
                }

                let responseVarType = "http:Response";
                if (connectorConfig.responsePayloadMap && connectorConfig.responsePayloadMap.isPayloadSelected) {
                    if (connectorConfig.responsePayloadMap.selectedPayloadType === "Text") {
                        responseVarType = "string";
                        serviceCallParams = serviceCallParams + `, targetType = string`;
                    } else {
                        responseVarType = connectorConfig.responsePayloadMap.selectedPayloadType.toLocaleLowerCase();
                        serviceCallParams = serviceCallParams + ` , targetType = ${connectorConfig.responsePayloadMap.selectedPayloadType.toLocaleLowerCase()}`;
                    }
                }
                const addActionInvocation: STModification = createCheckedRemoteServiceCall(
                    responseVarType,
                    connectorConfig.action.returnVariableName,
                    connectorConfig.name,
                    connectorConfig.action.name,
                    [serviceCallParams],
                    targetPosition
                );
                modifications.push(addActionInvocation);
            }
        }
        onSave(modifications);
    };

    const homeForm = <SelectConnectionForm onCreateNew={handleCreateNew} connectorConfig={connectorConfig} connector={connector} onSelectExisting={handleSelectExisting} />;
    const createConnectorForm = <CreateConnectorForm homePageEnabled={enableHomePage} functionDefinitions={functionDefinitions} onSave={handleInputOutputForm} connectorConfig={connectorConfig} onBackClick={handleBack} connector={connector} isNewConnectorInitWizard={isNewConnectorInitWizard} />;
    const inputOutptForm = <SelectInputOutputForm functionDefinitions={functionDefinitions} onSave={handleOnSave} headerObject={headerObject} onBackClick={handleBack} connectorConfig={connectorConfig} isNewConnectorInitWizard={isNewConnectorInitWizard} />;
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
