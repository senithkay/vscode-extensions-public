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

import { commands, window, Uri, ViewColumn, ExtensionContext, WebviewPanel, Disposable } from 'vscode';
import * as _ from 'lodash';
import { render } from './renderer';
import { ExtendedLangClient } from '../core/extended-language-client';
import { BallerinaExtension, Change } from '../core';
import { getCommonWebViewOptions, isWindows, WebViewRPCHandler } from '../utils';
import { join } from "path";
import {
	TM_EVENT_OPEN_DIAGRAM, TM_EVENT_ERROR_OLD_BAL_HOME_DETECTED, TM_EVENT_ERROR_EXECUTE_DIAGRAM_OPEN, CMP_DIAGRAM_VIEW,
	sendTelemetryEvent, sendTelemetryException
} from '../telemetry';
import { CMP_KIND, PackageOverviewDataProvider } from '../tree-view';
import { PALETTE_COMMANDS } from '../project';
import { sep } from "path";
import { DiagramOptions, Member, SyntaxTree } from './model';

const NO_DIAGRAM_VIEWS: string = 'No Ballerina diagram views found!';

let langClient: ExtendedLangClient;
let overviewDataProvider: PackageOverviewDataProvider;
let diagramElement: DiagramOptions | undefined = undefined;
let ballerinaExtension: BallerinaExtension;
let webviewRPCHandler: WebViewRPCHandler;

export async function showDiagramEditor(startLine: number, startColumn: number, kind: string, name: string,
	filePath: string, isCommand: boolean = false): Promise<void> {

	const editor = window.activeTextEditor;
	if (isCommand) {
		if (!editor || !editor.document.fileName.endsWith('.bal')) {
			const message = 'Current file is not a ballerina file.';
			sendTelemetryEvent(ballerinaExtension, TM_EVENT_ERROR_EXECUTE_DIAGRAM_OPEN, CMP_DIAGRAM_VIEW, message);
			window.showErrorMessage(message);
			return;
		}
	}

	if (isCommand && overviewDataProvider) {
		const diagramOptions: DiagramOptions = await overviewDataProvider.getFirstViewElement();
		if (!diagramOptions.isDiagram) {
			window.showErrorMessage(NO_DIAGRAM_VIEWS);
			return;
		}

		diagramElement = {
			fileUri: Uri.file(diagramOptions.filePath!),
			startLine: diagramOptions.startLine!,
			startColumn: diagramOptions.startColumn!,
			kind: diagramOptions.kind!,
			name: diagramOptions.name!,
			isDiagram: true
		};
	} else {
		diagramElement = {
			fileUri: filePath === '' ? editor!.document.uri : Uri.file(filePath),
			startLine,
			startColumn,
			kind,
			name,
			isDiagram: true
		};
	}

	DiagramPanel.create();
}

export function activate(ballerinaExtInstance: BallerinaExtension, diagramOverviewDataProvider:
	PackageOverviewDataProvider) {
	const context = <ExtensionContext>ballerinaExtInstance.context;
	langClient = <ExtendedLangClient>ballerinaExtInstance.langClient;
	overviewDataProvider = diagramOverviewDataProvider;
	ballerinaExtension = ballerinaExtInstance;

	ballerinaExtInstance.onEditorChanged(change => {
		refreshDiagramForEditorChange(change);
	});

	const diagramRenderDisposable = commands.registerCommand('ballerina.show.diagram', () => {
		if (!ballerinaExtInstance.isSwanLake()) {
			ballerinaExtInstance.showMessageOldBallerina();
			sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_ERROR_OLD_BAL_HOME_DETECTED, CMP_DIAGRAM_VIEW,
				"Diagram Editor is not supported for the ballerina version.");
			return;
		}
		commands.executeCommand(PALETTE_COMMANDS.FOCUS_OVERVIEW);
		sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_OPEN_DIAGRAM, CMP_DIAGRAM_VIEW);
		return ballerinaExtInstance.onReady()
			.then(() => {
				showDiagramEditor(0, 0, '', '', '', true);
			})
			.catch((e) => {
				ballerinaExtInstance.showPluginActivationError();
				sendTelemetryException(ballerinaExtInstance, e, CMP_DIAGRAM_VIEW);
			});
	});
	context.subscriptions.push(diagramRenderDisposable);
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

	public static create() {
		if (DiagramPanel.currentPanel) {
			DiagramPanel.currentPanel.webviewPanel.reveal();
			DiagramPanel.currentPanel.update();
			return;
		}

		const panel = window.createWebviewPanel(
			'ballerinaDiagram',
			"Ballerina Diagram",
			{ viewColumn: ViewColumn.Two, preserveFocus: false },
			getCommonWebViewOptions()
		);

		panel.iconPath = {
			light: Uri.file(join(ballerinaExtension.context!.extensionPath, 'resources/images/icons/design-view.svg')),
			dark: Uri.file(join(ballerinaExtension.context!.extensionPath,
				'resources/images/icons/design-view-inverse.svg'))
		};

		webviewRPCHandler = WebViewRPCHandler.create(panel, langClient);
		DiagramPanel.currentPanel = new DiagramPanel(panel);
	}

	public dispose() {
		DiagramPanel.currentPanel = undefined;
		this.webviewPanel.dispose();
		this.disposables.forEach(disposable => {
			disposable.dispose();
		});
		diagramElement = undefined;
	}

	private update() {
		if (diagramElement && diagramElement.isDiagram) {
			if (!DiagramPanel.currentPanel) {
				this.webviewPanel.webview.html = render(diagramElement!.fileUri!, diagramElement!.startLine!,
					diagramElement!.startColumn!, diagramElement!.kind!, diagramElement!.name!);
			} else {
				callUpdateDiagramMethod();
			}
		}
	}
}

