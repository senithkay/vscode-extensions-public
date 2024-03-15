/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { render } from "mustache";

export interface WsdlEndpointArgs {
    endpointName: string;
    format: string | null;
    traceEnabled: string | null;
    statisticsEnabled: string | null;
    optimize: string | null;
    description: string;
    wsdlUri: string;
    wsdlService: string;
    wsdlPort: string;
    requireProperties: boolean;
    properties: any;
    addressingEnabled: string;
    addressingVersion: string;
    addressListener: string | null;
    securityEnabled: string;
    suspendErrorCodes: string;
    initialDuration: string;
    maximumDuration: string;
    progressionFactor: string;
    retryErrorCodes: string;
    retryCount: string;
    retryDelay: string;
    timeoutDuration: string;
    timeoutAction: string | null;
}

export function getWsdlEndpointMustacheTemplate() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<endpoint name="{{endpointName}}" xmlns="http://ws.apache.org/ns/synapse">
    <wsdl port="{{wsdlPort}}" service="{{wsdlService}}" {{#format}}format="{{format}}"{{/format}} {{#optimize}}optimize="{{optimize}}"{{/optimize}} {{#statisticsEnabled}}statistics="{{statisticsEnabled}}"{{/statisticsEnabled}} {{#traceEnabled}}trace="{{traceEnabled}}"{{/traceEnabled}} uri="{{{wsdlUri}}}">
        {{#addressingEnabled}}<enableAddressing {{#addressListener}}separateListener="{{addressListener}}"{{/addressListener}} {{#addressingVersion}}version="{{addressingVersion}}{{/addressingVersion}}"/>{{/addressingEnabled}}
        {{#securityEnabled}}<enableSec/>{{/securityEnabled}}
        {{#timeout}}<timeout>
            {{#timeoutDuration}}<duration>{{timeoutDuration}}</duration>{{/timeoutDuration}}
            {{#timeoutAction}}<responseAction>{{timeoutAction}}</responseAction>{{/timeoutAction}}
        </timeout>{{/timeout}}
        <suspendOnFailure>
            {{#suspendErrorCodes}}<errorCodes>{{suspendErrorCodes}}</errorCodes>{{/suspendErrorCodes}}
            <initialDuration>{{initialDuration}}</initialDuration>
            <progressionFactor>{{progressionFactor}}</progressionFactor>
            {{#maximumDuration}}<maximumDuration>{{maximumDuration}}</maximumDuration>{{/maximumDuration}}
        </suspendOnFailure>
        <markForSuspension>
            {{#retryErrorCodes}}<errorCodes>{{retryErrorCodes}}</errorCodes>{{/retryErrorCodes}}
            <retriesBeforeSuspension>{{retryCount}}</retriesBeforeSuspension>
            {{#retryDelay}}<retryDelay>{{retryDelay}}</retryDelay>{{/retryDelay}}
        </markForSuspension>
    </wsdl>
    {{#properties}}
    <property name="{{name}}" scope="{{scope}}" value="{{value}}"/>
    {{/properties}}  
    {{#description}}<description>{{description}}</description>{{/description}}
</endpoint>`;
}


export function getWsdlEndpointXml(data: WsdlEndpointArgs) {

    data.retryCount = data.retryCount === '' ? '0' : data.retryCount;
    data.initialDuration = data.initialDuration === '' ? '-1' : data.initialDuration;
    data.progressionFactor = data.progressionFactor === '' ? '1' : data.progressionFactor;
    data.optimize = (data.optimize === 'LEAVE_AS_IS' || data.optimize === null) ? null : data.optimize.toLowerCase();
    data.format = (data.format === 'LEAVE_AS_IS' || data.format === null) ? null : data.format === 'SOAP 1.1' ? 'soap11' :
        data.format === 'SOAP 1.2' ? 'soap12' : data.format.toLowerCase();

    let timeout;

    assignNullToEmptyStrings(data);

    data.timeoutAction = (data.timeoutAction === 'Never' || data.timeoutAction === null) ? null : data.timeoutAction.toLowerCase();
    if (data.timeoutDuration != null || data.timeoutAction != null) {
        timeout = true;
    }

    data.addressListener = data.addressListener === 'enable' ? 'true' : null;

    if (!data.requireProperties) {
        data.properties = null;
    }

    const modifiedData = {
        ...data,
        timeout
    };

    return render(getWsdlEndpointMustacheTemplate(), modifiedData);
}

function assignNullToEmptyStrings(obj: { [key: string]: any }): void {
    for (const key in obj) {
        if (obj[key] === '' || obj[key] === 'disable') {
            obj[key] = null;
        }
    }
}
