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
// tslint:disable: jsx-no-lambda
import React, { useContext, useEffect, useState } from "react";

import { FunctionBodyBlock, FunctionDefinition } from "@ballerina/syntax-tree";
import cn from "classnames";

import { DiagramOverlay, DiagramOverlayPosition } from '../../..';
import { AddIcon } from "../../../../../../../assets/icons";
import ConfigPanel, { Section } from "../../../../../../../components/ConfigPanel";
import RadioControl from "../../../../../../../components/RadioControl";
import { Context as DiagramContext } from "../../../../../../../Contexts/Diagram";
import { validatePath } from "../../../../../../../utils/validator";
import { ServiceMethodType, SERVICE_METHODS, TRIGGER_TYPE_API } from "../../../../../../models";
import { PrimaryButton } from "../../../../ConfigForm/Elements/Button/PrimaryButton";
import { FormTextInput } from "../../../../ConfigForm/Elements/TextField/FormTextInput";
import { tooltipMessages } from "../../../../utils/constants";
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

  const [resources, setResources] = useState([]);
  // const [currentMethod, setCurrentMethod] = useState<ServiceMethodType>(method || "GET");
  const [currentMethod, setCurrentMethod] = useState<string>(method || "GET");
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

  function handleOnSelect(methodType: string, index: number) {
    setCurrentMethod(methodType);

    // Update selected method
    const updatedResources = resources;
    updatedResources[index].method = methodType;
    setResources(updatedResources);
  }

  function handleOnChangePath(text: string, index: number) {
    setCurrentPath(text);
    if (text === 'hello') {
      // todo: handle dispatch
      // dispatchGoToNextTourStep("CONFIG_HTTP_PATH");
    }

    // Update path
    const updatedResources = resources;
    updatedResources[index].path = text;
    setResources(updatedResources);
  }

  const validateResources = (resArr: any) => {
    let isValidated = true;
    const resourceSignatures: string[] = [];

    resArr.forEach((res: any) => {
      // Validate method signature
      const signature: string = `${res.method}_${res.path}`;
      if (resourceSignatures.includes(signature)) {
        isValidated = false;
        return;
      } else {
        resourceSignatures.push(signature);
      }

      // Validate paths
      if (!validatePath(res.path)) {
        isValidated = false;
        return;
      }
    });

    return isValidated;
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
      "BASE_PATH": "/",
      "RES_PATH": currentPath,
      "METHODS": currentMethod.toLocaleLowerCase(),
      "RESOURCES": resources.map((res) => ({
        "PATH": res.path,
        "METHOD": res.method.toLowerCase()
      }))
    });
    trackTriggerSelection("API");
    // todo: handle dispatch
    // dispatchGoToNextTourStep("CONFIG_SAVE");
  };

  const handleAddResource = () => {
    const defaultConfig = { id: `${resources.length}`, method: "GET", path: "" };
    setResources([...resources, defaultConfig])
  }

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
      <ConfigPanel
        title="API Configuration"
        onClose={onClose}
      >
        {resources.map((resProps, index: number) => (
          <div
            key={resProps.id}
            className={classes.resourceWrapper}
          >
            <Section
              title="HTTP Method"
            >
              <RadioControl
                options={SERVICE_METHODS}
                selectedValue={resProps.method.toUpperCase()}
                onSelect={(m: string) => handleOnSelect(m, index)}
              />
            </Section>

            <Section
              title="PATH"
              tooltip={{ title, content: tooltipMessages.path.content }}
            >
              <FormTextInput
                dataTestId="api-path"
                defaultValue={resProps.path}
                onChange={(text: string) => handleOnChangePath(text, index)}
                customProps={{
                  startAdornment: "/",
                  validate: validatePath
                }}
                errorMessage="Please enter a valid path"
                placeholder="Relative path from host"
              />
            </Section>
          </div>
        ))}

        <button
          onClick={handleAddResource}
          className={classes.addResourceBtn}
        >
          <div className={classes.addResourceBtnWrap}>
            <AddIcon />
            <p>Add resource</p>
          </div>
        </button>

        <div>
          {validateResources(resources) &&
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
              onConfirm={handleOnSave}
              onCancel={handleDialogOnCancel}
            />
          )}
        </div>
      </ConfigPanel>
    </DiagramOverlay>
  );
}
