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
import { getPathOfResources } from "components/DiagramSelector/utils";

import { DiagramOverlay, DiagramOverlayPosition } from '../../..';
import { AddIcon } from "../../../../../../../assets/icons";
import ConfigPanel, { Section } from "../../../../../../../components/ConfigPanel";
import RadioControl from "../../../../../../../components/RadioControl";
import { Context } from "../../../../../../../Contexts/Diagram";
import { updateResourceSignature } from '../../../../../../../Diagram/utils/modification-util';
import { DiagramContext } from "../../../../../../../providers/contexts";
import { validatePath } from "../../../../../../../utils/validator";
import {
  EVENT_TYPE_AZURE_APP_INSIGHTS,
  LowcodeEvent,
  ServiceMethodType,
  SERVICE_METHODS,
  TriggerType,
  TRIGGER_SELECTED_INSIGHTS, TRIGGER_TYPE_API, TRIGGER_TYPE_SERVICE_DRAFT
} from "../../../../../../models";
import { PrimaryButton } from "../../../../ConfigForm/Elements/Button/PrimaryButton";
import { SwitchToggle } from "../../../../ConfigForm/Elements/SwitchToggle";
import { FormTextInput } from "../../../../ConfigForm/Elements/TextField/FormTextInput";
import { SourceUpdateConfirmDialog } from "../../SourceUpdateConfirmDialog";
import { useStyles } from "../styles";
import { useStyles as returnStyles } from "../ApiConfigureWizard/components/ReturnTypeEditor/style";

