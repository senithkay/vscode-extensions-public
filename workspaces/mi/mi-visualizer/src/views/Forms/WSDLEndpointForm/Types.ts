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
    format: string;
    traceEnabled: string;
    statisticsEnabled: string;
    optimize: string;
    description: string;
    wsdlUri: string;
    wsdlService: string;
    wsdlPort: string;
    requireProperties: boolean;
    properties: any[];
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
    endpointName: "",
    format: "LEAVE_AS_IS",
    traceEnabled: "disable",
    statisticsEnabled: "disable",
    optimize: "LEAVE_AS_IS",
    description: "",
    wsdlUri: "",
    wsdlService: "",
    wsdlPort: "",
    requireProperties: false,
    properties: [],
    addressingEnabled: "disable",
    addressingVersion: "",
    addressListener: "",
    securityEnabled: "disable",
    suspendErrorCodes: "",
    initialDuration: -1,
    maximumDuration: Number.MAX_SAFE_INTEGER,
    progressionFactor: 1.0,
    retryErrorCodes: "",
    retryCount: 0,
    retryDelay: 0,
    timeoutDuration: 0,
    timeoutAction: "Never",
    templateName: "",
    requireTemplateParameters: false,
    templateParameters: []
};

export const getSchema = (type: string) => {
    return yup.object({
        endpointName: yup.string().required("Endpoint Name is required").matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in name"),
        format: yup.string(),
        traceEnabled: yup.string(),
        statisticsEnabled: yup.string(),
        optimize: yup.string(),
        description: yup.string(),
        wsdlUri: yup
            .string()
            .required("WSDL URI is required")
            .matches(/^(https?|ftp):\/\/(([a-z\d]([a-z\d-]*[a-z\d])?\.)+[a-z]{2,}|localhost(:[\d]*)?)(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?(\.wsdl)$/i, "Invalid URI template format"),
        wsdlService: yup.string().required("WSDL Service is required"),
        wsdlPort: yup.string().required("WSDL Port is required"),
        requireProperties: yup.boolean(),
        properties: yup.array(),
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
