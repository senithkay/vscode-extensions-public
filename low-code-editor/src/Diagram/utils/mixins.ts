import {
    CaptureBindingPattern,
    LocalVarDecl,
    STNode
} from "@ballerina/syntax-tree";

import { STSymbolInfo } from "../../Definitions";

export function getAllVariables(symbolInfo: STSymbolInfo): string[] {
    const variableCollection: string[] = [];
    symbolInfo.variables.forEach((variableNodes: STNode[]) => {
        variableNodes.forEach((variableNode) => {
            const variableDef: LocalVarDecl = variableNode as LocalVarDecl;
            const variable: CaptureBindingPattern = variableDef.typedBindingPattern.bindingPattern as
                CaptureBindingPattern;
            variableCollection.push(variable.variableName.value);
        });
    });
    symbolInfo.endpoints.forEach((variableNodes: STNode) => {
        const variableDef: LocalVarDecl = variableNodes as LocalVarDecl;
        const variable: CaptureBindingPattern = variableDef.typedBindingPattern.bindingPattern as
            CaptureBindingPattern;
        if (!variableCollection.includes(variable.variableName.value)) {
            variableCollection.push(variable.variableName.value);
        }
    });
    symbolInfo.actions.forEach((variableNodes: STNode) => {
        const variableDef: LocalVarDecl = variableNodes as LocalVarDecl;
        const variable: CaptureBindingPattern = variableDef.typedBindingPattern.bindingPattern as
            CaptureBindingPattern;
        if (!variableCollection.includes(variable.variableName.value)) {
            variableCollection.push(variable.variableName.value);
        }
    });
    return variableCollection;
}
