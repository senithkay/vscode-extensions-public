/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export function getLoadBalanceEndpointMustacheTemplate() {
    return `<endpoint>
    <loadbalance algorithm="{{algorithm}}" buildMessage="{{buildMessage}}"/>
    <session type="{{sessionType}}">
        <sessionTimeout>{{sessionTimeout}}</sessionTimeout>
    </session>
    {{#member}}
    <member hostName="{{hostName}}" httpPort="{{httpPort}}" httpsPort="{{httpsPort}}"/>
    {{/member}}
    {{#parameters}}
    <parameter name="{{parameterName}}" value="{{parameterValue}}" />
    {{/parameters}}
    <description>{{description}}</description>
</endpoint>`;
}
