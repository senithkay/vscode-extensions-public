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

export function getValidateMustacheTemplate() {
    return `<validate {{#source}}source="{{source}}" {{/source}}{{#enableSchemaCaching}}cache-schema="{{enableSchemaCaching}}" {{/enableSchemaCaching}}{{#description}}description="{{description}}" {{/description}}>
    {{#schemas}}
    <schema key="{{key}}" />
    {{/schemas}}
    {{#features}}
    <feature name="{{featureName}}" value="{{featureEnabled}}" />
    {{/features}}
    <on-fail />
    {{#resources}}
    <resource key="{{locationKey}}" location="{{location}}" />
    {{/resources}}
</validate>`;
}

export function getValidateXml(data: { [key: string]: any }) {

    const schemas = data.schemas.map((schema: string[]) => {
        return {
            key: schema[0] == "Static" ? schema[1] : "{" + schema[1] + "}"
        }
    });
    const features = data.features.map((feature: string[]) => {
        return {
            featureName: feature[0],
            featureEnable: feature[1]
        }
    });
    const resources = data.resources.map((resource: string[]) => {
        return {
            location: resource[0],
            locationKey: resource[1]
        }
    });

    const modifiedData = {
        ...data,
        schemas: schemas,
        features: features,
        resources: resources
    }

    return Mustache.render(getValidateMustacheTemplate(), modifiedData).trim();

}

export function getValidateFormDataFromSTNode(data: { [key: string]: any }, node: Validate) {
    if (node.feature) {
        data.features = node.feature.map(feature => {
            return [feature.name, feature.value];
        });
    }
    if (node.schema) {
        data.schemas = node.schema.map(schema => {
            let key = schema.key;
            let type;
            if (key?.startsWith("{")) {
                const regex = /{([^}]*)}/;
                const match = schema.key.match(regex);
                key = match.length > 1 ? match[1] : schema.key;
                type = "Dynamic";
            } else {
                type = "Static";
            }
            return [type, key];
        });
    }
    if (node.resource) {
        data.resources = node.resource.map(resource => {
            return [resource.location, resource.key];
        });
    }
    return data;
}