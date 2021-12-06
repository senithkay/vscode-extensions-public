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
import { DiagramEditorLangClientInterface, JsonToRecordResponse, STSymbolInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    RecordField,
    RecordFieldWithDefaultValue,
    EnumDeclaration,
    STKindChecker,
} from "@wso2-enterprise/syntax-tree";

import { Field, EnumModel, SimpleField } from "../types";

export async function convertToRecord(json: string, lsUrl: string, ls?: any): Promise<string> {
    const langClient: DiagramEditorLangClientInterface = await ls.getDiagramEditorLangClient(lsUrl);
    const resp: JsonToRecordResponse = await langClient.convert(
        {
            jsonString: json
        }
    )
    return resp.codeBlock;
}

export function getRecordPrefix(symbolInfo: STSymbolInfo): string {
    if (symbolInfo?.recordTypeDescriptions?.size > 0) {
        const typeDesc: EnumDeclaration = symbolInfo?.recordTypeDescriptions?.entries().next()?.value[1];
        const typeSymbol = typeDesc.typeData?.typeSymbol;
        if (typeSymbol) {
            return `${typeSymbol.moduleID.orgName}/${typeSymbol.moduleID.moduleName}:${typeSymbol.moduleID.version}:`;
        }
    }
    return null;
}

export function getEnumModel(typeDesc: EnumDeclaration, name: string, isInline: boolean, type?: string,
                               isOptional?: boolean): EnumModel {
    const recordModel: EnumModel = {
        name, fields: [], isInline, type,
    };
    if (typeDesc.enumMemberList.length > 0) {
        typeDesc.enumMemberList.forEach((field) => {
            // FIXME: Handle enum field with default value
            if (STKindChecker.isEnumMember(field)) {
                const recField: SimpleField = {
                    name: field.identifier.value,
                    type: 'member',
                    isFieldOptional: STKindChecker.isRecordField(field) ? (field.questionMarkToken !== undefined) :
                        false,
                }
                recordModel.fields.push(recField);
            }
        })
    }
    return recordModel;
}


export function getGeneratedCode(model: Field, isLast?: boolean): string {
    let codeGenerated: string;
    if (model.type === "enum") {
        const recordModel = model as EnumModel;
        // TODO: handle type reference fields
        const recordBegin = `enum ${model.name} {\n`;
        let fieldCode = "";
        if (recordModel?.fields.length > 0) {
            recordModel.fields.forEach((field, index) => {
                fieldCode += getGeneratedCode(field, index === (recordModel?.fields.length - 1));
            });
        }
        codeGenerated = recordBegin + fieldCode + "\n}";
    } else if (model.type === 'member') {
        codeGenerated = `${model.name} ${isLast ? '' : ','}\n`
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
