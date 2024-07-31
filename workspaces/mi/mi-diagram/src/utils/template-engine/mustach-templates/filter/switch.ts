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
    <switch {{#description}}description="{{description}}"{{/description}} {{#sourceXPath}}source="{{value}}"{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}}{{/sourceXPath}} >
        {{#caseBranches}}
        <case regex="{{caseRegex}}"></case>
        {{/caseBranches}}
        <default></default>
    </switch>
    {{/isNewMediator}}
    {{^isNewMediator}}
    {{#editSwitch}}
    {{#switchSelfClosed}}
    <switch {{#description}}description="{{description}}"{{/description}} {{#sourceXPath}}source="{{value}}"{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}}{{/sourceXPath}} />
    {{/switchSelfClosed}}
    {{^switchSelfClosed}}
    <switch {{#description}}description="{{description}}"{{/description}} {{#sourceXPath}}source="{{value}}"{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}}{{/sourceXPath}}>
    {{/switchSelfClosed}}
    {{/editSwitch}}
    {{#newCase}}
    <case regex="{{caseRegex}}"></case>
    {{/newCase}}
    {{#editCase}}
    {{#caseSelfClosed}}
    <case regex="{{caseRegex}}"></case>
    {{/caseSelfClosed}}
    {{^caseSelfClosed}}
    <case regex="{{caseRegex}}" >
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

  //Edit switch tag.
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

  // Add or update existing cases.
  if (dirtyFields.caseBranches) {
    for (let i = 0; i < data.caseBranches.length; i++) {
      dataCopy = { ...data };
      dataCopy.caseRegex = data.caseBranches[i][0];
      let oldIndex = data.caseBranches[i][1];
      let editRange;
      if (oldIndex != undefined) {
        dataCopy.editCase = true;
        let oldCaseData = getOldCaseData(defaultValues.caseBranchesData, oldIndex);
        dataCopy.caseSelfClosed = oldCaseData[3];
        editRange = oldCaseData[2].startTagRange
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

    // Delete removed cases from xml
    const removedCases = filterRemovedElements(defaultValues.caseBranchesData, data.caseBranches);
    for (let i = 0; i < removedCases.length; i++) {
      let removedCase = removedCases[i];
      let selfClosed = removedCase[3];
      let editRange;
      if (selfClosed) {
        editRange = removedCase[2].startTagRange;
      } else {
        editRange = { start: removedCase[2].startTagRange.start, end: removedCase[2].endTagRange.end };
        edits.push({
          range: editRange,
          text: ""
        });
      }
    }
  }

  edits.sort((a, b) => b.range.start.line - a.range.start.line);
  return edits;
}

function getOldCaseData(caseBranchesData: any, index: number) {
  for (let i = 0; i < caseBranchesData.length; i++) {
    if (caseBranchesData[i][1] == index) {
      return caseBranchesData[i];
    }
  }
}

function filterRemovedElements(arr1: any[], arr2: any[]): any[] {

  const set2 = new Set(arr2.map(pair => pair[1]));
  return arr1.filter(pair => !set2.has(pair[1]));
}

export function getSwitchFormDataFromSTNode(data: { [key: string]: any }, node: Switch) {

  data.sourceXPath = { isExpression: true, value: node.source, namespaces: transformNamespaces(node.namespaces) };
  data.description = node.description;
  if (node._case) {
    data.caseBranches = node._case.map((_case) => {
      return [_case.regex, node._case.indexOf(_case)];
    });
    data.caseBranchesData = node._case.map((_case) => {
      return [_case.regex, node._case.indexOf(_case), _case.range, _case.selfClosed];
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
