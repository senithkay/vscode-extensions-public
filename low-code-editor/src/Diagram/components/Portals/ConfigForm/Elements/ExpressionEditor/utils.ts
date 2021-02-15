import { FunctionDefinition, NodePosition, STKindChecker, STNode } from "@ballerina/syntax-tree";
import { Diagnostic } from "monaco-languageclient/lib/monaco-language-client";

// import { diagnosticChecker } from "../../../../../../../../$store/actions/app";
import { ExpressionEditorState } from '../../../../../../Definitions';
import { DraftInsertPosition } from '../../../../../view-state/draft';

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

export function addToTargetLine(oldModelValue: string, targetLine: number, codeSnippet: string, EOL: string): string {
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
