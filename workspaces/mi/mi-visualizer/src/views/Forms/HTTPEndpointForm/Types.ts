/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ParamConfig } from '@wso2-enterprise/ui-toolkit';
import * as yup from "yup";

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

    // Endpoint Error Handling: start
    suspendErrorCodes: "",
    initialDuration: -1,
    maximumDuration: Number.MAX_SAFE_INTEGER,
    progressionFactor: 1.0,
    retryErrorCodes: "",
    retryCount: 0,
    retryDelay: 0,
    timeoutDuration: 0,
    timeoutAction: "Never",

    // Template Configuration
    templateName: "",
    requireTemplateParameters: false,
    templateParameters: []
}

export const getSchema = (type: string) => {
    return yup.object({
        endpointName: yup.string().required("Endpoint name is required").matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in name"),
        traceEnabled: yup.string(),
        statisticsEnabled: yup.string(),
        uriTemplate: yup
            .string()
            .required("URI template is required")
            .matches(/^(https?|ftp):\/\/(([a-z\d]([a-z\d-]*[a-z\d])?\.)+[a-z]{2,}|localhost(:[\d]*)?)(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i, "Invalid URI template format"),
        httpMethod: yup.string().required("HTTP method is required"),
        description: yup.string(),
        requireProperties: yup.boolean(),
        properties: yup.array(),
        authType: yup.string(),
        basicAuthUsername: yup.string().when('authType', {
            is: 'Basic Auth',
            then: (schema) => schema.required('Basic Auth Username is required'),
            otherwise: (schema) => schema.notRequired(),
        }),
        basicAuthPassword: yup.string().when('authType', {
            is: 'Basic Auth',
            then: (schema) => schema.required('Basic Auth Password is required'),
            otherwise: (schema) => schema.notRequired(),
        }),
        authMode: yup.string(),
        grantType: yup.string(),
        clientId: yup.string().when('authType', {
            is: 'OAuth',
            then: (schema) => schema.required('Client ID is required'),
            otherwise: (schema) => schema.notRequired(),
        }),
        clientSecret: yup.string().when('authType', {
            is: 'OAuth',
            then: (schema) => schema.required('Client Secret is required'),
            otherwise: (schema) => schema.notRequired(),
        }),
        tokenUrl: yup.string().when('authType', {
            is: 'OAuth',
            then: (schema) => schema.required('Token URL is required'),
            otherwise: (schema) => schema.notRequired(),
        }),
        refreshToken: yup.string().when(['authType', 'grantType'], {
            is: (authType: any, grantType: any) => grantType === 'Authorization Code' && authType === 'OAuth',
            then: (schema) => schema.required('Refresh token is required'),
            otherwise: (schema) => schema.notRequired(),
        }),
        username: yup.string().when('grantType', {
            is: 'Password',
            then: (schema) => schema.required('Username is required'),
            otherwise: (schema) => schema.notRequired(),
        }),
        password: yup.string().when('grantType', {
            is: 'Password',
            then: (schema) => schema.required('Password is required'),
            otherwise: (schema) => schema.notRequired(),
        }),
        requireOauthParameters: yup.boolean(),
        oauthProperties: yup.array(),
        addressingEnabled: yup.string(),
        addressingVersion: yup.string(),
        addressListener: yup.string(),
        securityEnabled: yup.string(),
        suspendErrorCodes: yup.string(),
        initialDuration: yup.number().typeError('Initial Duration must be a number'),
        maximumDuration: yup.number().typeError('Maximum Duration must be a number').min(0, "Maximum Duration must be greater than or equal to 0"),
        progressionFactor: yup.number().typeError('Progression Factor must be a number'),
        retryErrorCodes: yup.string(),
        retryCount: yup.number().typeError('Retry Count must be a number').min(0, "Retry Count must be greater than or equal to 0"),
        retryDelay: yup.number().typeError('Retry Delay must be a number').min(0, "Retry Delay must be greater than or equal to 0"),
        timeoutDuration: yup.number().typeError('Timeout Duration must be a number').min(0, "Timeout Duration must be greater than or equal to 0"),
        timeoutAction: yup.string(),
        templateName: type === 'endpoint' ? yup.string() : yup.string().required("Template name is required"),
        requireTemplateParameters: yup.boolean(),
        templateParameters: yup.array()
    });
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
            defaultValue: "parameter_key",
            isRequired: true
        },
        {
            id: 1,
            type: "TextField",
            label: "Value",
            defaultValue: "parameter_value",
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
            defaultValue: "parameter_key",
            isRequired: true
        },
        {
            id: 1,
            type: "TextField",
            label: "Value",
            defaultValue: "parameter_value",
            isRequired: true
        }
    ]
}
