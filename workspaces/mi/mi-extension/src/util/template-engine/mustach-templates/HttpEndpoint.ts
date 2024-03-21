/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { render } from "mustache";
import {randomBytes} from "crypto";

export interface HttpEndpointArgs {
    endpointName: string;
    traceEnabled: string | null;
    statisticsEnabled: string | null;
    uriTemplate: string;
    httpMethod: string | null;
    description: string;
    requireProperties: boolean;
    properties: any;
    authType: string;
    basicAuthUsername: string;
    basicAuthPassword: string;
    authMode: string;
    grantType: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    tokenUrl: string;
    username: string;
    password: string;
    requireOauthParameters: boolean;
    oauthProperties: any;
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
    templateName: string;
    requireTemplateParameters: boolean;
    templateParameters: any;
}

export function getHttpEndpointMustacheTemplate() {
    return `<?xml version="1.0" encoding="UTF-8"?>
{{#template}}<template name="{{templateName}}" xmlns="http://ws.apache.org/ns/synapse">{{/template}}
{{#parameters}}
<{{key}}:parameter name="{{value}}" xmlns:{{key}}="http://ws.apache.org/ns/synapse"/>
{{/parameters}}
<endpoint name="{{endpointName}}" {{^template}}xmlns="http://ws.apache.org/ns/synapse"{{/template}}>
    <http {{#httpMethod}}method="{{httpMethod}}"{{/httpMethod}} {{#statisticsEnabled}}statistics="{{statisticsEnabled}}"{{/statisticsEnabled}} {{#traceEnabled}}trace="{{traceEnabled}}"{{/traceEnabled}} uri-template="{{{uriTemplate}}}">
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
        {{#authentication}}<authentication>
            {{#basicAuth}}<basicAuth>
                {{#basicAuthUsername}}<username>{{basicAuthUsername}}</username>{{/basicAuthUsername}}{{^basicAuthUsername}}<username/>{{/basicAuthUsername}}
                {{#basicAuthPassword}}<password>{{basicAuthPassword}}</password>{{/basicAuthPassword}}{{^basicAuthPassword}}<password/>{{/basicAuthPassword}}
            </basicAuth>{{/basicAuth}}
            {{#oauth}}<oauth>
                {{#authorizationCode}}<authorizationCode>
                    {{#refreshToken}}<refreshToken>{{refreshToken}}</refreshToken>{{/refreshToken}}{{^refreshToken}}{{/refreshToken}}
                    {{#clientId}}<clientId>{{clientId}}</clientId>{{/clientId}}{{^clientId}}<clientId/>{{/clientId}}
                    {{#clientSecret}}<clientSecret>{{clientSecret}}</clientSecret>{{/clientSecret}}{{^clientSecret}}<clientSecret/>{{/clientSecret}}
                    {{#tokenUrl}}<tokenUrl>{{tokenUrl}}</tokenUrl>{{/tokenUrl}}{{^tokenUrl}}<tokenUrl/>{{/tokenUrl}}
                    {{#requireOauthParameters}}<requestParameters>{{/requireOauthParameters}}
                    {{#oauthProperties}}
                        <parameter name="{{key}}">{{{value}}}</parameter>
                    {{/oauthProperties}} 
                    {{#requireOauthParameters}}</requestParameters>{{/requireOauthParameters}}
                    <authMode>{{authMode}}</authMode>
                </authorizationCode>{{/authorizationCode}}
                {{#clientCredentials}}<clientCredentials>
                    {{#clientId}}<clientId>{{clientId}}</clientId>{{/clientId}}{{^clientId}}<clientId/>{{/clientId}}
                    {{#clientSecret}}<clientSecret>{{clientSecret}}</clientSecret>{{/clientSecret}}{{^clientSecret}}<clientSecret/>{{/clientSecret}}
                    {{#tokenUrl}}<tokenUrl>{{tokenUrl}}</tokenUrl>{{/tokenUrl}}{{^tokenUrl}}<tokenUrl/>{{/tokenUrl}}
                    {{#requireOauthParameters}}<requestParameters>{{/requireOauthParameters}}
                    {{#oauthProperties}}
                        <parameter name="{{key}}">{{{value}}}</parameter>
                    {{/oauthProperties}}    
                    {{#requireOauthParameters}}</requestParameters>{{/requireOauthParameters}}                
                    <authMode>{{authMode}}</authMode>
                </clientCredentials>{{/clientCredentials}}
                {{#passwordCredentials}}<passwordCredentials>
                    {{#username}}<username>{{username}}</username>{{/username}}{{^username}}<username/>{{/username}}
                    {{#password}}<password>{{password}}</password>{{/password}}{{^password}}<password/>{{/password}}
                    {{#clientId}}<clientId>{{clientId}}</clientId>{{/clientId}}{{^clientId}}<clientId/>{{/clientId}}
                    {{#clientSecret}}<clientSecret>{{clientSecret}}</clientSecret>{{/clientSecret}}{{^clientSecret}}<clientSecret/>{{/clientSecret}}
                    {{#tokenUrl}}<tokenUrl>{{tokenUrl}}</tokenUrl>{{/tokenUrl}}{{^tokenUrl}}<tokenUrl/>{{/tokenUrl}}
                    {{#requireOauthParameters}}<requestParameters>{{/requireOauthParameters}}
                    {{#oauthProperties}}
                        <parameter name="{{key}}">{{{value}}}</parameter>
                    {{/oauthProperties}}  
                    {{#requireOauthParameters}}</requestParameters>{{/requireOauthParameters}}
                    <authMode>{{authMode}}</authMode>
                </passwordCredentials>{{/passwordCredentials}}
            </oauth>{{/oauth}}
        </authentication>{{/authentication}}
    </http>
    {{#properties}}
    <property name="{{name}}" scope="{{scope}}" value="{{value}}"/>
    {{/properties}}  
    {{#description}}<description>{{description}}</description>{{/description}}
</endpoint>
{{#template}}</template>{{/template}}`;
}


