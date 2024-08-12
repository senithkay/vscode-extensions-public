/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export function getDefaultEndpointMustacheTemplate() {
    return `<endpoint>
    <default {{#format}}format="{{format}}"{{/format}} {{#statisticsEnabled}}statistics="enable"{{/statisticsEnabled}} {{#traceEnabled}}trace="enable"{{/traceEnabled}} uri-template="{{uriTemplate}}">
        <timeout>
        <duration>{{timeoutDuration}}</duration>
        <responseAction>{{timeoutAction}}</responseAction>
        </timeout>    
        <suspendOnFailure>
                {{#suspendErrorCodes}}<errorCodes>{{suspendErrorCodes}}</errorCodes>{{/suspendErrorCodes}}
                <initialDuration>{{suspendInitialDuration}}</initialDuration>
                <progressionFactor>{{suspendProgressionFactor}}</progressionFactor>
                <maximumDuration>{{suspendMaximumDuration}}</maximumDuration>
            </suspendOnFailure>
            <markForSuspension>
                {{#retryErrorCodes}}<errorCodes>{{retryErrorCodes}}</errorCodes>{{/retryErrorCodes}}
                {{#retryCount}}<retriesBeforeSuspension>{{retryCount}}</retriesBeforeSuspension>{{/retryCount}}
                {{#retryDelay}}<retryDelay>{{retryDelay}}</retryDelay>{{/retryDelay}}
            </markForSuspension>
            {{#failoverNonRetryErrorCodes}}
            <retryConfig>
                <disabledErrorCodes>{{failoverNonRetryErrorCodes}}</disabledErrorCodes>
            </retryConfig>
            {{/failoverNonRetryErrorCodes}}}
    </default>
    {{#properties}}
    <property name="{{propertyName}}" {{#value}}value="{{value}}"{{/value}} {{#expression}}expression="{{expression}}"{{/expression}} />
    {{/properties}}
    <description>{{description}}</description>
</endpoint>`;
}
