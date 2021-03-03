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

// import { diagnosticChecker } from "../../../../../../../../$store/actions/app";
import { ExpressionEditorState } from '../../../../../../Definitions';
import { DraftInsertPosition } from '../../../../../view-state/draft';

import {
    BallerinaType,
    ExpressionEditorType,
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

export function getInitialValue(defaultValue: string, modelValue: string, varType: string): string {
    const initVal = defaultValue ? defaultValue : modelValue;
    if (varType === "string") {
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
export const transformFormFieldTypeToString = (formType?: ExpressionEditorType | any): string => {
    if (formType) {
        if (Array.isArray(formType)) {
            // if an array, then could be a primitive or non-primitive type
            return (formType as BallerinaType[]).map(item => {
                if ((item as NonPrimitiveBal).typeName) {
                    const nonPrimitiveItem = item as NonPrimitiveBal;
                    return `${nonPrimitiveItem.moduleName}:${nonPrimitiveItem.typeName}`
                }
                return item.toString();
            }).join('|')
        } else if ((formType as NonPrimitiveBal).typeName) {
            // if it contains the property 'typeName', it has to be a non-primitive type
            return (formType as NonPrimitiveBal).typeName
        } else {
            // else it has to be a simple primitive type
            return formType.toString();
        }
    } else {
        return PrimitiveBalType.Var.toString();
    }
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
    if (syntaxTree && STKindChecker.isFunctionDefinition(syntaxTree)) {
        const functionBodyPosition: NodePosition = (syntaxTree as FunctionDefinition).functionBody.position;
        if (model.type && Array.isArray(model.type)) {
            // If type is an array, then loop and only add imports for non-primitive types
            for (const type of model.type) {
                if ((type as NonPrimitiveBal).typeName) {
                    const nonPrimitiveTypeItem = type as NonPrimitiveBal
                    const importSnippet = `import ${nonPrimitiveTypeItem.orgName}/${nonPrimitiveTypeItem.moduleName};`;
                    if (!code.includes(importSnippet)) {
                        // Add import only if its already not imported
                        code = addToTargetLine(code, functionBodyPosition.startLine, `${importSnippet}`);
                    }
                }
            }
        } else if (model.type && (model.type as NonPrimitiveBal).typeName) {
            // If type is not an array, then check if it is a non-primitive type
            const nonPrimitiveTypeItem = model.type as NonPrimitiveBal
            const importSnippet = `import ${nonPrimitiveTypeItem.orgName}/${nonPrimitiveTypeItem.moduleName};`;
            if (!code.includes(importSnippet)) {
                // Add import only if its already not imported
                code = addToTargetLine(code, functionBodyPosition.startLine, importSnippet);
            }
        }
    }
    return code;
}
