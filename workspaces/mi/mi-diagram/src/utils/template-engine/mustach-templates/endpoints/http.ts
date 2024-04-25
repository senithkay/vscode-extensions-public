/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NamedEndpoint } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";

export function getHTTPEndpointMustacheTemplate() {

    return `
    <endpoint>
        <http {{#httpMethod}}method="{{httpMethod}}"{{/httpMethod}} {{#statisticsEnabled}}statistics="{{statisticsEnabled}}"{{/statisticsEnabled}} {{#traceEnabled}}trace="{{traceEnabled}}"{{/traceEnabled}} uri-template="{{{uriTemplate}}}">
            {{#timeout}}<timeout>
                {{#timeoutDuration}}<duration>{{timeoutDuration}}</duration>{{/timeoutDuration}}
                {{#timeoutAction}}<responseAction>{{timeoutAction}}</responseAction>{{/timeoutAction}}
            </timeout>{{/timeout}}  
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
                {{#authentication}}<authentication>
                {{#basicAuth}}<basicAuth>
                    {{#basicAuthUsername}}<username>{{basicAuthUsername}}</username>{{/basicAuthUsername}}{{^basicAuthUsername}}<username/>{{/basicAuthUsername}}
                    {{#basicAuthPassword}}<password>{{basicAuthPassword}}</password>{{/basicAuthPassword}}{{^basicAuthPassword}}<password/>{{/basicAuthPassword}}
                </basicAuth>{{/basicAuth}}
                {{#oauth}}<oauth>
                    {{#authorizationCode}}<authorizationCode>
                        {{#refreshToken}}<refreshToken>{{refreshToken}}</refreshToken>{{/refreshToken}}{{^refreshToken}}<refreshToken/>{{/refreshToken}}
                        {{#clientId}}<clientId>{{clientId}}</clientId>{{/clientId}}{{^clientId}}<clientId/>{{/clientId}}
                        {{#clientSecret}}<clientSecret>{{clientSecret}}</clientSecret>{{/clientSecret}}{{^clientSecret}}<clientSecret/>{{/clientSecret}}
                        {{#tokenUrl}}<tokenUrl>{{tokenUrl}}</tokenUrl>{{/tokenUrl}}{{^tokenUrl}}<tokenUrl/>{{/tokenUrl}}
                        {{#requireOauthParameters}}<requestParameters>{{/requireOauthParameters}}
                        {{#oauthParameters}}
                            <parameter name="{{key}}">{{{value}}}</parameter>
                        {{/oauthParameters}} 
                        {{#requireOauthParameters}}</requestParameters>{{/requireOauthParameters}}
                        <authMode>{{oauthAuthenticationMode}}</authMode>
                    </authorizationCode>{{/authorizationCode}}
                    {{#clientCredentials}}<clientCredentials>
                        {{#clientId}}<clientId>{{clientId}}</clientId>{{/clientId}}{{^clientId}}<clientId/>{{/clientId}}
                        {{#clientSecret}}<clientSecret>{{clientSecret}}</clientSecret>{{/clientSecret}}{{^clientSecret}}<clientSecret/>{{/clientSecret}}
                        {{#tokenUrl}}<tokenUrl>{{tokenUrl}}</tokenUrl>{{/tokenUrl}}{{^tokenUrl}}<tokenUrl/>{{/tokenUrl}}
                        {{#requireOauthParameters}}<requestParameters>{{/requireOauthParameters}}
                        {{#oauthParameters}}
                            <parameter name="{{key}}">{{{value}}}</parameter>
                        {{/oauthParameters}}    
                        {{#requireOauthParameters}}</requestParameters>{{/requireOauthParameters}}                
                        <authMode>{{oauthAuthenticationMode}}</authMode>
                    </clientCredentials>{{/clientCredentials}}
                    {{#passwordCredentials}}<passwordCredentials>
                        {{#clientId}}<clientId>{{clientId}}</clientId>{{/clientId}}{{^clientId}}<clientId/>{{/clientId}}
                        {{#clientSecret}}<clientSecret>{{clientSecret}}</clientSecret>{{/clientSecret}}{{^clientSecret}}<clientSecret/>{{/clientSecret}}
                        {{#tokenUrl}}<tokenUrl>{{tokenUrl}}</tokenUrl>{{/tokenUrl}}{{^tokenUrl}}<tokenUrl/>{{/tokenUrl}}
                        {{#requireOauthParameters}}<requestParameters>{{/requireOauthParameters}}
                        {{#oauthParameters}}
                            <parameter name="{{key}}">{{{value}}}</parameter>
                        {{/oauthParameters}}  
                        {{#requireOauthParameters}}</requestParameters>{{/requireOauthParameters}}
                        <authMode>{{oauthAuthenticationMode}}</authMode>
                        {{#oauthUsername}}<username>{{oauthUsername}}</username>{{/oauthUsername}}{{^oauthUsername}}<username/>{{/oauthUsername}}
                        {{#oauthPassword}}<password>{{oauthPassword}}</password>{{/oauthPassword}}{{^oauthPassword}}<password/>{{/oauthPassword}}
                    </passwordCredentials>{{/passwordCredentials}}
                </oauth>{{/oauth}}
            </authentication>{{/authentication}}
            </http>
            {{#properties}}
            <property name="{{propertyName}}" {{#scope}}scope="{{scope}}"{{/scope}} {{#value}}value="{{value}}"{{/value}} {{#expression}}expression="{{expression}}"{{/expression}} />
            {{/properties}}
            {{#description}}<description>{{description}}</description>{{/description}}
    </endpoint>
    `;
}


