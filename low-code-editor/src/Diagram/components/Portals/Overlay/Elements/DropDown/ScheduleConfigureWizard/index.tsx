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

import { FunctionBodyBlock, FunctionDefinition } from "@ballerina/syntax-tree";
import CloseIcon from "@material-ui/icons/Close";
import { isValidCron } from "cron-validator";

import { DiagramOverlay, DiagramOverlayPosition } from '../../..';
import { Context as DiagramContext } from "../../../../../../../Contexts/Diagram";
import { TRIGGER_TYPE_SCHEDULE } from "../../../../../../models";
import { PrimaryButton } from "../../../../ConfigForm/Elements/Button/PrimaryButton";
import { FormTextInput } from "../../../../ConfigForm/Elements/TextField/FormTextInput";
import { TooltipIcon } from "../../../../ConfigForm/Elements/Tooltip";
import { tooltipMessages } from "../../../../utils/constants";
import { SourceUpdateConfirmDialog } from "../../SourceUpdateConfirmDialog";
import { useStyles } from "../styles";

interface ScheduleConfigureWizardProps {
  position: DiagramOverlayPosition;
  onWizardComplete: () => void;
  onClose: () => void;
  cron?: string,
}

export interface ConnectorEvents {
  [key: string]: any;
}

export function ScheduleConfigureWizard(props: ScheduleConfigureWizardProps) {
  const { state } = useContext(DiagramContext);
  const {
    isMutationProgress: isFileSaving,
    isLoadingSuccess: isFileSaved,
    syntaxTree,
    onModify: dispatchModifyTrigger,
    trackTriggerSelection
  } = state;

  const model: FunctionDefinition = syntaxTree as FunctionDefinition;
  const body: FunctionBodyBlock = model?.functionBody as FunctionBodyBlock;
  const isEmptySource = (body?.statements.length < 1) || (body?.statements === undefined);

  const { position, onWizardComplete, onClose, cron } = props;
  const classes = useStyles();

  const [currentCron, setCurrentCron] = useState<string>(cron || "");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [triggerChanged, setTriggerChanged] = useState(false);

  useEffect(() => {
    if (!isFileSaving && isFileSaved && triggerChanged) {
      onWizardComplete();
      setTriggerChanged(false);
    }
  }, [isFileSaving, isFileSaved]);

  const handleDialogOnCancel = () => {
    setShowConfirmDialog(false);
  };

  function handleOnChangeCron(text: string) {
    setCurrentCron(text);
  }

  function validateCron(text: string) {
    return !text || isValidCron(text);
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
    setTriggerChanged(true);
    dispatchModifyTrigger(TRIGGER_TYPE_SCHEDULE, undefined, {
      "CRON": currentCron,
    });
    trackTriggerSelection("Schedule");
  };

  return (
    <DiagramOverlay
      className={classes.container}
      position={position}
    >
      <>
        <div className={classes.titleWrapper}>
          <p className={classes.title}>Configure Schedule Trigger</p>
          <button className={classes.closeBtnWrapper} onClick={onClose}>
            <CloseIcon className={classes.closeBtn} />
          </button>
        </div>
        <div className={classes.customWrapper}>
          <TooltipIcon
            title={tooltipMessages.cronExpression.title}
            actionText={tooltipMessages.cronExpression.actionText}
            actionLink={tooltipMessages.cronExpression.actionLink}
            placement="left"
            arrow={true}
            interactive={true}
          >

            <p className={classes.subTitle}>Cron Expression</p>
          </TooltipIcon>
          <FormTextInput
            defaultValue={currentCron}
            onChange={handleOnChangeCron}
            customProps={{
              validate: validateCron
            }}
            errorMessage="Please enter valid cron expression"
            placeholder="* * * * ?"
          />
        </div>
        {currentCron && validateCron(currentCron) && (
          <div className={classes.customFooterWrapper}>
            <PrimaryButton
              text="Save"
              className={classes.saveBtn}
              onClick={handleUserConfirm}
              disabled={isFileSaving}
            />
          </div>
        )}
        {showConfirmDialog && (
          <SourceUpdateConfirmDialog
            onConfirm={handleOnSave}
            onCancel={handleDialogOnCancel}
          />
        )}
      </>
    </DiagramOverlay>
  );
}