import { AdvancedEditor } from "./components/advanced";
import { PayloadEditor } from "./components/extractPayload";
import { PathEditor } from "./components/pathEditor";
import { QueryParamEditor } from "./components/queryParamEditor";
import { ReturnTypeEditor } from "./components/ReturnTypeEditor";
import { Advanced, Path, Payload, QueryParamCollection, Resource } from "./types";
import {
  convertPathStringToSegments,
  convertPayloadStringToPayload,
  convertQueryParamStringToSegments,
  extractPayloadFromST,
  generateQueryParamFromQueryCollection,
  generateQueryParamFromST,
  genrateBallerinaQueryParams,
  genrateBallerinaResourcePath,
  getBallerinaPayloadType,
  getReturnType,
  isCallerParamAvailable,
  isRequestParamAvailable
} from "./util";

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
  const { modifyTrigger, modifyDiagram } = useContext(DiagramContext).callbacks;
  const { state } = useContext(Context);
  const {
    isMutationProgress: isFileSaving,
    isLoadingSuccess: isFileSaved,
    syntaxTree,
    connectionData,
    onEvent
  } = state;
  const model: FunctionDefinition = syntaxTree as FunctionDefinition;
  const body: FunctionBodyBlock = model?.functionBody as FunctionBodyBlock;
  const isEmptySource = (body?.statements.length < 1) || (body?.statements === undefined);
  const { position, onWizardComplete, onClose, method, path, triggerType,
    // todo: handle dispatch
    // dispatchGoToNextTourStep
  } = props;
  const classes = useStyles();
  const returnClasses = returnStyles();
  const intl = useIntl();

  const [resources, setResources] = useState<Resource[]>([]);
  const [isNewService, setIsNewService] = useState(true);
  // const [currentMethod, setCurrentMethod] = useState<ServiceMethodType>(method || "GET");
  const [currentMethod, setCurrentMethod] = useState<string>(method || "GET");
  const [currentPath, setCurrentPath] = useState<string>(path || "");
  const [returnType, setReturnType] = useState<string>("");
  const [callerChecked, setCallerChecked] = useState<boolean>(false);
  const [triggerChanged, setTriggerChanged] = useState(false);

  const [showPathUI, setShowPathUI] = useState(new Map([[0, false]]));
  const [toggle, setToggle] = useState(false);
  const [payloadAvailable, setPayloadAvailable] = useState(false);

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
      const { functionName, relativeResourcePath, functionSignature } = syntaxTree as FunctionDefinition;
      const queryParam: string = generateQueryParamFromST(functionSignature?.parameters);
      const payload: string = extractPayloadFromST(functionSignature?.parameters);
      const callerParam: boolean = isCallerParamAvailable(functionSignature?.parameters);
      const requestParam: boolean = isRequestParamAvailable(functionSignature?.parameters);
      const returnTypeDesc: string = getReturnType(functionSignature?.returnTypeDesc);
      const stMethod: string = functionName?.value;
      const stPath: string = getPathOfResources(relativeResourcePath) || "";

      const resourceMembers: Resource[] = [];
      if (resources.length === 0) {
        if (stMethod && stPath) {
          resourceMembers.push({ id: 0, method: stMethod.toUpperCase(), path: stPath, queryParams: queryParam, payload, isCaller: callerParam, isRequest: requestParam, returnType: returnTypeDesc });
          setResources(resourceMembers);
          if (payload && payload !== "") {
            setPayloadAvailable(true);
          }
        } else {
          const defaultConfig: Resource = { id: resources.length, method: "GET", path: "" };
          resourceMembers.push(defaultConfig);
          setResources(resourceMembers);
        }
      }
    }
  }, [syntaxTree]);

  const onPathUIToggleSelect = (index: number, checked: boolean) => {
    showPathUI.set(index, !checked);
    setShowPathUI(showPathUI);
    setToggle(!toggle);
  }

  const onPayloadToggleSelect = (checked: boolean) => {
    setPayloadAvailable(!checked);
  }

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

    const formattedPath: Resource = extractPathData(text);

    // Update path
    const updatedResources = resources;
    updatedResources[index].path = formattedPath.path;
    updatedResources[index].queryParams = formattedPath.queryParams;
    setResources(updatedResources);
  }

  function handleOnChangePathFromUI(text: string, index: number) {
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

  function handleOnChangeReturnTypeFormUI(text: string, index: number) {
    setReturnType(text);
    const updatedResources = resources;
    updatedResources[index].returnType = text;
    setResources(updatedResources);
  }

  function handleOnChangeQueryParamFromUI(text: string, index: number) {
    setCurrentPath(text);
    if (text === 'hello') {
      // todo: handle dispatch
      // dispatchGoToNextTourStep("CONFIG_HTTP_PATH");
    }

    const queryParams: QueryParamCollection = convertQueryParamStringToSegments(text);

    // Update path
    const updatedResources = resources;
    updatedResources[index].queryParams = generateQueryParamFromQueryCollection(queryParams);
    setResources(updatedResources);
  }

  function handleOnChangePayloadFromUI(segment: Payload, index: number) {
    // Update path
    const updatedResources = resources;
    updatedResources[index].payload = getBallerinaPayloadType(segment);
    setResources(updatedResources);
  }

  function handleOnChangeAdvancedUI(advanced: Advanced, index: number) {
    // Update path
    const updatedResources = resources;
    updatedResources[index].isCaller = advanced.isCaller;
    updatedResources[index].isRequest = advanced.isRequest;
    setResources(updatedResources);
    setCallerChecked(advanced.isCaller);
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
    handleUpdateResources();
  };

  const handleUpdateResources = () => {
    if (isNewService) {
      // dispatch and close the wizard
      setTriggerChanged(true);

      modifyTrigger(TRIGGER_TYPE_API, undefined, {
        "PORT": 8090,
        "BASE_PATH": "/",
        "RES_PATH": currentPath,
        "METHODS": currentMethod.toLocaleLowerCase(),
        "RESOURCES": resources.map((res) => {
          const payload: Payload = convertPayloadStringToPayload(res.payload);
          const queryParams: QueryParamCollection = convertQueryParamStringToSegments(res.queryParams);
          return {
            "PATH": res.path,
            "QUERY_PARAM": genrateBallerinaQueryParams(queryParams, (res.isCaller || res.isRequest || (res.payload && res.payload !== ""))),
            "METHOD": res.method.toLowerCase(),
            "PAYLOAD": res.payload ? getBallerinaPayloadType(payload, (res.isCaller || res.isRequest)) : "",
            "ADD_CALLER": res.isCaller,
            "ADD_REQUEST": res.isRequest,
            "ADD_RETURN": res.returnType
          }
        })
      });
      const event: LowcodeEvent = {
        type: EVENT_TYPE_AZURE_APP_INSIGHTS,
        name: TRIGGER_SELECTED_INSIGHTS,
        property: "API"
      };
      onEvent(event);
      // todo: handle dispatch
      // dispatchGoToNextTourStep("CONFIG_SAVE");
    } else {
      const mutations: any[] = [];
      const updatePosition: any = {
        startLine: model.functionName.position.startLine,
        startColumn: model.functionName.position.startColumn,
        endLine: model.functionSignature.position.endLine,
        endColumn: model.functionSignature.position.endColumn
      }
      const selectedResource = resources[0];
      if (selectedResource.queryParams) {
        const queryParams: QueryParamCollection = convertQueryParamStringToSegments(selectedResource.queryParams);
        selectedResource.queryParams = genrateBallerinaQueryParams(queryParams, (selectedResource.isCaller || selectedResource.isRequest || (selectedResource.payload && selectedResource.payload !== "")));
      }

      if (selectedResource.payload && selectedResource.payload !== "") {
        const payload: Payload = convertPayloadStringToPayload(selectedResource.payload);
        selectedResource.payload = getBallerinaPayloadType(payload, (selectedResource.isCaller || selectedResource.isRequest));
      }

      mutations.push(updateResourceSignature(selectedResource.method.toLocaleLowerCase(), selectedResource.path,
        selectedResource.queryParams, (payloadAvailable ? selectedResource.payload : ""), selectedResource.isCaller,
        selectedResource.isRequest, selectedResource.returnType, updatePosition));

      setTriggerChanged(true);
      modifyDiagram(mutations);
    }
  };

  const handleAddResource = () => {
    const defaultConfig: Resource = { id: resources.length, method: "GET", path: "" };
    setResources([...resources, defaultConfig]);
    setShowPathUI(showPathUI.set(resources.length, false));
  }

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

  const pathSegmentTitle = intl.formatMessage({
    id: "lowcode.develop.apiConfigWizard.path.segment.title",
    defaultMessage: "Path Segments"
  });

  const pathErrorMessage = intl.formatMessage({
    id: "lowcode.develop.apiConfigWizard.path.errorMessage",
    defaultMessage: "Please enter a valid path"
  });

  const pathPlaceholder = intl.formatMessage({
    id: "lowcode.develop.apiConfigWizard.path.placeholder",
    defaultMessage: "Relative path from host"
  });

  const queryParamTitle = intl.formatMessage({
    id: "lowcode.develop.apiConfigWizard.query.param.title",
    defaultMessage: "Query Parameters"
  });

  const extractPayloadTitle = intl.formatMessage({
    id: "lowcode.develop.apiConfigWizard.extract.payload.title",
    defaultMessage: "Extract Payload"
  });

  const advancedTitle = intl.formatMessage({
    id: "lowcode.develop.apiConfigWizard.advanced.title",
    defaultMessage: "Advanced"
  });

  const returnTypeTitle = intl.formatMessage({
    id: "lowcode.develop.apiConfigWizard.return.type.title",
    defaultMessage: "Return Type"
  });

  const saveAPIButton = intl.formatMessage({
    id: "lowcode.develop.apiConfigWizard.saveAPIButton.text",
    defaultMessage: "Save API"
  });

  const pathExample = intl.formatMessage({
    id: "lowcode.develop.apiConfigWizard.path.tooltip.example",
    defaultMessage: "/users \n/users/[string name] \n/users/[int userId]/groups"
  });

  const returnTypeExample = intl.formatMessage({
    id: "lowcode.develop.apiConfigWizard.path.tooltip.example",
    defaultMessage: "/users \n/users/[string name] \n/users/[int userId]/groups"
  });

  const title = (
    <div>
      <p>
        <FormattedMessage id="lowcode.develop.apiConfigWizard.path.instructions.tooltip" defaultMessage="A valid path should" />
      </p>
      <ul>
        <li>
          <FormattedMessage id="lowcode.develop.apiConfigWizard.path.instructions.tooltip.bulletPoint1" defaultMessage="<b>NOT</b> include spaces outside the square brackets" values={{ b: (chunks: string) => <b>{chunks}</b> }} />
        </li>
        <li>
          <FormattedMessage id="lowcode.develop.apiConfigWizard.path.instructions.tooltip.bulletPoint2" defaultMessage="<b>NOT</b> start with a numerical character" values={{ b: (chunks: string) => <b>{chunks}</b> }} />
        </li>
        <li>
          <FormattedMessage id="lowcode.develop.apiConfigWizard.path.instructions.tooltip.bulletPoint3" defaultMessage="<b>NOT</b> include keywords such as Return, Foreach, Resource, Object, etc." values={{ b: (chunks: string) => <b>{chunks}</b> }} />
        </li>
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
            <SwitchToggle initSwitch={showPathUI.get(index)} onChange={onPathUIToggleSelect.bind(this, index)} text={"Advanced"} />
            {!showPathUI.get(index) &&
            <div className={classes.sectionSeparator}>
              <Section
                  title={pathTitle}
                  tooltipWithExample={{ title, content: pathExample }}
              >
                <FormTextInput
                    dataTestId="api-path"
                    defaultValue={resProps.path + (resProps.queryParams ? resProps.queryParams : "")}
                    onChange={(text: string) => handleOnChangePath(text, index)}
                    customProps={{
                      validate: validatePath
                    }}
                    errorMessage={pathErrorMessage}
                    placeholder={pathPlaceholder}
                />
              </Section>
            </div>
            }
            {showPathUI.get(index) &&
              <div>
                <div className={classes.sectionSeparator}>
                  <Section
                    title={pathSegmentTitle}
                    tooltipWithExample={{ title, content: pathExample }}
                  >
                    <PathEditor pathString={resProps.path} defaultValue={resProps.path} onChange={(text: string) => handleOnChangePathFromUI(text, index)} />
                  </Section>
                </div>
                <div className={classes.sectionSeparator}>
                  <Section
                    title={queryParamTitle}
                    tooltipWithExample={{ title, content: pathExample }}
                  >
                    <QueryParamEditor queryParams={resProps.queryParams} onChange={(text: string) => handleOnChangeQueryParamFromUI(text, index)} />
                  </Section>
                </div>
                <div className={classes.sectionSeparator}>
                  <Section
                    title={extractPayloadTitle}
                    tooltipWithExample={{ title, content: pathExample }}
                    button={<SwitchToggle initSwitch={payloadAvailable} onChange={onPayloadToggleSelect} />}
                  >
                    <PayloadEditor disabled={!payloadAvailable} payload={resProps.payload} onChange={(segment: Payload) => handleOnChangePayloadFromUI(segment, index)} />
                  </Section>
                </div>
                <div className={classes.sectionSeparator}>
                  <Section
                    title={advancedTitle}
                    tooltipWithExample={{ title, content: pathExample }}
                  >
                    <AdvancedEditor isCaller={resProps.isCaller} isRequest={resProps.isRequest} onChange={(segment: Advanced) => handleOnChangeAdvancedUI(segment, index)} />
                  </Section>
                </div>
                
              </div>
            }
              <Section
                  title={returnTypeTitle}
              >
                <div className={returnClasses.toggleWrapper}>
                  <SwitchToggle className={returnClasses.toggleTitle} initSwitch={true} onChange={null} text={"Advanced"} />
                </div>
                <ReturnTypeEditor returnTypeString={resProps.returnType} defaultValue={resProps.returnType} isCaller={resProps.isCaller} onChange={(text: string) => handleOnChangeReturnTypeFormUI(text, index)} />
              </Section>
            {/*

            <div className={classes.sectionSeparator}>
              <Section
                title={extractPayloadTitle}
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

            <Section
              title={returnTypeTitle}
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
            </Section> */}
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
        </div>
      </ConfigPanel>
    </DiagramOverlay>
  );
}

function extractPathData(text: string): Resource {
  const resource: Resource = {
    id: 0,
    method: "GET",
    path: ""
  };
  const splittedPath: string[] = text.split("?");
  const path: Path = convertPathStringToSegments(splittedPath[0]);
  if (splittedPath.length > 1) {
    const queryParams: QueryParamCollection = convertQueryParamStringToSegments(splittedPath[1]);
    resource.queryParams = generateQueryParamFromQueryCollection(queryParams);
  }
  resource.id = 0;
  resource.path = genrateBallerinaResourcePath(path);
  return resource;
}
