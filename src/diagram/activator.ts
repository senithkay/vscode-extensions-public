/**
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import {
	commands, window, Uri, ViewColumn, WebviewPanel, Disposable, workspace, WorkspaceEdit, Range, Position,
	TextDocumentShowOptions, ProgressLocation, ExtensionContext
} from 'vscode';
import * as _ from 'lodash';
import { render } from './renderer';
import { CONNECTOR_LIST_CACHE, DocumentIdentifier, ExtendedLangClient, HTTP_CONNECTOR_LIST_CACHE, PerformanceAnalyzerGraphResponse, PerformanceAnalyzerRealtimeResponse } from '../core/extended-language-client';
import { BallerinaExtension, ballerinaExtInstance, Change } from '../core';
import { getCommonWebViewOptions, isWindows, WebViewMethod, WebViewRPCHandler } from '../utils';
import { join } from "path";
import { TM_EVENT_ERROR_EXECUTE_DIAGRAM_OPEN, CMP_DIAGRAM_VIEW, sendTelemetryEvent, TM_EVENT_OPEN_DIAGRAM, sendTelemetryException } from '../telemetry';
import { CHOREO_API_PF, getDataFromChoreo, openPerformanceDiagram, PFSession } from '../forecaster';
import { showMessage } from '../utils/showMessage';
import { Module } from '../tree-view';
import { sep } from "path";
import { DiagramOptions, Member, SyntaxTree } from './model';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { runCommand } from '../utils/runCommand';
import { Diagnostic } from '.';
import { createTests } from '../testing/activator';

export let hasDiagram: boolean = false;

const NO_DIAGRAM_VIEWS: string = 'No Ballerina diagram views found!';

let langClient: ExtendedLangClient;
let diagramElement: DiagramOptions | undefined = undefined;
let ballerinaExtension: BallerinaExtension;
let webviewRPCHandler: WebViewRPCHandler;
let currentDocumentURI: Uri;

export async function showDiagramEditor(startLine: number, startColumn: number, filePath: string,
	isCommand: boolean = false): Promise<void> {

	const editor = window.activeTextEditor;
	if (isCommand) {
		if (!editor || !editor.document.fileName.endsWith('.bal')) {
			const message = 'Current file is not a ballerina file.';
			sendTelemetryEvent(ballerinaExtension, TM_EVENT_ERROR_EXECUTE_DIAGRAM_OPEN, CMP_DIAGRAM_VIEW, message);
			window.showErrorMessage(message);
			return;
		}
	}

	if (isCommand) {
		if (!editor) {
			window.showErrorMessage(NO_DIAGRAM_VIEWS);
			return;
		}

		diagramElement = {
			fileUri: editor!.document.uri,
			startLine: editor!.selection.active.line,
			startColumn: editor!.selection.active.character,
			isDiagram: true
		};
	} else {
		diagramElement = {
			fileUri: filePath === '' ? editor!.document.uri : Uri.file(filePath),
			startLine,
			startColumn,
			isDiagram: true
		};
	}

	DiagramPanel.create(isCommand ? ViewColumn.Two : ViewColumn.One);

	// Reset cached connector list
	langClient.getConnectors({ query: "", limit: 18 }, true).then((connectorList) => {
		if (connectorList && connectorList.central?.length > 0) {
			ballerinaExtInstance.context?.globalState.update(CONNECTOR_LIST_CACHE, connectorList);
		}
	})

	// Reset cached HTTP connector list
	langClient.getConnectors({ query: "http", limit: 18 }, true).then((connectorList) => {
		if (connectorList && connectorList.central?.length > 0) {
			ballerinaExtInstance.context?.globalState.update(HTTP_CONNECTOR_LIST_CACHE, connectorList);
		}
	})

	// Update test view
	createTests(Uri.parse(filePath));
}

export function activate(ballerinaExtInstance: BallerinaExtension) {
	langClient = <ExtendedLangClient>ballerinaExtInstance.langClient;
	ballerinaExtension = ballerinaExtInstance;

	ballerinaExtInstance.getDocumentContext().onEditorChanged(change => {
		refreshDiagramForEditorChange(change);
	});

	commands.registerCommand('ballerina.show.source', () => {
		const path = ballerinaExtension.getDocumentContext().getLatestDocument();
		if (!path) {
			return;
		}
		commands.executeCommand('workbench.action.splitEditor');
		commands.executeCommand('vscode.open', path);
	});

	const diagramRenderDisposable = commands.registerCommand('ballerina.show.diagram', () => {
		sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_OPEN_DIAGRAM, CMP_DIAGRAM_VIEW);
		return ballerinaExtInstance.onReady()
			.then(() => {
				showDiagramEditor(0, 0, '', true);
			})
			.catch((e) => {
				ballerinaExtInstance.showPluginActivationError();
				sendTelemetryException(ballerinaExtInstance, e, CMP_DIAGRAM_VIEW);
			});
	});
	const context = <ExtensionContext>ballerinaExtInstance.context
	context.subscriptions.push(diagramRenderDisposable);
}

function resolveMissingDependencyByCodeAction(filePath: string, fileContent: string, diagnostic: Diagnostic, langClient: ExtendedLangClient) {
	langClient.codeAction({
		context: {
			diagnostics: [{
				code: diagnostic.diagnosticInfo.code,
				message: diagnostic.message,
				range: {
					end: {
						line: diagnostic.range.endLine,
						character: diagnostic.range.endColumn
					},
					start: {
						line: diagnostic.range.startLine,
						character: diagnostic.range.startColumn
					}
				},
				severity: 1
			}],
			only: ["quickfix"]
		},
		range: {
			end: {
				line: diagnostic.range.endLine,
				character: diagnostic.range.endColumn
			},
			start: {
				line: diagnostic.range.startLine,
				character: diagnostic.range.startColumn
			}
		},
		textDocument: {
			uri: `file://${filePath}`
		}
	}).then(codeaction => {
		if (codeaction.length > 0 && codeaction[0].command) {
			langClient.executeCommand(codeaction[0].command).then(result => {
				// Update the diagram.
				callUpdateDiagramMethod();
			});
		}
	});
}

async function resolveMissingDependency(filePath: string, fileContent: string, langClient: ExtendedLangClient) {
	// Show the progress bar.
	await window.withProgress({
		location: ProgressLocation.Window,
		title: "Resolving dependencies...",
		cancellable: false
	}, async (progress) => {
		progress.report({ increment: 0 });

		// Resolve missing dependencies.
		const response = await langClient.resolveMissingDependencies({
			documentIdentifier: {
				uri: `file://${filePath}`
			}
		});

		progress.report({ increment: 20, message: "Updating code file..." });

		if (response.parseSuccess) {
			progress.report({ increment: 50, message: "Updating code file..." });

			// Rebuild the file to update the LS.
			await langClient.didChange({
				contentChanges: [
					{
						text: fileContent
					}
				],
				textDocument: {
					uri: Uri.file(filePath).toString(),
					version: 1
				}
			});
			progress.report({ increment: 70, message: "Updating diagram..." });

			// Update the diagram.
			callUpdateDiagramMethod();
			progress.report({ increment: 100, message: "Updating diagram..." });
		}
	});
}

class DiagramPanel {
	public static currentPanel: DiagramPanel | undefined;
	private readonly webviewPanel: WebviewPanel;
	private disposables: Disposable[] = [];


	private constructor(panel: WebviewPanel) {
		this.webviewPanel = panel;
		this.update();
		this.webviewPanel.onDidDispose(() => this.dispose(), null, this.disposables);
	}

	public static create(viewColumn: ViewColumn) {
		if (DiagramPanel.currentPanel && DiagramPanel.currentPanel.webviewPanel.viewColumn
			&& DiagramPanel.currentPanel.webviewPanel.viewColumn == viewColumn) {
			DiagramPanel.currentPanel.webviewPanel.reveal();
			DiagramPanel.currentPanel.update();
			ballerinaExtension.setDiagramActiveContext(true);
			return;
		} else if (DiagramPanel.currentPanel) {
			DiagramPanel.currentPanel.dispose();
		}

		const fileName: string | undefined = getCurrentFileName();
		const panel = window.createWebviewPanel(
			'ballerinaDiagram',
			fileName ? `${fileName} Diagram` : `Ballerina Diagram`,
			{ viewColumn, preserveFocus: false },
			getCommonWebViewOptions()
		);
		hasDiagram = true;
		ballerinaExtension.setDiagramActiveContext(true);
		panel.iconPath = {
			light: Uri.file(join(ballerinaExtension.context!.extensionPath, 'resources/images/icons/design-view.svg')),
			dark: Uri.file(join(ballerinaExtension.context!.extensionPath,
				'resources/images/icons/design-view-inverse.svg'))
		};

		panel.onDidChangeViewState(event => {
			event.webviewPanel.active ? ballerinaExtension.setDiagramActiveContext(true) :
				ballerinaExtension.setDiagramActiveContext(false);
		});

		const remoteMethods: WebViewMethod[] = [
			{
				methodName: "getFileContent",
				handler: async (args: any[]): Promise<string | undefined> => {
					// Get the active text editor
					const filePath = args[0];
					const doc = workspace.textDocuments.find((doc) => doc.fileName === filePath);
					if (doc) {
						return doc.getText();
					}
					return readFileSync(filePath, { encoding: 'utf-8' });
				}
			},
			{
				methodName: "updateFileContent",
				handler: async (args: any[]): Promise<boolean> => {
					// Get the active text editor
					const filePath = args[0];
					const fileContent = args[1];
					const doc = workspace.textDocuments.find((doc) => doc.fileName === filePath);
					if (doc) {
						const edit = new WorkspaceEdit();
						edit.replace(Uri.file(filePath), new Range(new Position(0, 0), doc.lineAt(doc.lineCount - 1).range.end), fileContent);
						await workspace.applyEdit(edit);
						langClient.updateStatusBar();
						return doc.save();
					} else {
						langClient.didChange({
							contentChanges: [
								{
									text: fileContent
								}
							],
							textDocument: {
								uri: Uri.file(filePath).toString(),
								version: 1
							}
						});
						writeFileSync(filePath, fileContent);
						langClient.updateStatusBar();
					}
					return false;
				}
			},
			{
				methodName: "gotoSource",
				handler: async (args: any[]): Promise<boolean> => {
					const filePath = args[0];
					const position: { startLine: number, startColumn: number } = args[1];
					if (!existsSync(filePath)) {
						return false;
					}
					const showOptions: TextDocumentShowOptions = {
						preserveFocus: false,
						preview: false,
						viewColumn: ViewColumn.Two,
						selection: new Range(position.startLine, position.startColumn, position.startLine!, position.startColumn!)
					};
					const status = commands.executeCommand('vscode.open', Uri.file(filePath), showOptions);
					return !status ? false : true;
				}
			},
			{
				methodName: "getPFSession",
				handler: async (): Promise<PFSession> => {
					const choreoToken = ballerinaExtension.getChoreoSession().choreoAccessToken;
					return { choreoAPI: CHOREO_API_PF, choreoToken: choreoToken, choreoCookie: "" };
				}
			},
			{
				methodName: "showPerformanceGraph",
				handler: async (args: any[]): Promise<boolean> => {
					return openPerformanceDiagram(args[0]);
				}
			},
			{
				methodName: "getPerfDataFromChoreo",
				handler: async (args: any[]): Promise<PerformanceAnalyzerRealtimeResponse | PerformanceAnalyzerGraphResponse | undefined> => {
					return await getDataFromChoreo(args[0], args[1]);
				}
			},
			{
				methodName: "resolveMissingDependency",
				handler: async (args: any[]): Promise<boolean> => {
					await resolveMissingDependency(args[0], args[1], langClient);
					return true;
				}
			},
			{
				methodName: "resolveMissingDependencyByCodeAction",
				handler: async (args: any[]): Promise<boolean> => {
					resolveMissingDependencyByCodeAction(args[0], args[1], args[2], langClient);
					return true;
				}
			},
			{
				methodName: "showMessage",
				handler: async (args: any[]): Promise<boolean> => {
					let callBack = async (filePath: string, fileContent: string) => {
						await resolveMissingDependency(filePath, fileContent, langClient);
					};
					if (!ballerinaExtension.enabledPerformanceForecasting() ||
						ballerinaExtension.getPerformanceForecastContext().temporaryDisabled) {
						return false;
					}
					showMessage(args[0], args[1], args[2], args[3], args[4], callBack);
					return true;
				}
			},
			{
				methodName: 'focusDiagram',
				handler: (_args: any[]): Promise<boolean> => {
					ballerinaExtension.setDiagramActiveContext(true);
					return Promise.resolve(true);
				}
			},
			{
				methodName: "runCommand",
				handler: async (args: any[]): Promise<boolean> => {
					await runCommand(args[0], args[1]);
					return Promise.resolve(true);
				}
			},
			{
				methodName: "sendTelemetryEvent",
				handler: async (args: any[]): Promise<boolean> => {
					const event: {
						type: any;
						name: any;
						property?: any;
					} = args[0];
					sendTelemetryEvent(ballerinaExtension, event.type, event.name, event.property);
					return Promise.resolve(true);
				}
			},
		];

		webviewRPCHandler = WebViewRPCHandler.create(panel, langClient, remoteMethods);
		DiagramPanel.currentPanel = new DiagramPanel(panel);
	}

	public dispose() {
		ballerinaExtension.setDiagramActiveContext(false);
		DiagramPanel.currentPanel = undefined;
		this.webviewPanel.dispose();
		this.disposables.forEach(disposable => {
			disposable.dispose();
		});
		hasDiagram = false;
	}

	private update() {
		if (diagramElement && diagramElement.isDiagram) {
			if (!DiagramPanel.currentPanel) {
				performDidOpen();
				this.webviewPanel.webview.html = render(diagramElement!.fileUri!, diagramElement!.startLine!,
					diagramElement!.startColumn!);
			} else {
				callUpdateDiagramMethod();
			}
		}
	}

	public updateTitle(title: string) {
		if (this.webviewPanel.title === title) {
			return;
		}
		this.webviewPanel.title = title;
	}
}

export async function refreshDiagramForEditorChange(change: Change) {
	if (!webviewRPCHandler || !DiagramPanel.currentPanel) {
		return;
	}

	if (change && langClient) {
		await langClient.getSyntaxTree({
			documentIdentifier: {
				uri: change.fileUri.toString()
			}
		}).then(response => {
			if (response.parseSuccess && response.syntaxTree) {
				diagramElement = getChangedElement(response.syntaxTree, change);
			}
		});
	}

	if (!diagramElement!.isDiagram) {
		return;
	}
	callUpdateDiagramMethod();
}

function callUpdateDiagramMethod() {
	performDidOpen();
	let ballerinaFilePath = diagramElement!.fileUri!.fsPath;
	const fileName: string | undefined = getCurrentFileName();
	DiagramPanel.currentPanel?.updateTitle(fileName ? `${fileName} Diagram` : `Ballerina Diagram`);
	if (isWindows()) {
		ballerinaFilePath = '/' + ballerinaFilePath.split(sep).join("/");
	}
	const args = [{
		filePath: ballerinaFilePath,
		startLine: diagramElement!.startLine,
		startColumn: diagramElement!.startColumn
	}];
	webviewRPCHandler.invokeRemoteMethod('updateDiagram', args, () => { });
}

export async function refreshDiagramForPerformanceConcurrencyChanges(args: any) {
	if (!webviewRPCHandler || !DiagramPanel.currentPanel) {
		return;
	}

	webviewRPCHandler.invokeRemoteMethod('updatePerformanceLabels', args, () => { });
}

function performDidOpen() {
	let tempUri: Uri | undefined;
	if (diagramElement!.fileUri) {
		tempUri = diagramElement?.fileUri!;
	}
	if (!tempUri) {
		return;
	}
	ballerinaExtension.getDocumentContext().setLatestDocument(tempUri);
	const doc = workspace.textDocuments.find((doc) => doc.uri === tempUri);
	if (doc) {
		return;
	}
	if (currentDocumentURI !== tempUri!) {
		const content: string = readFileSync(tempUri.fsPath, { encoding: 'utf-8' });
		langClient.didOpen({
			textDocument: {
				uri: tempUri.toString(),
				languageId: 'ballerina',
				version: 1,
				text: content
			}
		});
		currentDocumentURI = tempUri;
	}
}

function getChangedElement(st: SyntaxTree, change: Change): DiagramOptions {
	if (!st.members) {
		return { isDiagram: false };
	}

	const member: Member[] = st.members.filter(member => {
		return isWithinRange(member, change);
	});

	if (member.length == 0) {
		return { isDiagram: false };
	}

	if (member[0].kind === 'FunctionDefinition') {
		return {
			isDiagram: true, fileUri: change.fileUri, startLine: member[0].functionName?.position.startLine,
			startColumn: member[0].functionName?.position.startColumn
		};
	} else if (member[0].kind === 'ServiceDeclaration') {
		for (let ri = 0; ri < member[0].members.length; ri++) {
			const resource = member[0].members[ri];
			if (resource.kind === 'ResourceAccessorDefinition' && isWithinRange(resource, change)) {
				return {
					isDiagram: true, fileUri: change.fileUri, startLine: resource.functionName?.position.startLine,
					startColumn: resource.functionName?.position.startColumn
				};
			}
		}
		return {
			isDiagram: true, fileUri: change.fileUri, startLine: member[0].position.startLine,
			startColumn: member[0].position.startColumn
		};

	} else if (member[0].kind === 'ListenerDeclaration' || member[0].kind === 'ModuleVarDecl' ||
		member[0].kind === 'TypeDefinition' || member[0].kind === 'ConstDeclaration' ||
		member[0].kind === 'EnumDeclaration' || member[0].kind === 'ClassDefinition') {
		return {
			isDiagram: true, fileUri: change.fileUri, startLine: member[0].position.startLine,
			startColumn: member[0].position.startColumn
		};
	}
	return { isDiagram: false };
}

function isWithinRange(member: Member, change: Change) {
	return (member.position.startLine < change.startLine || (member.position.startLine === change.startLine &&
		member.position.startColumn <= change.startColumn)) && (member.position.endLine > change.startLine ||
			(member.position.endLine === change.startLine && member.position.endColumn >= change.startColumn));
}

function getCurrentFileName(): string | undefined {
	if (!diagramElement || !diagramElement!.fileUri) {
		return undefined;
	}
	return diagramElement!.fileUri!.fsPath.split(sep).pop();
}

export async function renderFirstDiagramElement(client: ExtendedLangClient) {
	const folder = workspace.workspaceFolders![0];
	const tomlPath = folder.uri.fsPath + sep + 'Ballerina.toml';
	const currentFileUri = Uri.file(tomlPath).toString();
	if (!existsSync(tomlPath)) {
		return;
	}

	client.onReady().then(async () => {
		client.sendNotification('textDocument/didOpen', {
			textDocument: {
				uri: currentFileUri,
				languageId: 'ballerina',
				version: 1,
				text: readFileSync(tomlPath, { encoding: 'utf-8' })
			}
		});

		const documentIdentifiers: DocumentIdentifier[] = [{ uri: currentFileUri }];
		await client.getBallerinaProjectComponents({ documentIdentifiers }).then(async (response) => {
			if (!response.packages || response.packages.length == 0 || !response.packages[0].modules) {
				return;
			}
			const defaultModules: Module[] = response.packages[0].modules.filter(module => {
				return !module.name;
			});
			if (defaultModules.length == 0) {
				return;
			}
			if ((defaultModules[0].functions && defaultModules[0].functions.length > 0) ||
				(defaultModules[0].services && defaultModules[0].services.length > 0)) {
				const mainFunctionNodes = defaultModules[0].functions.filter(fn => {
					return fn.name === 'main';
				});
				if (mainFunctionNodes.length > 0) {
					const path = join(folder.uri.path, mainFunctionNodes[0].filePath);
					await showDiagramEditor(0, 0, path);
					diagramElement = {
						isDiagram: true,
						fileUri: Uri.file(path),
						startLine: mainFunctionNodes[0].endLine,
						startColumn: mainFunctionNodes[0].endColumn - 1
					}
					callUpdateDiagramMethod();
				} else if (defaultModules[0].services && defaultModules[0].services.length > 0) {
					const path = join(folder.uri.path, defaultModules[0].services[0].filePath);
					for (let i = 0; i < defaultModules[0].services.length; i++) {
						if (defaultModules[0].services[i].resources && defaultModules[0].services[i].resources.length > 0) {
							await showDiagramEditor(0, 0, path);
							diagramElement = {
								isDiagram: true,
								fileUri: Uri.file(path),
								startLine: defaultModules[0].services[i].resources[0].startLine,
								startColumn: defaultModules[0].services[i].resources[0].startColumn
							}
							callUpdateDiagramMethod();
							break;
						}
					}
				} else if (defaultModules[0].functions.length > 0) {
					const path = join(folder.uri.path, defaultModules[0].functions[0].filePath);
					await showDiagramEditor(0, 0, path);
					diagramElement = {
						isDiagram: true,
						fileUri: Uri.file(path),
						startLine: defaultModules[0].functions[0].endLine,
						startColumn: defaultModules[0].functions[0].endColumn - 1
					}
					callUpdateDiagramMethod();
				}
			}
		});
	});
}
