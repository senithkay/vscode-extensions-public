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
import { ConnectorConfig, FormField, PrimitiveBalType, ResponsePayloadMap } from "../../ConfigurationSpec/types";
import { Connector } from "../../Definitions/lang-client-extended";
import { tooltipMessages } from "../components/Portals/utils/constants";

export function filterConnectorFunctions(connector: Connector, fieldsForFunctions: Map<string, FormField[]>,
                                         connectorConfig: ConnectorConfig, state?: any): Map<string, FormField[]> {
    let filteredFunctions: Map<string, FormField[]> = new Map();
    const connectorName: string = connector.org + "_" + connector.module + "_" + connector.name;
    switch (connectorName) {
        case "ballerina_http_Client":
            fieldsForFunctions.forEach((value, key) => {
                if (key === "init") {
                    value.forEach((param) => {
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
                    value.forEach((param) => {
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
                    value.forEach((param) => {
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
                    value.forEach((param) => {
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
                        value.push({name: "forwardReq", type: PrimitiveBalType.Int, isParam: true});
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
            fieldsForFunctions.forEach((value: FormField[], key) => {
                if (key === "sendEmailMessage") {
                    let formField: FormField[] = [];
                    value[0].fields.forEach((param) => {
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
                        }

                        if (param.name !== "'from") {
                            formField.push(param);
                        }
                    });
                    value[0].fields = formField;
                    filteredFunctions.set(key, value);
                }
                else if (key === "init") {
                    if (value[3].name === "clientConfig") {
                        value[3].fields.forEach((param) => {
                            if (param.name === "properties") {
                                param.hide = true;
                            }
                        })
                    }
                    if (value[0].name === "host"){
                        value[0].tooltip = tooltipMessages.SMTP.host
                    }
                    if (value[1].name === "username"){
                        value[1].tooltip = tooltipMessages.SMTP.username
                    }
                    if (value[2].name === "password"){
                        value[2].tooltip = tooltipMessages.SMTP.password
                    }
                    filteredFunctions.set(key, value);
                }
                else {
                    filteredFunctions.set(key, value);
                }
            });
            break;
        case "ballerinax_github_Client":
            fieldsForFunctions.forEach((value: FormField[], key) => {
                if (key === "createIssue") {
                    // make label list and assignee list optional and set default values
                    value.find(fields => fields.name === "labelList").optional = true;
                    value.find(fields => fields.name === "labelList").value = `[]`;
                    value.find(fields => fields.name === "assigneeList").optional = true;
                    value.find(fields => fields.name === "assigneeList").value = `[]`;
                    filteredFunctions.set(key, value);
                } else if (key === "getOrganization" || key === "getRepository" || key === "init") {
                    filteredFunctions.set(key, value);
                }
            });
            break;
        case "ballerina_email_ImapClient":
            fieldsForFunctions.forEach((value: FormField[], key) => {
                if (key === "init") {
                    if (value[3].name === "clientConfig") {
                        value[3].fields.forEach((param) => {
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
            fieldsForFunctions.forEach((value: FormField[], key) => {
                if (key === "init") {
                    if (value[3].name === "clientConfig") {
                        value[3].fields.forEach((param) => {
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
            fieldsForFunctions.forEach((value: FormField[], key) => {
                if (key === "listMessages" || key === "sendMessage" || key === "readMessage" || key === "init") {
                    if (key === "sendMessage"){
                        // set content type in sendMessage form
                        value.find(fields => fields.name === "message")
                        .fields.find(fields => fields.name === "contentType").value = `"text/plain"`;
                    }
                    // hide optional fields from gmail forms
                    if (key === "readMessage"){
                        value.find(fields => fields.name === "format").hide = true;
                        value.find(fields => fields.name === "metadataHeaders").hide = true;
                    }
                    if (key === "listMessages"){
                        value.find(fields => fields.name === "filter").hide = true;
                    }

                    filteredFunctions.set(key, value);
                }


                // add default value to userId field
                let formField: FormField[] = [];
                // const state = store.getState();
                value[0].value = state.userInfo?.user?.email ? `"${state.userInfo?.user?.email}"` : undefined;
                formField = [value[0], ...formField];
            });
            break;
        case "ballerinax_googleapis_calendar_CalendarClient":
            fieldsForFunctions.forEach((value: FormField[], key) => {
                if (key === "createEvent") {
                    value[1].fields.forEach((field: any, index: number) => {
                        if (!((field.name === "summary") || (field.name === "description") || (field.name === "location") ||
                            (field.name === "'start") || (field.name === "end") || (field.name === "attendees"))) {
                            field.hide = true;
                        } else if (field.name === "attendees") {
                            field.displayName = "email";
                            field.collectionDataType = "string";
                        }
                    });
                    filteredFunctions.set(key, value);
                } else if (key === "quickAddEvent") {
                    value.forEach((field, index) => {
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
            fieldsForFunctions.forEach((value: FormField[], key) => {
                if (key === "init") {
                    if (value[0].name === 'spreadsheetConfig') {
                        value[0].fields.forEach((param) => {
                            switch (param.name) {
                                case 'secureSocketConfig':
                                    param.hide = true;
                                    break;
                                case 'oauth2Config': {
                                    param.fields.forEach(recordField => {
                                        if (recordField.name !== 'accessToken' && recordField.name !== 'refreshConfig') {
                                            recordField.hide = true;
                                        }

                                        switch (recordField.name) {
                                            case 'refreshConfig':
                                                recordField.fields.forEach(subField => {
                                                    if (subField.name !== 'refreshUrl' &&
                                                        subField.name !== 'refreshToken' &&
                                                        subField.name !== 'clientId' &&
                                                        subField.name !== 'clientSecret') {
                                                        subField.hide = true;
                                                    }
                                                });
                                                break;
                                        }
                                    })
                                }
                            }

                        })
                    }
                    filteredFunctions.set(key, value);
                } else {
                    filteredFunctions.set(key, value);
                }
            });
            break;
        case 'ballerinax_twilio_Client':
            fieldsForFunctions.forEach((value: FormField[], key) => {
                if (key === "init") {
                    value[0].fields.forEach((field) => {
                        if ((field.name !== "accountSId") && (field.name !== "authToken") && (field.name !== "xAuthyKey")) {
                            field.hide = true;
                        }
                    });
                }
                filteredFunctions.set(key, value);
            });
            break;
        case "ballerinax_sfdc_BaseClient":
            fieldsForFunctions.forEach((value: FormField[], key) => {
                if (key === "init") {
                    value[0].fields.forEach((field) => {
                        if ((field.name === "clientConfig")) {
                            field.fields[1].fields.find(subFields => subFields.name === "clientConfig").hide = true;
                            field.fields[1].fields.find(subFields => subFields.name === "scopes").hide = true;
                            field.fields[2].hide = true;
                            field.fields[3].hide = true;
                            field.fields[4].hide = true;
                        }
                        if ((field.name === "secureSocketConfig")) {
                            field.hide = true;
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

export function filterCodeGenFunctions(connector: Connector, fieldsForFunctions: Map<string, FormField[]>)
    : Map<string, FormField[]> {
    const connectorName: string = connector.org + "_" + connector.module + "_" + connector.name;
    switch (connectorName) {
        case 'ballerina_http_Client':
            fieldsForFunctions.forEach((value, key) => {
                switch (key) {
                    case 'init':
                        value.forEach((param) => {
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
                    case 'forward':
                        // allowed functions
                        break;
                    default:
                        // for functions that are ignored noCodeGen is added for fields
                        value.forEach(fields => {
                            fields.noCodeGen = true;
                        });
                }
            })
            break;
        case 'ballerina_email_SmtpClient':
            fieldsForFunctions.forEach((value, key) => {
                switch (key) {
                    case 'init':
                    case 'sendEmailMessage':
                        break;
                    default:
                        value.forEach(fields => {
                            fields.noCodeGen = true;
                        });
                }
            });
            break;
        case 'ballerinax_github_Client':
            fieldsForFunctions.forEach((value, key) => {
                switch (key) {
                    case 'init':
                    case 'createIssue':
                    case 'getOrganization':
                        break;
                    case 'getRepository':
                        value.forEach(field => {
                            if (field.name === 'repoIdentifier') {
                                field.isUnion = false;
                                field.type = PrimitiveBalType.String;
                                field.value = field.fields[0].value;
                                field.fields = [];
                            }
                        })
                        break;
                    default:
                        value.forEach(fields => {
                            fields.noCodeGen = true;
                        });
                }
            });
            break;
        case 'ballerina_email_ImapClient':
            fieldsForFunctions.forEach((value, key) => {
                if (key === 'init') {
                    value.filter(field => field.name === 'clientConfig')[0].fields.forEach(subField => {
                        if (subField.name === 'properties') {
                            subField.noCodeGen = true;
                        }
                    });
                }
            });
            break;
        case 'ballerina_email_PopClient':
            fieldsForFunctions.forEach((value, key) => {
                if (key === 'init') {
                    value.filter(field => field.name === 'clientConfig')[0].fields.forEach(subField => {
                        if (subField.name === 'properties') {
                            subField.noCodeGen = true;
                        }
                    })
                }
            });
            break;
        case "ballerinax_googleapis_gmail_Client":
            fieldsForFunctions.forEach((value, key) => {
                switch (key) {
                    case 'init':
                    case 'readMessage':
                    case 'sendMessage':
                    case 'listMessages':
                        break;
                    default:
                        value.forEach(fields => {
                            fields.noCodeGen = true;
                        });
                }
            })
            break;
        case 'ballerinax_googleapis_sheets_Client':
            fieldsForFunctions.forEach((value, key) => {
                switch (key) {
                    case 'init':
                        value.forEach(field => {
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

    return fieldsForFunctions;
}
