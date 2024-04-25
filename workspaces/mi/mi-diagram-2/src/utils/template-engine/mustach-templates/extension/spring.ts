
export function getSpringMustacheTemplate() {

    return `
    <spring:spring {{#beanName}}bean="{{beanName}}"{{/beanName}} {{#description}}description="{{description}}"{{/description}} {{#configurationKey}}key="{{configurationKey}}"{{/configurationKey}} xmlns:spring="http://ws.apache.org/ns/synapse"/>
    `;
}
