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

import { LocalVarDecl, NodePosition, STNode } from "@ballerina/syntax-tree";

import {
  ConnectorConfig,
  FunctionDefinitionInfo,
  WizardType,
} from "../../../ConfigurationSpec/types";
import { Context } from "../../../Contexts/Diagram";
import {
  BallerinaConnectorInfo,
  Connector,
} from "../../../Definitions/lang-client-extended";
// import { closeConfigOverlayForm configOverlayFormPrepareStart } from "../../$store/actions";
import { DefaultConfig } from "../../visitors/default";
import { FormGenerator } from "../FormGenerator";
import {
  DiagramOverlayPosition,
} from "../Portals/Overlay";
import { fetchConnectorInfo } from "../Portals/utils";

import { wizardStyles } from "./style";
// import { pan as acpan } from 'store/actions/preference';


export interface ConfigWizardState {
  isLoading: boolean;
  connector: Connector;
  wizardType: WizardType;
  functionDefInfo: Map<string, FunctionDefinitionInfo>;
  connectorConfig: ConnectorConfig;
  model?: STNode;
}

export interface ConnectorConfigWizardProps {
  position: DiagramOverlayPosition;
  connectorInfo: BallerinaConnectorInfo;
  targetPosition: NodePosition;
  model?: STNode;
  onClose: () => void;
  selectedConnector?: LocalVarDecl;
  isAction?: boolean;
  // dispatchOverlayOpen: () => void;
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
      stSymbolInfo
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
      }
    }
  } = useContext(Context);

  const {
    position,
    connectorInfo,
    targetPosition,
    model,
    onClose,
    selectedConnector,
    isAction,
  } = props;

  const initWizardState: ConfigWizardState = {
    isLoading: true,
    connectorConfig: undefined,
    functionDefInfo: undefined,
    wizardType: undefined,
    connector: undefined,
  };

  const [wizardState, setWizardState] = useState<ConfigWizardState>(
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
        const configList = await fetchConnectorInfo(
          connectorInfo,
          model,
          stSymbolInfo,
          langServerURL,
          getDiagramEditorLangClient,
          userInfo?.user?.email
        );
        if (configList) {
          setWizardState(configList);
        } else {
          triggerErrorNotification(new Error(connectionErrorMsgText));
          handleClose();
        }
      })();
      toggleDiagramOverlay();
    }
  }, [wizardState]);

  const handleClose = () => {
    onClose();
    dispatchOverlayClose();
    toggleDiagramOverlay();
  };

  return (
        <div>
            { !isCodeEditorActive ? (
                <FormGenerator
                    onCancel={handleClose}
                    // onSave={onSave}
                    configOverlayFormStatus={ {
                        formType: "Connector",
                        formArgs: {
                            selectedConnector,
                            targetPosition,
                            configWizardArgs: wizardState,
                            connectorInfo,
                            isAction,
                            onClose: handleClose,
                        },
                        isLoading: true,
                    } }
                />
            ) : null }
        </div>
    );
}
