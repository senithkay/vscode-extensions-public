
export function getSpringMustacheTemplate() {

    return `
    <spring:spring bean="{{beanName}}" description="{{description}}," key="{{configurationKey}}" xmlns:spring="http://ws.apache.org/ns/synapse"/>
    `;
}
