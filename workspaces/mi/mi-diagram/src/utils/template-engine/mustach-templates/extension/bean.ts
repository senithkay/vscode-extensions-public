import { Bean } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";
import { transformNamespaces } from "../../../commons";

export function getBeanMustacheTemplate() {
    return `<bean {{#action}}action="{{action}}" {{/action}}{{#class}}class="{{class}}" {{/class}}{{#property}}property="{{property}}" {{/property}}{{#valueLiteral}}value="{{{valueLiteral}}}" {{/valueLiteral}}{{#valueExpression}}value="{{{valueExpression}}}" {{/valueExpression}}{{#targetLiteral}}target="{{{targetLiteral}}}" {{/targetLiteral}}{{#targetExpression}}target="{{{targetExpression}}}" {{/targetExpression}}{{#description}}description="{{description}}" {{/description}}{{#var}}var="{{var}}" {{/var}}{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}}/>`;
}

export function getBeanXml(data: { [key: string]: any }) {

    if (data.action != "CREATE") {
        delete data.class;
    }
    if (data.action != "SET_PROPERTY" && data.action != "REMOVE_PROPERTY") {
        delete data.property;
        delete data.valueType;
        delete data.valueLiteral;
        delete data.valueExpression;
    }
    let namespaces = [];
    if (data.targetType == "LITERAL") delete data.targetExpression;
    else delete data.targetLiteral;
    if (data.valueType == "LITERAL") delete data.valueExpression;
    else delete data.valueLiteral;
    if (data.targetExpression && !data.targetExpression.value.startsWith("{")) {
        if (data.targetExpression?.namespaces) {
            namespaces.push(...data.targetExpression?.namespaces);
        }
        data.targetExpression = "{" + data.targetExpression?.value + "}";
    }
    if (data.valueExpression && !data.valueExpression.value.startsWith("{")) {
        if (data.valueExpression?.namespaces) {
            namespaces.push(...data.valueExpression?.namespaces);
        }
        data.valueExpression = "{" + data.valueExpression?.value + "}";
    }
    data.namespaces = namespaces;
    const output = Mustache.render(getBeanMustacheTemplate(), data);
    return output.trim();
}

export function getBeanFormDataFromSTNode(data: { [key: string]: any }, node: Bean) {

    let regex = /{([^}]*)}/;
    let targetMatch = node.target?.match(regex);
    let namespaces = transformNamespaces(node.namespaces);
    if (targetMatch && targetMatch.length > 1) {
        data.targetType = "EXPRESSION";
        data.targetExpression = { isExpression: true, value: targetMatch[1], namespaces: namespaces }
    } else {
        data.targetType = "LITERAL";
        delete data.targetExpression;
        data.targetLiteral = node.target;
    }
    let valueMatch = node.value?.match(regex);
    if (valueMatch && valueMatch.length > 1) {
        data.valueType = "EXPRESSION";
        data.valueExpression = { isExpression: true, value: valueMatch[1], namespaces: namespaces }
    } else {
        data.valueType = "LITERAL";
        delete data.valueExpression;
        data.valueLiteral = node.value;
    }
    data.class = node.clazz;
    return data;
}
