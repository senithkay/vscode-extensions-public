/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Validate } from '@wso2-enterprise/mi-syntax-tree/lib/src';
import Mustache from 'mustache';
import { transformNamespaces } from '../../../commons';

export function getValidateMustacheTemplate() {
    return `
    {{#isNewMediator}}
    <validate {{#source}}source="{{{value}}}"{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}} {{/source}}{{#enableSchemaCaching}}cache-schema="{{enableSchemaCaching}}" {{/enableSchemaCaching}}{{#description}}description="{{description}}" {{/description}}>
    {{#schemas}}
    <schema key="{{key}}" />
    {{/schemas}}
    {{#features}}
    <feature name="{{featureName}}" value="{{featureEnable}}" />
    {{/features}}
    <on-fail></on-fail>
    {{#resources}}
    <resource key="{{locationKey}}" location="{{location}}" />
    {{/resources}}
    </validate>
    {{/isNewMediator}}
    {{^isNewMediator}}
    <validate {{#source}}source="{{{value}}}"{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}} {{/source}}{{#enableSchemaCaching}}cache-schema="{{enableSchemaCaching}}" {{/enableSchemaCaching}}{{#description}}description="{{description}}" {{/description}}>
    {{#schemas}}
    <schema key="{{key}}" />
    {{/schemas}}
    {{#features}}
    <feature name="{{featureName}}" value="{{featureEnable}}" />
    {{/features}}
    {{#resources}}
    <resource key="{{locationKey}}" location="{{location}}" />
    {{/resources}}
    {{/isNewMediator}}
`;
}

export function getValidateXml(data: { [key: string]: any }, dirtyFields?: any, defaultValues?: any) {

    data.schemas = data.schemas.map((schema: string[]) => {
        return {
            key: schema[0]
        }
    });
    data.features = data.features.map((feature: string[]) => {
        return {
            featureName: feature[0],
            featureEnable: feature[1] ? "true" : "false"
        }
    });
    data.resources = data.resources.map((resource: string[]) => {
        return {
            location: resource[0],
            locationKey: resource[1]
        }
    });

    if (defaultValues === undefined || Object.keys(defaultValues).length == 0) {
        data.isNewMediator = true;
        return Mustache.render(getValidateMustacheTemplate(), data).trim();
    }
    return getEdits(data, dirtyFields, defaultValues);
}

function getEdits(data: { [key: string]: any }, dirtyFields: any, defaultValues: any) {

    let edits: { [key: string]: any }[] = [];
    if (Object.keys(dirtyFields).length > 0) {
        let dirtyData = { ...data };
        let validateRange = defaultValues.ranges.validate;
        let onFailRange = defaultValues.ranges.onFail;
        if (onFailRange && onFailRange.endTagRange?.end) {
            let startXml = Mustache.render(getValidateMustacheTemplate(), dirtyData)?.trim();
            let editRange = {
                start: validateRange.startTagRange.start,
                end: onFailRange.startTagRange.start
            }
            edits.push({
                range: editRange,
                text: startXml
            });

            let endXml = "</validate>";
            editRange = {
                start: onFailRange.endTagRange.end,
                end: validateRange.endTagRange.end
            }
            edits.push({
                range: editRange,
                text: endXml
            });
        } else {
            data.isNewMediator = true;
            let validateXml = Mustache.render(getValidateMustacheTemplate(), data)?.trim();
            let editRange = {
                start: validateRange.startTagRange.start,
                end: validateRange.endTagRange ? validateRange.endTagRange.end : validateRange.startTagRange.end
            }
            edits.push({
                range: editRange,
                text: validateXml
            });
        }
    }
    edits.sort((a, b) => b.range.start.line - a.range.start.line);
    return edits;
}

export function getValidateFormDataFromSTNode(data: { [key: string]: any }, node: Validate) {
    data.source = { isExpression: true, value: node.source, namespaces: transformNamespaces(node.namespaces) };
    data.description = node.description;
    data.enableSchemaCaching = node.cacheSchema;
    if (node.feature) {
        data.features = node.feature.map(feature => {
            return [feature.name, feature.value];
        });
    }
    if (node.schema) {
        data.schemas = node.schema.map(schema => {
            let key = schema.key;
            return [key];
        });
    }
    if (node.resource) {
        data.resources = node.resource.map(resource => {
            return [resource.location, resource.key];
        });
    }
    data.ranges = {
        validate: node.range,
        onFail: node.onFail?.range
    }
    return data;
}
