import { createStdioLangClient, StdioBallerinaLangServer, BallerinaConnectorsResponse, BallerinaConnectorResponse } from "@ballerina/lang-service";
import { STNode, traversNode } from "@ballerina/syntax-tree";
import { ChildProcess } from "child_process";
import * as fs from "fs";
import { promises as fspromise } from "fs";
import { cleanFields, functionDefinitionMap,  visitor as FormFieldVisitor } from "./form-field-utils";
import { filterCodeGenFunctions } from "./connector-form-utils";
import { Connector, FunctionDefinitionInfo } from "./types";

let server: any;
let client: any;

const ignoreList = [
    // sl alpha2
    'ballerina/http:1.1.0-alpha4:Request',
    'ballerina/http:1.1.0-alpha4:Response',
    'ballerina/http:1.1.0-alpha4:HttpFuture',
    'ballerina/http:1.1.0-alpha4:PushPromise',
    'ballerina/http:1.1.0-alpha4:CookieStore',
    'ballerina/email:1.1.0-alpha4:Security',
    'ballerinax/twilio:0.99.6:Account',
    'ballerinax/twilio:0.99.6:MessageResourceResponse',
    'ballerinax/twilio:0.99.6:WhatsAppResponse',
    'ballerina/oauth2:1.1.0-alpha4:CredentialBearer',
    'ballerina/oauth2:1.1.0-alpha4:HttpVersion',
    'ballerinax/googleapis_gmail:0.99.4:MessageRequest',
    'ballerinax/googleapis_gmail:0.99.4:Message',
    'ballerinax/googleapis_gmail:0.99.4:DraftListPage',
    'ballerinax/googleapis_calendar:0.1.3:Shared',
    'ballerinax/googleapis_calendar:0.1.3:CalendarListOptional',
    'ballerinax/sfdc:2.1.5:BulkJob',
    'ballerina/http:1.1.0-alpha4:PersistentCookieHandler',
    'ballerinax/github.webhook:0.99.12:User',
    'ballerinax/github.webhook:0.99.12:Milestone',
    'ballerinax/github.webhook:0.99.12:Branch',
    'ballerinax/github.webhook:0.99.12:Links',
    'ballerinax/github:0.99.12:ColumnList',
    'ballerinax/github:0.99.12:BranchList',
    'ballerinax/github:0.99.12:IssueList',
    'ballerinax/github:0.99.12:ProjectList',
    'ballerinax/github:0.99.12:RepositoryList',
    'ballerinax/github:0.99.12:ColumnList',
    'ballerinax/github:0.99.12:PullRequestList',
    'ballerinax/netsuite:0.9.3:GetAllRecordType',
    'ballerinax/netsuite:0.9.3:GetSaveSearchType'
]

const clientPromise = init();

export async function init() {
    server = new StdioBallerinaLangServer(process.env.BALLERINA_SDK_PATH);
    server.start();
    client = await createStdioLangClient(server.lsProcess as ChildProcess, () => {/**/}, () => {/**/});
    if (!client) {
        console.error("Could not initiate language client");
    }

    await client.init();
}

export function shutdown() {
    client.close();
    //server.shutdown();
}

async function getConnectorST(connector: Connector) {
    await clientPromise;
    try {
        const connectorResp : BallerinaConnectorResponse  = await client.getConnector(connector);
        return connectorResp.ast;
    } catch (err) {
        console.log(err);
    }
}

export async function getConnectorList() {
    await clientPromise;
    try {
        const resp : BallerinaConnectorsResponse = await client.getConnectors();
        return resp.connectors;
    } catch (err) {
        console.log(err);
    }
}

export async function genFormField(connector: Connector) {
    await clientPromise;
    const connectorDef : STNode = await getConnectorST(connector);
    console.log("Parsing Syntax tree for " + connector.org + ":" + connector.module + ":" + connector.name + ":" + connector.version);
    cleanFields();
    traversNode(connectorDef, FormFieldVisitor);
    const funcMap : Map<string, FunctionDefinitionInfo> = functionDefinitionMap;
    let functionDefInfo : Map<string, FunctionDefinitionInfo> = filterCodeGenFunctions(connector, funcMap);
    let funcMapClone: Map<string, FunctionDefinitionInfo> = new Map<string, FunctionDefinitionInfo>();
    functionDefInfo.forEach((value: FunctionDefinitionInfo, key: string, mapObj: Map<string, FunctionDefinitionInfo>) => {
        funcMapClone.set(key, value);
    });
    for (const value of Array.from(funcMapClone.values())) {
        if(connectorDef.typeData) {
            await getRecordFields(value.parameters, connectorDef.typeData.records, client);
            if (value.returnType) {
                if (value.returnType.type === 'union') {
                    await getRecordFields((value.returnType.fields as any), connectorDef.typeData.records, client);
                } else {
                    await getRecordFields([value.returnType], connectorDef.typeData.records, client);
                }
            }
        }
    }
    return funcMapClone;
}

const receivedRecords: Map<string, STNode> = new Map();
export async function getRecordFields(formFields: any, records: object, langClient: any) {
    return new Promise(async (resolve) => {
        for (const formField of formFields) {
            // check primitive types if it's not a primitive go and fetch record
            if (!formField.noCodeGen) {
                switch (formField.type) {
                    case 'string':
                    case 'boolean':
                    case 'int':
                    case 'float':
                    case 'json':
                    case 'xml':
                    case 'collection':
                        // fine as it is
                        break;
                    case 'union':
                        if (formField.fields) {
                            await getRecordFields(formField.fields, records, langClient);
                            formField.fields.filter((property: any) => property?.isReference).forEach((property: any) => {
                                if (property?.length > 0) {
                                    formField.fields = [ ...formField.fields, ...property.fields ];
                                }
                            });
                        }
                        break;
                    default:
                        // every other type can be a record or union
                        if (formField.typeInfo) {
                            let recordRes: STNode;
                            const typeInfo = formField.typeInfo;
                            const recordKey = `${typeInfo.orgName}/${typeInfo.modName}:${typeInfo.version}:${typeInfo.name}`;
                            recordRes = receivedRecords.get(recordKey)
                            if (ignoreList.indexOf(recordKey) === -1) {
                                if (recordRes === undefined) {
                                    const record = await langClient.getRecord({
                                        module: typeInfo.modName,
                                        org: typeInfo.orgName,
                                        version: typeInfo.version,
                                        name: typeInfo.name
                                    });

                                    if (record && record.ast) {
                                        recordRes = record.ast;
                                    }
                                }
                            }

                            if (recordRes) {
                                if (recordRes.typeData?.records) {
                                    Object.keys(recordRes.typeData.records).forEach((key) => {
                                        receivedRecords.set(key, recordRes.typeData.records[key])
                                    })
                                }
                            }

                            if (!recordRes) {
                                const keys: string[] = Object.keys(records);
                                for (const key of keys) {
                                    if (key.includes(formField.typeName)) {
                                        recordRes = (records as any)[key] as STNode;
                                        break;
                                    }
                                }
                            }

                            if (recordRes) {
                                recordRes.viewState = formField;
                                traversNode(recordRes, FormFieldVisitor);
                                if (formField.fields) {
                                    await getRecordFields(formField.fields, records, langClient);

                                    formField.fields.filter((property: any) => property?.isReference).forEach((property: any) => {
                                        if (property?.length > 0){
                                            formField.fields = [...formField.fields, ...property.fields]
                                        }
                                    })
                                }
                            }
                        }
                }
            }
        }
        resolve(formFields);
    });
}
