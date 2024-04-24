import { Class } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";

export function getClassMustacheTemplate() {
    return `<class {{#description}}description="{{description}}" {{/description}}{{#className}}name="{{className}}" {{/className}} >
        {{#properties}}
        <property {{#propertyName}}name="{{propertyName}}" {{/propertyName}}{{^isExpression}}value="{{value}}" {{/isExpression}}{{#isExpression}}expression="{{value}}" {{/isExpression}} />
        {{/properties}}
</class>`;
}

export function getClassXml(data: { [key: string]: any }) {

    const properties = data.properties.map((property: any[]) => {
        return {
            propertyName: property[0],
            value: property[1].value,
            isExpression: property[1].isExpression
        }
    });
    data = {
        ...data,
        properties
    }

    const output = Mustache.render(getClassMustacheTemplate(), data);
    return output.trim();
}

export function getClassFormDataFromSTNode(data: { [key: string]: any }, node: Class) {

    if (node.property) {
        data.properties = node.property.map((property) => {
            let isExpression = property?.value ? false : true;
            return [property.name, { isExpression: isExpression, value: property.value ?? property.expression }];
        });
    }

    return data;
}
