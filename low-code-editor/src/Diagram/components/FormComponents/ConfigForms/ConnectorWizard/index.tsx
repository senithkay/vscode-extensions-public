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
import { FormattedMessage } from "react-intl";

import { Box, FormControl, List, Typography } from "@material-ui/core";
import {
    BallerinaConnectorInfo,
    ConnectorWizardProps,
    ConnectorWizardType,
    DiagramOverlayPosition,
    WizardType,
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FormHeaderSection, PrimaryButton } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { LocalVarDecl, NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../Contexts/Diagram";
import { ConfigWizardState } from "../../ConnectorConfigWizard";
import { FormGenerator, FormGeneratorProps } from "../../FormGenerator";
import { wizardStyles as useFormStyles } from "../style";

import useStyles from "./style";
import { fetchConnectorInfo } from "./util";

enum WizardStep {
    LOADING = "loading",
    MARKETPLACE = "marketplace",
    ENDPOINT_FORM = "endpointForm",
    ENDPOINT_LIST = "endpointList",
    ACTION_LIST = "actionList",
    ACTION_FROM = "actionFrom",
}

// export enum ConnectorWizardType {
//     ENDPOINT = "endpoint",
//     ACTION = "action",
// }
// export interface ConnectorWizardProps {
//     wizardType: ConnectorWizardType;
//     diagramPosition: DiagramOverlayPosition;
//     connectorInfo?: BallerinaConnectorInfo;
//     model?: STNode;
//     targetPosition: NodePosition;
//     functionNode: STNode;
//     isModuleType?: boolean;
//     onSave: () => void;
//     onClose: () => void;
// }

export function ConnectorWizard(props: ConnectorWizardProps) {
    const classes = useStyles();
    const formClasses = useFormStyles();
    const {
        props: { stSymbolInfo, langServerURL, currentFile },
        api: {
            ls: { getDiagramEditorLangClient },
        },
    } = useContext(Context);

    const {
        wizardType,
        diagramPosition,
        connectorInfo,
        model,
        targetPosition,
        functionNode,
        isModuleType,
        onSave,
        onClose,
    } = props;

    const [wizardStep, setWizardStep] = useState<string>(getInitialWizardStep());
    const [selectedConnector, setSelectedConnector] = useState<BallerinaConnectorInfo>(connectorInfo);

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
            setWizardStep(WizardStep.ENDPOINT_FORM);
        }
    }

    function handleSelectConnector(connector: BallerinaConnectorInfo, node: LocalVarDecl) {
        setWizardStep(WizardStep.LOADING);
        // (async () => {
        //     // TODO: fix this with propper loading
        //     fetchMetadata(connector);
        // })();
        fetchMetadata(connector);
    }

    function closeEndpointForm() {
        onClose();
        setSelectedConnector(undefined);
    }

    function handleSelectEndpoint(connector: BallerinaConnectorInfo, endpointName: string) {
        setSelectedConnector(connector);
        setWizardStep(WizardStep.ACTION_LIST);
    }

    function handleAddNewEndpoint() {
        return WizardStep.ENDPOINT_LIST;
    }

    return (
        <>
            {wizardStep === WizardStep.LOADING && <>Fetching...</>}
            {wizardStep === WizardStep.MARKETPLACE && (
                <FormGenerator
                    onCancel={onClose}
                    configOverlayFormStatus={{
                        formType: "ConnectorList",
                        formArgs: {
                            onSelect: handleSelectConnector,
                            onCancel: onClose,
                        },
                        isLoading: true,
                    }}
                />
            )}
            {wizardStep === WizardStep.ENDPOINT_FORM && (selectedConnector || (connectorInfo && model)) && (
                <FormGenerator
                    onCancel={closeEndpointForm}
                    onSave={onSave}
                    configOverlayFormStatus={{
                        formType: "EndpointForm",
                        formArgs: {
                            targetPosition,
                            connector: selectedConnector || connectorInfo,
                            onCancel: closeEndpointForm,
                        },
                        isLoading: true,
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
                            onCancel: onClose,
                            functionNode,
                            addNewEndpoint: handleAddNewEndpoint,
                        },
                        isLoading: true,
                    }}
                />
            )}
        </>
    );
}
