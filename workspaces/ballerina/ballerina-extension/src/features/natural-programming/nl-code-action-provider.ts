import * as vscode from 'vscode';
import { CustomDiagnostic } from './custom-diagnostics';
import {DIAGNOSTIC_ID, COMMAND_SHOW_TEXT} from "./constants";

const UPDATE_CODE_ACTION_CONTENT = "Update code to match docs";
const UPDATE_DOC_ACTION_CONTENT = "Update docs to match code";

export class NLCodeActionProvider implements vscode.CodeActionProvider {
    public provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.CodeAction[]> {
        const actions: vscode.CodeAction[] = [];

        for (const diagnostic of context.diagnostics) {
            if (diagnostic instanceof CustomDiagnostic) {
                const customDiagnostic = diagnostic as CustomDiagnostic;

                if (customDiagnostic.data.id == DIAGNOSTIC_ID){
                    const codeChangeSolution = customDiagnostic.data.codeChangeSolution;
                    const docChangeSolution = customDiagnostic.data.docChangeSolution;

                    if (codeChangeSolution != null && codeChangeSolution != "") {
                        const replaceAction = new vscode.CodeAction(UPDATE_CODE_ACTION_CONTENT, vscode.CodeActionKind.QuickFix);
                        replaceAction.command = {
                            command: COMMAND_SHOW_TEXT,
                            title: UPDATE_CODE_ACTION_CONTENT,
                            arguments: [document, customDiagnostic, customDiagnostic.data.codeChangeSolution]
                        };
                        actions.push(replaceAction);
                    }

                    if (docChangeSolution != null && docChangeSolution != "") {
                        const replaceAction = new vscode.CodeAction(UPDATE_DOC_ACTION_CONTENT, vscode.CodeActionKind.QuickFix);
                        replaceAction.command = {
                            command: COMMAND_SHOW_TEXT,
                            title: UPDATE_DOC_ACTION_CONTENT,
                            arguments: [document, customDiagnostic, customDiagnostic.data.docChangeSolution]
                        };
                        actions.push(replaceAction);
                    }
                }
            }
        }

        return actions;
    }
}

export const showTextOptions = vscode.commands.registerCommand(COMMAND_SHOW_TEXT, async (document: vscode.TextDocument, diagnostic: CustomDiagnostic, newText: string) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage("No active editor found.");
        return;
    }

    const textToReplace = document.getText(diagnostic.range);

    // Create a Git conflict-like view with "|||||||", "HEAD" and "======="
    const conflictText = `<<<<<<< HEAD\n${textToReplace}\n=======\n${newText}\n>>>>>>>\n`;

    const edit = new vscode.WorkspaceEdit();
    edit.replace(document.uri, diagnostic.range, conflictText);
    await vscode.workspace.applyEdit(edit);
    vscode.window.showInformationMessage('Changes added');
});
