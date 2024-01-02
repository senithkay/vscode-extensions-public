/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import Mustache from "mustache";
import { getMustacheTemplate } from "../templateUtils";
import { MEDIATORS } from "../../../../constants";
import { CallTemplate } from "@wso2-enterprise/mi-syntax-tree/lib/src";

export function getCallTemplateXml(data: { [key: string]: any }) {
  const parameterName = data.parameterNameTable.map((property: string[]) => {
    return {
      parameterName: property[0],
      parameterValue: property[2]
    }
  });
  const modifiedData = {
    ...data,
    parameterName
  }

  return Mustache.render(getMustacheTemplate(MEDIATORS.CALLTEMPLATE), modifiedData);
}

export function getCallTemplateFormDataFromSTNode(data: { [key: string]: any }, node: CallTemplate) {
  if (node.withParam) {
    data.parameterNameTable = node.withParam.map((property) => {
      return [property.name, property.value ? "LITERAL" : "EXPRESSION", property.value];
    });
  }

  return data;
}
