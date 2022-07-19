/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import {
    BallerinaConnectorInfo,
    ConnectorWizardProps,
    ConnectorWizardType,
    FunctionDefinitionInfo,
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { LocalVarDecl, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../Contexts/Diagram";
import { ConnectorConfigWizard } from "../../ConnectorConfigWizard";
import { FormGenerator } from "../../FormGenerator";
import { isStatementEditorSupported } from "../../Utils";

import { fetchConnectorInfo } from "./util";

enum WizardStep {
    EMPTY = "empty",
    MARKETPLACE = "marketplace",
    ENDPOINT_FORM = "endpointForm",
    ENDPOINT_LIST = "endpointList",
    ACTION_LIST = "actionList",
    ACTION_FROM = "actionFrom",
}

export function ConnectorWizard(props: ConnectorWizardProps) {
    const {
        props: { langServerURL, currentFile, ballerinaVersion },
        api: {
            ls: { getDiagramEditorLangClient },
        },
    } = useContext(Context);

    const {
        wizardType,
        connectorInfo,
        model,
        targetPosition,
        functionNode,
        diagramPosition,
        isModuleType,
        onSave,
        onClose,
    } = props;

    const [fetchingMetadata, setFetchingMetadata] = useState(false);
    const [retrievingAction, setRetrievingAction] = useState(false);
    const [selectedConnector, setSelectedConnector] = useState<BallerinaConnectorInfo>(connectorInfo);
    const [selectedEndpoint, setSelectedEndpoint] = useState<string>();
    const [selectedAction, setSelectedAction] = useState<FunctionDefinitionInfo>();
    const [wizardStep, setWizardStep] = useState<string>(getInitialWizardStep());

    const showNewForms = isStatementEditorSupported(ballerinaVersion);
    const isLoading = fetchingMetadata || retrievingAction;

    useEffect(() => {
        setWizardStep(getInitialWizardStep());
    }, [wizardType]);

    useEffect(() => {
        (async () => {
            await retrieveMissingInfo();
        })();
    }, [wizardStep]);

    useEffect(() => {
        retrieveMissingInfo();
    }, [connectorInfo]);

    function getInitialWizardStep() {
        if (wizardType === ConnectorWizardType.ENDPOINT) {
            return model ? WizardStep.ENDPOINT_FORM : WizardStep.MARKETPLACE;
        } else if (wizardType === ConnectorWizardType.ACTION) {
            return model ? WizardStep.ACTION_FROM : WizardStep.ENDPOINT_LIST;
        }
    }

    async function retrieveMissingInfo() {
        if (model && connectorInfo) {
            if (
                wizardStep === WizardStep.ENDPOINT_FORM &&
                (!selectedConnector || !hasFunctions(selectedConnector)) &&
                !fetchingMetadata
            ) {
                await retrieveUsedConnector(connectorInfo);
            } else if (wizardStep === WizardStep.ACTION_FROM && !selectedAction && !retrievingAction) {
                await retrieveUsedAction(model, connectorInfo);
            }
        }
    }

    async function retrieveUsedConnector(connector: BallerinaConnectorInfo) {
        if (hasFunctions(connector)) {
            return;
        }
        setFetchingMetadata(true);
        const metadata = await fetchMetadata(connector);
        if (!metadata) {
            // TODO: Handle error properly
            setWizardStep(WizardStep.EMPTY);
        }
        setFetchingMetadata(false);
    }

    async function retrieveUsedAction(actionModel: STNode, connector?: BallerinaConnectorInfo) {
        let methodName = "";
        let methods = connector.functions;

        setRetrievingAction(true);
        if (!hasFunctions(connector)) {
            const metadata = await fetchMetadata(connector);
            methods = metadata ? metadata.functions : undefined;
        }

        if (
            STKindChecker.isLocalVarDecl(actionModel) &&
            STKindChecker.isCheckAction(actionModel.initializer) &&
            STKindChecker.isRemoteMethodCallAction(actionModel.initializer.expression)
        ) {
            methodName = actionModel.initializer.expression.methodName.name.value;
        } else if (
            STKindChecker.isActionStatement(actionModel) &&
            STKindChecker.isCheckAction(actionModel.expression) &&
            STKindChecker.isRemoteMethodCallAction(actionModel.expression.expression)
        ) {
            methodName = actionModel.expression.expression.methodName.name.value;
        }
        if (methodName && methodName !== "" && methods?.length > 0) {
            const usedMethod = methods.find((func) => func.name === methodName);
            if (usedMethod) {
                setSelectedAction(usedMethod);
                setRetrievingAction(false);
                return;
            }
        }
        // TODO: Handle error properly
        setWizardStep(WizardStep.EMPTY);
        setRetrievingAction(false);
    }

    async function fetchMetadata(connector: BallerinaConnectorInfo): Promise<BallerinaConnectorInfo> {
        const connectorMetadata = await fetchConnectorInfo(
            connector,
            langServerURL,
            currentFile.path,
            getDiagramEditorLangClient
        );
        if (connectorMetadata) {
            setSelectedConnector(connectorMetadata);
        }
        return connectorMetadata;
    }

    async function handleSelectConnector(connector: BallerinaConnectorInfo, node: LocalVarDecl) {
        setFetchingMetadata(true);
        setSelectedConnector(connector);
        setWizardStep(WizardStep.ENDPOINT_FORM);
        await fetchMetadata(connector);
        setFetchingMetadata(false);
    }

    async function handleSelectEndpoint(connector: BallerinaConnectorInfo, endpointName: string) {
        setSelectedEndpoint(endpointName);
        setWizardStep(WizardStep.ACTION_LIST);
        if (!hasFunctions(connectorInfo)) {
            setFetchingMetadata(true);
            await fetchMetadata(connector);
        }
        setFetchingMetadata(false);
    }

    function closeEndpointForm() {
        onClose();
        setSelectedConnector(undefined);
    }

    function saveEndpointForm() {
        onSave();
        closeEndpointForm();
    }

    function handleAddNewEndpoint() {
        setSelectedConnector(undefined);
        setSelectedAction(undefined);
        setWizardStep(WizardStep.MARKETPLACE);
    }

    function handleSelectAction(action: FunctionDefinitionInfo) {
        setSelectedAction(action);
        setWizardStep(WizardStep.ACTION_FROM);
    }

    function hasFunctions(connector: BallerinaConnectorInfo) {
        return connector?.functions?.length > 0 ?? false;
    }

    return (
        <>
            {wizardStep === WizardStep.MARKETPLACE && (
                <FormGenerator
                    onCancel={onClose}
                    configOverlayFormStatus={{
                        formType: "ConnectorList",
                        formArgs: {
                            onSelect: handleSelectConnector,
                            onCancel: onClose,
                        },
                        isLoading,
                    }}
                />
            )}
            {wizardStep === WizardStep.ENDPOINT_FORM &&
                (selectedConnector?.package || connectorInfo?.package) &&
                showNewForms && (
                    <FormGenerator
                        onCancel={closeEndpointForm}
                        onSave={saveEndpointForm}
                        configOverlayFormStatus={{
                            formType: "EndpointForm",
                            formArgs: {
                                connector: selectedConnector?.package ? selectedConnector : connectorInfo,
                            },
                            isLoading,
                        }}
                        targetPosition={targetPosition}
                        model={model}
                    />
                )}
            {wizardStep === WizardStep.ENDPOINT_FORM &&
                (selectedConnector?.package || connectorInfo?.package) &&
                !showNewForms && (
                    // TODO: Remove this when cleaning old forms
                    <ConnectorConfigWizard
                        position={diagramPosition}
                        connectorInfo={selectedConnector?.package ? selectedConnector : connectorInfo}
                        targetPosition={targetPosition}
                        model={model}
                        onClose={closeEndpointForm}
                        onSave={saveEndpointForm}
                        isModuleEndpoint={isModuleType ?? false}
                        isAction={false}
                        isEdit={model ? true : false}
                        functionNode={functionNode}
                        isLoading={isLoading}
                    />
                )}
            {wizardStep === WizardStep.ENDPOINT_LIST && (
                <FormGenerator
                    onCancel={onClose}
                    configOverlayFormStatus={{
                        formType: "EndpointList",
                        formArgs: {
                            onSelect: handleSelectEndpoint,
                            functionNode,
                            addNewEndpoint: handleAddNewEndpoint,
                        },
                        isLoading,
                    }}
                    targetPosition={targetPosition}
                    model={model}
                />
            )}
            {wizardStep === WizardStep.ACTION_LIST && showNewForms && (
                <FormGenerator
                    onCancel={onClose}
                    configOverlayFormStatus={{
                        formType: "ActionList",
                        formArgs: {
                            actions: selectedConnector?.functions,
                            onSelect: handleSelectAction,
                        },
                        isLoading,
                    }}
                />
            )}
            {wizardStep === WizardStep.ACTION_LIST && !showNewForms && (
                // TODO: Remove this when cleaning old forms
                <ConnectorConfigWizard
                    position={diagramPosition}
                    connectorInfo={selectedConnector?.package ? selectedConnector : connectorInfo}
                    endpointName={selectedEndpoint}
                    targetPosition={targetPosition}
                    model={model}
                    onClose={closeEndpointForm}
                    onSave={saveEndpointForm}
                    isModuleEndpoint={isModuleType ?? false}
                    isAction={true}
                    isEdit={model ? true : false}
                    functionNode={functionNode}
                    isLoading={isLoading}
                />
            )}
            {wizardStep === WizardStep.ACTION_FROM && (
                <FormGenerator
                    onCancel={onClose}
                    onSave={onSave}
                    configOverlayFormStatus={{
                        formType: "ActionForm",
                        formArgs: {
                            action: selectedAction,
                            endpointName: selectedEndpoint,
                        },
                        isLoading,
                    }}
                    targetPosition={targetPosition}
                    model={model}
                />
            )}
        </>
    );
}
