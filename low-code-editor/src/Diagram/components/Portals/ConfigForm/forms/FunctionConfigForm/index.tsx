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
// tslint:disable: jsx-no-lambda
// tslint:disable: jsx-no-multiline-js
import React, { useState } from "react";

import { STNode } from "@ballerina/syntax-tree";
import { Box, FormControl, Typography } from "@material-ui/core";

import { AddIcon, FunctionIcon } from "../../../../../../assets/icons";
import ConfigPanel, { Section } from "../../../../../../components/ConfigPanel";
import { useDiagramContext } from "../../../../../../Contexts/Diagram";
import { STModification } from "../../../../../../Definitions";
import { createFunctionSignature } from "../../../../../utils/modification-util";
import { DraftUpdatePosition } from "../../../../../view-state/draft";
import { QueryParamItem as FunctionParamItem } from "../../../Overlay/Elements/DropDown/ApiConfigureWizard/components/queryParamEditor/queryParamItem";
import { QueryParamSegmentEditor as FunctionParamSegmentEditor } from "../../../Overlay/Elements/DropDown/ApiConfigureWizard/components/queryParamEditor/segmentEditor";
import { ReturnTypeItem } from "../../../Overlay/Elements/DropDown/ApiConfigureWizard/components/ReturnTypeEditor/ReturnTypeItem";
import { ReturnTypeSegmentEditor } from "../../../Overlay/Elements/DropDown/ApiConfigureWizard/components/ReturnTypeEditor/SegmentEditor";
import {
  QueryParam,
  ReturnType,
} from "../../../Overlay/Elements/DropDown/ApiConfigureWizard/types";
import { functionParamTypes } from "../../../Overlay/Elements/DropDown/ApiConfigureWizard/util";
import { PrimaryButton } from "../../Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../Elements/Button/SecondaryButton";
import { FormTextInput } from "../../Elements/TextField/FormTextInput";
import { useStyles as useFormStyles } from "../style";

interface FunctionConfigFormProps {
  model?: STNode;
  targetPosition?: DraftUpdatePosition;
  onCancel: () => void;
  onSave: (modifications: STModification[]) => void;
}

export function FunctionConfigForm(props: FunctionConfigFormProps) {
  const formClasses = useFormStyles();
  const { targetPosition, onSave, onCancel } = props;
  const [functionName, setFunctionName] = useState("");
  const [parameters, setParameters] = useState<QueryParam[]>([]);
  const [returnTypes, setReturnTypes] = useState<ReturnType[]>([]);
  const [addingNewParam, setAddingNewParam] = useState(false);
  const [addingNewReturnType, setAddingNewReturnType] = useState(false);
  const {
    props: { syntaxTree },
  } = useDiagramContext();
  const existingFunctionNames = (syntaxTree as any).members.map(
    (member: any) => member.functionName.value
  );
  const disableSaveBtn =
    !!!functionName || existingFunctionNames.includes(functionName);

  const handleOnSave = () => {
    const parametersStr = parameters
      .map((item) => `${item.type} ${item.name}`)
      .join(",");
    const returnType = returnTypes
      .map((item) => `${item.type}${item.isOptional ? "?" : ""}`)
      .join("|");
    const returnTypeStr = returnType ? `returns ${returnType}` : "";
    const modification = createFunctionSignature(
      functionName,
      parametersStr,
      returnTypeStr,
      { line: targetPosition.startLine, column: 0 }
    );
    onSave([modification]);
  };

  return (
    <FormControl
      data-testid="log-form"
      className={formClasses.wizardFormControl}
    >
      <div className={formClasses.formTitleWrapper}>
        <div className={formClasses.mainTitleWrapper}>
          <FunctionIcon color={"#CBCEDB"} />
          <Typography variant="h4">
            <Box paddingLeft={2} paddingY={2}>
              Function
            </Box>
          </Typography>
        </div>
      </div>

      <div className={formClasses.sectionSeparator}>
        <Section title={"Function Name"}>
          <FormTextInput
            dataTestId="function-name"
            defaultValue={functionName}
            onChange={(text: string) => setFunctionName(text)}
            placeholder="Enter function name"
            customProps={{
              isErrored: existingFunctionNames.includes(functionName),
            }}
            errorMessage="Function name already exists"
          />
        </Section>
      </div>

      <div className={formClasses.sectionSeparator}>
        <Section title={"Parameters"}>
          {parameters.map((param) => (
            <FunctionParamItem
              key={param.id}
              queryParam={param}
              onDelete={(paramItem: QueryParam) =>
                setParameters(
                  parameters.filter((item) => item.id !== paramItem.id)
                )
              }
            />
          ))}
          {addingNewParam ? (
            <FunctionParamSegmentEditor
              id={parameters.length}
              onCancel={() => setAddingNewParam(false)}
              types={functionParamTypes}
              onSave={(param: QueryParam) => {
                setParameters([...parameters, param]);
                setAddingNewParam(false);
              }}
            />
          ) : (
            <span
              onClick={() => setAddingNewParam(true)}
              className={formClasses.addPropertyBtn}
            >
              <AddIcon />
              <p>Add parameter</p>
            </span>
          )}
        </Section>
      </div>

      <div className={formClasses.sectionSeparator}>
        <Section title={"Return Type"}>
          {returnTypes.map((returnType) => (
            <ReturnTypeItem
              key={returnType.id}
              returnType={returnType}
              onDelete={(returnItem: ReturnType) =>
                setReturnTypes(
                  returnTypes.filter((item) => item.id !== returnItem.id)
                )
              }
            />
          ))}
          {addingNewReturnType ? (
            <ReturnTypeSegmentEditor
              id={returnTypes.length}
              showDefaultError={false}
              onCancel={() => setAddingNewReturnType(false)}
              onSave={(item: ReturnType) => {
                setReturnTypes([...returnTypes, item]);
                setAddingNewReturnType(false);
              }}
            />
          ) : (
            <span
              onClick={() => setAddingNewReturnType(true)}
              className={formClasses.addPropertyBtn}
            >
              <AddIcon />
              <p>Add return type</p>
            </span>
          )}
        </Section>
      </div>

      <div className={formClasses.wizardBtnHolder}>
        <SecondaryButton text="Cancel" fullWidth={false} onClick={onCancel} />
        <PrimaryButton
          text="Save"
          disabled={disableSaveBtn}
          fullWidth={false}
          onClick={handleOnSave}
        />
      </div>
    </FormControl>
  );
}
