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
import React, { ReactNode } from "react";

import {
    CaptureBindingPattern, CheckAction,
    CheckExpression,
    ImplicitNewExpression, ListConstructor, LocalVarDecl, MappingConstructor, NumericLiteral,
    ParenthesizedArgList,
    PositionalArg, RemoteMethodCallAction, RequiredParam, SimpleNameReference, SpecificField,
    STKindChecker,
    STNode, StringLiteral, traversNode, TypeCastExpression
} from "@ballerina/syntax-tree";
import { DocumentSymbol, SymbolInformation } from "monaco-languageclient";

import { ConnectionDetails } from "../../../../api/models";
// import { getLangClientForCurrentApp, waitForCurrentWorkspace } from "../../../../../../$store/actions";
import { ActionConfig, ConnectorConfig, FormField, FunctionDefinitionInfo, PrimitiveBalType, WizardType } from "../../../../ConfigurationSpec/types";
import { DiagramEditorLangClientInterface, STSymbolInfo } from "../../../../Definitions";
import { BallerinaConnectorsInfo, Connector } from "../../../../Definitions/lang-client-extended";
import { filterCodeGenFunctions, filterConnectorFunctions } from "../../../utils/connector-form-util";
import { getAllVariables as retrieveVariables } from "../../../utils/mixins";
import {
    addToFormFieldCache,
    getConnectorDefFromCache,
    getFormFieldFromFileCache,
    getFromFormFieldCache,
    getRecordDefFromCache} from "../../../utils/st-util";
import { DraftInsertPosition } from "../../../view-state/draft";
import { cleanFields, functionDefinitionMap, visitor as FormFieldVisitor } from "../../../visitors/form-field-extraction-visitor";
import * as Icons from "../../Connector/Icon";
import { ConfigWizardState } from "../../ConnectorConfigWizard";
import * as ConnectorExtension from "../../ConnectorExtensions";
import * as Elements from "../ConfigForm/Elements";
import * as Forms from "../ConfigForm/forms";
import { FormElementProps } from "../ConfigForm/types";
import * as OverlayElement from "../Overlay/Elements";

import { keywords, symbolKind } from "./constants";

const receivedRecords: Map<string, STNode> = new Map();
// in order to ignore classes, object and enum type references
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

export function getOverlayElement(
    type: string,
    data: any,
    onClose: () => void, onClick: () => void,
    onChange?: (event: object, value: any) => void
): ReactNode {
    const Element = (OverlayElement as any)[type];
    return (
        <Element type={type} data={data} onClose={onClose} onClick={onClick} onChange={onChange} />
    );
}

