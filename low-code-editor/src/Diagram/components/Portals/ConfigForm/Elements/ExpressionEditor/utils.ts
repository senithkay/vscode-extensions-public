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
// tslint:disable: ordered-imports
import { FunctionDefinition, NodePosition, STKindChecker, STNode } from "@ballerina/syntax-tree";
import { Diagnostic } from "monaco-languageclient/lib/monaco-language-client";

import { ExpressionEditorState } from '../../../../../../Definitions';
import { DraftInsertPosition } from '../../../../../view-state/draft';

import {
    FormField,
    NonPrimitiveBal,
    PrimitiveBalType
} from "../../../../../../ConfigurationSpec/types";

// return true if there is any diagnostic of severity === 1
export function diagnosticChecker(diagnostics: Diagnostic[]): boolean {
    if (!diagnostics) {
        return false
    }
    // check for severity level == 1
    let isInvalid = false;
    Array.from(diagnostics).forEach((diagnostic: Diagnostic) => {
        if (diagnostic.severity === 1) {
            isInvalid = true;
            return
        }
    });
    return isInvalid;
}

export function addToTargetLine(oldModelValue: string, targetLine: number, codeSnippet: string, EOL?: string): string {
    const modelContent: string[] = oldModelValue.split(/\n/g) || [];
    modelContent.splice(targetLine, 0, codeSnippet);
    return modelContent.join('\n');
}

export function addToTargetPosition(oldLine: string, targetColumn: number, codeSnippet: string): string {
    return oldLine.slice(0, targetColumn) + codeSnippet + oldLine.slice(targetColumn);
}

export function getExpState(state: any): ExpressionEditorState {
    return state?.exprEditorState
}

export function getDiagnostics(state: any): Diagnostic[] {
    return state?.diagnostics
}

export function getCurrentSyntaxTree(state: any): STNode {
    return state?.syntaxTree
}

export function getTargetPosition(targetPosition: any, syntaxTree: any): DraftInsertPosition {
    if (targetPosition?.line) {
        return targetPosition
    } else if (targetPosition?.startLine) {
        return {
            line: targetPosition.startLine,
            column: undefined
        }
    } else {
        if (syntaxTree && STKindChecker.isFunctionDefinition(syntaxTree)) {
            const functionBodyPosition: NodePosition = (syntaxTree as FunctionDefinition).functionBody.position;
            return {
                line: functionBodyPosition.startLine + 1,
                column: undefined
            }
        } else {
            return {
                line: 1,
                column: undefined
            }
        }
    }
}

export function getInitialValue(defaultValue: string, model: FormField): string {
    if (model.type === PrimitiveBalType.Collection) {
        if (model.value && Array.isArray(model.value) && model.value.length > 0) {
            const arrayValues = model.value.map((subValue: any) => {
                return subValue;
            });
            return "[" + arrayValues.join(",") + "]";
        } else if (model.fields && Array.isArray(model.fields) && model.fields.length > 0) {
            const arrayValues = model.fields.map((subField: FormField) => {
                return subField.value;
            });
            return "[" + arrayValues.join(",") + "]";
        } else {
            return model.value
        }
    }
    const initVal = defaultValue ? defaultValue : model.value;
    if (model.type === PrimitiveBalType.String) {
        return initVal ? initVal : "\"\"";
    } else {
        return initVal;
    }
}

export function diagnosticCheckerExp(diagnostics: Diagnostic[]): boolean {
    // check for severity level == 1
    return diagnosticChecker(diagnostics)
}

/**
 * Helper function to convert the model type into string.
 * Currently simply returns the type name for non primitive types.
 */
export const transformFormFieldTypeToString = (model?: FormField): string => {
    if (model.type === "record" || model.typeInfo) {
        if (model.typeInfo){
            return model.typeInfo.modName + ":" + model.typeInfo.name;
        }
    } else if (model.type === "union"){
        if (model.fields) {
            const allTypes: string[] = [];
            for (const field of model.fields) {
                let type;
                if (field.type === "record" || model.typeInfo) {
                    if (field.typeInfo){
                        type = field.typeInfo.modName + ":" + field.typeInfo.name;
                    }
                } else if (field.type === "collection") {
                    if (field.collectionDataType) {
                        return field.collectionDataType + "[]";
                    }
                } else if (field.type) {
                    type = field.type;
                }

                if (type && !allTypes.includes(type.toString())){
                    allTypes.push(type.toString());
                }
            }
            return model.isArray ? "(" + allTypes.join("|") + ")[]" : allTypes.join("|");
        }
    } else if (model.type === "collection") {
        if (model.collectionDataType) {
            return model.collectionDataType + "[]";
        }
    } else if (model.type) {
        return model.type;
    }
    return PrimitiveBalType.Var.toString();
}

/**
 * Helper function to add import statements to a given code.
 * Import statements are only added if a given type is a non primitive type and if already not imported.
 * @param codeSnipet Existing code to which the imports will be added
 * @param model formfield model to check the types of the imports
 */
export const addImportModuleToCode = (codeSnipet: string, model: FormField, state?: any): string => {
    let code = codeSnipet;
    const { syntaxTree } = state;
    const functionBodyPosition: NodePosition = (syntaxTree as FunctionDefinition).functionBody.position;
    if (functionBodyPosition){
        if (model.type === "record" || model.typeInfo) {
            if (model.typeInfo){
                const nonPrimitiveTypeItem = model.typeInfo as NonPrimitiveBal
                const importSnippet = `import ${nonPrimitiveTypeItem.orgName}/${nonPrimitiveTypeItem.modName};`;
                if (!code.includes(importSnippet)){
                    // Add import only if its already not imported
                    code = addToTargetLine(code, functionBodyPosition.startLine, `${importSnippet}`);
                }
            }
        } else if (model.type === "union"){
            if (model.fields) {
                for (const field of model.fields) {
                    if (field.type === "record" || model.typeInfo) {
                        if (field.typeInfo){
                            const nonPrimitiveTypeItem = field.typeInfo as NonPrimitiveBal
                            const importSnippet = `import ${nonPrimitiveTypeItem.orgName}/${nonPrimitiveTypeItem.modName};`;
                            if (!code.includes(importSnippet)){
                                // Add import only if its already not imported
                                code = addToTargetLine(code, functionBodyPosition.startLine, `${importSnippet}`);
                            }
                        }
                    }
                }
            }
        }
    }
    return code;
}