export function getHTTPEndpointXml(data: { [key: string]: any }) {

    data.httpMethod = data.httpMethod.toLowerCase(),
        data.timeoutAction = (data.timeoutAction == 'never' || data.timeoutAction == null) ? null : data.timeoutAction.toLowerCase();
    if (data.timeoutDuration != null || data.timeoutAction != null) {
        data.timeout = true;
    }
    data.statisticsEnabled = data.statisticsEnabled ? "enable" : "disable";
    data.traceEnabled = data.traceEnabled ? "enable" : "disable";

    if (data.authType === 'None') {
        data.authentication = null;
    } else if (data.authType === 'Basic Auth') {
        data.basicAuth = true;
        data.authentication = true;
    } else {
        data.oauth = true;
        data.authentication = true;
        if (data.oauthGrantType === 'Authorization Code') {
            data.authorizationCode = true;
        } else if (data.oauthGrantType === 'Client Credentials') {
            data.clientCredentials = true;
        } else {
            data.passwordCredentials = true;
        }
    }

    data.addressListener = data.addressListener === 'enable' ? 'true' : null;

    if (data.oauthParameters) {
        data.requireOauthParameters = true;
    }

    data.properties = data?.properties.map((property: string[]) => {
        return {
            propertyName: property[0],
            scope: property[1] == "default" ? undefined : property[1],
            value: property[2] == "LITERAL" ? property[3] : undefined,
            expression: property[2] == "EXPRESSION" ? property[4] : undefined
        }
    });
    data.oauthParameters = data?.oauthParameters?.map((parameter: string[]) => {
        const value = parameter[1] == "EXPRESSION" && !parameter[3].startsWith("{") ? "{" + parameter[3] + "}" : parameter[2];
        return {
            key: parameter[0],
            value: value
        }
    })
    const output = Mustache.render(getHTTPEndpointMustacheTemplate(), data).trim();
    return output;
}

export function getHTTPEndpointFormDataFromSTNode(data: { [key: string]: any }, node: NamedEndpoint) {

    data.uriTemplate = node.http.uriTemplate;
    const configs = node.http.enableSecAndEnableRMAndEnableAddressing;
    const suspendOnFailure = configs?.suspendOnFailure;
    const markForSuspension = configs?.markForSuspension;
    const authentication = configs?.authentication;
    const retryConfig = configs?.retryConfig;
    data.timeoutDuration = configs?.timeout?.content[0]?.textNode;
    data.timeoutAction = configs?.timeout?.content[1]?.textNode;
    data.timeoutAction = data.timeoutAction ? data.timeoutAction : "never";
    data.suspendErrorCodes = suspendOnFailure?.errorCodes?.textNode;
    data.suspendInitialDuration = suspendOnFailure?.initialDuration?.textNode;
    data.suspendProgressionFactor = suspendOnFailure?.progressionFactor?.textNode;
    data.suspendMaximumDuration = suspendOnFailure?.maximumDuration?.textNode;
    data.retryErrorCodes = markForSuspension?.errorCodes?.textNode;
    data.retryCount = markForSuspension?.retriesBeforeSuspension?.textNode;
    data.retryDelay = markForSuspension?.retryDelay?.textNode;
    data.httpMethod = node.http.method.toUpperCase();
    data.statisticsEnabled = node.http.statistics == "enable" ? true : false;
    data.traceEnabled = node.http.trace == "enable" ? true : false;
    data.authType = authentication?.basicAuth ? "Basic Auth" : (authentication?.oauth ? "OAuth" : "None");
    if (data.authType == "Basic Auth") {
        data.basicAuthUsername = authentication.basicAuth?.username?.textNode;
        data.basicAuthPassword = authentication.basicAuth?.password?.textNode;
    } else if (data.authType == "OAuth") {
        data.oauthGrantType = authentication.oauth?.authorizationCode ? "Authorization Code" : (authentication.oauth?.clientCredentials ? "Client Credentials" : "Password Credentials");
        let oauthConfig: { [key: string]: any };
        if (data.oauthGrantType == "Authorization Code") {
            oauthConfig = authentication.oauth.authorizationCode;
        } else if (data.oauthGrantType == "Client Credentials") {
            oauthConfig = authentication.oauth.clientCredentials;
        } else {
            oauthConfig = authentication.oauth.passwordCredentials;
        }
        data.oauthUsername = oauthConfig?.username?.textNode;
        data.oauthPassword = oauthConfig?.password?.textNode;
        data.clientId = oauthConfig?.clientId?.textNode;
        data.clientSecret = oauthConfig?.clientSecret?.textNode;
        data.refreshToken = oauthConfig?.refreshToken?.textNode;
        data.tokenUrl = oauthConfig?.tokenUrl?.textNode;
        data.oauthParameters = oauthConfig?.requestParameters?.parameter?.map((property: { [key: string]: any }) => {
            let value = property?.textNode;
            const isExpression = value?.startsWith("{") ? true : false;
            const valueType = isExpression ? "EXPRESSION" : "LITERAL";
            const regex = /{([^}]*)}/;
            const match = value.match(regex);
            if (match?.length > 1) {
                value = match[1];
            }
            return [property.name, valueType, isExpression ? undefined : value, isExpression ? value : undefined];
        });
        data.oauthAuthenticationMode = oauthConfig?.authMode?.textNode;
    }
    data.failoverNonRetryErrorCodes = retryConfig?.disabledErrorCodes?.textNode;

    data.properties = node.property.map((property) => {
        const type = property.expression ? "EXPRESSION" : "LITERAL";
        return [property.name, property.scope ?? "default", type, property.value, property.expression]
    });
    data.properties = data.properties ? data.properties : [];
    data.oauthParameters = data.oauthParameters ? data.oauthParameters : [];

    data.description = node.description;
    return data;
}

