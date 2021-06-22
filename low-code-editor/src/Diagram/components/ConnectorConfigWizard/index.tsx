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

import { LocalVarDecl, STNode } from "@ballerina/syntax-tree";
// import { diagramPanLocation as acDiagramPanLocation } from 'store/actions/preference';

import {
  ConnectorConfig,
  FunctionDefinitionInfo,
  WizardType,
} from "../../../ConfigurationSpec/types";
import { Context } from "../../../Contexts/Diagram";
import {
  BallerinaConnectorsInfo,
  Connector,
} from "../../../Definitions/lang-client-extended";
import { TextPreloaderVertical } from "../../../PreLoader/TextPreloaderVertical";
import { DiagramContext } from "../../../providers/contexts";
// import { closeConfigOverlayForm configOverlayFormPrepareStart } from "../../$store/actions";
import { DraftInsertPosition } from "../../view-state/draft";
import { DefaultConfig } from "../../visitors/default";
import {
  DiagramOverlay,
  DiagramOverlayContainer,
  DiagramOverlayPosition,
} from "../Portals/Overlay";
import { fetchConnectorInfo } from "../Portals/utils";

import { ConnectorForm } from "./Components/ConnectorForm";
import { wizardStyles } from "./style";

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
  connectorInfo: BallerinaConnectorsInfo;
  targetPosition: DraftInsertPosition;
  model?: STNode;
  onClose: () => void;
  selectedConnector?: LocalVarDecl;
  isAction?: boolean;
  // dispatchOverlayOpen: () => void;
}

export function ConnectorConfigWizard(props: ConnectorConfigWizardProps) {
  const { diagramPanLocation } = useContext(DiagramContext).callbacks;
  const { state, toggleDiagramOverlay } = useContext(Context);
  const {
    closeConfigOverlayForm: dispatchOverlayClose,
    configOverlayFormPrepareStart: dispatchOverlayOpen,
    isCodeEditorActive,
    triggerErrorNotification,
    onFitToScreen,
    appInfo,
  } = state;

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
  const classes = wizardStyles();

  const intl = useIntl();
  const connectionErrorMsgText = intl.formatMessage({
    id: "lowcode.develop.connectorForms.createConnection.errorMessage",
    defaultMessage: "Something went wrong. Couldn't load the connection.",
  });

  const currentAppid = appInfo?.currentApp?.id;

  React.useEffect(() => {
    onFitToScreen(currentAppid);
    diagramPanLocation(currentAppid, 0, -position.y + DefaultConfig.dotGap * 3);
  }, []);

  React.useEffect(() => {
    if (wizardState.isLoading) {
      (async () => {
        const configList = await fetchConnectorInfo(
          connectorInfo,
          model,
          state
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
      <DiagramOverlayContainer>
        {!isCodeEditorActive ? (
          <DiagramOverlay
            className={classes.configWizardContainer}
            position={position}
          >
            <>
              {wizardState.isLoading ? (
                <div className={classes.loaderWrapper}>
                  <TextPreloaderVertical position="relative" />
                </div>
              ) : (
                <ConnectorForm
                  selectedConnector={selectedConnector}
                  targetPosition={targetPosition}
                  configWizardArgs={wizardState}
                  connectorInfo={connectorInfo}
                  isAction={isAction}
                  onClose={handleClose}
                />
              )}
            </>
          </DiagramOverlay>
        ) : null}
      </DiagramOverlayContainer>
    </div>
  );
}
