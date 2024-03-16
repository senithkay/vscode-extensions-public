/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import Mustache from "mustache";

export function getHTTPEndpointMustacheTemplate() {
    return `<endpoint>
    <http method="{{httpMethod}}" {{#statisticsEnabled}}statistics="enable"{{/statisticsEnabled}} {{#traceEnabled}}trace="enable"{{/traceEnabled}} uri-template="{{{uriTemplate}}}">
    {{#timeout}}
    <timeout>
    {{#timeoutDuration}}<duration>{{timeoutDuration}}</duration>{{/timeoutDuration}}
    {{#timeoutAction}}<responseAction>{{timeoutAction}}</responseAction>{{/timeoutAction}}
    </timeout>
    {{/timeout}}
    {{#suspendOnFailure}}
    <suspendOnFailure>
        {{#suspendErrorCodes}}<errorCodes>{{suspendErrorCodes}}</errorCodes>{{/suspendErrorCodes}}
        <initialDuration>{{suspendInitialDuration}}</initialDuration>
        <progressionFactor>{{suspendProgressionFactor}}</progressionFactor>
        <maximumDuration>{{suspendMaximumDuration}}</maximumDuration>
    </suspendOnFailure>
    {{/suspendOnFailure}}
    {{#markForSuspension}}
    <markForSuspension>
        {{#retryErrorCodes}}<errorCodes>{{retryErrorCodes}}</errorCodes>{{/retryErrorCodes}}
        {{#retryCount}}<retriesBeforeSuspension>{{retryCount}}</retriesBeforeSuspension>{{/retryCount}}
        {{#retryDelay}}<retryDelay>{{retryDelay}}</retryDelay>{{/retryDelay}}
    </markForSuspension>
    {{/markForSuspension}}
    {{#failoverNonRetryErrorCodes}}
    <retryConfig>
        <disabledErrorCodes>{{failoverNonRetryErrorCodes}}</disabledErrorCodes>
    </retryConfig>
    {{/failoverNonRetryErrorCodes}}
    </http>
    {{#properties}}
    <property name="{{propertyName}}" {{#value}}value="{{value}}"{{/value}} {{#expression}}expression="{{expression}}"{{/expression}} />
    {{/properties}}
    {{#description}}<description>{{description}}</description>{{/description}}
</endpoint>`;
}

export function getHTTPEndpointXml(data: { [key: string]: any }) {
    const modifiedData = {
        ...data,
        httpMethod: data.httpMethod.toLowerCase(),
    }

    return Mustache.render(getHTTPEndpointMustacheTemplate(), modifiedData);
}

export function getHTTPEndpointFormDataFromSTNode(data: { [key: string]: any }, node: any) {
    data.httpMethod = data.httpMethod.toUpperCase();
    return data;
}
