/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// import { store } from "../../../../$store";
import {
    ConnectorConfig,
    FormField,
    FunctionDefinitionInfo,
    httpRequest,
    PrimitiveBalType,
    ResponsePayloadMap
} from "../../ConfigurationSpec/types";
import { Connector } from "../../Definitions";
import { tooltipMessages } from "../components/Portals/utils/constants";

const INIT = "init";
const SPREAD_SHEET_CONFIG = "spreadsheetConfig";
const GMAIL_CONFIG = "gmailConfig";
const OAUTH_CLIENT_CONFIG = "oauthClientConfig";
const CALENDAR_CONFIG = "calendarConfig";
const OAUTH2_CONFIG = "oauth2Config";
const CONFIG = "config";
const ACCESS_TOKEN = "accessToken";
const DRIVE_CONFIG = "driveConfig";
const CLIENT_CONFIG = "clientConfig";

const headerKeys = [`"Accept"`,
    `"Accept-Charset"`,
    `"Accept-Datetime"`,
    `"Accept-Encoding"`,
    `"Accept-Language"`,
    `"Access-Control-Request-Method"`,
    `"Access-Control-Request-Headers"`,
    `"Authorization"`,
    `"Cache-Control"`,
    `"Connection"`,
    `"Permanent"`,
    `"Content-Encoding"`,
    `"Content-Length"`,
    `"Content-MD5"`,
    `"Content-Type"`,
    `"Cookie"`,
    `"Date"`,
    `"Expect"`,
    `"Forwarded"`,
    `"From"`,
    `"Host"`,
]

const headerVal = [
    `"audio/aac"`,
    `"application/x-abiword"`,
    `"application/x-freearc"`,
    `"video/x-msvideo"`,
    `"application/vnd.amazon.ebook"`,
    `"application/octet-stream"`,
    `"image/bmp"`,
    `"application/x-bzip"`,
    `"application/x-bzip2"`,
    `"application/x-csh"`,
    `"text/css"`,
    `"text/csv"`,
    `"application/msword"`,
    `"application/epub+zip"`,
    `"application/gzip"`,
    `"image/gif"`,
    `"text/html"`,
    `"text/calendar"`,
    `"application/java-archive"`,
    `"image/jpeg"`,
    `"text/javascript"`,
    `"application/json"`,
    `"application/ld+json"`,
    `"audio/mpeg"`,
    `"video/mpeg"`,
    `"image/png"`,
    `"application/pdf"`,
    `"image/svg+xml"`,
    `"application/x-shockwave-flash"`,
    `"application/x-tar"`,
    `"image/tiff"`,
    `"font/ttf"`,
    `"text/plain"`,
    `"font/woff"`,
    `"font/woff2"`,
    `"application/xml"`,
    `"text/xml"`,
]

export function filterConnectorFunctions(connector: Connector, fieldsForFunctions: Map<string, FunctionDefinitionInfo>,
                                         connectorConfig: ConnectorConfig, userEmail?: string): Map<string, FunctionDefinitionInfo> {
    let filteredFunctions: Map<string, FunctionDefinitionInfo> = new Map();
    const connectorName: string = connector.package.organization + "_" + connector.moduleName + "_" + connector.name;

    // TODO: Remove when optional field BE support is given
    const hideOptionalFields = (value: FunctionDefinitionInfo, connectorType: string, oauthConfigName: string) => {
        const allFields = value?.parameters?.find(field => field.name === connectorType).fields;
        const mandatoryFields = allFields.find(field => field.name === oauthConfigName);
        const optionalFields = allFields.find(field => field.name !== oauthConfigName);
        optionalFields.hide = true;

        if (oauthConfigName !== ACCESS_TOKEN)
        {
            // Set mandatory fields of OAuth2RefreshTokenGrantConfig
            mandatoryFields.fields.find(fields => fields.typeInfo?.name === "OAuth2RefreshTokenGrantConfig").fields = [
                {
                    "name": "refreshUrl",
                    "optional": false,
                    "typeName": "string"
                },
                {
                    "name": "refreshToken",
                    "optional": false,
                    "typeName": "string"
                },
                {
                    "name": "clientId",
                    "optional": false,
                    "typeName": "string"
                },
                {
                    "name": "clientSecret",
                    "optional": false,
                    "typeName": "string"
                },
            ]
        }

        // Remove JwtIssuerConfig related fields
        if (connectorType === CALENDAR_CONFIG){
            mandatoryFields.fields = mandatoryFields.fields.filter(fields => fields.typeInfo?.name !== "JwtIssuerConfig");
        }
    }

    switch (connectorName) {
        case 'ballerinax_github_Client':
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo, key) => {
                if (key === INIT) {
                    // TODO: Remove this after fixing GitHub connector required field list.
                    value.parameters.find(fields => fields.name === "config").fields
                        .forEach(field => {
                            if (field.name !== "auth") {
                                field.optional = true;
                            }
                        });
                }
                filteredFunctions.set(key, value);
            });
            break;
        default:
            filteredFunctions = fieldsForFunctions;
            break;
    }

    return filteredFunctions;
}

