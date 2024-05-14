/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ConditionalRouter, ConditionalRouterRoute, ConditionalRouterRouteCondition } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";

export function getConditionalRouterMustacheTemplate() {

  return `
    <conditionalRouter continueAfter="{{continueAfterRoute}}" description="{{description}}" >
        {{#conditionalRouteBranches}}
        <conditionalRoute asynchronous="true" breakRoute="{{breakAfterRoute}}" >
            <condition>{{{evaluatorExpression}}}</condition>
            <target sequence="{{{targetSequence}}}" />
        </conditionalRoute>
        {{/conditionalRouteBranches}}
    </conditionalRouter>
    `;
}

export function getConditionalRouterXml(data: { [key: string]: any }) {

  data.conditionalRouteBranches = data.conditionalRouteBranches.map((branch: string[]) => {
    return { breakAfterRoute: branch[0], targetSequence: branch[1], evaluatorExpression: branch[2] }
  })

  const output = Mustache.render(getConditionalRouterMustacheTemplate(), data)?.trim();
  return output;
}


export function getConditionalRouterFormDataFromSTNode(data: { [key: string]: any }, node: ConditionalRouter) {

  data.continueAfterRoute = node.continueAfter;
  if (node.conditionalRoute) {
    data.conditionalRouteBranches = node.conditionalRoute.map((route) => {
      const condition = getConditionXml(route.condition);
      return [route.breakRoute, route.target.sequenceAttribute, condition];
    });
  }

  data.conditionalRouteBranches = data.conditionalRouteBranches ? data.conditionalRouteBranches : [];
  data.description = node.description;
  return data;
}

function getConditionXml(condition: ConditionalRouterRouteCondition) {
  let conditionXml: string
  if (condition?.equal) {
    const data = {
      type: condition.equal.type,
      source: condition.equal.source,
      value: condition.equal.value
    }
    const conditionMustacheTemplate = `<equal  type="{{type}}" source="{{source}}" value="{{value}}"/>`;
    conditionXml = Mustache.render(conditionMustacheTemplate, data);
  }
  return conditionXml;

}
