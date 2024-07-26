import { PojoCommand } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";

export function getCommandMustacheTemplate() {

  return `<pojoCommand {{#description}}description="{{description}}" {{/description}}{{#className}}name="{{className}}"{{/className}} >
        {{#properties}}
        <property {{#messageAction}}action="{{messageAction}}" {{/messageAction}}{{#contextAction}}action="{{contextAction}}" {{/contextAction}}{{#valueContextPropertyName}}context-name="{{valueContextPropertyName}}" {{/valueContextPropertyName}}{{#propertyName}}name="{{propertyName}}" {{/propertyName}}{{#valueLiteral}}value="{{valueLiteral}}" {{/valueLiteral}}{{#valueMessageElementXpath}}expression="{{valueMessageElementXpath}}"{{/valueMessageElementXpath}} />
        {{/properties}}
</pojoCommand>`;
}

export function getCommandXml(data: { [key: string]: any }) {

  const properties = data.properties.map((property: any[]) => {
    return {
      propertyName: property[0],
      valueLiteral: property[1] == "LITERAL" ? property[2] : undefined,
      valueContextPropertyName: property[1] == "CONTEXT_PROPERTY" ? property[5] : undefined,
      valueMessageElementXpath: property[1] == "MESSAGE_ELEMENT" ? property[4]?.value : undefined,
      contextAction: property[1] == "CONTEXT_PROPERTY" ? property[6] : undefined,
      messageAction: property[1] == "MESSAGE_ELEMENT" ? property[3] : undefined
    }
  });
  data = {
    ...data,
    properties
  }

  const output = Mustache.render(getCommandMustacheTemplate(), data);
  return output.trim();
}

export function getCommandFormDataFromSTNode(data: { [key: string]: any }, node: PojoCommand) {

  if (node.property) {
    data.properties = node.property.map((property) => {
      const propertyType = property.value ? "LITERAL" : property.contextName ? "CONTEXT_PROPERTY" : "MESSAGE_ELEMENT";
      return [property.name, propertyType, property.value, propertyType == "MESSAGE_ELEMENT" ? property.action : undefined, { isExpression: true, value: property.expression }, property.contextName,
      propertyType == "CONTEXT_PROPERTY" ? property.action : undefined];
    });
  }

  return data;
}