export function filterCodeGenFunctions(connector: Connector, functionDefInfoMap: Map<string, FunctionDefinitionInfo>)
    : Map<string, FunctionDefinitionInfo> {
    const connectorName: string = connector.package.organization + "_" + connector.moduleName + "_" + connector.name;
    switch (connectorName) {
        case 'ballerina_http_Client':
            functionDefInfoMap.forEach((value, key) => {
                switch (key) {
                    case INIT:
                        value.parameters.forEach((param) => {
                            if (param.name === "config") {
                                param.noCodeGen = true;
                            }
                        });
                        break;
                    case 'get':
                        // allowed functions
                        break;
                    case 'post':
                    case 'put':
                    case 'delete':
                    case 'patch':
                        // this filter common for all post put delete and patch methods
                        value.parameters.find(field => field.name === "message").fields.forEach((param) => {
                            if (!(param.typeName === "string" || param.typeName === "xml" || param.typeName === "json")) {
                                param.noCodeGen = true;
                            }
                        });
                        break;
                    case 'forward':
                        // allowed functions
                        break;
                    default:
                        // for functions that are ignored noCodeGen is added for fields
                        value.parameters.forEach(fields => {
                            fields.noCodeGen = true;
                        });
                }
            })
            break;
        case 'ballerina_email_SmtpClient':
            functionDefInfoMap.forEach((value, key) => {
                switch (key) {
                    case INIT:
                    case 'sendMessage':
                        break;
                    case 'send':
                        break;
                    default:
                        value.parameters.forEach(fields => {
                            fields.noCodeGen = true;
                        });
                }
            });
            break;
        case 'ballerinax_github_Client':
            functionDefInfoMap.forEach((value, key) => {
                if (key === 'getRepository') {
                    value.parameters.forEach(field => {
                        if (field.name === 'repoIdentifier') {
                            field.typeName = PrimitiveBalType.String;
                            field.value = field.fields[0].value;
                            field.fields = [];
                        }
                    })
                }
            });
            break;
        case 'ballerina_email_ImapClient':
            functionDefInfoMap.forEach((value, key) => {
                if (key === INIT) {
                    value.parameters.filter(field => field.name === CLIENT_CONFIG)[0].fields.forEach(subField => {
                        if (subField.name === 'properties') {
                            subField.noCodeGen = true;
                        }
                    });
                }
            });
            break;
        case 'ballerina_email_PopClient':
            functionDefInfoMap.forEach((value, key) => {
                if (key === INIT) {
                    value.parameters.filter(field => field.name === CLIENT_CONFIG)[0].fields.forEach(subField => {
                        if (subField.name === 'properties') {
                            subField.noCodeGen = true;
                        }
                    })
                }
            });
            break;
        case 'ballerinax_googleapis_sheets_Client':
            functionDefInfoMap.forEach((value, key) => {
                switch (key) {
                    case 'init':
                        value.parameters.forEach(field => {
                            if (field.name === SPREAD_SHEET_CONFIG) {
                                field.fields.forEach(subField => {
                                    switch (subField.name) {
                                        case 'secureSocketConfig':
                                            subField.noCodeGen = true;
                                            break;
                                    }
                                })
                            }
                        })
                        break;
                }
            })
            break;
        default:
        // other connectors are allowed
    }

    return functionDefInfoMap;
}
