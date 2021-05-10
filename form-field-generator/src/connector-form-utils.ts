import { Connector, FunctionDefinitionInfo, PrimitiveBalType } from "./types";

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