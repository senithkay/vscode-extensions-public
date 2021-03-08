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
import React from "react";

import CloseIcon from "@material-ui/icons/Close";

import { DiagramOverlay, DiagramOverlayPosition } from '../../..';
import { useStyles } from "../styles";
import { ConnectorType } from "../TriggerDropDown";

import { CalendarConfigureForm } from "./CalendarConfigureForm";
import { GitHubConfigureForm } from "./GitHubConfigureForm";

interface WebhookConfigureWizardProps {
  position: DiagramOverlayPosition;
  connector: ConnectorType;
  onWizardComplete: () => void;
  onClose: () => void;
}

export interface ConnectorEvents {
  [ key: string ]: any;
}

export function WebhookConfigureWizardC(props: WebhookConfigureWizardProps) {

  const { position, connector, onWizardComplete, onClose } = props;
  const classes = useStyles();

  function handleOnWizardComplete() {
    onWizardComplete();
  }

  return (
    <DiagramOverlay
      className={classes.container}
      position={position}
    >
      <div className={classes.titleWrapper}>
        <p className={classes.title}>{connector} Configuration</p>
        <button className={classes.closeBtnWrapper} onClick={onClose}>
          <CloseIcon className={classes.closeBtn} />
        </button>
      </div>
      { connector === ConnectorType.GITHUB && (
        <GitHubConfigureForm
          position={position}
          onComplete={handleOnWizardComplete}
        />
      ) }
      { connector === ConnectorType.G_CALENDAR && (
        <CalendarConfigureForm
          position={position}
          onComplete={handleOnWizardComplete}
        />
      ) }
    </DiagramOverlay>
  );
}

export const WebhookConfigureWizard = WebhookConfigureWizardC;
