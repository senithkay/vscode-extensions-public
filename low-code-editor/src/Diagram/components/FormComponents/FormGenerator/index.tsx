/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useState } from "react";

import { ConfigOverlayFormStatus, STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

import { useDiagramContext } from "../../../../Contexts/Diagram";
import { Panel } from "../../Panel";
import { UnsupportedConfirmButtons } from "../DialogBoxes/UnsupportedConfirmButtons";
import { getForm } from "../Utils";

export interface FormGeneratorProps {
  model?: STNode;
  targetPosition?: NodePosition;
  onCancel?: () => void;
  onSave?: () => void;
  configOverlayFormStatus: ConfigOverlayFormStatus; // FixMe : There are lot of unwanted properties passed through
  // this model clean up or remove this
}

export interface InjectableItem {
  id: string;
  modification: STModification;
  name?: string;
  value?: string;
}

export interface ExpressionInjectablesProps {
  list: InjectableItem[];
  setInjectables: (InjectableItem: InjectableItem[]) => void;
}

export function FormGenerator(props: FormGeneratorProps) {
  const {
    api: {
      code: { gotoSource },
    },
  } = useDiagramContext();
  const [injectables, setInjectables] = useState<InjectableItem[]>([]);
  const { onCancel, configOverlayFormStatus, targetPosition, ...restProps } = props;
  const { isLastMember, formType } = configOverlayFormStatus;
  const expressionInjectables: ExpressionInjectablesProps = {
    list: injectables,
    setInjectables,
  };
  if (configOverlayFormStatus.formArgs) {
    configOverlayFormStatus.formArgs.expressionInjectables = expressionInjectables;
  }
  const args = { onCancel, configOverlayFormStatus, formType, targetPosition, isLastMember, ...restProps }; // FixMe: Sort out form args

  const handleConfirm = () => {
    onCancel();
    gotoSource({ startLine: targetPosition.startLine, startColumn: targetPosition.startColumn });
  }

  let unsupportedType = false;
  switch (formType) {
    case "ClassDefinition" :
    case "ObjectField":
    case "ObjectMethodDefinition":
      unsupportedType = true;
      break;
  }

  return (
    <div>
      {unsupportedType ? (
        <UnsupportedConfirmButtons onConfirm={handleConfirm} onCancel={onCancel} />
      ) : (
        <Panel onClose={onCancel}>
          <div className="form-generator">{getForm(formType, args)}</div>
        </Panel>
      )}
    </div>
  );
}
