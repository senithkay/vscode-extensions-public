import { Ejb } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";

export function getEjbMustacheTemplate() {
    return `<ejb {{#beanstalk}}beanstalk="{{beanstalk}}" {{/beanstalk}}{{#class}}class="{{class}}" {{/class}}{{#description}}description="{{description}}" {{/description}}{{#sessionIdExpression}}id="{{sessionIdExpression}}" {{/sessionIdExpression}}{{#sessionIdLiteral}}id="{{sessionIdLiteral}}" {{/sessionIdLiteral}}{{#jndiName}}jndiName="{{jndiName}}" {{/jndiName}}{{#method}}method="{{method}}" {{/method}}{{#remove}}remove="{{remove}}" {{/remove}}stateful="true" {{#target}}target="{{target}}"{{/target}} >
        {{#argsAvailable}}
        <args>
            {{#methodArguments}}
            <arg {{#value}}value="{{value}}" {{/value}}/>
            {{/methodArguments}}
        </args>
        {{/argsAvailable}}
</ejb>`;
}

export function getEjbXml(data: { [key: string]: any }) {

    if (data.sessionIdExpression && !data.sessionIdExpression.startsWith("{")) {
        data.sessionIdExpression = "{" + data.sessionIdExpression + "}";
    }

    let argsAvailable = false
    const methodArguments = data.methodArguments.map((property: string[]) => {
        argsAvailable = true;
        return {
            value: property[0] == "EXPRESSION" && !property[1].startsWith("{") ? "{" + property[1] + "}" : property[1]
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

    if (node.args) {
        if (node.args.arg) {
            data.methodArguments = node.args.arg.map((arg) => {
                return [arg.value.startsWith("{") ? "EXPRESSION" : "LITERAL", arg.value];
            });
        }
    }
    data.sessionIdType = "LITERAL";
    if (node.id && node.id.startsWith("{")) {
        data.sessionIdType = "EXPRESSION";
    }
    return data;
}
