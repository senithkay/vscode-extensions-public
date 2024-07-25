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
        <operations type="{{operationType}}">
            {{#operations}}
            <operation name="{{operationName}}">
                {{#DSSProperties}}
                <param name="{{propertyName}}" {{#propertyValue}}value="{{propertyValue}}"{{/propertyValue}} {{#propertyExpression}}expression="{{propertyExpression}}" evaluator="xml"{{/propertyExpression}} />
                {{/DSSProperties}}
            </operation>
            {{/operations}}
        </operations>
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
        data.operations = data.operations.map((operation: any[]) => {
            return {
                operationName: operation[0],
                DSSProperties: operation[1].map((property: string[]) => {
                    return {
                        propertyName: property[0],
                        propertyValue: property[1] == "LITERAL" ? property[2] : undefined,
                        propertyExpression: property[1] == "EXPRESSION" ? property[2] : undefined
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
    if (node.operations.operation) {
        data.operations = node.operations.operation.map((op1) => {
            return [op1.name, op1.param.map((param) => {
                return [param.name, param.value ? "LITERAL" : "EXPRESSION", param.value ?? param.expression];
            })]

        });
    }
    data.DSSProperties = [];
    return data;
}
