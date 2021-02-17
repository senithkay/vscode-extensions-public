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
import cn from "classnames";

import { DiagramOverlay, DiagramOverlayPosition } from '../../..';
import { Context as DiagramContext } from "../../../../../../../Contexts/Diagram";
import { ServiceMethodType, SERVICE_METHODS, TRIGGER_TYPE_API } from "../../../../../../models";
import { DefaultConfig } from "../../../../../../visitors/default";
import { PrimaryButton } from "../../../../ConfigForm/Elements/Button/PrimaryButton";
import { RadioControl } from "../../../../ConfigForm/Elements/RadioControl/FormRadioControl";
import { FormTextInput } from "../../../../ConfigForm/Elements/TextField/FormTextInput";
import { TooltipIcon } from "../../../../ConfigForm/Elements/Tooltip";
import { keywords, tooltipMessages } from "../../../../utils/constants";
import { SourceUpdateConfirmDialog } from "../../SourceUpdateConfirmDialog";
import { useStyles } from "../styles";

interface ApiConfigureWizardProps {
  position: DiagramOverlayPosition;
  onWizardComplete: () => void;
  onClose: () => void;
  method?: ServiceMethodType,
  path?: string,
  // handle dispatch
  // dispatchGoToNextTourStep: (id: string) => void
}

export interface ConnectorEvents {
  [key: string]: any;
}

export function ApiConfigureWizard(props: ApiConfigureWizardProps) {
  const { state } = useContext(DiagramContext);
  const {
    isMutationProgress: isFileSaving,
    isLoadingSuccess: isFileSaved,
    syntaxTree,
    connectionData,
    onModify: dispatchModifyTrigger,
    trackTriggerSelection
  } = state;
  const model: FunctionDefinition = syntaxTree as FunctionDefinition;
  const body: FunctionBodyBlock = model?.functionBody as FunctionBodyBlock;
  const isEmptySource = (body?.statements.length < 1) || (body?.statements === undefined);
  const { position, onWizardComplete, onClose, method, path,
    // todo: handle dispatch
    // dispatchGoToNextTourStep
  } = props;
  const classes = useStyles();

  const [currentMethod, setCurrentMethod] = useState<ServiceMethodType>(method || "GET");
  const [currentPath, setCurrentPath] = useState<string>(path || "");
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

  function handleOnChangeMethod(methodType: ServiceMethodType) {
    setCurrentMethod(methodType);
  }

  function handleOnChangePath(text: string) {
    setCurrentPath(text);
    if (text === 'hello') {
      // todo: handle dispatch
      // dispatchGoToNextTourStep("CONFIG_HTTP_PATH");
    }
  }

  function validatePath(text: string) {
    if (text !== "") {
      if (text.includes("/") && text.includes("[") && text.includes("]")) {
        const paramArray = (text.match(/\[([^\[\]]*)\]/g))
        const arrayLength = paramArray.length;
        for (let i = 0; i < arrayLength; i++) {
          const splitString = paramArray[i].split(" ")
          if (!keywords.includes(splitString[0].slice(1)) || keywords.includes(splitString[1].slice(0, -1))) {
            return false;
          }
          text = text.replace(paramArray[i], "")
        }
        return ((/^[a-zA-Z0-9_\/\[\].]+$/g.test(text)) && (!/^\d/.test(text)))
      } else if (text === "[]") return false
      else return ((/^[a-zA-Z0-9_\/\[\].]+$/g.test(text)) && (!/^\d/.test(text)))
    } else return true
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
    dispatchModifyTrigger(TRIGGER_TYPE_API, undefined, {
      "PORT": 8090,
      "RES_PATH": currentPath,
      "METHODS": currentMethod.toLocaleLowerCase(),
    });
    trackTriggerSelection("API");
    // todo: handle dispatch
    // dispatchGoToNextTourStep("CONFIG_SAVE");
  };

  const title = (
    <div>
      <p>Enter a valid path following these instructions, Please avoid using:</p>
      <ul>
        <li>Spaces outside square brackets</li>
        <li>Starting the path with a number</li>
        <li>Keywords for param names</li>
      </ul>
    </div>
  );

  return (
    <DiagramOverlay
      className={cn(classes.container)}
      position={position}
    >
      <div id='api-config-panel'>
        <div>
          <div className={classes.titleWrapper}>
            <p className={classes.title}>API Configuration</p>
            <button className={classes.closeBtnWrapper} onClick={onClose}>
              <CloseIcon className={classes.closeBtn} />
            </button>
          </div>
          <div className={classes.customWrapper}>
            <p className={classes.subTitle}>HTTP Method</p>
            <div className={classes.radioBtnWrapper}>
              <RadioControl
                customProps={{ collection: SERVICE_METHODS }}
                defaultValue={currentMethod.toUpperCase()}
                onChange={handleOnChangeMethod}
              />
            </div>
          </div>
          <div id="product-tour-path" className={classes.customWrapper}>
            <TooltipIcon
              title={title}
              placement="left"
              arrow={true}
              codeSnippet={true}
              example={true}
              content={tooltipMessages.path.content}
            >
              <p className={classes.subTitle}>PATH</p>
            </TooltipIcon>
            <FormTextInput
              dataTestId="api-path"
              defaultValue={currentPath}
              onChange={handleOnChangePath}
              customProps={{
                startAdornment: "/",
                validate: validatePath
              }}
              errorMessage="Please enter a valid path"
              placeholder="Relative path from host"
            />
          </div>
          {validatePath(currentPath) &&
            (
              <div className={classes.customFooterWrapper}>
                <div id="product-tour-save" >
                  <PrimaryButton
                    dataTestId="save-btn"
                    text="Save API"
                    className={classes.saveBtn}
                    onClick={handleUserConfirm}
                    disabled={isFileSaving}
                  />
                </div>
              </div>
            )
          }

          {showConfirmDialog && (
            <SourceUpdateConfirmDialog
              position={{
                x: position.x + DefaultConfig.configureWizardOffset.x,
                y: position.y + DefaultConfig.configureWizardOffset.y + 300
              }}
              onConfirm={handleOnSave}
              onCancel={handleDialogOnCancel}
            />
          )}
        </div>
      </div>
    </DiagramOverlay>
  );
}

// todo : handle dispatch
// const mapDispatchToProps = {
//   dispatchGoToNextTourStep: goToNextTourStep,
// };
