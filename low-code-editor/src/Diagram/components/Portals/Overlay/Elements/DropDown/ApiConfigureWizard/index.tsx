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
import { FormattedMessage, useIntl } from "react-intl";

import { FunctionBodyBlock, FunctionDefinition } from "@ballerina/syntax-tree";
import cn from "classnames";

import { DiagramOverlay, DiagramOverlayPosition } from '../../..';
import { AddIcon } from "../../../../../../../assets/icons";
import ConfigPanel, { Section } from "../../../../../../../components/ConfigPanel";
import RadioControl from "../../../../../../../components/RadioControl";
import { Context } from "../../../../../../../Contexts/Diagram";
import { updatePropertyStatement } from '../../../../../../../Diagram/utils/modification-util';
import { DiagramContext } from "../../../../../../../providers/contexts";
import { validatePath } from "../../../../../../../utils/validator";
import { ServiceMethodType, SERVICE_METHODS, TriggerType, TRIGGER_TYPE_API, TRIGGER_TYPE_SERVICE_DRAFT } from "../../../../../../models";
import { PrimaryButton } from "../../../../ConfigForm/Elements/Button/PrimaryButton";
import { FormTextInput } from "../../../../ConfigForm/Elements/TextField/FormTextInput";
import { SourceUpdateConfirmDialog } from "../../SourceUpdateConfirmDialog";
import { useStyles } from "../styles";

interface ApiConfigureWizardProps {
  position: DiagramOverlayPosition;
  onWizardComplete: () => void;
  onClose: () => void;
  method?: ServiceMethodType,
  path?: string,
  triggerType?: TriggerType
  // handle dispatch
  // dispatchGoToNextTourStep: (id: string) => void
}

export interface ConnectorEvents {
  [key: string]: any;
}

