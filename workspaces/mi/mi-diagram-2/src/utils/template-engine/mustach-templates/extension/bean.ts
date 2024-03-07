import { Bean } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";

export function getBeanMustacheTemplate() {
    return `<bean {{#action}}action="{{action}}" {{/action}}{{#class}}class="{{class}}" {{/class}}{{#property}}property="{{property}}" {{/property}}{{#valueLiteral}}value="{{valueLiteral}}" {{/valueLiteral}}{{#valueExpression}}value="{{valueExpression}}" {{/valueExpression}}{{#targetLiteral}}target="{{targetLiteral}}" {{/targetLiteral}}{{#targetExpression}}target="{{targetExpression}}" {{/targetExpression}}{{#description}}description="{{description}}" {{/description}}{{#var}}var="{{var}}" {{/var}} />`;
}

export function getBeanXml(data: { [key: string]: any }) {

    if (data.targetExpression && !data.targetExpression.startsWith("{")) {
        data.targetExpression = "{" + data.targetExpression + "}";
    }
    if (data.valueExpression && !data.valueExpression.startsWith("{")) {
        data.valueExpression = "{" + data.valueExpression + "}";
    }

    const output = Mustache.render(getBeanMustacheTemplate(), data);
    return output.trim();
}

export function getBeanFormDataFromSTNode(data: { [key: string]: any }, node: Bean) {

    if (node.target && node.target.startsWith("{")) {
        data.targetType = "EXPRESSION";
    } else if (node.target) {
        data.targetType = "LITERAL"
    }
    if (node.value && node.value.startsWith("{")) {
        data.valueType = "EXPRESSION";
    } else if (node.value) {
        data.valueType = "LITERAL"
    }
    data.class = node.clazz;
    return data;
}
