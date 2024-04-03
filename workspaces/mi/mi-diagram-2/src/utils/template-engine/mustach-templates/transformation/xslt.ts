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
    <xslt {{#description}}description="{{description}}"{{/description}} {{#key}}key="{{key}}"{{/key}} {{#sourceXPath}}source="{{sourceXPath}}"{{/sourceXPath}} >
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

  if (data.xsltSchemaKeyType == "Dynamic") {
    data.key = "{" + data.xsltDynamicSchemaKey + "}";
    delete data.xsltStaticSchemaKey;
  }
  else {
    data.key = data.xsltStaticSchemaKey;
    delete data.xsltDynamicSchemaKey;
  }
  data.properties = data.properties?.map((property: string[]) => {
    return {
      propertyName: property[0],
      propertyValue: property[1] == "LITERAL" ? property[2] : undefined,
      propertyExpression: property[1] == "EXPRESSION" ? property[3] : undefined
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

  data.sourceXPath = node.source;
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
      return [property.name, property.value ? "LITERAL" : "EXPRESSION", property.value, property.expression];
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