export function getFormElement(elementProps: FormElementProps, type: string) {
    if (type) {
        const FormElement = (Elements as any)[type];
        // todo: check if this logic should be moved down to element component level
        if (elementProps.model.value) {
            if (type === 'xml') {
                const xmlRegex = /xml\ \`(.*\n?)\`/g
                const matchedRegex = xmlRegex.exec(elementProps.model.value);
                elementProps.defaultValue = matchedRegex ? matchedRegex[1] : elementProps.model.value;
            } else if (type === 'json') {
                elementProps.defaultValue = elementProps.model.value;
            }
        }

        return (
            <FormElement {...elementProps} />
        );
    } else {
        return null;
    }
}

export function getForm(type: string, args: any) {
    const Form = (Forms as any)[type];
    return Form ? (
        <Form {...args} />
    ) : null;
}

export function getConnectorComponent(type: string, args: any) {
    const ConnectorExtensionComponent = (ConnectorExtension as any)[type];
    return ConnectorExtensionComponent ? (
        <ConnectorExtensionComponent {...args} />
    ) : undefined;
}

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
                            if (ignoreList.indexOf(recordKey) === -1 && recordRes === undefined) {
                                recordRes = await getRecordDefFromCache({
                                    module: typeInfo.modName,
                                    org: typeInfo.orgName,
                                    version: typeInfo.version,
                                    name: typeInfo.name
                                });

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

export function getFieldName(fieldName: string): string {
    return keywords.includes(fieldName) ? "'" + fieldName : fieldName;
}

export function getParams(formFields: FormField[]): string[] {
    const paramStrings: string[] = [];
    formFields.forEach(formField => {
        let paramString: string = "";
        if (formField.isParam && !formField.noCodeGen) {
            if (formField.type === "string" && formField.value) {
                paramString += formField.value;
            } else if (formField.type === "collection" && !formField.hide && formField.value) {
                paramString += formField.value.toString();
            } else if ((formField.type === "int" || formField.type === "boolean" || formField.type === "float" || formField.type === "json") && formField.value) {
                paramString += formField.value;
            } else if (formField.type === "record" && formField.fields && formField.fields.length > 0) {
                let recordFieldsString: string = "";
                let firstRecordField = false;
                formField.fields.forEach(field => {
                    if (field.type === "string" && field.value) {
                        if (firstRecordField) {
                            recordFieldsString += ", ";
                        } else {
                            firstRecordField = true;
                        }
                        recordFieldsString += getFieldName(field.name) + ": " + field.value;
                    } else if ((field.type === "int" || field.type === "boolean" || field.type === "float") && field.value) {
                        if (firstRecordField) {
                            recordFieldsString += ", ";
                        } else {
                            firstRecordField = true;
                        }
                        recordFieldsString += getFieldName(field.name) + ": " + field.value;
                    } else if (field.type === "collection" && !field.hide && field.value) {
                        if (firstRecordField) {
                            recordFieldsString += ", ";
                        } else {
                            firstRecordField = true;
                        }
                        recordFieldsString += getFieldName(field.name) + ": " + field.value;
                    } else if (field.type === "union" && !field.hide && field.isUnion && field.value) {
                        if (firstRecordField) {
                            recordFieldsString += ", ";
                        } else {
                            firstRecordField = true;
                        }
                        recordFieldsString += getFieldName(field.name) + ": " + field.value;
                    } else if (field.type === "record" && !field.hide) {
                        if (firstRecordField) {
                            recordFieldsString += ", ";
                        } else {
                            firstRecordField = true;
                        }

                        const fieldArray: FormField[] = [
                            {
                                isParam: true,
                                type: PrimitiveBalType.Record,
                                fields: field.fields
                            }
                        ]
                        recordFieldsString += getFieldName(field.name) + ": " + getParams(fieldArray);
                    }
                });
                if (recordFieldsString !== "" && recordFieldsString !== undefined) {
                    paramString += "{" + recordFieldsString + "}";
                }
            } else if (formField.type === PrimitiveBalType.Union && formField.isUnion && formField.value) {
                paramString += formField.value;
            } else if (formField.type === PrimitiveBalType.Nil) {
                paramString += "()";
            } else if (formField.type === PrimitiveBalType.Xml && formField.value) {
                const xmlRegex = /^xml\ `(.*)`$/g;
                if (xmlRegex.test(formField.value)) {
                    paramString = formField.value;
                } else {
                    paramString += "xml `" + formField.value + "`";
                }
            }

            if (paramString !== "") {
                paramStrings.push(paramString);
            }
        }
    });

    return paramStrings;
}

export function isValidTextInput(inputValue: string, type: any): boolean {
    let isValueValid: boolean = false;
    if (type === PrimitiveBalType.Int) {
        const intRegex = new RegExp("^\\d+$");
        if (intRegex.test(inputValue)) {
            isValueValid = true;
        }
    } else if (type === PrimitiveBalType.Float) {
        const floatRegex = new RegExp("^\\d+(\\.\\d)?\\d*$");
        if (floatRegex.test(inputValue)) {
            isValueValid = true;
        }
    } else if (type === PrimitiveBalType.String) {
        isValueValid = true;
    } else {
        isValueValid = true;
    }
    return isValueValid;
}

export function validateEmail(inputValue: string): boolean {
    const emailRegex = new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$");
    if (emailRegex.test(inputValue)) {
        return true;
    }
    return false;
}

export function getCollectionForRadio(model: FormField): string[] {
    const collection: string[] = [];
    switch (model.type) {
        case PrimitiveBalType.Boolean:
            collection.push("true");
            collection.push("false");
            break;
        default:
            break;
    }
    return collection;
}

export function matchEndpointToFormField(endPoint: LocalVarDecl, formFields: FormField[]) {
    let implicitExpr: ImplicitNewExpression;
    switch (endPoint.initializer.kind) {
        case "CheckExpression":
            implicitExpr = (endPoint.initializer as CheckExpression).expression as ImplicitNewExpression;
            break;
        default:
            implicitExpr = endPoint.initializer as ImplicitNewExpression;
    }
    const parenthesizedArgs: ParenthesizedArgList = implicitExpr.parenthesizedArgList as ParenthesizedArgList;
    let nextValueIndex = 0;
    for (const arg of parenthesizedArgs.arguments) {
        if ((parenthesizedArgs.arguments === undefined) || (formFields.length <= nextValueIndex)) {
            break;
        }

        const positionalArg: PositionalArg = arg as PositionalArg;
        const formField = formFields[nextValueIndex];
        if (positionalArg.kind === "PositionalArg") {
            if (formField.type === "string" || formField.type === "int" || formField.type === "boolean" ||
                formField.type === "float" || formField.type === "json" || formField.type === "xml") {
                if (STKindChecker.isStringLiteral(positionalArg.expression)) {
                    const stringLiteral: StringLiteral = positionalArg.expression as StringLiteral;
                    formField.value = stringLiteral.literalToken.value;
                } else if (STKindChecker.isNumericLiteral(positionalArg.expression)) {
                    const numericLiteral: NumericLiteral = positionalArg.expression as NumericLiteral;
                    formField.value = numericLiteral.literalToken.value;
                } else if (STKindChecker.isBooleanLiteral(positionalArg.expression)) {
                    const booleanLiteral: NumericLiteral = positionalArg.expression as NumericLiteral;
                    formField.value = booleanLiteral.literalToken.value;
                } else {
                    formField.value = positionalArg.expression.source;
                }
                nextValueIndex++;
            } else if (formField.type === "record" && formField.fields && formField.fields.length > 0) {
                const mappingConstructor: MappingConstructor = positionalArg.expression as MappingConstructor;
                if (mappingConstructor) {
                    mapRecordLiteralToRecordTypeFormField(mappingConstructor.fields as SpecificField[], formField.fields);
                    nextValueIndex++;
                }
            } else if (formField.type === "union" && formField.isUnion) {
                formField.value = positionalArg.expression?.source;
            }
        }
    }
}

export function mapRecordLiteralToRecordTypeFormField(specificFields: SpecificField[], formFields: FormField[]) {
    specificFields.forEach(specificField => {
        if (specificField.kind !== "CommaToken") {
            formFields.forEach(formField => {
                if (formField.name === specificField.fieldName.value) {
                    // if the assigned value is one of inbuilt type
                    formField.value = (STKindChecker.isStringLiteral(specificField.valueExpr) ||
                        STKindChecker.isNumericLiteral(specificField.valueExpr) ||
                        STKindChecker.isBooleanLiteral(specificField.valueExpr)) ?

                        formField.value = specificField.valueExpr.literalToken.value :
                        formField.value = specificField.valueExpr.source;

                    // if the assigned value is a record
                    if (specificField.valueExpr.kind === 'MappingConstructor') {
                        const mappingField = specificField.valueExpr as MappingConstructor;
                        mapRecordLiteralToRecordTypeFormField(mappingField.fields as SpecificField[], formField.fields);
                    }

                    // if the assigned value is an array
                    if (specificField.valueExpr.kind === 'ListConstructor') {
                        const listExpr = specificField.valueExpr as ListConstructor;
                        formField.value = listExpr.source;
                        formField.fields = [];
                    }
                }
            })
        }
    });
}

export function matchActionToFormField(variable: LocalVarDecl, formFields: FormField[]) {
    let remoteCall: RemoteMethodCallAction;
    switch (variable.initializer.kind) {
        case 'TypeCastExpression':
            const initializer: TypeCastExpression = variable.initializer as TypeCastExpression;
            remoteCall = (initializer.expression as CheckAction).expression as RemoteMethodCallAction;
            break;
        case 'RemoteMethodCallAction':
            remoteCall = variable.initializer as RemoteMethodCallAction;
            break;
        default:
            remoteCall = (variable.initializer as CheckAction).expression;
    }
    const remoteMethodCallArguments = remoteCall.arguments.filter(arg => arg.kind !== 'CommaToken');
    let nextValueIndex = 0;
    for (const formField of formFields) {
        if ((remoteMethodCallArguments === undefined) || (remoteMethodCallArguments.length <= nextValueIndex)) {
            break;
        }

        const positionalArg: PositionalArg = remoteMethodCallArguments[nextValueIndex] as PositionalArg;
        if (formField.type === "string" || formField.type === "int" || formField.type === "boolean" || formField.type === "float") {
            if (STKindChecker.isStringLiteral(positionalArg.expression)) {
                const stringLiteral: StringLiteral = positionalArg.expression as StringLiteral;
                formField.value = stringLiteral.literalToken.value;
            } else if (STKindChecker.isNumericLiteral(positionalArg.expression)) {
                const numericLiteral: NumericLiteral = positionalArg.expression as NumericLiteral;
                formField.value = numericLiteral.literalToken.value;
            } else if (STKindChecker.isBooleanLiteral(positionalArg.expression)) {
                const booleanLiteral: NumericLiteral = positionalArg.expression as NumericLiteral;
                formField.value = booleanLiteral.literalToken.value;
            } else {
                formField.value = positionalArg.expression.source;
            }
            nextValueIndex++;
        } else if (formField.type === 'collection') {
            formField.value = positionalArg.expression?.source;
            nextValueIndex++;
        } else if (formField.type === "record" && formField.fields && formField.fields.length > 0) {
            const mappingConstructor: MappingConstructor = positionalArg.expression as MappingConstructor;
            if (mappingConstructor) {
                mapRecordLiteralToRecordTypeFormField(mappingConstructor.fields as SpecificField[], formField.fields);
                nextValueIndex++;
            }
        } else if (formField.type === "union" && formField.isUnion) {
            formField.value = positionalArg.expression?.source;
            nextValueIndex++;
        } else if (formField.type === "json") {
            formField.value = positionalArg.expression?.source;
            nextValueIndex++;
        }
    }
}

export function getVaribaleNamesFromVariableDefList(asts: STNode[]) {
    if (asts === undefined) {
        return [];
    }
    return (asts as LocalVarDecl[]).map((item) => (item.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.value);
}

export function getConnectorIcon(iconId: string, props?: any): React.ReactNode {
    const Icon = (Icons as any)[iconId];
    const DefaultIcon = (Icons as any).default;
    return Icon ? (
        <Icon {...props} />
    ) : <DefaultIcon {...props} />;
}

export function getConnectorIconSVG(connector: BallerinaConnectorsInfo, scale: number = 1): React.ReactNode {
    const iconId = getConnectorIconId(connector);
    const Icon = (Icons as any)[iconId];
    const DefaultIcon = (Icons as any).default;
    const props = {
        scale
    }
    return Icon ? (
        <Icon {...props} />
    ) : <DefaultIcon {...props} />;
}

export function getConnectorIconId(connector: BallerinaConnectorsInfo) {
    return `${connector.module}_${connector.name}`;
}

export function genVariableName(defaultName: string, variables: string[]): string {
    const baseName: string = convertToCamelCase(defaultName);
    let varName: string = baseName;
    let index = 0;
    while (variables.includes(varName)) {
        index++;
        varName = baseName + index;
    }
    return varName;
}

function convertToCamelCase(variableName: string): string {
    return variableName
        .replace(/\s(.)/g, (a) => {
            return a.toUpperCase();
        })
        .replace(/\s/g, '')
        .replace(/^(.)/, (b) => {
            return b.toLowerCase();
        });
}

export function addAiSuggestion(targetVariable: string, aiSuggestion: string, formFields: FormField[]) {
    // Todo: optimize the tree traversing algorithm
    formFields.forEach((formField: FormField) => {
        if (formField.fields) {
            addAiSuggestion(targetVariable, aiSuggestion, formField.fields);
        } else {
            if (formField.name === targetVariable) {
                formField.aiSuggestion = aiSuggestion;
            }
        }
    })
}

export function getAllVariablesForAi(symbolInfo: STSymbolInfo): { [key: string]: any } {
    const variableCollection: { [key: string]: any } = {};
    symbolInfo.variables.forEach((variableNodes: STNode[], type: string) => {
        variableNodes.forEach((variableNode) => {
            if (STKindChecker.isRequiredParam(variableNode)) {
                // Handle function definition params
                variableCollection[(variableNode as RequiredParam).paramName.value] = {
                    "type": type,
                    "position": 0,
                    "isUsed": 0
                }
            } else if (STKindChecker.isLocalVarDecl(variableNode)) {
                const variableDef: LocalVarDecl = variableNode as LocalVarDecl;
                const variable: CaptureBindingPattern = variableDef.typedBindingPattern.bindingPattern as
                    CaptureBindingPattern;
                variableCollection[variable.variableName.value] = {
                    "type": type,
                    "position": 0,
                    "isUsed": 0
                }
            }
        });
    });
    symbolInfo.endpoints.forEach((variableNodes: STNode, type: string) => {
        const variableDef: LocalVarDecl = variableNodes as LocalVarDecl;
        const variable: CaptureBindingPattern = variableDef.typedBindingPattern.bindingPattern as
            CaptureBindingPattern;
        if (!variableCollection[variable.variableName.value]) {
            variableCollection[variable.variableName.value] = {
                "type": type,
                "position": 0,
                "isUsed": 0
            }
        }
    });
    symbolInfo.actions.forEach((variableNodes: STNode, type: string) => {
        const variableDef: LocalVarDecl = variableNodes as LocalVarDecl;
        const variable: CaptureBindingPattern = variableDef.typedBindingPattern.bindingPattern as
            CaptureBindingPattern;
        if (!variableCollection[variable.variableName.value]) {
            variableCollection[variable.variableName.value] = {
                "type": type,
                "position": 0,
                "isUsed": 0
            }
        }
    });
    return variableCollection;
}

function isDocumentSymbol(symbol: DocumentSymbol | SymbolInformation): symbol is DocumentSymbol {
    return symbol && (symbol as DocumentSymbol).range !== undefined;
}

function getSymbolKind(kind: number): string {
    return symbolKind[kind]
}

export function getMapTo(_formFields: FormField[], targetPosition: DraftInsertPosition): { [key: string]: any } {
    const mapTo: { [key: string]: any } = {};

    function iterateFormFields(formFields: FormField[]) {
        formFields.forEach((formField: FormField) => {
            if (formField.fields) {
                iterateFormFields(formField.fields);
            } else {
                if (formField.name && formField.type) {
                    mapTo[formField.name] = {
                        "type": formField.type,
                        "position": targetPosition.line,
                        "isUsed": 0
                    }
                }
            }
        });
    };

    iterateFormFields(_formFields);
    return mapTo;
}

export async function fetchConnectorInfo(connector: Connector, model?: STNode, state?: any): Promise<ConfigWizardState> {
    const { stSymbolInfo: symbolInfo, langServerURL, getDiagramEditorLangClient } = state;
    // get form fields from browser cache
    let functionDefInfo = await getFromFormFieldCache(connector);
    const connectorConfig = new ConnectorConfig();

    if (!functionDefInfo) {
        // get form fields from file cache
        functionDefInfo = await getFormFieldFromFileCache(connector);
        // save form fields in browser cache
        await addToFormFieldCache(connector, functionDefInfo);
    }

    if (!functionDefInfo) {
        // generate form fields form connector syntax tree
        const langClient: DiagramEditorLangClientInterface = await getDiagramEditorLangClient(langServerURL);
        let connectorDef = connector ? await getConnectorDefFromCache(connector) : undefined;
        if (!connectorDef && connector) {
            const connectorResp = await langClient.getConnector(connector);
            connectorDef = connectorResp.ast;
        }
        connectorDef.viewState = {};

        cleanFields();
        traversNode(connectorDef, FormFieldVisitor);

        functionDefInfo = filterCodeGenFunctions(connector, functionDefinitionMap);

        for (const value of Array.from(functionDefInfo.values())) {
            await getRecordFields(value.parameters, connectorDef.typeData.records, langClient);
            if (value.returnType) {
                if (value.returnType.type === 'union') {
                    await getRecordFields((value.returnType.fields as any), connectorDef.typeData.records, langClient);
                } else {
                    await getRecordFields([ value.returnType ], connectorDef.typeData.records, langClient);
                }
            }
        }
        // save form fields in browser cache
        await addToFormFieldCache(connector, functionDefInfo);

        // INFO: uncomment below code to get connector form field json object
        // const formFieldJsonObject: any = {};
        // functionDefInfo.forEach((value, key) => {
        //     formFieldJsonObject[key] = value;
        // });
        // console.warn("save this field.json file in here >>>", `/connectors/cache/${connector.org}/${connector.module}/${connector.version}/${connector.name}/${connector.cacheVersion || "0"}/fields.json`)
        // console.log("form field json >>>", JSON.stringify(formFieldJsonObject))
    }

    // Filter connector functions to have better usability.
    const filteredFunctionDefInfo = filterConnectorFunctions(connector, functionDefInfo, connectorConfig, state);

    if (model) {
        const variable: LocalVarDecl = model as LocalVarDecl;
        let remoteCall: RemoteMethodCallAction;
        switch (variable.initializer.kind) {
            case 'TypeCastExpression':
                const initializer: TypeCastExpression = variable.initializer as TypeCastExpression;
                remoteCall = (initializer.expression as CheckAction).expression as RemoteMethodCallAction;
                break;
            case 'RemoteMethodCallAction':
                remoteCall = variable.initializer as RemoteMethodCallAction;
                break;
            default:
                remoteCall = (variable.initializer as CheckAction).expression;
        }
        const bindingPattern: CaptureBindingPattern = variable.typedBindingPattern.bindingPattern as
            CaptureBindingPattern;
        const returnVarName: string = bindingPattern.variableName.value;
        if (remoteCall && returnVarName) {
            const configName: SimpleNameReference = remoteCall.expression as SimpleNameReference;
            const actionName: SimpleNameReference = remoteCall.methodName as SimpleNameReference;
            if (remoteCall && actionName) {
                const action: ActionConfig = new ActionConfig();
                action.name = actionName.name.value;
                action.returnVariableName = returnVarName;
                connectorConfig.action = action;
                connectorConfig.name = configName.name.value;
                connectorConfig.action.fields = filteredFunctionDefInfo.get(connectorConfig.action.name).parameters;
                matchActionToFormField(model as LocalVarDecl, connectorConfig.action.fields);
            }
        }

        connectorConfig.connectorInit = filteredFunctionDefInfo.get("init") ?
        filteredFunctionDefInfo.get("init").parameters
            : filteredFunctionDefInfo.get("__init").parameters;
        const matchingEndPoint: LocalVarDecl = symbolInfo.endpoints.get(connectorConfig.name) as LocalVarDecl;
        connectorConfig.initPosition = matchingEndPoint.position;
        matchEndpointToFormField(matchingEndPoint, connectorConfig.connectorInit);
    }
    connectorConfig.existingConnections = symbolInfo.variables.get(connector.module + ":" + connector.name);

    return {
        isLoading: false,
        connector,
        wizardType: model ? WizardType.EXISTING : WizardType.NEW,
        functionDefInfo: filteredFunctionDefInfo,
        connectorConfig,
        model
    };
}

export const getKeyFromConnection = (connection: ConnectionDetails, key: string) => {
    return connection?.codeVariableKeys.find((keys: { name: string; }) => keys.name === key).codeVariableKey || "";
};

export function getOauthConnectionParams(connectorName: string, connectionDetail: ConnectionDetails): any {
    switch (connectorName) {
        case "github": {
            const githubAccessToken = getKeyFromConnection(connectionDetail, 'accessTokenKey');
            return [`{
                accessToken: ${githubAccessToken}
            }`];
        }
        case "google sheets": {
            const sheetClientId = getKeyFromConnection(connectionDetail, 'clientIdKey');
            const sheetClientSecret = getKeyFromConnection(connectionDetail, 'clientSecretKey');
            const sheetRefreshUrl = getKeyFromConnection(connectionDetail, 'tokenEpKey');
            const sheetRefreshToken = getKeyFromConnection(connectionDetail, 'refreshTokenKey');
            return [`{
                oauthClientConfig: {
                    clientId: ${sheetClientId},
                    clientSecret: ${sheetClientSecret},
                    refreshToken: ${sheetRefreshToken},
                    refreshUrl: ${sheetRefreshUrl}
                }
             }`];
        }
        case "google calendar": {
            const calendarClientId = getKeyFromConnection(connectionDetail, 'clientIdKey');
            const calendarClientSecret = getKeyFromConnection(connectionDetail, 'clientSecretKey');
            const calendarRefreshUrl = getKeyFromConnection(connectionDetail, 'tokenEpKey');
            const calendarRefreshToken = getKeyFromConnection(connectionDetail, 'refreshTokenKey');
            return [`{
                oauth2Config: {
                    clientId: ${calendarClientId},
                    clientSecret: ${calendarClientSecret},
                    refreshToken: ${calendarRefreshToken},
                    refreshUrl: ${calendarRefreshUrl}
                }
             }`];
        }
        case "gmail": {
            const gmailClientId = getKeyFromConnection(connectionDetail, 'clientIdKey');
            const gmailClientSecret = getKeyFromConnection(connectionDetail, 'clientSecretKey');
            const gmailRefreshUrl = getKeyFromConnection(connectionDetail, 'tokenEpKey');
            const gmailRefreshToken = getKeyFromConnection(connectionDetail, 'refreshTokenKey');
            return [`{
                oauthClientConfig: {
                    clientId: ${gmailClientId},
                    clientSecret: ${gmailClientSecret},
                    refreshToken: ${gmailRefreshToken},
                    refreshUrl: ${gmailRefreshUrl}
                }
             }`];
        }
    }
}

export function checkErrorsReturnType(action: string, functionDefinitions: Map<string, FunctionDefinitionInfo>): boolean {
    if (functionDefinitions.get(action)?.returnType?.isErrorType) {
        // return type has an error
        return true;
    }
    if (functionDefinitions.get(action)?.returnType?.fields
        .find((param: any) => (param?.isErrorType || param?.type === "error"))) {
        // return type has an error
        return true;
    }
    // return type hasn't any error
    return false;
}

export interface VariableNameValidationResponse {
    error: boolean;
    message?: string;
}
/**
 * check variable name validation with error message.
 * and return variableNameValidationResponse object.
 * @param varName text field name. this will used to generate error message
 * @param text current value of the text field
 * @param existingText default value. this will skip from variable list
 */
export function checkVariableName(varName: string, text: string, existingText?: string, state?: any): VariableNameValidationResponse {
    const symbolInfo = state.stSymbolInfo;
    const lowerCasedAllVariables = retrieveVariables(symbolInfo).map(name => name.toLowerCase());
    const nameRegex = new RegExp("^'?[a-zA-Z][a-zA-Z0-9_]*$");
    let response: VariableNameValidationResponse = { error: false };
    if (text === "") {
        // is the name empty
        response = { error: true, message: `Name is empty` };
        return response;
    }
    if (text !== existingText && lowerCasedAllVariables?.includes(text.toLowerCase())) {
        // is already used in code
        response = { error: true, message: `${varName} already exists` };
        return response;
    }
    if (!nameRegex.test(text)) {
        // invalid format
        response = { error: true, message: `Invalid value for ${varName}` };
        return response;
    }
    if (keywords.includes(text)) {
        // is a keyword
        response = { error: true, message: `This is a reserved value. Please enter different value` };
        return response;
    }
    return response;
}
