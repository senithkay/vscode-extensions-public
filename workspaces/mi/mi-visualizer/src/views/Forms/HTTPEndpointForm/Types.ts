/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ParamConfig } from "@wso2-enterprise/mi-diagram";

export type InputsFields = {
    endpointName: string;
    traceEnabled: string;
    statisticsEnabled: string;
    uriTemplate: string;
    httpMethod: string;
    description: string;
    requireProperties: boolean;
    properties: any[];
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
    oauthProperties: any[];
    addressingEnabled: string;
    addressingVersion: string;
    addressListener: string;
    securityEnabled: string;
    seperatePolicies: boolean;
    policyKey?: string;
    inboundPolicyKey?: string;
    outboundPolicyKey?: string;
    suspendErrorCodes: string;
    initialDuration: number;
    maximumDuration: number;
    progressionFactor: number;
    retryErrorCodes: string;
    retryCount: number;
    retryDelay: number;
    timeoutDuration: number;
    timeoutAction: string;
    templateName: string;
    requireTemplateParameters: boolean;
    templateParameters: any[];
    basicUsernameExpression: boolean;
    basicPasswordExpression: boolean;
    usernameExpression: boolean;
    passwordExpression: boolean;
    clientIdExpression: boolean;
    clientSecretExpression: boolean;
    tokenUrlExpression: boolean;
    refreshTokenExpression: boolean;
    saveInReg?: boolean;
    //reg form
    artifactName?: string;
    registryPath?: string
    registryType?: "gov" | "conf";
}

export const initialEndpoint: InputsFields = {
    // Basic Properties
    endpointName: "",
    traceEnabled: "disable",
    statisticsEnabled: "disable",
    uriTemplate: "",
    httpMethod: "GET",
    description: "",
    requireProperties: false,
    properties: [],

    // Auth Configuration: start
    authType: "None",
    // authType: "Basic",
    basicAuthUsername: "",
    basicAuthPassword: "",
    // authType: "OAuth",
    grantType: "Authorization Code",
    authMode: "Header",
    // -- grantType: "Authorization Code" | "Client Credentials" | "Password",
    clientId: "",
    clientSecret: "",
    tokenUrl: "",
    // grantType: "Authorization Code",
    refreshToken: "",
    // grantType: "Password",
    username: "",
    password: "",
    // -- grantType: end
    requireOauthParameters: false,
    oauthProperties: [],
    
    // Quality of Service: start
    addressingEnabled: "disable",
    // -- addressingEnabled: "enabled",
    addressingVersion: "",
    addressListener: "",
    // -- addressingEnabled: end,
    securityEnabled: "disable",
    seperatePolicies: false,
    policyKey: "",
    inboundPolicyKey: "",
    outboundPolicyKey: "",

    // Endpoint Error Handling: start
    suspendErrorCodes: "",
    initialDuration: -1,
    maximumDuration: Number.MAX_SAFE_INTEGER,
    progressionFactor: 1.0,
    retryErrorCodes: "",
    retryCount: 0,
    retryDelay: 0,
    timeoutDuration: Number.MAX_SAFE_INTEGER,
    timeoutAction: "Never",

    // Template Configuration
    templateName: "",
    requireTemplateParameters: false,
    templateParameters: [],

    basicUsernameExpression: false,
    basicPasswordExpression: false,
    usernameExpression: false,
    passwordExpression: false,
    clientIdExpression: false,
    clientSecretExpression: false,
    tokenUrlExpression: false,
    refreshTokenExpression: false,

    saveInReg: false,
    //reg form
    artifactName: "",
    registryPath: "/",
    registryType: "gov"
}

export const paramTemplateConfigs: ParamConfig = {
    paramValues: [],
    paramFields: [
        {
            id: 0,
            type: "TextField",
            label: "Parameter",
            defaultValue: "parameter_value",
            isRequired: true
        }
    ]
}

export const propertiesConfigs: ParamConfig = {
    paramValues: [],
    paramFields: [
        {
            id: 0,
            type: "TextField",
            label: "Name",
            placeholder: "parameter_key",
            defaultValue: "",
            isRequired: true
        },
        {
            id: 1,
            type: "TextField",
            label: "Value",
            placeholder: "parameter_value",
            defaultValue: "",
            isRequired: true
        },
        {
            id: 2,
            type: "Dropdown",
            label: "Scope",
            values: ["default", "transport", "axis2", "axis2-client"],
            defaultValue: "default",
            isRequired: true
        }
    ]
}

export const oauthPropertiesConfigs: ParamConfig = {
    paramValues: [],
    paramFields: [
        {
            id: 0,
            type: "TextField",
            label: "Name",
            placeholder: "parameter_key",
            defaultValue: "",
            isRequired: true
        },
        {
            id: 1,
            type: "TextField",
            label: "Value",
            placeholder: "parameter_value",
            defaultValue: "",
            isRequired: true
        }
    ]
}
