import { FunctionDefinition, ModulePart, STKindChecker, STNode, traversNode } from "@ballerina/syntax-tree";

import { initVisitor, positionVisitor, sizingVisitor, SymbolVisitor } from "..";
import { DiagramEditorLangClientInterface } from "../Definitions/diagram-editor-lang-client-interface";
import { getLowCodeSTFnSelected } from "../Diagram/utils/st-util";
import { cleanAll } from "../Diagram/visitors/symbol-finder-visitor";

export async function getSyntaxTree(filePath: string, langClient: DiagramEditorLangClientInterface) {
    const resp = await langClient.getSyntaxTree({
        documentIdentifier: {
            uri: `file://${filePath}`
        }
    });
    return resp.syntaxTree;
}

export function getLowcodeST(payload: any, startLine: string, startColumn: string) {
    const modulePart: ModulePart = payload;
    const members: STNode[] = modulePart?.members || [];
    let responseST: STNode;
    // FunctionDefinition
    const fnMembers = members.filter((m: any) => (m.kind === "FunctionDefinition"));
    for (const node of fnMembers) {
        if (STKindChecker.isFunctionDefinition(node) && node.functionName.position.startLine.toString() === startLine
             && node.functionName.position.startColumn.toString() === startColumn) {
            if (STKindChecker.isExternalFunctionBody(node.functionBody)) {
                responseST = node;
                break;
            }
            const fnDef = getLowCodeSTFnSelected(payload, node, true);
            const st: STNode = sizingAndPositioningST(fnDef);
            cleanAll();
            traversNode(st, SymbolVisitor);
            responseST = st;
            break;
        }
    }
    const serviceMembers = members.filter((m: any) => (STKindChecker.isServiceDeclaration(m)));
    for (const node of serviceMembers) {
        if (STKindChecker.isServiceDeclaration(node)) {
            const resourceMembers: STNode[] = node.members;
            for (const resource of resourceMembers) {
                const functionDef = resource as FunctionDefinition;
                if (functionDef.functionName.position.startLine.toString() === startLine
                    && functionDef.functionName.position.startColumn.toString() === startColumn) {
                    const fnDef = getLowCodeSTFnSelected(payload, resource, false);
                    const st: STNode = sizingAndPositioningST(fnDef);
                    cleanAll();
                    traversNode(st, SymbolVisitor);
                    responseST = st;
                    break;
                }
            }
        }
    }
    return responseST;
}

export function sizingAndPositioningST(st: STNode): STNode {
    traversNode(st, initVisitor);
    traversNode(st, sizingVisitor);
    traversNode(st, positionVisitor);
    const clone = { ...st };
    return clone;
}
