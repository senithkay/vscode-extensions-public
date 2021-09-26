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
        case "ballerina_http_Client":
            fieldsForFunctions.forEach((value, key) => {
                if (key === INIT) {
                    value.parameters.forEach((param) => {
                        if (param.name === "url") {
                            param.displayName = "URL";
                            param.description = "URL of the target service";
                            param.validationRegex = new RegExp("[(http(s)?):\\/\\/(www\\.)?a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)");
                        } else if (param.name === "config") {
                            param.hide = true;
                            param.noCodeGen = true;
                            param.displayName = "Advance Configurations";
                            const recordFields: FormField[] = [];
                            if (param.fields && param.fields.length > 0) {
                                param.fields.forEach(recordField => {
                                    if (recordField.name === "forwarded") {
                                        recordField.displayName = "Forwarded";
                                    } else if (recordField.name === "httpVersion") {
                                        recordField.displayName = "HTTP Version";
                                        recordFields.push(recordField);
                                    } else if (recordField.name === "timeoutInMillis") {
                                        recordField.displayName = "Timeout In Milliseconds";
                                        recordFields.push(recordField);
                                    } else {
                                        recordFields.push(recordField);
                                    }
                                });
                                param.fields = recordFields;
                            }
                        }
                    });
                    filteredFunctions.set(key, value);
                } else if (key === "get") {
                    value.parameters.forEach((param) => {
                        if (param.name === "path") {
                            param.displayName = "Resource Path";
                            param.value = "\"/\"";
                        } else if (param.name === "message") {
                            param.hide = true;
                            param.noCodeGen = true;
                            param.displayName = "Message";
                        } else if (param.name === "targetType") {
                            param.hide = true;
                            param.noCodeGen = true;
                        } else if (param.name === "headers") {
                            param.displayName = "Headers";
                            param.customAutoComplete = headerKeys;
                            param.fields[0].customAutoComplete = headerVal;
                        }
                    });
                    filteredFunctions.set(key, value);
                } else if (key === "post" || key === "put" || key === "delete" || key === "patch") {
                    value.parameters.forEach((param) => {
                        if (param.name === "path") {
                            param.displayName = "Resource Path";
                            param.value = "\"/\"";
                        } else if (param.name === "message") {
                            param.displayName = "Message";
                        } else if (param.name === "targetType") {
                            param.hide = true;
                            param.noCodeGen = true;
                        } else if (param.name === "headers") {
                            param.displayName = "Headers";
                            param.customAutoComplete = headerKeys;
                            param.fields[0].customAutoComplete = headerVal;
                        }
                    });
                    filteredFunctions.set(key, value);
                } else if (key === "forward") {
                    value.parameters.forEach((param) => {
                        if (param.name === "path") {
                            param.displayName = "Resource Path";
                            param.value = "\"/\"";
                        } else if (param.name === "request") {
                            param.displayName = "Request";
                            param.typeName = "httpRequest";
                            param.typeInfo = httpRequest;
                        } else if (param.name === "targetType") {
                            param.hide = true;
                            param.noCodeGen = true;
                        }
                    });
                    filteredFunctions.set(key, value);
                }
            });

            // Set payload types.
            const payloadTypes: Map<string, string> = new Map();
            payloadTypes.set("String", "string");
            payloadTypes.set("XML", "xml");
            payloadTypes.set("JSON", "json");
            const responsePayloadMap: ResponsePayloadMap = {
                isPayloadSelected: false,
                payloadTypes
            };
            connectorConfig.responsePayloadMap = responsePayloadMap;
            break;
        case "ballerina_email_SmtpClient":
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo , key) => {
                if (key === "sendMessage") {
                    let formField: FormField[] = [];
                    value.parameters[0].fields.forEach((param) => {
                        if (param.name === "contentType" || param.name === "sender") {
                            param.hide = true;
                        } else if (param.name === "replyTo") {
                            param.hide = true;
                            param.value = "[]";
                        } else if (param.name === "'from") {
                            // const state = store.getState();
                            param.tooltip = tooltipMessages.SMTP.from
                            param.value = userEmail ? "\"" + userEmail + "\"" : undefined;
                            formField = [param, ...formField]
                        } else if (param.name === "to") {
                            param.typeName = "array";
                            param.memberType = {typeName: PrimitiveBalType.String};
                            param.fields = [];
                            param.tooltip = tooltipMessages.SMTP.to
                        }
                        else if (param.name === "subject"){
                            param.tooltip = tooltipMessages.SMTP.subject
                        }
                        else if (param.name === "body"){
                            param.tooltip = tooltipMessages.SMTP.body
                        }

                        if (param.name !== "'from") {
                            formField.push(param);
                        }
                    });
                    value.parameters[0].fields = formField;
                    filteredFunctions.set(key, value);
                } else if (key === 'send'){
                    value.parameters.forEach((param) => {
                        if (param.typeName === "Options") {
                            param.fields.forEach(field => {
                                // Temporarily setting default value to contentType to avoid running into run-time errors
                                if (field.name === "contentType"){
                                    field.value = `"text/plain"`;
                                }
                            })
                        }
                    });
                    filteredFunctions.set(key, value);
                }
                else if (key === INIT) {
                    if (value.parameters[3].name === CLIENT_CONFIG) {
                        value.parameters[3].fields.forEach((param) => {
                            if (param.name === "properties" || param.name === "secureSocket") {
                                param.hide = true;
                            }
                        })
                    }
                    if (value.parameters[0].name === "host"){
                        value.parameters[0].tooltip = tooltipMessages.SMTP.host
                    }
                    if (value.parameters[1].name === "username"){
                        value.parameters[1].tooltip = tooltipMessages.SMTP.username
                    }
                    if (value.parameters[2].name === "password"){
                        value.parameters[2].tooltip = tooltipMessages.SMTP.password
                    }
                    filteredFunctions.set(key, value);
                }
                else {
                    filteredFunctions.set(key, value);
                }
            });
            break;
        case "ballerina_email_ImapClient":
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo, key) => {
                if (key === INIT) {
                    value.parameters.find(field => field.name === CLIENT_CONFIG).hide = true;
                    value.parameters.find(field => field.name === CLIENT_CONFIG).noCodeGen = true;
                    if (value.parameters[0].name === "host"){
                        value.parameters[0].tooltip = tooltipMessages.IMAP.host
                    }
                    if (value.parameters[1].name === "username"){
                        value.parameters[1].tooltip = tooltipMessages.IMAP.username
                    }
                    if (value.parameters[2].name === "password"){
                        value.parameters[2].tooltip = tooltipMessages.IMAP.password
                        value.parameters[2].tooltipActionLink = tooltipMessages.IMAP.passwordLink
                        value.parameters[2].tooltipActionText = tooltipMessages.IMAP.passwordText
                    }
                }
                filteredFunctions.set(key, value);
            });
            break;
        case "ballerina_email_PopClient":
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo, key) => {
                if (key === INIT) {
                    value.parameters.find(field => field.name === CLIENT_CONFIG).hide = true;
                    value.parameters.find(field => field.name === CLIENT_CONFIG).noCodeGen = true;
                    if (value.parameters[0].name === "host"){
                        value.parameters[0].tooltip = tooltipMessages.POP3.host
                    }
                    if (value.parameters[1].name === "username"){
                        value.parameters[1].tooltip = tooltipMessages.POP3.username
                    }
                    if (value.parameters[2].name === "password"){
                        value.parameters[2].tooltip = tooltipMessages.POP3.password
                    }
                }
                filteredFunctions.set(key, value);
            });
            break;
        case "ballerinax_googleapis.gmail_Client":
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo, key) => {
                if (key === "sendMessage" || key === "createDraft" || key === "updateDraft") {
                    value.parameters.find(fields => fields.name === "message").fields.forEach(field => {
                        if (field.name === "contentType") {
                            // set content type in sendMessage form
                            field.value = `"text/plain"`;
                        }
                        if (field.name === "inlineImagePaths") {
                            field.optional = true;
                            field.displayName = 'Inline Image Paths'
                        }
                        if (field.name === "attachmentPaths") {
                            field.optional = true;
                            field.displayName = 'Attachment Paths'
                        }
                    });
                }

                // hide optional fields from gmail forms
                // TODO: Remove when optional field BE support is given
                if (key === INIT){
                    hideOptionalFields(value, GMAIL_CONFIG, OAUTH_CLIENT_CONFIG);
                }

                if (key === "readMessage") {
                    value.parameters.find(fields => fields.name === "format").hide = true;
                    value.parameters.find(fields => fields.name === "metadataHeaders").hide = true;
                }
                if (key === "listMessages") {
                    value.parameters.find(fields => fields.name === "filter").hide = true;
                }

                // set default value to userId field
                const userIdField = value.parameters.find(field => field.name === "userId");
                if (userIdField && !(userIdField?.value)) {
                    value.parameters.find(field => field.name === "userId").value = `"me"`;
                }
                filteredFunctions.set(key, value);
            });
            break;
        case "ballerinax_googleapis.calendar_Client":
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo, key) => {

                // hide optional fields from google calendar forms
                // TODO: Remove when optional field BE support is given
                if (key === INIT){
                    hideOptionalFields(value, CALENDAR_CONFIG, OAUTH2_CONFIG);
                }

                if (key === "createEvent" || key === "updateEvent") {
                    value.parameters.find(field => field.name === "event").fields.forEach((field) => {
                        if (!((field.name === "summary") || (field.name === "description") || (field.name === "location") ||
                            (field.name === "'start") || (field.name === "end") || (field.name === "attendees"))) {
                            field.hide = true;
                        } else if (field.name === "attendees") {
                            field.displayName = "Attendee Emails";
                        }
                    });
                    filteredFunctions.set(key, value);
                } else if (key === "quickAddEvent") {
                    value.parameters.forEach((field) => {
                        if ((field.name === "sendUpdates")) {
                            field.hide = true;
                        }
                    });
                    filteredFunctions.set(key, value);
                } else if (key === "getEvents") {
                    value.parameters.forEach((field) => {
                        if ((field.name === "count")) {
                            field.value = "10";
                        }
                    });
                    filteredFunctions.set(key, value);
                } else if (!((key === "watchEvents") || (key === "stopChannel"))) {
                    filteredFunctions.set(key, value);
                }
            });
            break;
        case 'ballerinax_googleapis.sheets_Client':
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo, key) => {
                // hide optional fields from google sheets forms
                // TODO: Remove when optional field BE support is given
                if (key === INIT){
                    hideOptionalFields(value, SPREAD_SHEET_CONFIG, OAUTH_CLIENT_CONFIG);
                }

                // HACK: hide duplicate sheet operations. this will fixed in next sheet connector release. #5338
                const filteredOperations = [ "removeSheet", "addColumnsBefore", "addColumnsAfter", "deleteColumns",
                    "addRowsBefore", "addRowsAfter", "deleteRows", "copyTo", "clearAll" ];
                if (!filteredOperations.includes(key)) {
                    if (key === "addRowsBeforeBySheetName") {
                        value.name = "Add Rows Before"
                    }
                    filteredFunctions.set(key, value);
                }
            });
            break;
        case 'ballerinax_github_Client':
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo, key) => {
                if (key === INIT) {
                    // hide optional fields from github forms
                    // TODO: Remove when optional field BE support is given
                    hideOptionalFields(value, CONFIG, ACCESS_TOKEN);

                    value.parameters.find(fields => fields.name === "config").fields
                        .find(fields => fields.name === "clientConfig").optional = true;
                } else if (key === "getOrganizationProjectList") {
                    // HACK: use hardcoded FormFields until ENUM fix from lang-server
                    const stateField = value.parameters.find(fields => fields.name === "state");
                    if (stateField) {
                        stateField.typeName = PrimitiveBalType.String;
                        stateField.customAutoComplete = [`"OPEN"`, `"CLOSED"`];
                    }
                } else if (key === "getRepositoryProjectList") {
                    // HACK: use hardcoded FormFields until ENUM fix from lang-server
                    const stateField = value.parameters.find(fields => fields.name === "state");
                    if (stateField) {
                        stateField.typeName = PrimitiveBalType.String;
                        stateField.customAutoComplete = [`"OPEN"`, `"CLOSED"`];
                    }
                } else if (key === "getRepositoryIssueList") {
                    // HACK: use hardcoded FormFields until ENUM fix from lang-server
                    const statesField = value.parameters.find(fields => fields.name === "states");
                    if (statesField) {
                        statesField.typeName = "array";
                        statesField.memberType = {typeName: PrimitiveBalType.String};
                        statesField.customAutoComplete = [`"OPEN"`, `"CLOSED"`];
                    }
                }
                filteredFunctions.set(key, value);
            });
            break;
        case 'ballerinax_sfdc_Client':
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo, key) => {
                if (key === INIT) {
                    // TODO: update this tooltip assignment with source code documentation values
                    value.parameters.find(fields => fields.name === "salesforceConfig").fields.
                        find(fields => fields.name === CLIENT_CONFIG).fields.
                            find(fields => fields.typeInfo?.name === "OAuth2RefreshTokenGrantConfig").fields.forEach(subFields => {
                                if (subFields.name === "refreshUrl") subFields.tooltip = tooltipMessages.salesforce.refreshTokenURL;
                                if (subFields.name === "refreshToken") subFields.tooltip = tooltipMessages.salesforce.refreshToken;
                                if (subFields.name === "clientId") subFields.tooltip = tooltipMessages.salesforce.clientID;
                                if (subFields.name === "clientSecret") subFields.tooltip = tooltipMessages.salesforce.clientSecret;
                    });
                    value.parameters.find(fields => fields.name === "salesforceConfig").fields.
                        find(fields => fields.name === "baseUrl").tooltip = tooltipMessages.salesforce.baseURL;
                } else if (key === "createJob") {
                    value.parameters.forEach(field => {
                        if (field.name === "operation"){
                            // HACK: use hardcoded FormFields until ENUM fix from lang-server
                            field.typeName = PrimitiveBalType.String;
                            field.customAutoComplete = [`"insert"`, `"update"`, `"delete"`, `"upsert"`, `"query"`];
                        } else if (field.name === "contentType"){
                            // HACK: use hardcoded FormFields until ENUM fix from lang-server
                            field.typeName = PrimitiveBalType.String;
                            field.customAutoComplete = [`"JSON"`, `"XML"`, `"CSV"`];
                        }
                    })
                }
                filteredFunctions.set(key, value);
            });
            break;
        case 'ballerinax_netsuite_Client':
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo, key) => {
                // HACK: use hardcoded FormFields until ENUM fix from lang-server
                if (key === "getAll") {
                    value.parameters[0] = {
                        typeName: PrimitiveBalType.String,
                        name: "RecordType",
                        optional: false,
                    }
                }
                filteredFunctions.set(key, value);
            });
            break;
        case 'ballerinax_slack_Client':
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo, key) => {
                // TODO: hide file upload operation until the Choreo support file upload feature
                if (key !== "uploadFile") {
                    filteredFunctions.set(key, value);
                }
            });
            break;
        case 'ballerinax_worldbank_Client':
            // HACK: update default response format as a JSON
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo, key) => {
                if (value.parameters.find(field => field.name === "format")){
                    value.parameters.find(field => field.name === "format").value = `"json"`;
                }
                filteredFunctions.set(key, value);
            });
            break;
        case 'ballerinax_twilio_Client':
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo, key) => {
                if (key === "makeVoiceCall") {
                    value.parameters.find(field => field.name === "voiceCallInput").fields.forEach(field => {
                        if (field.name === "userInputType") {
                            // HACK: add ENUM types to expression-editor auto suggestion list
                            //      need to remove this once add ENUM support to Choreo
                            field.customAutoComplete = [
                                "twilio:TWIML_URL",
                                "twilio:MESSAGE_IN_TEXT"
                            ];
                            field.typeName = PrimitiveBalType.String
                        }
                    });
                }
                filteredFunctions.set(key, value);
            });
            break;
        case 'ballerinax_googleapis.drive_Client':
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo, key) => {

                // TODO: hide these operation until the Choreo support file upload feature
                const hiddenActions: string[] = [
                    "uploadFile",
                    "uploadFileUsingByteArray",
                    "watchFiles",
                    "watchFilesById",
                    "watchStop",
                    "getAbout",
                    "listChanges"
                ];
                if (!hiddenActions.includes(key)) {
                    filteredFunctions.set(key, value);
                }
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
