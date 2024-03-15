/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Switch } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";

export function getSwitchMustacheTemplate() {

  return `
    {{#isNewMediator}}
    <switch {{#description}}description="{{description}}"{{/description}} {{#sourceXPath}}source="{{sourceXPath}}"{{/sourceXPath}} >
        {{#caseBranches}}
        <case regex="{{caseRegex}}" />
        {{/caseBranches}}
        <default />
    </switch>
    {{/isNewMediator}}
    {{^isNewMediator}}
    {{#editSwitch}}
    {{#switchSelfClosed}}
    <switch {{#description}}description="{{description}}"{{/description}} {{#sourceXPath}}source="{{sourceXPath}}"{{/sourceXPath}} />
    {{/switchSelfClosed}}
    {{^switchSelfClosed}}
    <switch {{#description}}description="{{description}}"{{/description}} {{#sourceXPath}}source="{{sourceXPath}}"{{/sourceXPath}}>
    {{/switchSelfClosed}}
    {{/editSwitch}}
    {{#newCase}}
    <case regex="{{caseRegex}}" />
    {{/newCase}}
    {{#editCase}}
    {{#caseSelfClosed}}
    <case regex="{{caseRegex}}" />
    {{/caseSelfClosed}}
    {{^caseSelfClosed}}
    <case regex="{{caseRegex}}" >
    {{/caseSelfClosed}}
    {{/editCase}}
    {{/isNewMediator}}    
    `;
}

export function getSwitchXml(data: { [key: string]: any }) {

  if (data.caseBranches) {
    data.caseBranches = data.caseBranches.map((_case: string[]) => {
      return { caseRegex: _case[0] }
    });
  }
  const output = Mustache.render(getSwitchMustacheTemplate(), data)?.trim();
  return output;
}


export function getSwitchFormDataFromSTNode(data: { [key: string]: any }, node: Switch) {

  data.sourceXPath = node.source;
  data.description = node.description;
  if (node._case) {
    data.caseBranches = node._case.map((_case) => {
      return [_case.regex, _case.range, _case.selfClosed];
    });
  }
  data.ranges = {
    switch: node.range,
    lastCase: node._case[node._case.length - 1]?.range
  }
  data.switchSelfClosed = node.selfClosed;
  return data;
}
