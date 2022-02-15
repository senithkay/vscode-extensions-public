/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import { DiagramEditorLangClientInterface, ExpressionEditorLangClientInterface, JsonToRecordResponse,
    PartialSTRequest, STSymbolInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    RecordField,
    RecordFieldWithDefaultValue,
    RecordTypeDesc,
    STKindChecker,
    STNode
} from "@wso2-enterprise/syntax-tree";

import { Field, RecordModel, SimpleField } from "../types";

export async function convertToRecord(json: string, name: string, isClosed: boolean,
                                      lsUrl: string, ls?: any): Promise<string> {
    const langClient: DiagramEditorLangClientInterface = await ls.getDiagramEditorLangClient();
    const resp: JsonToRecordResponse = await langClient.convert(
        {
            jsonString: json,
            recordName: name,
            isClosed,
            isRecordTypeDesc: true,
        }
    )
    return resp.codeBlock;
}

export async function getRecordST(partialSTRequest: PartialSTRequest,
                                  lsUrl: string,
                                  ls?: any): Promise<STNode> {
    const langClient: ExpressionEditorLangClientInterface = await ls.getExpressionEditorLangClient(lsUrl);

    const resp = await langClient.getSTForModuleMembers(partialSTRequest);
    return resp.syntaxTree;
}

export function getRecordPrefix(symbolInfo: STSymbolInfo): string {
    if (symbolInfo?.recordTypeDescriptions?.size > 0) {
        const typeDesc: RecordTypeDesc = symbolInfo?.recordTypeDescriptions?.entries().next()?.value[1];
        const typeSymbol = typeDesc.typeData?.typeSymbol;
        if (typeSymbol) {
            return `${typeSymbol.moduleID.orgName}/${typeSymbol.moduleID.moduleName}:${typeSymbol.moduleID.version}:`;
        }
    }
    return null;
}

export function getRecordModel(typeDesc: RecordTypeDesc, name: string, isInline: boolean, type?: string,
                               isOptional?: boolean): RecordModel {
    const recordModel: RecordModel = {
        name, fields: [], isInline, type,
        isClosed: STKindChecker.isOpenBracePipeToken(typeDesc.bodyStartDelimiter),
        isOptional
    };
    if (typeDesc.fields.length > 0) {
        typeDesc.fields.forEach((field) => {
            // FIXME: Handle record field with default value
            if (STKindChecker.isRecordFieldWithDefaultValue(field.typeName)) {
                // when there is a inline record with a default value
            } else if (STKindChecker.isRecordTypeDesc(field.typeName)) {
                // when there is a inline record
                const subRecModels = getRecordModel(field.typeName, field.fieldName.value, true, "record",
                    (field as RecordField)?.questionMarkToken !== undefined);
                recordModel.fields.push(subRecModels);
            } else if (STKindChecker.isOptionalTypeDesc(field.typeName)) {
                const recField: SimpleField = STKindChecker.isArrayTypeDesc(field.typeName.typeDescriptor) ?
                    (getArrayField(field) as SimpleField) : {
                        name: field.fieldName.value,
                        type: field.typeName.source.trim(),
                        isFieldOptional: STKindChecker.isRecordField(field) ? (field.questionMarkToken !== undefined) :
                            false
                    };
                recField.isFieldTypeOptional = true;
                if (STKindChecker.isRecordFieldWithDefaultValue(field)) {
                    recField.value = field.expression.literalToken ? field.expression.literalToken.value :
                        field.expression.source.trim();
                }
                recordModel.fields.push(recField);
            } else if (STKindChecker.isArrayTypeDesc(field.typeName)) {
                const recField = (getArrayField(field) as SimpleField)
                if (STKindChecker.isRecordFieldWithDefaultValue(field)) {
                    recField.value = field.expression.literalToken ? field.expression.literalToken.value :
                        field.expression.source.trim();
                }
                recordModel.fields.push(recField);
            } else if (STKindChecker.isIntTypeDesc(field.typeName) || STKindChecker.isBooleanTypeDesc(field.typeName)
                || STKindChecker.isFloatTypeDesc(field.typeName) || STKindChecker.isStringTypeDesc(field.typeName) ||
                STKindChecker.isErrorTypeDesc(field.typeName) || STKindChecker.isNeverTypeDesc(field.typeName) ||
                STKindChecker.isSimpleNameReference(field.typeName)) {
                // when there is a simple field or when there is a referenced record
                const recField: SimpleField = {
                    name: field.fieldName.value,
                    type: field.typeName.name.value,
                    isFieldOptional: STKindChecker.isRecordField(field) ? (field.questionMarkToken !== undefined) :
                        false,
                    isFieldTypeOptional: false,
                }
                if (STKindChecker.isRecordFieldWithDefaultValue(field)) {
                    recField.value = field.expression.literalToken ? field.expression.literalToken.value :
                        field.expression.source.trim();
                }
                recordModel.fields.push(recField);
            } else {
                const recField: SimpleField = {
                    name: field.fieldName.value,
                    type: field.typeName.source.trim(),
                    isFieldOptional: STKindChecker.isRecordField(field) ? (field.questionMarkToken !== undefined) :
                        false,
                }
                if (STKindChecker.isRecordFieldWithDefaultValue(field)) {
                    recField.value = field.expression.literalToken ? field.expression.literalToken.value :
                        field.expression.source.trim();
                }
                recordModel.fields.push(recField);
            }
        })
    }
    return recordModel;
}

