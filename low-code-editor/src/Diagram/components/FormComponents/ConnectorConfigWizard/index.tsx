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
import { useIntl } from "react-intl";

import {
  BallerinaConnectorInfo,
  BallerinaModule,
  Connector,
  ConnectorConfig,
  FunctionDefinitionInfo,
  WizardType
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { LocalVarDecl, NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../Contexts/Diagram";
import { CONNECTOR_CLOSED, LowcodeEvent } from "../../../models";
import { DefaultConfig } from "../../../visitors/default";
import {
  DiagramOverlayPosition,
} from "../../Portals/Overlay";
import { fetchConnectorInfo } from "../../Portals/utils";
import { fetchConnectorsList } from "../ConfigForms/ConnectorList";
import { SearchQueryParams } from "../ConfigForms/Marketplace";
import { FormGenerator } from "../FormGenerator";

export interface ConfigWizardState {
    isLoading: boolean;
    connector: Connector;
    functionDefInfo: Map<string, FunctionDefinitionInfo>;
    connectorConfig: ConnectorConfig;
    model?: STNode;
    wizardType?: WizardType;
}
export interface ConnectorConfigWizardProps {
    position: DiagramOverlayPosition;
    connectorInfo: BallerinaConnectorInfo;
    targetPosition: NodePosition;
    // This prop is used to load connectors from statement menu
    specialConnectorName?: string;
    model?: STNode;
    onClose: () => void;
    onSave: () => void;
    selectedConnector?: LocalVarDecl;
    isAction?: boolean;
    isEdit?: boolean;
}

export function ConnectorConfigWizard(props: ConnectorConfigWizardProps) {
    const {
        actions: {
            toggleDiagramOverlay
        },
        props: {
            isCodeEditorActive,
            userInfo,
            langServerURL,
            stSymbolInfo,
            currentFile
        },
        api: {
            ls: {
                getDiagramEditorLangClient
            },
            panNZoom: {
                pan,
                fitToScreen
            },
            notifications: {
                triggerErrorNotification,
            },
            configPanel: {
                closeConfigOverlayForm: dispatchOverlayClose,
            },
            insights: {
                onEvent
            }
        }
    } = useContext(Context);

    const {
        position,
        connectorInfo,
        targetPosition,
        model,
        onClose,
        onSave,
        selectedConnector,
        isAction,
        isEdit,
        specialConnectorName
    } = props;

    const initWizardState: ConfigWizardState = {
        isLoading: true,
        connectorConfig: undefined,
        functionDefInfo: undefined,
        connector: undefined,
        wizardType: isEdit ? WizardType.EXISTING : WizardType.NEW
    };

    const [ wizardState, setWizardState ] = useState<ConfigWizardState>(
        initWizardState
    );

    const intl = useIntl();
    const connectionErrorMsgText = intl.formatMessage({
        id: "lowcode.develop.connectorForms.createConnection.errorMessage",
        defaultMessage: "Something went wrong. Couldn't load the connection.",
    });

    React.useEffect(() => {
        fitToScreen();
        pan(0, -position.y + DefaultConfig.dotGap * 3);
    }, []);

    React.useEffect(() => {
        if (wizardState.isLoading) {
            (async () => {
                let connector = connectorInfo;
                if (specialConnectorName) {
                    const queryParams: SearchQueryParams = {
                        query: specialConnectorName.toLocaleLowerCase(),
                        category: "",
                        filterState: {},
                        limit: 18,
                        page: 1,
                    };
                    const langClient = await getDiagramEditorLangClient();
                    const ballerinaConnectorInfo = await fetchConnectorsList(queryParams, currentFile.path,
                        langClient, userInfo);
                    connector = ballerinaConnectorInfo.central.find((balModule: BallerinaModule) =>
                        (balModule.moduleName === specialConnectorName.toLocaleLowerCase() &&
                            balModule.name === "Client")) as BallerinaConnectorInfo;
                }

                const connectorInfoResponse = await fetchConnectorInfo(
                    connector,
                    model,
                    stSymbolInfo,
                    langServerURL,
                    getDiagramEditorLangClient,
                    userInfo?.user?.email
                );
                if (connectorInfoResponse) {
                    connectorInfoResponse.wizardType = isEdit ? WizardType.EXISTING : WizardType.NEW;
                    setWizardState(connectorInfoResponse);
                } else {
                    triggerErrorNotification(new Error(connectionErrorMsgText));
                    handleClose();
                }
            })();
            toggleDiagramOverlay();
        }
    }, [ wizardState ]);

    const handleClose = () => {
        onClose();
        dispatchOverlayClose();
        toggleDiagramOverlay();
        const event: LowcodeEvent = {
            type: CONNECTOR_CLOSED,
            name: connectorInfo?.displayName
        };
        onEvent(event);
    };

    const handleSave = () => {
        onSave();
    };

    return (
        <div>
            { !isCodeEditorActive ? (
                <FormGenerator
                    onCancel={handleClose}
                    configOverlayFormStatus={ {
                        formType: "Connector",
                        formArgs: {
                            selectedConnector,
                            targetPosition,
                            configWizardArgs: wizardState,
                            connectorInfo,
                            isAction,
                            onClose: handleClose,
                            onSave: handleSave,
                        },
                        isLoading: true,
                    } }
                />
            ) : null }
        </div>
    );
}
