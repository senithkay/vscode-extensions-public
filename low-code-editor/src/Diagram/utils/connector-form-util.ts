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
import { Connector } from "../../Definitions/lang-client-extended";
import { tooltipMessages } from "../components/Portals/utils/constants";

export function filterConnectorFunctions(connector: Connector, fieldsForFunctions: Map<string, FunctionDefinitionInfo>,
                                         connectorConfig: ConnectorConfig, state?: any): Map<string, FunctionDefinitionInfo> {
    let filteredFunctions: Map<string, FunctionDefinitionInfo> = new Map();
    const connectorName: string = connector.org + "_" + connector.module + "_" + connector.name;
    switch (connectorName) {
        case "ballerina_http_Client":
            fieldsForFunctions.forEach((value, key) => {
                if (key === "init") {
                    value.parameters.forEach((param) => {
                        if (param.name === "url") {
                            param.displayName = "URL";
                            param.description = "URL of the target service";
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
                            param.type = "httpRequest";
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
                            param.value = state.userInfo?.user?.email ? "\"" + state.userInfo?.user?.email + "\"" : undefined;
                            formField = [param, ...formField]
                        } else if (param.name === "to") {
                            param.type = "collection";
                            param.collectionDataType = {type: PrimitiveBalType.String, isParam: true};
                            param.isUnion = false;
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
                }
                else if (key === "init") {
                    if (value.parameters[3].name === "clientConfig") {
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
                if (key === "init") {
                    value.parameters.find(field => field.name === "clientConfig").hide = true;
                    value.parameters.find(field => field.name === "clientConfig").noCodeGen = true;
                    if (value.parameters[0].name === "host"){
                        value.parameters[0].tooltip = tooltipMessages.IMAP.host
                    }
                    if (value.parameters[1].name === "username"){
                        value.parameters[1].tooltip = tooltipMessages.IMAP.username
                    }
                    if (value.parameters[2].name === "password"){
                        value.parameters[2].tooltip = tooltipMessages.IMAP.password
                    }
                }
                filteredFunctions.set(key, value);
            });
            break;
        case "ballerina_email_PopClient":
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo, key) => {
                if (key === "init") {
                    value.parameters.find(field => field.name === "clientConfig").hide = true;
                    value.parameters.find(field => field.name === "clientConfig").noCodeGen = true;
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
        case 'ballerinax_sfdc_Client':
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo, key) => {
                if (key === "init") {
                    // TODO: update this tooltip assignment with source code documentation values
                    value.parameters.find(fields => fields.name === "salesforceConfig").fields.
                        find(fields => fields.name === "clientConfig").fields.
                            find(fields => fields.typeInfo?.name === "OAuth2RefreshTokenGrantConfig").fields.forEach(subFields => {
                                if (subFields.name === "refreshUrl") subFields.tooltip = tooltipMessages.salesforce.refreshTokenURL;
                                if (subFields.name === "refreshToken") subFields.tooltip = tooltipMessages.salesforce.refreshToken;
                                if (subFields.name === "clientId") subFields.tooltip = tooltipMessages.salesforce.clientID;
                                if (subFields.name === "clientSecret") subFields.tooltip = tooltipMessages.salesforce.clientSecret;
                    });
                    value.parameters.find(fields => fields.name === "salesforceConfig").fields.
                        find(fields => fields.name === "baseUrl").tooltip = tooltipMessages.salesforce.baseURL;
                }
                filteredFunctions.set(key, value);
            });
            break;
        case 'ballerinax_netsuite_Client':
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo, key) => {
                // HACK: use hardcoded FormFields until ENUM fix from lang-server
                if (key === "getAll") {
                    value.parameters[0] = {
                        type: PrimitiveBalType.String,
                        name: "RecordType",
                        optional: false,
                        isParam: true
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
                    "updateFileMetadataById",
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
    const connectorName: string = connector.org + "_" + connector.module + "_" + connector.name;
    switch (connectorName) {
        case 'ballerina_http_Client':
            functionDefInfoMap.forEach((value, key) => {
                switch (key) {
                    case 'init':
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
                            if (!(param.type === "string" || param.type === "xml" || param.type === "json")) {
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
                    case 'init':
                    case 'sendMessage':
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
                            field.isUnion = false;
                            field.type = PrimitiveBalType.String;
                            field.value = field.fields[0].value;
                            field.fields = [];
                        }
                    })
                }
            });
            break;
        case 'ballerina_email_ImapClient':
            functionDefInfoMap.forEach((value, key) => {
                if (key === 'init') {
                    value.parameters.filter(field => field.name === 'clientConfig')[0].fields.forEach(subField => {
                        if (subField.name === 'properties') {
                            subField.noCodeGen = true;
                        }
                    });
                }
            });
            break;
        case 'ballerina_email_PopClient':
            functionDefInfoMap.forEach((value, key) => {
                if (key === 'init') {
                    value.parameters.filter(field => field.name === 'clientConfig')[0].fields.forEach(subField => {
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
                            if (field.name === 'spreadsheetConfig') {
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
