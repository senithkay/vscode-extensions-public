/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as path from "path";
import { CommandIds } from "@wso2-enterprise/choreo-core";
import * as vscode from "vscode";

// Register all code lenses here
export function activateCodeLenses(context: vscode.ExtensionContext) {
	const yamlCodeLensProvider = new YAMLCodeLensProvider();
	context.subscriptions.push(vscode.languages.registerCodeLensProvider({ scheme: "file", language: "yaml" }, yamlCodeLensProvider));
}

class YAMLCodeLensProvider implements vscode.CodeLensProvider {
	provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
		const codeLenses: vscode.CodeLens[] = [];
		// todo: add code lens for component.yaml
		if (document.fileName.endsWith("component-config.yaml")) {
			const addDependencyCmd: vscode.Command = {
				title: "Add Dependency",
				command: CommandIds.CreateComponentDependency,
				tooltip: "Add a new dependency to your Choreo component",
				arguments: [{ componentFsPath: path.dirname(path.dirname(document.uri.path)), isCodeLens: true }],
			};

			const viewDependencyCmd: vscode.Command = {
				title: "View Documentation",
				command: CommandIds.ViewDependency,
				tooltip: "View documentation on how to use this connection dependency",
				arguments: [{ componentFsPath: path.dirname(path.dirname(document.uri.path)), isCodeLens: true }],
			};

			if (document.getText().includes("outbound:")) {
				for (let line = 0; line < document.lineCount; line++) {
					const lineText = document.lineAt(line);
					if (lineText.text.includes("outbound:")) {
						const range = new vscode.Range(line, 0, line, lineText.text.length);
						codeLenses.push(new vscode.CodeLens(range, addDependencyCmd));
					}
				}
			} else {
				const range = new vscode.Range(0, 0, 0, 0);
				codeLenses.push(new vscode.CodeLens(range, addDependencyCmd));
			}

			for (let line = 0; line < document.lineCount; line++) {
				const lineText = document.lineAt(line);

				if (lineText.text.includes("name:")) {
					const range = new vscode.Range(line, 0, line, lineText.text.length);

					const nextLineText = document.lineAt(line + 1);
					if (nextLineText.text.includes("connectionConfig:")) {
						const connectionConfig = nextLineText.text.split(" ").pop();
						if (viewDependencyCmd?.arguments?.[0]) {
							viewDependencyCmd.arguments[0] = { ...viewDependencyCmd.arguments[0], connectionConfig };
						}
						codeLenses.push(new vscode.CodeLens(range, viewDependencyCmd));
					}
				}
			}
		}
		return codeLenses;
	}

	resolveCodeLens?(codeLens: vscode.CodeLens, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens> {
		return new vscode.CodeLens(codeLens.range, codeLens.command);
	}
}
