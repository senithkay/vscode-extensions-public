/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Xslt } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";
import { features } from "process";

export function getXsltMustacheTemplate() {

  return `
    <xslt {{#description}}description="{{description}}"{{/description}} {{#xsltSchemaKey}}key="{{xsltSchemaKey}}"{{/xsltSchemaKey}} {{#sourceXPath}}source="{{sourceXPath}}"{{/sourceXPath}} >
        {{#properties}}
        <property name="{{propertyName}}" {{#propertyValue}}value="{{propertyValue}}"{{/propertyValue}} {{#propertyExpression}}expression="{{propertyExpression}}"{{/propertyExpression}} />
        {{/properties}}
        {{#features}}
        <feature name="{{featureName}}" value="{{featureEnabled}}"/>
        {{/features}}
        {{#resources}}
        <resource key="{{resourceRegistryKey}}" location="{{location}}"/>
        {{/resources}}
    </xslt>
    `;
}

export function getXsltXml(data: { [key: string]: any }) {

  data.sourceXPath = data?.sourceXPath?.value;
  data.properties = data.properties?.map((property: any[]) => {
    return {
      propertyName: property[0],
      propertyValue: property[1]?.isExpression ? undefined : property[1]?.value,
      propertyExpression: property[1]?.isExpression ? property[1]?.value : undefined,
    }
  });
  data.features = data.features?.map((feature: string[]) => {
    return {
      featureName: feature[0],
      featureEnabled: feature[1]
    }
  });
  data.resources = data.resources?.map((resource: string[]) => {
    return {
      location: resource[0],
      resourceRegistryKey: resource[1]
    }
  });
  const output = Mustache.render(getXsltMustacheTemplate(), data)?.trim();
  return output;
}

export function getXsltFormDataFromSTNode(data: { [key: string]: any }, node: Xslt) {

  data.sourceXPath = { isExpression: true, value: node.source };
  data.description = node.description;
  if (node.key) {
    const regex = /{([^}]*)}/;
    const match = node.key.match(regex);
    if (match && match.length > 1) {
      data.xsltSchemaKeyType = "Dynamic";
      data.xsltDynamicSchemaKey = match[1];
    } else {
      data.xsltSchemaKeyType = "Static";
      data.xsltStaticSchemaKey = node.key;
    }
  }
  if (node.property) {
    data.properties = node.property.map((property) => {
      let isExpression = property.value ? false : true;
      return [property.name, { isExpression: isExpression, value: property.value ?? property.expression }];
    });
  } else {
    data.properties = [];
  }
  if (node.resource) {
    data.resources = node.resource.map((resource) => {
      return [resource.location, resource.key]
    });
  } else {
    data.resources = [];
  }
  if (node.feature) {
    data.features = node.feature.map((feature) => {
      return [feature.name, feature.value]
    });
  } else {
    data.features = [];
  }

  return data;
}
