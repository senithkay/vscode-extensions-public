import vscode from 'vscode';

export interface BallerinaPluginConfig extends vscode.WorkspaceConfiguration {
    home?: string;
    debugLog?: boolean;
    classpath?: string;
}

export interface ResultItem {
    id: string;
    fileName: string;
    startLine: number;
    endLine: number;
    startColumn: number;
    endColumn: number;
    codeChangeSolution: string;
    docChangeSolution: string;
    cause: string;
}

export interface ResponseData {
    results: ResultItem[];
}
