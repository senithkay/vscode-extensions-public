import { Aggregate } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";

export function getAggregateMustacheTemplate() {
    return `
    {{#isNewMediator}}
    <aggregate id="{{aggregateID}}" >
{{#correlationExpression}}<correlateOn expression="{{correlationExpression}}" />{{/correlationExpression}}
        <completeCondition timeout="{{completionTimeout}}">
            <messageCount {{#completionMax}}max="{{completionMax}}" {{/completionMax}}{{#completionMin}}min="{{completionMin}}" {{/completionMin}}/>
        </completeCondition>
        <onComplete aggregateElementType="{{aggregateElementType}}" enclosingElementProperty="{{enclosingElementProperty}}" expression="{{aggregationExpression}}" {{#sequenceKey}}sequence="{{sequenceKey}}"{{/sequenceKey}} ></onComplete>
    </aggregate>
    {{/isNewMediator}}
    {{^isNewMediator}}
    {{#editAggregate}}
    <aggregate id="{{aggregateID}}" >
    {{/editAggregate}}
    {{#editCorrelateOn}}
    {{#correlationExpression}}<correlateOn expression="{{correlationExpression}}" />{{/correlationExpression}}
    {{/editCorrelateOn}}
    {{#editCompleteCondition}}
    <completeCondition timeout="{{completionTimeout}}">
        <messageCount {{#completionMax}}max="{{completionMax}}" {{/completionMax}}{{#completionMin}}min="{{completionMin}}" {{/completionMin}}/>
    </completeCondition>
    {{/editCompleteCondition}}
    {{#editOnComplete}}
    <onComplete aggregateElementType="{{aggregateElementType}}" enclosingElementProperty="{{enclosingElementProperty}}" expression="{{aggregationExpression}}" {{#sequenceKey}}sequence="{{sequenceKey}}"{{/sequenceKey}} ></onComplete>
    {{/editOnComplete}}
    {{/isNewMediator}}
    `;
}

export function getAggregateXml(data: { [key: string]: any }) {

    data.completionMax = data.completionMaxMessagesType == "EXPRESSION" ? "{" + data.completionMaxMessages + "}" : data.completionMaxMessagesValue;
    data.completionMin = data.completionMinMessagesType == "EXPRESSION" ? "{" + data.completionMinMessages + "}" : data.completionMinMessagesValue;

    data.aggregateElementType = data.aggregateElementType.toLowerCase();

    const output = Mustache.render(getAggregateMustacheTemplate(), data)?.trim();
    return output;
}

export function getAggregateFormDataFromSTNode(data: { [key: string]: any }, node: Aggregate) {

    data.description = node.description;
    data.aggregateID = node.id;
    data.correlationExpression = node.correlateOnOrCompleteConditionOrOnComplete?.correlateOn?.expression;
    data.completionTimeout = node.correlateOnOrCompleteConditionOrOnComplete?.completeCondition?.timeout;
    const max = node.correlateOnOrCompleteConditionOrOnComplete?.completeCondition?.messageCount?.max;
    if (max && max.startsWith("{")) {
        const regex = /{([^}]*)}/;
        const match = max.match(regex);
        data.completionMaxMessages = match.length > 1 ? match[1] : max;
        data.completionMaxMessagesType = "EXPRESSION";
    } else if (max) {
        data.completionMaxMessagesValue = max;
        data.completionMaxMessagesType = "VALUE";
    }
    const min = node.correlateOnOrCompleteConditionOrOnComplete?.completeCondition?.messageCount?.min;
    if (min && min.startsWith("{")) {
        const regex = /{([^}]*)}/;
        const match = min.match(regex);
        data.completionMinMessages = match.length > 1 ? match[1] : min;
        data.completionMinMessagesType = "EXPRESSION";
    } else if (min) {
        data.completionMinMessagesValue = min;
        data.completionMinMessagesType = "VALUE";
    }
    data.aggregateElementType = node.correlateOnOrCompleteConditionOrOnComplete?.onComplete?.aggregateElementType?.toUpperCase();
    data.enclosingElementProperty = node.correlateOnOrCompleteConditionOrOnComplete?.onComplete?.enclosingElementProperty;
    data.aggregationExpression = node.correlateOnOrCompleteConditionOrOnComplete?.onComplete?.expression;
    data.sequenceKey = node.correlateOnOrCompleteConditionOrOnComplete?.onComplete?.sequenceAttribute;
    data.sequenceType = data.sequenceKey ? "REGISTRY_REFERENCE" : "ANONYMOUS";
    data.ranges = {
        aggregate: node.range,
        correlateOn: node.correlateOnOrCompleteConditionOrOnComplete?.correlateOn?.range,
        completeCondition: node.correlateOnOrCompleteConditionOrOnComplete?.completeCondition?.range,
        onComplete: node.correlateOnOrCompleteConditionOrOnComplete?.onComplete?.range
    }

    return data;
}
