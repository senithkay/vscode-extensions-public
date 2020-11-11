import * as vscode from 'vscode';
import { ExtendedLangClient } from '../core/extended-language-client';

/**
 * CodelensProvider for API document generation.
 */
export class CodelensProvider implements vscode.CodeLensProvider {

    private client: ExtendedLangClient;
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor(client: ExtendedLangClient) {
        this.client = client;
        vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        let codeLenses: vscode.CodeLens[] = [];
        if (vscode.workspace.getConfiguration("codelens-docs").get("enableCodeLens", true)) {
            return this.getCodeLensList(document);
        }
        return codeLenses;
    }

    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
        if (vscode.workspace.getConfiguration("codelens-docs").get("enableCodeLens", true)) {
            return codeLens;
        }
        return null;
    }

    private getCodeLensList(document: vscode.TextDocument): Thenable<vscode.CodeLens[]> {
        return this.client.getAST(document.uri).then((response) => this.loadCodeLensList(response));
    }

    private loadCodeLensList(response) {
        let codeLenses: vscode.CodeLens[] = [];
        if (!response.ast || !response.ast.topLevelNodes) {
            return codeLenses;
        }

        const documentables = ['Function', 'TypeDefinition', 'ClassDefn'];

        response.ast.topLevelNodes.forEach(node => {
            if (documentables.indexOf(node.kind) !== -1) {
                let isAdded = false;
                if (node.markdownDocumentationAttachment && node.public) {
                    codeLenses.push(this.createCodeLens(node));
                    isAdded = true;
                }

                if (!isAdded) {
                    if (node.kind === 'ClassDefn' && node.public && node.functions) {
                        node.functions.forEach(childFunction => {
                            if (!isAdded && childFunction.markdownDocumentationAttachment && childFunction.public) {
                                codeLenses.push(this.createCodeLens(node));
                                isAdded = true;
                            }
                        });

                        if (!isAdded && node.initFunction && node.initFunction.markdownDocumentationAttachment
                            && node.initFunction.public) {
                            codeLenses.push(this.createCodeLens(node));
                            isAdded = true;
                        }
                    }

                    if (node.kind === 'TypeDefinition' && node.public && node.typeNode && node.typeNode.functions) {
                        node.typeNode.functions.forEach(childFunction => {
                            if (!isAdded && childFunction.markdownDocumentationAttachment && childFunction.public) {
                                codeLenses.push(this.createCodeLens(node));
                                isAdded = true;
                            }
                        });
                    }
                }
            }
        });
        return codeLenses;
    }

    private createCodeLens(node): vscode.CodeLens {
        const { position } = node.markdownDocumentationAttachment ? node.markdownDocumentationAttachment : node;
        const startLine = position.startLine;
        const startColumn = position.startColumn;
        const endLine = position.endLine;
        const endColumn = position.endColumn;
        const codeLens = new vscode.CodeLens(new vscode.Range(startLine, startColumn, endLine, endColumn));
        codeLens.command = {
            title: "Preview Docs",
            tooltip: "Click to preview documentation",
            command: "ballerina.showDocs",
            arguments: [
                {
                    moduleName: this.getModuleName(node),
                    nodeType: this.getNodeType(node),
                    nodeName: this.getNodeName(node)
                }
            ]
        };
        return codeLens;
    }

    private getNodeType(node): string {
        if (node.kind === 'Function') {
            return 'functions';
        }
        if (node.kind === 'ClassDefn') {
            return 'classes';
        }
        if (node.kind === 'TypeDefinition') {
            if (node.typeNode.kind === 'RecordType') {
                return 'records';
            }
            return 'abstractobjects';
        }
        return '';
    }

    private getModuleName(node): string {
        if (node.typeInfo) {
            return node.typeInfo.modName;
        }
        if (node.kind === 'TypeDefinition' && node.typeNode) {
            return node.typeNode.typeInfo.modName;
        }
        return '';
    }

    private getNodeName(node): string {
        return node.name.value;
    }
}

