/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import Mustache from "mustache";
import { MEDIATORS } from "../../../../constants";
import { getMustacheTemplate } from "../templateUtils";

export function getCallXml(data: { [key: string]: any }) {
  let bodySource;
  let propertySource;
  let bodyTarget;
  let propertyTarget;
  if (data.sourceType === 'body') {
    bodySource = true; // Set a flag for bodySource if sourceType is 'body'
  } else {
    propertySource = true; // Set a flag for propertySource otherwise
  }
  if (data.targetType === "body") {
    bodyTarget = true;
  } else {
    propertyTarget = true;
  }
  const modifiedData = {
    ...data,
    bodySource: bodySource,
    propertySource: propertySource,
    bodyTarget: bodyTarget,
    propertyTarget: propertyTarget
  }

  return Mustache.render(getMustacheTemplate(MEDIATORS.CALL), modifiedData)
}
