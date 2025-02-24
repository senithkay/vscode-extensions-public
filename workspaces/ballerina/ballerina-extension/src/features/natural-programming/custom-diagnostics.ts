import vscode from "vscode";

export interface CustomDiagnosticData {
    codeChangeSolution: string;
    docChangeSolution: string;
    fileName: string;
    id: string;
}

export class CustomDiagnostic extends vscode.Diagnostic {
    public data?: CustomDiagnosticData;

    constructor(range: vscode.Range, message: string, severity: vscode.DiagnosticSeverity, data:CustomDiagnosticData) {
        super(range, message, severity);
        this.data = data;
    }
}
