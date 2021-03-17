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
    BooleanLiteral, CaptureBindingPattern, CheckAction,
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
    getFromFormFieldCache,
    getRecordDefFromCache
} from "../../../utils/st-util";
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
    'ballerinax/github:0.99.12:CardList',
    'ballerinax/github:0.99.12:ColumnList',
    'ballerinax/github:0.99.12:BranchList',
    'ballerinax/github:0.99.12:IssueList',
    'ballerinax/github:0.99.12:ProjectList',
    'ballerinax/github:0.99.12:RepositoryList',
    'ballerinax/github:0.99.12:ColumnList',
    'ballerinax/github:0.99.12:PullRequestList',
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
                    default:
                        // every other type can be a record or union
                        if (formField.typeInfo) {
                            let recordRes: STNode;
                            const typeInfo = formField.typeInfo;
                            const recordKey = `${typeInfo.orgName}/${typeInfo.modName}:${typeInfo.version}:${typeInfo.name}`;
                            recordRes = receivedRecords.get(recordKey)
                            if (ignoreList.indexOf(recordKey) === -1) {
                                if (recordRes === undefined) {
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
            } else if (formField.type === "collection" && !formField.hide) {
                if (formField.fields.length > 0) {
                    let firstRecordField = false;
                    paramString += "[";
                    formField.fields.forEach(field => {
                        if (firstRecordField) {
                            paramString += ", ";
                        } else {
                            firstRecordField = true;
                        }
                        paramString += field.value;
                    });
                    paramString += "]";
                } else if (formField.value !== undefined) {
                    paramString += formField.value.toString();
                }
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
                    } else if (field.type === "collection" && !field.hide) {
                        if (firstRecordField) {
                            recordFieldsString += ", ";
                        } else {
                            firstRecordField = true;
                        }
                        let collectionFieldString: string = "[";
                        let firstCollectionField = false;
                        if (field.fields) {
                            // To check incoming fields from property from
                            field.fields.forEach((subField: FormField) => {
                                if (firstCollectionField) {
                                    collectionFieldString += ", ";
                                } else {
                                    firstCollectionField = true;
                                }
                                if (field.collectionDataType === "string" && subField.value) {
                                    collectionFieldString += subField.value;
                                } else if ((field.type === "int" || field.type === "boolean" ||
                                    field.type === "float") && subField.value) {
                                    collectionFieldString += subField.value;
                                }
                            });
                        } else if (field.value) {
                            // To check incoming values from Array component
                            field.value.forEach((value: any) => {
                                if (firstCollectionField) {
                                    collectionFieldString += ", ";
                                } else {
                                    firstCollectionField = true;
                                }
                                if (field.collectionDataType === "string" && field.value) {
                                    collectionFieldString += value;
                                } else if ((field.type === "int" || field.type === "boolean" ||
                                    field.type === "float") && field.value) {
                                    collectionFieldString += value;
                                }
                            });
                        }
                        collectionFieldString += "]";
                        recordFieldsString += getFieldName(field.name) + ": " + collectionFieldString;
                    } else if (field.type === "union" && !field.optional && !field.hide && field.isUnion) {
                        const selectedUnionField: FormField[] = [];
                        for (const unionField of field.fields) {
                            if (unionField.type === field.selectedDataType
                                || unionField.collectionDataType === field.selectedDataType
                                || unionField.typeName === field.selectedDataType) {
                                selectedUnionField.push(unionField);
                                break;
                            }
                        }
                        recordFieldsString += ", " + getFieldName(field.name) + ": " + getParams(selectedUnionField);
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
            } else if (formField.type === PrimitiveBalType.Union && formField.isUnion) {
                const selectedUnionField: FormField[] = [];
                for (const unionField of formField.fields) {
                    if (unionField.type === formField.selectedDataType
                        || unionField.collectionDataType === formField.selectedDataType
                        || unionField.typeName === formField.selectedDataType) {
                        selectedUnionField.push(unionField);
                        break;
                    }
                }
                paramString += getParams(selectedUnionField);
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
                const mappingConstructor: MappingConstructor = positionalArg.expression as MappingConstructor;

                let type = "";
                if (STKindChecker.isStringLiteral(positionalArg.expression)) {
                    type = "string";
                } else if (STKindChecker.isNumericLiteral(positionalArg.expression)) {
                    const numericLiteral: NumericLiteral = positionalArg.expression as NumericLiteral;
                    if (STKindChecker.isDecimalIntegerLiteralToken(numericLiteral.literalToken)) {
                        type = "int";
                    } else if (STKindChecker.isDecimalFloatingPointLiteralToken(numericLiteral.literalToken)) {
                        type = "float";
                    }
                } else if (STKindChecker.isBooleanLiteral(positionalArg.expression)) {
                    type = "boolean"
                } else if (mappingConstructor) {
                    type = "record";
                }
                // if (type === "null") {
                //     type = "nil";
                // }

                for (const unionMember of formField.fields) {
                    if (unionMember.type === type) {
                        if (unionMember.type === "string" || unionMember.type === "int" || unionMember.type === "boolean"
                            || unionMember.type === "float" || unionMember.type === "nil") {
                            let literal: StringLiteral | NumericLiteral | BooleanLiteral;
                            if (STKindChecker.isStringLiteral(positionalArg.expression)) {
                                literal = positionalArg.expression as StringLiteral;
                            } else if (STKindChecker.isNumericLiteral(positionalArg.expression)) {
                                literal = positionalArg.expression as StringLiteral;
                            } else if (STKindChecker.isBooleanLiteral(positionalArg.expression)) {
                                literal = positionalArg.expression as StringLiteral;
                            }
                            formField.selectedDataType = unionMember.type;
                            unionMember.value = literal;
                            nextValueIndex++;
                            break;
                        } else if (unionMember.type === "record" && unionMember.fields && unionMember.fields.length > 0) {
                            if (mappingConstructor) {
                                // mapRecordLiteralToRecordTypeFormField(mappingConstructor.fields as SpecificField[],
                                // unionMember.fields);
                                formField.selectedDataType = unionMember.type;
                                nextValueIndex++;
                                break;
                            }
                        }
                    }
                }
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
                    if (STKindChecker.isStringLiteral(specificField.valueExpr) ||
                        STKindChecker.isNumericLiteral(specificField.valueExpr) ||
                        STKindChecker.isBooleanLiteral(specificField.valueExpr)) {

                        const fieldValue = specificField.valueExpr.literalToken.value;
                        if (formField.type === "union") {
                            formField.fields.forEach((field: FormField) => {
                                if (field.type === formField.selectedDataType) {
                                    formField.value = fieldValue;
                                }
                            });
                        } else {
                            formField.value = fieldValue;
                        }
                    } else {
                        formField.value = specificField.valueExpr.source;
                    }

                    // if the assigned value is a record
                    if (specificField.valueExpr.kind === 'MappingConstructor') {
                        const mappingField = specificField.valueExpr as MappingConstructor;
                        mapRecordLiteralToRecordTypeFormField(mappingField.fields as SpecificField[], formField.fields);
                    }

                    // if the assigned value is an array
                    if (specificField.valueExpr.kind === 'ListConstructor') {
                        const listExpr = specificField.valueExpr as ListConstructor;
                        formField.value = [];
                        formField.fields = [];
                        listExpr.expressions.forEach(element => {
                            if (STKindChecker.isStringLiteral(element) ||
                                STKindChecker.isNumericLiteral(element) ||
                                STKindChecker.isBooleanLiteral(element)) {

                                const fieldValue = element.literalToken.value;
                                if (formField.type === "union") {
                                    formField.fields.forEach((field: FormField) => {
                                        if (field.type === formField.selectedDataType) {
                                            formField.value.push(fieldValue);
                                        }
                                    });
                                } else {
                                    formField.value.push(fieldValue);
                                }
                            } else {
                                if (STKindChecker.isMappingConstructor(element)) {
                                    const mappingField: FormField = {
                                        type: PrimitiveBalType.String,
                                        name: "",
                                        fields: []
                                    }
                                    element.fields.forEach((field) => {
                                        if (field.kind !== "CommaToken") {
                                            const mappingSpecificField = field as SpecificField;
                                            if (STKindChecker.isNumericLiteral(mappingSpecificField.valueExpr)) {
                                                mappingField.fields.push({
                                                    type: PrimitiveBalType.Float,
                                                    name: mappingSpecificField.fieldName.value,
                                                    value: mappingSpecificField.valueExpr.source
                                                });
                                            } else if (STKindChecker.isStringLiteral(mappingSpecificField.valueExpr)) {
                                                mappingField.fields.push({
                                                    type: PrimitiveBalType.String,
                                                    name: mappingSpecificField.fieldName.value,
                                                    value: mappingSpecificField.valueExpr.source
                                                });
                                            } else if (STKindChecker.isStringLiteral(mappingSpecificField.valueExpr)) {
                                                mappingField.fields.push({
                                                    type: PrimitiveBalType.Boolean,
                                                    name: mappingSpecificField.fieldName.value,
                                                    value: mappingSpecificField.valueExpr.source
                                                });
                                            }
                                        }
                                    });
                                    formField.fields.push(mappingField);
                                } else if (element.kind !== "CommaToken") {
                                    formField.fields.push({type: PrimitiveBalType.String, name: "", value: element.source});
                                }
                            }
                        })
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
            formField.fields = (positionalArg.expression as ListConstructor).expressions
                .filter(exp => exp.kind !== 'CommaToken')
                .map(exp => ({ type: formField.collectionDataType, value: exp.source }));
            nextValueIndex++;
        } else if (formField.type === "record" && formField.fields && formField.fields.length > 0) {
            const mappingConstructor: MappingConstructor = positionalArg.expression as MappingConstructor;
            if (mappingConstructor) {
                mapRecordLiteralToRecordTypeFormField(mappingConstructor.fields as SpecificField[], formField.fields);
                nextValueIndex++;
            }
        } else if (formField.type === "union" && formField.isUnion) {
            const mappingConstructor: MappingConstructor = positionalArg.expression as MappingConstructor;
            let type = "";
            if (STKindChecker.isStringLiteral(positionalArg.expression)) {
                type = "string";
            } else if (STKindChecker.isNumericLiteral(positionalArg.expression)) {
                const numericLiteral: NumericLiteral = positionalArg.expression as NumericLiteral;
                if (STKindChecker.isDecimalIntegerLiteralToken(numericLiteral.literalToken)) {
                    type = "int";
                } else if (STKindChecker.isDecimalFloatingPointLiteralToken(numericLiteral.literalToken)) {
                    type = "float";
                }
            } else if (STKindChecker.isBooleanLiteral(positionalArg.expression)) {
                type = "boolean"
            } else if (mappingConstructor) {
                type = "record";
            }

            // if (type === "null") {
            //     type = "nil";
            // }

            for (const unionMember of formField.fields) {
                if (unionMember.type === type) {
                    if (unionMember.type === "string" || unionMember.type === "int" || unionMember.type === "boolean" || unionMember.type === "float" || unionMember.type === "nil") {
                        let literal: StringLiteral | NumericLiteral | BooleanLiteral;
                        if (STKindChecker.isStringLiteral(positionalArg.expression)) {
                            literal = positionalArg.expression as StringLiteral;
                        } else if (STKindChecker.isNumericLiteral(positionalArg.expression)) {
                            literal = positionalArg.expression as StringLiteral;
                        } else if (STKindChecker.isBooleanLiteral(positionalArg.expression)) {
                            literal = positionalArg.expression as StringLiteral;
                        }
                        formField.selectedDataType = unionMember.type;
                        unionMember.value = literal;
                        nextValueIndex++;
                        break;
                    } else if (unionMember.type === "record" && unionMember.fields && unionMember.fields.length > 0) {
                        if (mappingConstructor) {
                            mapRecordLiteralToRecordTypeFormField(mappingConstructor.fields as SpecificField[],
                                unionMember.fields);
                            formField.selectedDataType = unionMember.type;
                            nextValueIndex++;
                            break;
                        }
                    }
                }
            }
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
            } else {
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

// documentSymbol request is no longer supported by the LS
// export async function getAllVariables(): Promise<{ [key: string]: any }> {
//     const langClient: BallerinaLangClient = await getLangClientForCurrentApp();
//     // const { state: { langClient }} = useContext(DiagramContext);
//     const symbolInfo = await langClient.getDocumentSymbol({
//         textDocument: {
//             uri: monaco.Uri.file(store.getState()?.appInfo?.currentApp?.workingFile).toString()
//         }
//     });
//     if (symbolInfo) {
//         const varList: { [key: string]: any } = {};
//         if (isDocumentSymbol(symbolInfo[0])) {
//             (symbolInfo as DocumentSymbol[]).forEach((symbol: DocumentSymbol) => {
//                 varList[symbol.name] = {
//                     "type": getSymbolKind(symbol.kind),
//                     "position": 0,
//                     "isUsed": 0
//                 }
//             })
//         } else {
//             (symbolInfo as SymbolInformation[]).forEach((symbol: SymbolInformation) => {
//                 varList[symbol.name] = {
//                     "type": getSymbolKind(symbol.kind),
//                     "position": symbol.location.range.start.line,
//                     "isUsed": 0
//                 }
//             })
//         }
//         return varList
//     }
// }

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

// export function getConnectorConfig(connectorName: string): OauthConnectorConfig {
//     const configs: OauthConnectorConfig[] = store.getState().oauthProviderConfigs.configList;
//     let oauthConfig: OauthConnectorConfig = null;
//     configs.forEach((config) => {
//         if (config.connectorName.toLocaleLowerCase() === connectorName.toLocaleLowerCase()) {
//             oauthConfig = config;
//         }
//     });
//     return oauthConfig;
// }

export async function fetchConnectorInfo(connector: Connector, model?: STNode, state?: any): Promise<ConfigWizardState> {
    // check existing in same code file
    // generate select existing connector form
    // if create new clicked.
    const { stSymbolInfo: symbolInfo, langServerURL, getDiagramEditorLangClient } = state;

    const langClient: DiagramEditorLangClientInterface = await getDiagramEditorLangClient(langServerURL);
    let connectorDef = connector ? await getConnectorDefFromCache(connector) : undefined;

    if (!connectorDef && connector) {
        const connectorResp = await langClient.getConnector(connector);
        connectorDef = connectorResp.ast;
    }
    if (connectorDef) {
        const connectorConfig = new ConnectorConfig();
        connectorDef.viewState = {};
        cleanFields();
        let functionDefInfo = await getFromFormFieldCache(connector);
        if (!functionDefInfo) {
            traversNode(connectorDef, FormFieldVisitor);
            functionDefInfo = filterCodeGenFunctions(connector, functionDefinitionMap);
            for (const value of Array.from(functionDefInfo.values())) {
                await getRecordFields(value.parameters, connectorDef.typeData.records, langClient);
                if (value.returnType) {
                    if (value.returnType.type === 'union') {
                        await getRecordFields((value.returnType.fields as any), connectorDef.typeData.records, langClient);
                    } else {
                        await getRecordFields([value.returnType], connectorDef.typeData.records, langClient);
                    }
                }
            }
            addToFormFieldCache(connector, functionDefInfo);
        }

        // // check whether the init method has an error type return
        // const initFunction: ObjectMethodDefinition[] = connectorDef.members.filter((member: any) => member.functionName && member.functionName.value === 'init');
        // if (initFunction.length > 0 && initFunction[0].functionSignature.returnTypeDesc) {
        //     const returnType = initFunction[0].functionSignature.returnTypeDesc.type;
        //     const typeVS = returnType.kind === 'OptionalTypeDesc' ?
        //         (returnType as OptionalTypeDesc).typeDescriptor.viewState
        //         : returnType.viewState;
        //     await getRecordFields([typeVS], connectorDef.typeData.records, langClient);

        //     if (typeVS.isUnion) {
        //         typeVS.fields.forEach((field: any) => {
        //             if (field.isErrorType) {
        //                 connectorConfig.isReturnError = true;
        //             }
        //         })
        //     } else {
        //         connectorConfig.isReturnError = typeVS.isErrorType;
        //     }
        // }

        // Filter connector functions to have better usability.
        functionDefInfo = filterConnectorFunctions(connector, functionDefInfo, connectorConfig, state);
        if (model) {
            const variable: LocalVarDecl = model as LocalVarDecl;
            let remoteCall: RemoteMethodCallAction;
            switch (variable.initializer.kind) {
                case 'TypeCastExpression':
                    const initializer: TypeCastExpression = variable.initializer as TypeCastExpression
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
                    connectorConfig.action.fields = functionDefInfo.get(connectorConfig.action.name).parameters;
                    matchActionToFormField(model as LocalVarDecl, connectorConfig.action.fields);
                }
            }

            connectorConfig.connectorInit = functionDefInfo.get("init") ?
                functionDefInfo.get("init").parameters
                : functionDefInfo.get("__init").parameters;
            const matchingEndPoint: LocalVarDecl = symbolInfo.endpoints.get(connectorConfig.name) as LocalVarDecl;
            connectorConfig.initPosition = matchingEndPoint.position;
            matchEndpointToFormField(matchingEndPoint, connectorConfig.connectorInit);
        }
        connectorConfig.existingConnections = symbolInfo.variables.get(connector.module + ":" + connector.name);

        return {
            isLoading: false,
            connector,
            wizardType: model ? WizardType.EXISTING : WizardType.NEW,
            functionDefInfo,
            connectorConfig,
            connectorDef,
            model
        };
    }
    return {
        isLoading: false,
        connector: undefined,
        wizardType: undefined,
        functionDefInfo: undefined,
        connectorConfig: undefined,
        connectorDef: undefined
    }
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
