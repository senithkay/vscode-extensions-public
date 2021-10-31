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
import React, { useContext, useEffect, useState } from "react";
import { useIntl } from "react-intl";

import { FunctionBodyBlock, FunctionDefinition } from "@ballerina/syntax-tree";
import CloseIcon from "@material-ui/icons/Close";

import { Context } from "../../../../../../Contexts/Diagram";
import { ServiceMethodType, TRIGGER_TYPE_WEBHOOK, WebhookMethodType, WEBHOOK_METHODS } from "../../../../../models";
import { PrimaryButton } from "../../../../FormComponents/FormFieldComponents/Button/PrimaryButton";
import { RadioControl } from "../../../../FormComponents/FormFieldComponents/RadioControl/FormRadioControl";
import { FormTextInput } from "../../../../FormComponents/FormFieldComponents/TextField/FormTextInput";
import { DiagramOverlay, DiagramOverlayPosition } from '../../../../Portals/Overlay';
import { SourceUpdateConfirmDialog } from "../../SourceUpdateConfirmDialog";
import { useStyles } from "../styles";

interface ManualWebhookConfigureWizardProps {
  position: DiagramOverlayPosition;
  onWizardComplete: () => void;
  onClose: () => void;
  method?: WebhookMethodType,
  path?: string,
}

export interface ConnectorEvents {
  [key: string]: any;
}

export function ManualWebhookConfigureWizard(props: ManualWebhookConfigureWizardProps) {
  const {
    api: {
      code: { modifyTrigger }
    },
    props: { isMutationProgress: isFileSaving, isLoadingSuccess: isFileSaved, syntaxTree }
  } = useContext(Context);
  const model: FunctionDefinition = syntaxTree as FunctionDefinition;
  const body: FunctionBodyBlock = model?.functionBody as FunctionBodyBlock;
  const isEmptySource = (body?.statements.length < 1) || (body?.statements === undefined);
  const { position, onWizardComplete, onClose, method, path } = props;
  const classes = useStyles();
  const intl = useIntl();
  const [currentMethod, setCurrentMethod] = useState<ServiceMethodType>(method || "GET");
  const [currentPath, setCurrentPath] = useState<string>(path || "");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (!isFileSaving && isFileSaved) {
      onWizardComplete();
    }
  }, [isFileSaving, isFileSaved]);

  const handleDialogOnCancel = () => {
    setShowConfirmDialog(false);
  };

  function handleOnChangeMethod(methodType: ServiceMethodType) {
    setCurrentMethod(methodType);
  }
  function handleOnChangePath(text: string) {
    setCurrentPath(text);
  }

  function validatePath(text: string) {
    // TODO: have to update regex to match exactly param types and skip other spaces
    return (text) ? ((!/^\d/.test(text)) && /^[a-zA-Z0-9_\/\[ \].]+$/g.test(text)) : true;
  }

  const handleUserConfirm = () => {
    if (isEmptySource) {
      handleOnSave();
    } else {
      // get user confirmation if code there
      setShowConfirmDialog(true);
    }
  };

  const handleOnSave = () => {
    setShowConfirmDialog(false);
    // dispatch and close the wizard
    modifyTrigger(TRIGGER_TYPE_WEBHOOK, undefined, {
      TRIGGER_NAME: "manualwebhook",
      PORT: 8090,
      RES_PATH: currentPath,
      METHODS: currentMethod.toLocaleLowerCase(),
    });
  };

  const manualwebhookConfigTitle = intl.formatMessage({
    id: "lowcode.develop.manualwebhookConfigWizard.resourceConfig.Title",
    defaultMessage: "Webhook Configuration"
  });

  const manualwebhookHttpMethodTitle = intl.formatMessage({
    id: "lowcode.develop.manualwebhookConfigWizard.httpMethod.Title",
    defaultMessage: "HTTP Method"
  });

  const manualwebhookPathTitle = intl.formatMessage({
    id: "lowcode.develop.manualwebhookConfigWizard.path.Title",
    defaultMessage: "Path"
  });
  const wmanualwebhookPathErrorMessage = intl.formatMessage({
    id: "lowcode.develop.manualwebhookConfigWizard.path.errorMessage",
    defaultMessage: "You cannot start with a number, and only [a-zA-Z0-9{}_/ [].] characters are allowed."
  });

  const manualwebhookPathPlaceholder = intl.formatMessage({
    id: "lowcode.develop.manualwebhookConfigWizard.path.placeholder",
    defaultMessage: "Relative path from host"
  });

  const saveWebhookButton = intl.formatMessage({
    id: "lowcode.develop.manualwebhookConfigWizard.saveWehHookButton.text",
    defaultMessage: "Save Webhook"
  });
  return (
    <DiagramOverlay
      className={classes.container}
      position={position}
    >
      <div className={classes.titleWrapper}>
        <p className={classes.title}>{manualwebhookConfigTitle}</p>
        <button className={classes.closeBtnWrapper} onClick={onClose}>
          <CloseIcon className={classes.closeBtn} />
        </button>
      </div>
      <div className={classes.customWrapper}>
        <p className={classes.subTitle}>{manualwebhookHttpMethodTitle}</p>
        <div className={classes.radioBtnWrapper}>
          <RadioControl
            customProps={{ collection: WEBHOOK_METHODS }}
            defaultValue={currentMethod.toUpperCase()}
            onChange={handleOnChangeMethod}
          />
        </div>
      </div>
      <div className={classes.customWrapper}>
        <p className={classes.subTitle}>{manualwebhookPathTitle}</p>
        <FormTextInput
          defaultValue={currentPath}
          onChange={handleOnChangePath}
          customProps={{
            startAdornment: "/",
            validate: validatePath
          }}
          errorMessage={wmanualwebhookPathErrorMessage}
          placeholder={manualwebhookPathPlaceholder}
        />
      </div>
      { validatePath(currentPath) &&
        (
          <div className={classes.customFooterWrapper}>
            <PrimaryButton
              text={saveWebhookButton}
              className={classes.saveBtn}
              onClick={handleUserConfirm}
              disabled={isFileSaving}
            />
          </div>
        )}
      { showConfirmDialog && (
        <SourceUpdateConfirmDialog
          onConfirm={handleOnSave}
          onCancel={handleDialogOnCancel}
        />
      )}
    </DiagramOverlay>
  );
}