export function ApiConfigureWizard(props: ApiConfigureWizardProps) {
  const { onModify, onMutate } = useContext(DiagramContext).callbacks;
  const { state } = useContext(Context);
  const {
    isMutationProgress: isFileSaving,
    isLoadingSuccess: isFileSaved,
    syntaxTree,
    connectionData,
    trackTriggerSelection
  } = state;
  const model: FunctionDefinition = syntaxTree as FunctionDefinition;
  const body: FunctionBodyBlock = model?.functionBody as FunctionBodyBlock;
  const isEmptySource = (body?.statements.length < 1) || (body?.statements === undefined);
  const { position, onWizardComplete, onClose, method, path, triggerType,
    // todo: handle dispatch
    // dispatchGoToNextTourStep
  } = props;
  const classes = useStyles();
  const intl = useIntl();

  const [resources, setResources] = useState([]);
  const [isNewService, setIsNewService] = useState(true);
  // const [currentMethod, setCurrentMethod] = useState<ServiceMethodType>(method || "GET");
  const [currentMethod, setCurrentMethod] = useState<string>(method || "GET");
  const [currentPath, setCurrentPath] = useState<string>(path || "");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [triggerChanged, setTriggerChanged] = useState(false);

  useEffect(() => {
    const members = syntaxTree && syntaxTree.members;
    if (!members) setIsNewService(false);
  }, [])

  useEffect(() => {
    if (!isFileSaving && isFileSaved && triggerChanged) {
      onWizardComplete();
      setTriggerChanged(false);
    }
  }, [isFileSaving, isFileSaved]);

  useEffect(() => {
    if (syntaxTree) {
      const { functionName, relativeResourcePath } = syntaxTree;
      const stMethod = functionName?.value;
      const stPath = relativeResourcePath && relativeResourcePath[0] && (relativeResourcePath[0]?.value || relativeResourcePath[0]?.source) || "";

      const resourceMembers = [];
      if (stMethod && stPath) {
        resourceMembers.push({ id: 0, method: stMethod.toUpperCase(), path: stPath });
      } else {
        const defaultConfig = { id: `${resources.length}`, method: "GET", path: "" };
        resourceMembers.push(defaultConfig);
      }
      setResources(resourceMembers)
    }
  }, [syntaxTree])

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

  const validateResources = () => {
    if (!resources || resources.length === 0) return false;

    let isValidated = true;
    const resourceSignatures: string[] = [];

    resources.forEach((res: any) => {
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
      handleUpdateResources();
    } else {
      // get user confirmation if code there
      setShowConfirmDialog(true);
    }
  };

  const handleUpdateResources = () => {
    if (isNewService) {
      setShowConfirmDialog(false);
      // dispatch and close the wizard
      setTriggerChanged(true);
      onModify(TRIGGER_TYPE_API, undefined, {
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
    } else {
      const mutations: any[] = [];
      const updatePosition: any = {
        startLine: syntaxTree.functionName.position.startLine,
        startColumn: syntaxTree.functionName.position.startColumn,
        endLine: syntaxTree.relativeResourcePath[syntaxTree.relativeResourcePath.length - 1].position.endLine,
        endColumn: syntaxTree.relativeResourcePath[syntaxTree.relativeResourcePath.length - 1].position.endColumn
      }
      const selectedResource = resources[0];
      const resource = `${selectedResource.method.toLocaleLowerCase()} ${selectedResource.path}`;
      mutations.push(updatePropertyStatement(resource, updatePosition));

      setTriggerChanged(true);
      onMutate(mutations);
    }
  };

  const handleAddResource = () => {
    const defaultConfig = { id: `${resources.length}`, method: "GET", path: "" };
    setResources([...resources, defaultConfig])
  }

  const pathInstructions = intl.formatMessage({
    id: "lowcode.develop.apiConfigWizard.path.instructions.tooltip",
    defaultMessage: "A valid path should not :"
  });

  const pathInstructionsBullet1 = intl.formatMessage({
    id: "lowcode.develop.apiConfigWizard.path.instructions.tooltip.bulletPoint1",
    defaultMessage: "Include spaces outside the square brackets"
  });

  const pathInstructionsBullet2 = intl.formatMessage({
    id: "lowcode.develop.apiConfigWizard.path.instructions.bulletPoint2",
    defaultMessage: "Start with a numerical character"
  });

  const pathInstructionsBullet3 = intl.formatMessage({
    id: "lowcode.develop.apiConfigWizard.path.instructions.bulletPoint3",
    defaultMessage: "Include keywords such as Return, Foreach, Resource, Object, etc."
  });

  const resourceConfigTitle = intl.formatMessage({
    id: "lowcode.develop.apiConfigWizard.resourceConfig.title",
    defaultMessage: "Configure Resource"
  });

  const httpMethodTitle = intl.formatMessage({
    id: "lowcode.develop.apiConfigWizard.httpMethod.title",
    defaultMessage: "HTTP Method"
  });

  const pathTitle = intl.formatMessage({
    id: "lowcode.develop.apiConfigWizard.path.title",
    defaultMessage: "Path"
  });

  const pathErrorMessage = intl.formatMessage({
    id: "lowcode.develop.apiConfigWizard.path.errorMessage",
    defaultMessage: "Please enter a valid path"
  });

  const pathPlaceholder = intl.formatMessage({
    id: "lowcode.develop.apiConfigWizard.path.placeholder",
    defaultMessage: "Relative path from host"
  });

  const saveAPIButton = intl.formatMessage({
    id: "lowcode.develop.apiConfigWizard.saveAPIButton.text",
    defaultMessage: "Save API"
  });

  const pathExample = intl.formatMessage({
    id: "lowcode.develop.apiConfigWizard.path.tooltip.example",
    defaultMessage: "/users/[string name]"
  });

  const title = (
    <div>
      <p>{pathInstructions}</p>
      <ul>
        <li>{pathInstructionsBullet1}</li>
        <li>{pathInstructionsBullet2}</li>
        <li>{pathInstructionsBullet3}</li>
      </ul>
    </div>
  );

  return (
    <DiagramOverlay
      className={cn(classes.container)}
      position={position}
    >
      <ConfigPanel
        title={resourceConfigTitle}
        onClose={onClose}
        showClose={(triggerType !== undefined && triggerType !== TRIGGER_TYPE_SERVICE_DRAFT)}
      >
        {resources.map((resProps, index: number) => (
          <div
            key={resProps.id}
            className={classes.resourceWrapper}
          >
            <Section
              title={httpMethodTitle}
            >
              <RadioControl
                options={SERVICE_METHODS}
                selectedValue={resProps.method.toUpperCase()}
                onSelect={(m: string) => handleOnSelect(m, index)}
              />
            </Section>

            <Section
              title={pathTitle}
              tooltipWithExample={{ title, content: pathExample }}
            >
              <FormTextInput
                dataTestId="api-path"
                defaultValue={resProps.path}
                onChange={(text: string) => handleOnChangePath(text, index)}
                customProps={{
                  startAdornment: "/",
                  validate: validatePath
                }}
                errorMessage={pathErrorMessage}
                placeholder={pathPlaceholder}
              />
            </Section>
          </div>
        ))}

        {isNewService && (
          <button
            onClick={handleAddResource}
            className={classes.addResourceBtn}
          >
            <div className={classes.addResourceBtnWrap}>
              <AddIcon />
              <p><FormattedMessage id="lowcode.develop.apiConfigWizard.addResource.title" defaultMessage="Add Resource" /></p>
            </div>
          </button>
        )}

        <div>
          {validateResources() &&
            (
              <div className={classes.serviceFooterWrapper}>
                <div id="product-tour-save" >
                  <PrimaryButton
                    dataTestId="save-btn"
                    text={saveAPIButton}
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
              onConfirm={handleUpdateResources}
              onCancel={handleDialogOnCancel}
            />
          )}
        </div>
      </ConfigPanel>
    </DiagramOverlay>
  );
}
