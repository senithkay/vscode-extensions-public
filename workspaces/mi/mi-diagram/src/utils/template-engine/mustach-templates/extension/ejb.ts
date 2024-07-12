import { Ejb } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";
import { transformNamespaces } from "../../../commons";

export function getEjbMustacheTemplate() {
    return `{{#argsAvailable}}
    <ejb {{#beanstalk}}beanstalk="{{beanstalk}}" {{/beanstalk}}{{#class}}class="{{class}}" {{/class}}{{#description}}description="{{description}}" {{/description}}{{#sessionIdExpression}}id="{{sessionIdExpression}}" {{/sessionIdExpression}}{{#sessionIdLiteral}}id="{{{sessionIdLiteral}}}" {{/sessionIdLiteral}}{{#jndiName}}jndiName="{{jndiName}}" {{/jndiName}}{{#method}}method="{{method}}" {{/method}}{{#remove}}remove="{{remove}}" {{/remove}}stateful="true" {{#target}}target="{{{target}}}"{{/target}}{{#namespaces}} xmlns:{{{prefix}}}="{{{uri}}}"{{/namespaces}}>
        <args>
            {{#methodArguments}}
            <arg {{#value}}value="{{{value}}}"{{/value}}/>
            {{/methodArguments}}
        </args>
    </ejb>
    {{/argsAvailable}}
    {{^argsAvailable}}
    <ejb {{#beanstalk}}beanstalk="{{beanstalk}}" {{/beanstalk}}{{#class}}class="{{class}}" {{/class}}{{#description}}description="{{description}}" {{/description}}{{#sessionIdExpression}}id="{{sessionIdExpression}}" {{/sessionIdExpression}}{{#sessionIdLiteral}}id="{{{sessionIdLiteral}}}" {{/sessionIdLiteral}}{{#jndiName}}jndiName="{{jndiName}}" {{/jndiName}}{{#method}}method="{{method}}" {{/method}}{{#remove}}remove="{{remove}}" {{/remove}}stateful="true" {{#target}}target="{{{target}}}"{{/target}}{{#namespaces}} xmlns:{{{prefix}}}="{{{uri}}}"{{/namespaces}}/>
    {{/argsAvailable}}`;
}

export function getEjbXml(data: { [key: string]: any }) {

    if (data.sessionIdType == "EXPRESSION") {
        data.namespaces = data.sessionIdExpression?.namespaces;
        data.sessionIdExpression = "{" + data.sessionIdExpression?.value + "}";
        delete data.sessionIdLiteral;
    } else {
        delete data.sessionIdExpression;
    }

    let argsAvailable = false
    const methodArguments = data.methodArguments.map((property: any[]) => {
        argsAvailable = true;
        return {
            value: property[1] == "EXPRESSION" ? "{" + property[3]?.value + "}" : property[2]
        }
    });

    const modifiedData = {
        ...data,
        methodArguments,
        argsAvailable: argsAvailable
    }

    const output = Mustache.render(getEjbMustacheTemplate(), modifiedData);
    return output.trim();
}

export function getEjbFormDataFromSTNode(data: { [key: string]: any }, node: Ejb) {

    let regex = /{([^}]*)}/;
    data.class = node.clazz;
    if (node.args) {
        if (node.args.arg) {
            data.methodArguments = node.args.arg.map((arg) => {
                let valueMatch = arg.value.match(regex);
                let value;
                let expression;
                if (valueMatch && valueMatch.length > 1) {
                    expression = { isExpression: true, value: valueMatch[1] };
                } else {
                    value = arg.value;
                }
                return ["", arg.value.startsWith("{") ? "EXPRESSION" : "LITERAL", value, expression];
            });
        }
    }
    let sessionIdMatch = node.id?.match(regex);
    if (sessionIdMatch && sessionIdMatch.length > 1) {
        data.sessionIdType = "EXPRESSION";
        data.sessionIdExpression = { isExpression: true, value: sessionIdMatch[1], namespaces: transformNamespaces(node.namespaces) }
    } else {
        data.sessionIdType = "LITERAL";
        delete data.sessionIdExpression;
        data.sessionIdLiteral = node.id;
    }
    return data;
}
