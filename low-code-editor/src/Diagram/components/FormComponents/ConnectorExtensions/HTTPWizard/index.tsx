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

import Typography from "@material-ui/core/Typography";
import { CloseRounded } from "@material-ui/icons";
import { ActionConfig, ButtonWithIcon, Connector, ConnectorConfig, FormField, FunctionDefinitionInfo, ResponsePayloadMap, STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { CaptureBindingPattern, LocalVarDecl, NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../Contexts/Diagram";
import {
    CONNECTOR_CLOSED,
    CONTINUE_TO_INVOKE_API,
    EVENT_TYPE_AZURE_APP_INSIGHTS,
    FINISH_CONNECTOR_ACTION_ADD_INSIGHTS,
    FINISH_CONNECTOR_INIT_ADD_INSIGHTS,
    LowcodeEvent
} from "../../../../models";
import {
    createImportStatement,
    createPropertyStatement,
    updatePropertyStatement} from "../../../../utils/modification-util";
import { getModuleIcon, getParams } from "../../../Portals/utils";
import { wizardStyles } from "../../ConnectorConfigWizard/style";

import { CreateConnectorForm } from "./CreateConnectorForm";
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
    targetPosition: NodePosition;
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
    const {
        api: {
            insights: {
                onEvent
            }
        },
        props: {
            stSymbolInfo
        }
    } = useContext(Context);

    const connectorInitFormFields: FormField[] = functionDefinitions.get("init")?.parameters;
    const enableConnectorInitalizePage = !isAction;

    const initFormState = enableConnectorInitalizePage ? InitFormState.Create : InitFormState.SelectInputOutput;

    connectorConfig.connectorInit = connectorConfig.connectorInit.length > 0 ? connectorConfig.connectorInit
        : connectorInitFormFields;
    const [state, setState] = useState<InitFormState>(initFormState);

    const operations: string[] = [];
    if (functionDefinitions) {
        functionDefinitions.forEach((value, key) => {
            if (key !== "init") {
                operations.push(key);
            }
        });
    }

    const payloadTypes: Map<string, string> = new Map();
    const responsePayloadMap: ResponsePayloadMap = {
        isPayloadSelected: false,
        payloadTypes,
    };
    connectorConfig.responsePayloadMap = responsePayloadMap;

    if (!connectorConfig.action) {
        connectorConfig.action = new ActionConfig();
    }

    React.useEffect(() => {
        if (!isNewConnectorInitWizard && isAction) {
            setState(InitFormState.SelectInputOutput);
        } else if (selectedConnector) {
            connectorConfig.isExistingConnection = true;
            setState(InitFormState.SelectInputOutput);
        }
        const targetTypeValue = connectorConfig?.action?.fields?.find(field => field.name === "targetType")?.value;
        if (targetTypeValue) {
            connectorConfig.responsePayloadMap.isPayloadSelected = true;
            if (targetTypeValue === "json") {
                connectorConfig.responsePayloadMap.selectedPayloadType = "JSON";
            } else if (targetTypeValue === "xml") {
                connectorConfig.responsePayloadMap.selectedPayloadType = "XML";
            } else if (targetTypeValue === "string") {
                connectorConfig.responsePayloadMap.selectedPayloadType = "String";
            } else {
                connectorConfig.responsePayloadMap.selectedPayloadType = "http:Response";
            }
        }
    }, [isNewConnectorInitWizard, selectedConnector])

    const handleCreateConnectorOnSaveNext = () => {
        setState(InitFormState.SelectInputOutput);
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: CONTINUE_TO_INVOKE_API,
            property: connector.displayName
        };
        onEvent(event);
    };

    const handleConnectionChange = () => {
        setState(InitFormState.Create);
    };

    const handleFormClose = () => {
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: CONNECTOR_CLOSED,
            property: connector.displayName
        };
        onEvent(event);
        onClose();
    };

    const handleCreateConnectorOnSave = () => {
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: FINISH_CONNECTOR_INIT_ADD_INSIGHTS,
            property: connector.displayName
        };
        onEvent(event);
        const modifications: STModification[] = [];
        if (!isNewConnectorInitWizard) {
            const updatedConnectorInit = updatePropertyStatement(
                `${connector.moduleName}:${connector.name} ${connectorConfig.name} = check new (${getParams(
                    connectorConfig.connectorInit).join()});`, connectorConfig.initPosition);
            modifications.push(updatedConnectorInit);
        } else {
            // Add an import.
            const addImport: STModification = createImportStatement(
                connector.package.organization,
                connector.moduleName,
                targetPosition
            );
            modifications.push(addImport);

            // Add an connector client initialization.
            if (!connectorConfig.isExistingConnection) {
                const addConnectorInit = createPropertyStatement(
                    `${connector.moduleName}:${connector.name} ${connectorConfig.name} = check new (${getParams(connectorConfig.connectorInit).join()});`,
                    targetPosition
                );
                modifications.push(addConnectorInit);
            }
        }
        onSave(modifications);
    };

    const handleActionOnSave = () => {
        const modifications: STModification[] = [];
        const selectedPayloadType = connectorConfig.action.fields.find(
            (field) => field.name === "targetType"
        ).selectedDataType;

        if (isNewConnectorInitWizard && !isAction) {
            const addImport: STModification = createImportStatement(
                connector.package.organization,
                connector.moduleName,
                targetPosition
            );
            modifications.push(addImport);
            const endpointStatement = `${connector.moduleName}:${connector.name} ${
                connectorConfig.name
            } = check new (${getParams(connectorConfig.connectorInit).join()});`;
            const addConnectorInit = createPropertyStatement(endpointStatement, targetPosition);
            modifications.push(addConnectorInit);
        }

        const actionStatement = `${selectedPayloadType} ${connectorConfig.action.returnVariableName} = check ${
            connectorConfig.name
        }->${connectorConfig.action.name}(${getParams(connectorConfig.action.fields).join()});`;

        if (!isNewConnectorInitWizard && isAction) {
            const updateActionInvocation = updatePropertyStatement(actionStatement, model.position);
            modifications.push(updateActionInvocation);
        } else {
            const addActionInvocation = createPropertyStatement(actionStatement, targetPosition);
            modifications.push(addActionInvocation);
            onActionAddEvent();
        }

        onSave(modifications);
    };

    const onActionAddEvent = () => {
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: FINISH_CONNECTOR_ACTION_ADD_INSIGHTS,
            property: "http",
        };
        onEvent(event);
    };

    return (
        <div className={classes.root}>
            <div className={wizardClasses.topTitleWrapper}>
                <ButtonWithIcon
                    className={wizardClasses.closeBtnAutoGen}
                    onClick={handleFormClose}
                    icon={<CloseRounded fontSize="small" />}
                />
                <div className={wizardClasses.titleWrapper}>
                    <div className={wizardClasses.connectorIconWrapper}>{getModuleIcon(connector, 0.5)}</div>
                    <Typography className={wizardClasses.configTitle} variant="h4">{isNewConnectorInitWizard ? "New" : "Update"} {connector.displayName} <FormattedMessage id="lowcode.develop.connectorForms.HTTP.connection.title" defaultMessage="Connection" /></Typography>
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
