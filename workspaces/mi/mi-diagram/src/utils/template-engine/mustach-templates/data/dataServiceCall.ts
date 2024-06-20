/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DataServiceCall } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from 'mustache';

export function getDataServiceCallMustacheTemplate() {

    return `
    <dataServiceCall {{#description}}description="{{description}}"{{/description}} {{#serviceName}}serviceName="{{serviceName}}"{{/serviceName}}>
        {{^hasOperations}}
        <operations type="{{operationType}}"/>
        {{/hasOperations}}
        {{#hasOperations}}
        <operations type="{{operationType}}">
            {{#operations}}
            <operation name="{{operationName}}">
                {{#DSSProperties}}
                <param name="{{propertyName}}" {{#propertyValue}}value="{{{propertyValue}}}"{{/propertyValue}} {{#propertyExpression}}expression="{{{propertyExpression}}}" evaluator="xml"{{/propertyExpression}} />
                {{/DSSProperties}}
            </operation>
            {{/operations}}
        </operations>
        {{/hasOperations}}
        <source type="{{sourceType}}"/>
        <target {{#targetProperty}}name="{{targetProperty}}" {{/targetProperty}}{{#targetType}}type="{{targetType}}{{/targetType}}"/>
    </dataServiceCall>
    `;
}

export function getDataSerivceCallXml(data: { [key: string]: any }) {
    data.operationType = data.operationType.toLowerCase();
    if (data.sourceType == "BODY") {
        delete data.operations;
    }
    if (data.targetType == "BODY") {
        delete data.targetProperty;
    }
    data.sourceType = data.sourceType?.toLowerCase();
    data.targetType = data.targetType?.toLowerCase();
    if (data.operations && data.operations.length > 0) {
        data.hasOperations = true;
        data.operations = data.operations.map((operation: any[]) => {
            return {
                operationName: operation[0],
                DSSProperties: operation[1].map((property: any[]) => {
                    return {
                        propertyName: property[0],
                        propertyValue: property[2],
                        propertyExpression: property[3]?.value
                    }
                })
            }
        });
    }
    const output = Mustache.render(getDataServiceCallMustacheTemplate(), data).trim();
    return output;
}

export function getDataServiceCallFormDataFromSTNode(data: { [key: string]: any }, node: DataServiceCall) {
    data.sourceType = node.source?.type?.toUpperCase();
    data.targetType = node.target?.type?.toUpperCase();
    data.targetProperty = node.target?.name;
    data.operationType = node.operations?.type?.toUpperCase();
    if (node.operations?.operation) {
        data.operations = node.operations.operation.map((operation) => {
            return [operation.name, operation.param.map((param) => {
                let values = [param.name, param.value ? "LITERAL" : "EXPRESSION", param.value, { isExpression: true, value: param.expression }];
                return values;
            })];
        });
    } else {
        data.operations = [];
    }

    return data;
}

export function getDSCallDescription(node: DataServiceCall) {
    return node.serviceName;
}
