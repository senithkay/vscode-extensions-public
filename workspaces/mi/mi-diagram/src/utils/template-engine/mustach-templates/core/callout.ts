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

export function getCalloutXml(data: { [key: string]: any }) {
  let xpathPayload = data.payloadType === "XPATH";
  let propertyPayload = data.payloadType === "PROPERTY";
  let envelopePayload = data.payloadType === "ENVELOPE";
  let xpathTarget = data.targetType === "XPATH";
  let propertyTarget = data.targetType === "PROPERTY";
  let securityEnabled = data.securityType === "FALSE";
  let configurationEnabled = data.pathToAxis2Repository ?? data.pathToAxis2Xml !== null;
  const modifiedData = {
    ...data,
    xpathPayload: xpathPayload,
    propertyPayload: propertyPayload,
    envelopePayload: envelopePayload,
    xpathTarget: xpathTarget,
    propertyTarget: propertyTarget,
    securityEnabled: securityEnabled,
    configurationEnabled: configurationEnabled
  }

  return Mustache.render(getMustacheTemplate(MEDIATORS.CALLOUT), modifiedData);
}