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
  const xpathPayload = data.payloadType === "XPATH";
  const propertyPayload = data.payloadType === "PROPERTY";
  const envelopePayload = data.payloadType === "ENVELOPE";
  const xpathTarget = data.resultType === "XPATH";
  const propertyTarget = data.resultType === "PROPERTY";
  // const targetMessageXPath = data.resultMessageXPath;
  const targetProperty = data.resultContextProperty;
  const securityEnabled = data.securityType === "TRUE";
  const configurationEnabled = data.pathToAxis2Repository ?? data.pathToAxis2Xml !== null;
  const policies = data.policies === "TRUE";

  if (xpathPayload) {
    data.payloadMessageXPath = data.payloadMessageXPath?.value;
  }
  if (xpathTarget) {
    data.targetMessageXPath = data.resultMessageXPath?.value;
  }
  const modifiedData = {
    ...data,
    xpathPayload: xpathPayload,
    propertyPayload: propertyPayload,
    envelopePayload: envelopePayload,
    xpathTarget: xpathTarget,
    propertyTarget: propertyTarget,
    securityEnabled: securityEnabled,
    configurationEnabled: configurationEnabled,
    targetProperty: targetProperty,
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
    const sourceOrTargetOrConfiguration = node?.sourceOrTargetOrConfiguration

    if (sourceOrTargetOrConfiguration?.configuration?.repository) {
      data.pathToAxis2Repository = sourceOrTargetOrConfiguration.configuration.repository;
    }
    if (sourceOrTargetOrConfiguration?.configuration?.axis2Xml) {
      data.pathToAxis2xml = sourceOrTargetOrConfiguration.configuration.axis2Xml;
    }

    if (sourceOrTargetOrConfiguration.source) {
      if (sourceOrTargetOrConfiguration.source.key) {
        data.payloadType = "PROPERTY";
        data.payloadProperty = sourceOrTargetOrConfiguration.source.key;
      } else if (sourceOrTargetOrConfiguration.source.xpath) {
        data.payloadType = "XPATH";
        data.payloadMessageXPath = { isExpression: true, value: sourceOrTargetOrConfiguration.source.xpath };
      } else {
        data.payloadType = "ENVELOPE";
      }
    }
    if (sourceOrTargetOrConfiguration.target) {
      if (sourceOrTargetOrConfiguration.target.key) {
        data.resultType = "PROPERTY";
        data.resultContextProperty = sourceOrTargetOrConfiguration.target.key;
      } else if (sourceOrTargetOrConfiguration.target.xpath) {
        data.resultType = "XPATH";
        data.resultMessageXPath = { isExpression: true, value: sourceOrTargetOrConfiguration.target.key };
      }
    }
    data.securityType = "FALSE";
    if (sourceOrTargetOrConfiguration.enableSec) {
      data.securityType = "TRUE";

      if (sourceOrTargetOrConfiguration.enableSec?.policy) {
        data.policies = "FALSE";
        data.policyKey = sourceOrTargetOrConfiguration.enableSec.policy;
      } else {
        data.policies = "TRUE";
        if (sourceOrTargetOrConfiguration.enableSec?.inboundPolicy) {
          data.inboundPolicyKey = sourceOrTargetOrConfiguration.enableSec.inboundPolicy;
        }
        if (sourceOrTargetOrConfiguration.enableSec?.outboundPolicy) {
          data.outboundPolicyKey = sourceOrTargetOrConfiguration.enableSec.outboundPolicy;
        }
      }
    }
  }

  return data;
}
