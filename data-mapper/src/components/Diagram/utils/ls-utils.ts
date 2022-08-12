/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import {
	DiagramEditorLangClientInterface,
    PublishDiagnosticsParams
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { CodeAction, Diagnostic } from "vscode-languageserver-protocol";

export async function getDiagnostics(
    docUri: string,
    getLangClient: () => Promise<DiagramEditorLangClientInterface>): Promise<PublishDiagnosticsParams[]> {
    const langClient = await getLangClient();
    const diagnostics = await langClient.getDiagnostics({
        documentIdentifier: {
            uri: docUri,
        }
    });

    return diagnostics;
}

export const handleDiagnostics = async (fileURI: string,
                                        getLangClient: () => Promise<DiagramEditorLangClientInterface>):
    Promise<Diagnostic[]> => {
    const diagResp = await getDiagnostics(`file://${fileURI}`, getLangClient);
    const diag = diagResp[0]?.diagnostics ? diagResp[0].diagnostics : [];
    return diag;
}

export const filterDiagnostics = (diagnostics: Diagnostic[], nodePosition:NodePosition) : Diagnostic[] => {
	return diagnostics.filter( (diagnostic) => {
		const diagPosition: NodePosition = {
			startLine: diagnostic.range.start.line,
			startColumn: diagnostic.range.start.character,
			endLine: diagnostic.range.end.line,
			endColumn: diagnostic.range.end.character
		};
		return isDiagInRange(nodePosition, diagPosition);
	})
}

export function isDiagInRange(nodePosition: NodePosition, diagPosition: NodePosition): boolean {
    return diagPosition?.startLine >= nodePosition?.startLine &&
        (diagPosition?.startLine === nodePosition?.startLine ? diagPosition?.startColumn >= nodePosition?.startColumn : true) &&
        diagPosition?.endLine <= nodePosition?.endLine &&
        (diagPosition?.endLine === nodePosition?.endLine ? diagPosition?.endColumn <= nodePosition?.endColumn : true);
}


export async function getCodeAction(filePath: string, diagnostic: Diagnostic, langClient: DiagramEditorLangClientInterface): Promise<CodeAction[]> {
    const codeAction = await langClient.codeAction({
		context: {
			diagnostics: [{
				code: diagnostic.code,
				message: diagnostic.message,
				range: {
					end: {
						line: diagnostic.range.end.line,
						character: diagnostic.range.end.character
					},
					start: {
						line: diagnostic.range.start.line,
						character: diagnostic.range.start.character
					}
				},
				severity: 1
			}],
			only: ["quickfix"]
		},
		range: {
			end: {
				line: diagnostic.range.end.line,
				character: diagnostic.range.end.character
			},
			start: {
				line: diagnostic.range.start.line,
				character: diagnostic.range.start.character
			}
		},
		textDocument: {
			uri: filePath
		}
	});

    return codeAction
}

export const handleCodeActions = async (fileURI: string, diagnostics: Diagnostic[],
	getLangClient: () => Promise<DiagramEditorLangClientInterface>):
	Promise<CodeAction[]> => {

	const langClient = await getLangClient();
	let codeActions: any[] = []

	for (const diagnostic of diagnostics) {
		const codeAction = await getCodeAction(`file://${fileURI}`,diagnostic, langClient)
		codeActions = [...codeActions, ...codeAction]
	}

return codeActions;
}