export function getHttpEndpointXml(data: HttpEndpointArgs) {

    data.retryCount = data.retryCount === '' ? '0' : data.retryCount;
    data.initialDuration = data.initialDuration === '' ? '-1' : data.initialDuration;
    data.progressionFactor = data.progressionFactor === '' ? '1' : data.progressionFactor;
    data.httpMethod = (data.httpMethod === 'leave_as_is' || data.httpMethod === null) ? null : data.httpMethod.toLowerCase();

    let timeout, authentication, basicAuth, oauth, authorizationCode, clientCredentials, passwordCredentials, endpoint, template;

    assignNullToEmptyStrings(data);

    data.timeoutAction = (data.timeoutAction === 'Never' || data.timeoutAction === null) ? null : data.timeoutAction.toLowerCase();
    if (data.timeoutDuration != null || data.timeoutAction != null) {
        timeout = true;
    }

    if (data.authType === 'None') {
        authentication = null;
    } else if (data.authType === 'Basic Auth') {
        basicAuth = true;
        authentication = true;
    } else {
        oauth = true;
        authentication = true;
        if (data.grantType === 'Authorization Code') {
            authorizationCode = true;
        } else if (data.grantType === 'Client Credentials') {
            clientCredentials = true;
        } else {
            passwordCredentials = true;
        }
    }

    data.addressListener = data.addressListener === 'enable' ? 'true' : null;

    if (!data.requireProperties || data.properties.length == 0) {
        data.properties = null;
    }

    if (!data.requireOauthParameters || data.oauthProperties.length == 0) {
        data.oauthProperties = null;
    }

    data.templateName != null && data.templateName != '' ? template = true : endpoint = true;

    data.endpointName = (data.endpointName != null && data.endpointName != '') ?
        "endpoint_urn_uuid_".concat(generateUUID()) : data.endpointName;

    let parameters: any = [];
    if (!data.requireTemplateParameters || data.templateParameters.length == 0) {
        data.templateParameters = null;
    } else {
        let incrementalValue = 1;
        data.templateParameters.forEach(element => {
            parameters.push({ key: 'axis2ns'.concat(String(incrementalValue).padStart(2, '0')), value: element });
            incrementalValue++;
        });
    }

    const modifiedData = {
        ...data,
        timeout,
        authentication,
        basicAuth,
        oauth,
        authorizationCode,
        clientCredentials,
        passwordCredentials,
        endpoint,
        template,
        parameters
    };

    return render(getHttpEndpointMustacheTemplate(), modifiedData);
}

function assignNullToEmptyStrings(obj: { [key: string]: any }): void {
    for (const key in obj) {
        if (obj[key] === '' || obj[key] === 'disable') {
            obj[key] = null;
        }
    }
}

function generateUUID(): string {
    const buf = randomBytes(16);
    buf[6] = (buf[6] & 0x0f) | 0x40;
    buf[8] = (buf[8] & 0x3f) | 0x80;

    return buf.toString('hex', 0, 4) + '-' +
        buf.toString('hex', 4, 6) + '-' +
        buf.toString('hex', 6, 8) + '-' +
        buf.toString('hex', 8, 10) + '-' +
        buf.toString('hex', 10, 16);
}
