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
import { ConnectorConfig, FormField, FunctionDefinitionInfo, PrimitiveBalType, ResponsePayloadMap } from "../../ConfigurationSpec/types";
import { Connector } from "../../Definitions/lang-client-extended";
import { tooltipMessages } from "../components/Portals/utils/constants";

export function filterConnectorFunctions(connector: Connector, fieldsForFunctions: Map<string, FunctionDefinitionInfo>,
                                         connectorConfig: ConnectorConfig, state?: any): Map<string, FunctionDefinitionInfo> {
    let filteredFunctions: Map<string, FunctionDefinitionInfo> = new Map();
    const connectorName: string = connector.org + "_" + connector.module + "_" + connector.name;
    switch (connectorName) {
        case "ballerina_http_HttpClient":
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
                            param.hide = true;
                        } else if (param.name === "message") {
                            param.hide = true;
                            param.displayName = "Message";
                        }
                    });
                    filteredFunctions.set(key, value);
                } else if (key === "post" || key === "put" || key === "delete" || key === "patch") {
                    value.parameters.forEach((param) => {
                        if (param.name === "path") {
                            param.displayName = "Resource Path";
                            param.value = "\"/\"";
                            param.hide = true;
                        } else if (param.name === "message") {
                            param.displayName = "Message";
                        }
                    });
                    filteredFunctions.set(key, value);
                } else if (key === "forward") {
                    let isForwardAvailable = false;
                    value.parameters.forEach((param) => {
                        if (param.name === "path") {
                            param.displayName = "Resource Path";
                            param.value = "\"\"";
                            param.hide = true;
                        } else if (param.name === "request") {
                            param.hide = true;
                        } else if (param.name === "forwardReq") {
                            isForwardAvailable = true;
                        }
                    });
                    // adding forward request field since the type
                    // of request field is not supported in forms
                    if (!isForwardAvailable) {
                        value.parameters.push({name: "forwardReq", type: PrimitiveBalType.Int, isParam: true});
                    }
                    filteredFunctions.set(key, value);
                }
            });

            // Set payload types.
            const payloadTypes: Map<string, string> = new Map();
            payloadTypes.set("Text", "getTextPayload");
            payloadTypes.set("XML", "getXmlPayload");
            payloadTypes.set("JSON", "getJsonPayload");
            const responsePayloadMap: ResponsePayloadMap = {
                isPayloadSelected: false,
                payloadTypes
            };
            connectorConfig.responsePayloadMap = responsePayloadMap;
            break;
        case "ballerina_email_SmtpClient":
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo , key) => {
                if (key === "sendEmailMessage") {
                    let formField: FormField[] = [];
                    value.parameters[0].fields.forEach((param) => {
                        if (param.name === "contentType" || param.name === "sender") {
                            param.hide = true;
                        } else if (param.name === "replyTo") {
                            param.hide = true;
                            param.value = [];
                        } else if (param.name === "cc" || param.name === "bcc") {
                            param.value = [];
                        } else if (param.name === "'from") {
                            // const state = store.getState();
                            param.value = state.userInfo?.user?.email ? "\"" + state.userInfo?.user?.email + "\"" : undefined;
                            formField = [param, ...formField]
                        } else if (param.name === "to") {
                            param.type = "collection";
                            param.collectionDataType = PrimitiveBalType.String;
                            param.isUnion = false;
                            param.fields = [];
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
                            if (param.name === "properties") {
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
        case "ballerinax_github_Client":
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo, key) => {
                if (key === "createIssue") {
                    // make label list and assignee list optional and set default values
                    value.parameters.find(fields => fields.name === "labelList").optional = true;
                    value.parameters.find(fields => fields.name === "labelList").value = `[]`;
                    value.parameters.find(fields => fields.name === "assigneeList").optional = true;
                    value.parameters.find(fields => fields.name === "assigneeList").value = `[]`;
                    filteredFunctions.set(key, value);
                } 
                filteredFunctions.set(key, value);
            });
            break;
        case "ballerina_email_ImapClient":
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo, key) => {
                if (key === "init") {
                    if (value.parameters[3].name === "clientConfig") {
                        value.parameters[3].fields.forEach((param) => {
                            if (param.name === "properties") {
                                param.hide = true;
                            }
                        })
                    }
                }
                filteredFunctions.set(key, value);
            });
            break;
        case "ballerina_email_PopClient":
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo, key) => {
                if (key === "init") {
                    if (value.parameters[3].name === "clientConfig") {
                        value.parameters[3].fields.forEach((param) => {
                            if (param.name === "properties") {
                                param.hide = true;
                            }
                        })
                    }
                }
                filteredFunctions.set(key, value);
            });
            break;
        case "ballerinax_googleapis_gmail_Client":
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo, key) => {
                if (key === "listMessages" || key === "sendMessage" || key === "readMessage" || key === "init") {
                    if (key === "init"){
                        // replace single record inside "oauthClientConfig" record with inner field list
                        const subFields = value.parameters.find(fields => fields.name === "gmailConfig")
                        .fields.find(fields => fields.name === "oauthClientConfig").fields[0].fields;

                        value.parameters.find(fields => fields.name === "gmailConfig")
                        .fields.find(fields => fields.name === "oauthClientConfig").fields = subFields;
                    }
                    if (key === "sendMessage"){
                        // set content type in sendMessage form
                        value.parameters.find(fields => fields.name === "message")
                        .fields.find(fields => fields.name === "contentType").value = `"text/plain"`;
                    }
                    // hide optional fields from gmail forms
                    if (key === "readMessage"){
                        value.parameters.find(fields => fields.name === "format").hide = true;
                        value.parameters.find(fields => fields.name === "metadataHeaders").hide = true;
                    }
                    if (key === "listMessages"){
                        value.parameters.find(fields => fields.name === "filter").hide = true;
                    }

                    filteredFunctions.set(key, value);
                }

                // add default value to userId field
                let formField: FormField[] = [];
                // const state = store.getState();
                value.parameters[0].value = state.userInfo?.user?.email ? `"${state.userInfo?.user?.email}"` : undefined;
                formField = [value.parameters[0], ...formField];
            });
            break;
        case "ballerinax_googleapis_calendar_Client":
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo, key) => {
                if (key === "init"){
                    // replace single record inside "oauth2Config" record with inner field list
                    const subFields = value.parameters.find(fields => fields.name === "calendarConfig")
                    .fields.find(fields => fields.name === "oauth2Config").fields[0].fields;

                    value.parameters.find(fields => fields.name === "calendarConfig")
                    .fields.find(fields => fields.name === "oauth2Config").fields = subFields;

                    filteredFunctions.set(key, value);
                }else if (key === "createEvent") {
                    value.parameters[1].fields.forEach((field) => {
                        if (!((field.name === "summary") || (field.name === "description") || (field.name === "location") ||
                            (field.name === "'start") || (field.name === "end") || (field.name === "attendees"))) {
                            field.hide = true;
                        } else if (field.name === "attendees") {
                            field.displayName = "email";
                            field.collectionDataType = PrimitiveBalType.String;
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
                } else if (!((key === "watchEvents") || (key === "updateEvent") || (key === "getEventResponse") || (key === "getCalendars"))) {
                    filteredFunctions.set(key, value);
                }
            });
            break;
        case 'ballerinax_googleapis_sheets_Client':
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo, key) => {
                if (key === "init") {
                    // replace single record inside "oauth2Config" record with inner field list
                    const subFields = value.parameters.find(fields => fields.name === "spreadsheetConfig")
                    .fields.find(fields => fields.name === "oauthClientConfig").fields[0].fields;

                    value.parameters.find(fields => fields.name === "spreadsheetConfig")
                    .fields.find(fields => fields.name === "oauthClientConfig").fields = subFields;
                    filteredFunctions.set(key, value);
                } else {
                    filteredFunctions.set(key, value);
                }
            });
            break;
        case 'ballerinax_twilio_Client':
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo, key) => {
                if (key === "init") {
                    value.parameters[0].fields.forEach((field) => {
                        if ((field.name !== "accountSId") && (field.name !== "authToken") && (field.name !== "xAuthyKey")) {
                            field.hide = true;
                        }
                    });
                }
                filteredFunctions.set(key, value);
            });
            break;
        case 'ballerinax_sfdc_BaseClient':
            fieldsForFunctions.forEach((value: FunctionDefinitionInfo, key) => {
                if (key === "init") {
                    value.parameters.find(fields => fields.name === "salesforceConfig").fields.forEach(subFields => {
                        // replace single record inside "clientConfig" record with inner field list
                        if (subFields.name === "clientConfig"){
                            subFields.fields =  subFields.fields[0].fields;
                        }
                        if (subFields.name === "secureSocketConfig"){
                            subFields.hide = true;
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
    const connectorName: string = connector.org + "_" + connector.module + "_" + connector.name;
    switch (connectorName) {
        case 'ballerina_http_HttpClient':
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
                    case 'sendEmailMessage':
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
                switch (key) {
                    case 'init':
                    case 'createIssue':
                    case 'getOrganization':
                        break;
                    case 'getRepository':
                        value.parameters.forEach(field => {
                            if (field.name === 'repoIdentifier') {
                                field.isUnion = false;
                                field.type = 'string';
                                field.value = field.fields[0].value;
                                field.fields = [];
                            }
                        })
                        break;
                    default:
                        value.parameters.forEach(fields => {
                            fields.noCodeGen = true;
                        });
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
        case "ballerinax_googleapis_gmail_Client":
            functionDefInfoMap.forEach((value, key) => {
                switch (key) {
                    case 'init':
                    case 'readMessage':
                    case 'sendMessage':
                    case 'listMessages':
                        break;
                    default:
                        value.parameters.forEach(fields => {
                            fields.noCodeGen = true;
                        });
                }
            })
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
