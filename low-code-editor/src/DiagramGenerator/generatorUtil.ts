import { DiagramEditorLangClientInterface, PerformanceAnalyzerGraphResponse, PerformanceAnalyzerRealtimeResponse } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FunctionDefinition, ModulePart, NodePosition, ResourceAccessorDefinition, ServiceDeclaration, STKindChecker, STNode, traversNode } from "@wso2-enterprise/syntax-tree";

import { cleanLocalSymbols, cleanModuleLevelSymbols } from "../Diagram/visitors/symbol-finder-visitor";
import { initVisitor, positionVisitor, sizingVisitor, SymbolVisitor } from "../index";
import { SelectedPosition } from "../types";

import { addExecutorPositions } from "./executor";
import { addPerformanceData, MESSAGE_TYPE } from "./performanceUtil";
import { PALETTE_COMMANDS, PFSession } from "./vscode/Diagram";

export async function getSyntaxTree(filePath: string, langClient: DiagramEditorLangClientInterface) {
    const resp = await langClient.getSyntaxTree({
        documentIdentifier: {
            uri: `file://${filePath}`
        }
    });
    return resp.syntaxTree;
}

export async function resolveMissingDependencies(filePath: string, langClient: DiagramEditorLangClientInterface) {
    const resp = await langClient.resolveMissingDependencies({
        documentIdentifier: {
            uri: `file://${filePath}`
        }
    });
    return resp;
}

export async function getLowcodeST(payload: any, filePath: string, langClient: DiagramEditorLangClientInterface, pfSession: PFSession, showPerformanceGraph: () => Promise<boolean>, handlePerfErrors: (response: PerformanceAnalyzerRealtimeResponse | PerformanceAnalyzerGraphResponse) => Promise<boolean>, showMessage: (message: string, type: MESSAGE_TYPE, isIgnorable: boolean) => Promise<boolean>) {
    const modulePart: ModulePart = payload;
    const members: STNode[] = modulePart?.members || [];
    const st = sizingAndPositioningST(payload);
    cleanLocalSymbols();
    cleanModuleLevelSymbols();
    traversNode(st, SymbolVisitor);
    await addPerformanceData(st, filePath, langClient, pfSession, showPerformanceGraph, handlePerfErrors, showMessage);
    await addExecutorPositions(st, langClient, filePath)
    return st;
}

export function getFnStartPosition(node: FunctionDefinition | ResourceAccessorDefinition): SelectedPosition {
    const { startColumn, startLine } = node.functionName.position;
    return {
        startColumn,
        startLine
    }
}
export function getDefaultSelectedPosition(modulePart: ModulePart): SelectedPosition {
    const functions = modulePart.members && modulePart.members.filter((m) => STKindChecker.isFunctionDefinition(m)) as FunctionDefinition[];
    const services = modulePart.members && modulePart.members.filter((m) => STKindChecker.isServiceDeclaration(m)) as ServiceDeclaration[];

    const mainResult = functions && functions.filter((m) => m.functionName.value === "main");
    if (mainResult && mainResult.length > 0) { // select main fn if availble
        return getFnStartPosition(mainResult[0]);
    } else if (services && services.length > 0) { // select first resource fn of first service if availble
        const resources = services[0].members;
        if (resources && resources.length > 0) {
            return getFnStartPosition(resources[0]);
        }
    } else if (functions && functions.length > 0) { // select first fn if availble
        return getFnStartPosition(functions[0]);
    } else if (modulePart.members && modulePart.members.length > 0) { // select first member in module part
        const { startColumn, startLine } = modulePart.members[0]?.position;
        return { startColumn, startLine }
    } else {
        return { startColumn: 0, startLine: 0 }
    }
}

export function sizingAndPositioningST(st: STNode): STNode {
    traversNode(st, initVisitor);
    traversNode(st, sizingVisitor);
    traversNode(st, positionVisitor);
    const clone = { ...st };
    return clone;
}

export interface DiagnosticInfo {
    code: string,
    severity: string
}

export interface Diagnostic {
    message: string,
    diagnosticInfo: DiagnosticInfo,
    range: NodePosition
}

export function isUnresolvedModulesAvailable(diagnostics: Diagnostic[]): {isAvailable: boolean, diagnostic: Diagnostic} {
    let unresolvedModuleAvailable: boolean = false;
    let selectedDiagnostic: Diagnostic;
    for (const diagnostic of diagnostics) {
        if (diagnostic.diagnosticInfo.code === "BCE2003") {
            unresolvedModuleAvailable = true;
            selectedDiagnostic = diagnostic;
            break;
        }
    }
    return {isAvailable: unresolvedModuleAvailable, diagnostic: selectedDiagnostic};
}
