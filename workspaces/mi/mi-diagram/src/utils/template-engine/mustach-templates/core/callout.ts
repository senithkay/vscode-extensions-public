/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import Mustache from "mustache";
import { Callout } from "@wso2-enterprise/mi-syntax-tree/lib/src";

export function getCalloutMustacheTemplate() {
  return `<callout{{#serviceURL}} serviceURL="{{serviceURL}}"{{/serviceURL}}{{#soapAction}} action="{{soapAction}}"{{/soapAction}}{{#initAxis2ClientOptions}} initAxis2ClientOptions="{{initAxis2ClientOptions}}"{{/initAxis2ClientOptions}}{{#addressEndpoint}} endpointKey="{{addressEndpoint}}"{{/addressEndpoint}}{{#description}} description="{{description}}"{{/description}}>
  {{#configurationEnabled}}
  <configuration axis2xml="{{pathToAxis2xml}}" repository="{{pathToAxis2Repository}}"/>
  {{/configurationEnabled}}
  {{#xpathPayload}}
  <source xpath="{{payloadMessageXPath}}"/>
  {{/xpathPayload}}
  {{#propertyPayload}}
  <source key="{{payloadProperty}}"/>
  {{/propertyPayload}}
  {{#envelopePayload}}
  <source type="envelope"/>
  {{/envelopePayload}}
  {{#xpathTarget}}
  <target xpath="{{targetMessageXPath}}"/>
  {{/xpathTarget}}
  {{#propertyTarget}}
  <target key="{{targetProperty}}"/>
  {{/propertyTarget}}
  {{#securityEnabled}}
  {{#policies}}
  <enableSec inboundPolicy="{{inboundPolicyKey}}" outboundPolicy="{{outboundPolicyKey}}"/>
  {{/policies}}
  {{^policies}}
  <enableSec policy="{{policyKey}}"/>
  {{/policies}}
  {{/securityEnabled}}
</callout>`
}

export function getCalloutXml(data: { [key: string]: any }) {
  let xpathPayload = data.payloadType === "XPATH";
  let propertyPayload = data.payloadType === "PROPERTY";
  let envelopePayload = data.payloadType === "ENVELOPE";
  let xpathTarget = data.targetType === "XPATH";
  let propertyTarget = data.targetType === "PROPERTY";
  let securityEnabled = data.securityType === "TRUE";
  let configurationEnabled = data.pathToAxis2Repository ?? data.pathToAxis2Xml !== null;
  let policies = data.policies === "TRUE";
  const modifiedData = {
    ...data,
    xpathPayload: xpathPayload,
    propertyPayload: propertyPayload,
    envelopePayload: envelopePayload,
    xpathTarget: xpathTarget,
    propertyTarget: propertyTarget,
    securityEnabled: securityEnabled,
    configurationEnabled: configurationEnabled,
    policies: policies,
  }

  return Mustache.render(getCalloutMustacheTemplate(), modifiedData);
}

export function getCalloutFormDataFromSTNode(data: { [key: string]: any }, node: Callout) {
  if (node.serviceURL) {
    data.endpointType = "URL";
  }
  if (node.endpointKey) {
    data.endpointType = "AddressEndpoint";
  }
  if (node.sourceOrTargetOrConfiguration) {
    const sourceOrTargetOrConfiguration = (node.sourceOrTargetOrConfiguration as any);

    if (sourceOrTargetOrConfiguration?.configuration?.value?.repository) {
      data.pathToAxis2Repository = sourceOrTargetOrConfiguration.configuration?.value?.repository;
    }
    if (sourceOrTargetOrConfiguration?.configuration?.value?.axis2Xml) {
      data.pathToAxis2xml = sourceOrTargetOrConfiguration.configuration.value.axis2Xml;
    }

    if (sourceOrTargetOrConfiguration.source.value.key) {
      data.payloadType = "PROPERTY";
      data.payloadProperty = sourceOrTargetOrConfiguration.source.value.key;
    }

    if (sourceOrTargetOrConfiguration.enableSec) {
      data.securityType = "TRUE";

      if (sourceOrTargetOrConfiguration.enableSec?.value?.policy) {
        data.policies = "FALSE";
        data.policyKey = sourceOrTargetOrConfiguration.enableSec.value.policy;
      } else {
        data.policies = "TRUE";
        if (sourceOrTargetOrConfiguration.enableSec?.value?.inboundPolicy) {
          data.inboundPolicyKey = sourceOrTargetOrConfiguration.enableSec.value.inboundPolicy;
        }
        if (sourceOrTargetOrConfiguration.enableSec?.value?.outboundPolicy) {
          data.outboundPolicyKey = sourceOrTargetOrConfiguration.enableSec.value.outboundPolicy;
        }
      }
    }
  }

  return data;
}