function getChangedElement(st: SyntaxTree, change: Change): DiagramOptions {
	if (!st.members) {
		return { isDiagram: false };
	}
	const functions: Member[] = st.members.filter(member => {
		return member.kind === 'FunctionDefinition';
	});
	const services: Member[] = st.members.filter(member => {
		return member.kind === 'ServiceDeclaration';
	});

	if (!functions && !services) {
		return { isDiagram: false };
	}

	for (let i = 0; i < functions.length; i++) {
		const fn = functions[i];
		if (isWithinRange(fn, change)) {
			return {
				isDiagram: true, name: fn.functionName?.value, kind: CMP_KIND.FUNCTION,
				fileUri: change.fileUri, startLine: fn.functionName?.position.startLine,
				startColumn: fn.functionName?.position.startColumn
			};
		}
	}

	for (let i = 0; i < services.length; i++) {
		const service = services[i];
		if (!service.members || !isWithinRange(service, change)) {
			continue;
		}

		for (let ri = 0; ri < service.members.length; ri++) {
			const resource = service.members[ri];
			if (isWithinRange(resource, change)) {
				let resourceName = resource.functionName?.value;
				const resourcePaths = resource.relativeResourcePath;
				if (resourcePaths && resourcePaths.length > 0) {
					resourcePaths.forEach(resourcePath => {
						resourceName += ` ${resourcePath.value}`;
					});
				}
				return {
					isDiagram: true, name: resourceName, kind: CMP_KIND.RESOURCE,
					fileUri: change.fileUri, startLine: resource.functionName?.position.startLine,
					startColumn: resource.functionName?.position.startColumn
				};
			}
		}
	}
	return { isDiagram: false };
}

export async function refreshDiagramForEditorChange(change: Change) {
	if (!webviewRPCHandler || !diagramElement) {
		return;
	}

	if (change && langClient) {
		await langClient.getSyntaxTree({
			documentIdentifier: {
				uri: change.fileUri.toString()
			}
		}).then(response => {
			if (response.parseSuccess && response.syntaxTree) {
				const st: SyntaxTree = response.syntaxTree;
				diagramElement = getChangedElement(st, change);
			}
		});
	}

	if (!diagramElement!.isDiagram) {
		return;
	}
	callUpdateDiagramMethod();
}

function isWithinRange(member: Member, change: Change) {
	return (member.position.startLine < change.startLine || (member.position.startLine === change.startLine &&
		member.position.startColumn <= change.startColumn)) && (member.position.endLine > change.startLine ||
			(member.position.endLine === change.startLine && member.position.endColumn >= change.startColumn));
}

function callUpdateDiagramMethod() {
	let ballerinaFilePath = diagramElement!.fileUri!.fsPath;
	if (isWindows()) {
		ballerinaFilePath = '/' + ballerinaFilePath.split(sep).join("/");
	}
	const args = [{
		filePath: ballerinaFilePath,
		startLine: diagramElement!.startLine,
		startColumn: diagramElement!.startColumn,
		name: diagramElement!.name,
		kind: diagramElement!.kind
	}];
	webviewRPCHandler.invokeRemoteMethod('updateDiagram', args, () => { });
}
