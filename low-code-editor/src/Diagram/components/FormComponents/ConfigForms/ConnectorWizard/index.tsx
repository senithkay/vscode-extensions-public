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
import React, { useContext, useState } from "react";

import {
    BallerinaConnectorInfo,
    ConnectorWizardProps,
    ConnectorWizardType,
    FunctionDefinitionInfo,
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { LocalVarDecl } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../Contexts/Diagram";
import { FormGenerator } from "../../FormGenerator";

import { fetchConnectorInfo } from "./util";

enum WizardStep {
    MARKETPLACE = "marketplace",
    ENDPOINT_FORM = "endpointForm",
    ENDPOINT_LIST = "endpointList",
    ACTION_LIST = "actionList",
    ACTION_FROM = "actionFrom",
}

export function ConnectorWizard(props: ConnectorWizardProps) {
    const {
        props: { langServerURL, currentFile },
        api: {
            ls: { getDiagramEditorLangClient },
        },
    } = useContext(Context);

    const { wizardType, connectorInfo, model, targetPosition, functionNode, onSave, onClose } = props;

    const [isLoading, setIsLoading] = useState(false);
    const [wizardStep, setWizardStep] = useState<string>(getInitialWizardStep());
    const [selectedConnector, setSelectedConnector] = useState<BallerinaConnectorInfo>(connectorInfo);
    const [selectedEndpoint, setSelectedEndpoint] = useState<string>();
    const [selectedAction, setSelectedAction] = useState<FunctionDefinitionInfo>();

    function getInitialWizardStep() {
        if (wizardType === ConnectorWizardType.ENDPOINT) {
            if (model) {
                return WizardStep.ENDPOINT_FORM;
            }
            return WizardStep.MARKETPLACE;
        } else if (wizardType === ConnectorWizardType.ACTION) {
            if (model) {
                return WizardStep.ACTION_FROM;
            }
            return WizardStep.ENDPOINT_LIST;
        }
    }

    async function fetchMetadata(connector: BallerinaConnectorInfo) {
        const connectorMetadata = await fetchConnectorInfo(
            connector,
            langServerURL,
            currentFile.path,
            getDiagramEditorLangClient
        );
        if (connectorMetadata) {
            setSelectedConnector(connectorMetadata);
            setIsLoading(false);
        }
    }

    async function handleSelectConnector(connector: BallerinaConnectorInfo, node: LocalVarDecl) {
        setIsLoading(true);
        setWizardStep(WizardStep.ENDPOINT_FORM);
        await fetchMetadata(connector);
    }

    function closeEndpointForm() {
        onClose();
        setSelectedConnector(undefined);
    }

    function saveEndpointForm() {
        onSave();
        closeEndpointForm();
    }

    function handleSelectEndpoint(connector: BallerinaConnectorInfo, endpointName: string) {
        // setSelectedConnector(connector);
        // setWizardStep(WizardStep.ACTION_LIST);
        setIsLoading(true);
        setSelectedEndpoint(endpointName);
        setWizardStep(WizardStep.ACTION_LIST);
        fetchMetadata(connector);
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
            {wizardStep === WizardStep.ENDPOINT_FORM && (selectedConnector || (connectorInfo && model)) && (
                <FormGenerator
                    onCancel={closeEndpointForm}
                    onSave={saveEndpointForm}
                    configOverlayFormStatus={{
                        formType: "EndpointForm",
                        formArgs: {
                            connector: selectedConnector || connectorInfo,
                        },
                        isLoading,
                    }}
                    targetPosition={targetPosition}
                    model={model}
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
            {wizardStep === WizardStep.ACTION_LIST && (
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