export function getArrayField(field: RecordField | RecordFieldWithDefaultValue) : SimpleField | RecordModel {
    let recField: SimpleField | RecordModel;
    if ((STKindChecker.isOptionalTypeDesc(field.typeName)) &&
        STKindChecker.isArrayTypeDesc(field.typeName.typeDescriptor)) {
        recField = {
            name: field.fieldName.value,
            type: field.typeName.source.trim(),
            isFieldOptional: STKindChecker.isRecordField(field) ? (field.questionMarkToken !== undefined) :
                false,
        }
    } else if (STKindChecker.isArrayTypeDesc(field.typeName)) {
        if (STKindChecker.isRecordTypeDesc(field.typeName.memberTypeDesc)) {
            // when there is a inline record
            recField = getRecordModel(field.typeName.memberTypeDesc, field.fieldName.value, true,
                "record");
            if (STKindChecker.isRecordField(field) && (field as RecordField)?.questionMarkToken) {
                recField.isOptional = true;
            }
            recField.isArray = true;
        } else {
            recField = {
                name: field.fieldName.value,
                type: field.typeName.source.trim(),
                isFieldOptional: STKindChecker.isRecordField(field) ? (field.questionMarkToken !== undefined) :
                    false,
            }
        }
    }
    return recField;
}

export function getGeneratedCode(model: Field, isTypeDef: boolean): string {
    let codeGenerated: string;
    if (model.type === "record") {
        const recordModel = model as RecordModel;
        // TODO: handle type reference fields
        const recordBegin = `record {${recordModel.isClosed ? "|\n" : ""}`;
        let fieldCode = "";
        if (recordModel?.fields.length > 0) {
            recordModel.fields.forEach((field) => {
                fieldCode += getGeneratedCode(field, false);
            });
        }
        const recordEnd = isTypeDef ? `${recordModel.isClosed ? "|" : ""}};` :
            `${recordModel.isClosed ? "|" : ""}}${recordModel.isArray ? "[]" :
                ""} ${recordModel.name}${recordModel.isOptional ? "?" : ""};`;
        codeGenerated = recordBegin + fieldCode + recordEnd + "\n";
    } else {
        const fieldModel = model as SimpleField;
        codeGenerated = `${fieldModel.type}${fieldModel.isArray ? "[]" : ""} ${fieldModel.name}${fieldModel.
            isFieldOptional ? "?" : ""} ${fieldModel.value ? ` = ${fieldModel.value}` : ""};\n`;
    }
    return codeGenerated;
}

export function genRecordName(defaultName: string, variables: string[]): string {
    let index = 0;
    let varName = defaultName;
    while (variables.includes(varName)) {
        index++;
        varName = defaultName + index;
    }
    return varName;
}

export function getFieldNames(fields: Field[]): string[] {
    const fieldNames: string[] = [];
    fields.forEach((field) => {
        fieldNames.push(field.name);
    });
    return fieldNames;
}
