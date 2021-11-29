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

import {
  CommaToken,
  DefaultableParam,
  IncludedRecordParam,
  RequiredParam,
  RestParam,
  STKindChecker,
} from "@wso2-enterprise/syntax-tree";

import "./style.scss";

interface ResourceOtherParamsProps {
  parameters: (
    | CommaToken
    | DefaultableParam
    | IncludedRecordParam
    | RequiredParam
    | RestParam
  )[];
}

export function ResourceOtherParams(props: ResourceOtherParamsProps) {
  const { parameters } = props;

  const otherParamComponents = parameters
    .filter((param) => !STKindChecker.isCommaToken(param))
    .filter(
      (param) =>
        STKindChecker.isRequiredParam(param) &&
        !(
          STKindChecker.isStringTypeDesc(param.typeName) ||
          STKindChecker.isIntTypeDesc(param.typeName) ||
          STKindChecker.isBooleanTypeDesc(param.typeName) ||
          STKindChecker.isFloatTypeDesc(param.typeName) ||
          STKindChecker.isDecimalTypeDesc(param.typeName)
        )
    )
    .map((param: RequiredParam, i) => (
      <span key={i} className={"signature-param"}>
        {param.source}
      </span>
    ));

  return (
    <div className={"param-container"}>
      <p className={"path-text"}>{otherParamComponents}</p>
    </div>
  );
}
