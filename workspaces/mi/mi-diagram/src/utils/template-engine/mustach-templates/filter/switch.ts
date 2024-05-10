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
import { transformNamespaces } from "../../../commons";

export function getSwitchMustacheTemplate() {

  return `
    {{#isNewMediator}}
    <switch {{#description}}description="{{description}}"{{/description}} {{#sourceXPath}}source="{{{value}}}"{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}}{{/sourceXPath}} >
        {{#caseBranches}}
        <case regex="{{{caseRegex}}}"></case>
        {{/caseBranches}}
        <default></default>
    </switch>
    {{/isNewMediator}}
    {{^isNewMediator}}
    {{#editSwitch}}
    {{#switchSelfClosed}}
    <switch {{#description}}description="{{description}}"{{/description}} {{#sourceXPath}}source="{{{value}}}"{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}}{{/sourceXPath}} />
    {{/switchSelfClosed}}
    {{^switchSelfClosed}}
    <switch {{#description}}description="{{description}}"{{/description}} {{#sourceXPath}}source="{{{value}}}"{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}}{{/sourceXPath}}>
    {{/switchSelfClosed}}
    {{/editSwitch}}
    {{#newCase}}
    <case regex="{{{caseRegex}}}"></case>
    {{/newCase}}
    {{#editCase}}
    {{#caseSelfClosed}}
    <case regex="{{{caseRegex}}}"></case>
    {{/caseSelfClosed}}
    {{^caseSelfClosed}}
    <case regex="{{{caseRegex}}}" >
    {{/caseSelfClosed}}
    {{/editCase}}
    {{/isNewMediator}}    
    `;
}

export function getSwitchXml(data: { [key: string]: any }, dirtyFields?: any, defaultValues?: any) {

  if (defaultValues === undefined || Object.keys(defaultValues).length == 0) {
    data.isNewMediator = true;
    if (data.caseBranches) {
      data.caseBranches = data.caseBranches.map((_case: string[]) => {
        return { caseRegex: _case[0] }
      });
    }
    const output = Mustache.render(getSwitchMustacheTemplate(), data)?.trim();
    return output;
  }
  return getEdits(data, dirtyFields, defaultValues);
}

function getEdits(data: { [key: string]: any }, dirtyFields: any, defaultValues: any) {
  let edits: { [key: string]: any }[] = [];
  let dataCopy;
  if (dirtyFields.sourceXPath || dirtyFields.description) {
    dataCopy = { ...data }
    dataCopy.editSwitch = true;
    dataCopy.switchSelfClosed = defaultValues.switchSelfClosed;
    let output = Mustache.render(getSwitchMustacheTemplate(), dataCopy)?.trim();
    edits.push({
      range: defaultValues.ranges.switch.startTagRange,
      text: output
    });
  }
  if (dirtyFields.caseBranches) {
    for (let i = 0; i < data.caseBranches.length; i++) {
      dataCopy = { ...data };
      dataCopy.caseRegex = data.caseBranches[i][0];
      let editRange;
      if (defaultValues.caseBranchesData[i]) {
        dataCopy.editCase = true;
        dataCopy.caseSelfClosed = defaultValues.caseBranchesData[i][2];
        editRange = defaultValues.caseBranchesData[i][1].startTagRange
      } else {
        dataCopy.newCase = true;
        editRange = {
          start: defaultValues.ranges._default.startTagRange.start,
          end: defaultValues.ranges._default.startTagRange.start
        }
      }
      let output = Mustache.render(getSwitchMustacheTemplate(), dataCopy)?.trim();
      edits.push({
        range: editRange,
        text: output
      });

    }
  }
  edits.sort((a, b) => b.range.start.line - a.range.start.line);
  return edits;
}

export function getSwitchFormDataFromSTNode(data: { [key: string]: any }, node: Switch) {

  data.sourceXPath = { isExpression: true, value: node.source, namespaces: transformNamespaces(node.namespaces) };
  data.description = node.description;
  if (node._case) {
    data.caseBranches = node._case.map((_case) => {
      return [_case.regex];
    });
    data.caseBranchesData = node._case.map((_case) => {
      return [_case.regex, _case.range, _case.selfClosed];
    });
  }
  data.ranges = {
    switch: node.range,
    _default: node._default?.range
  }
  data.switchSelfClosed = node.selfClosed;
  return data;
}

export function getNewSwitchCaseXml(st: Switch) {
  let caseName = "case";
  let caseCount = 1;
  if (st._case) {
    caseCount = st._case.length;
  }
  if (caseCount > 0)
    caseName += caseCount;

  return `<case regex="${caseName}">
  </case>`;
}

export function getSwitchDescription(node: Switch) {
  return node.source;
}
