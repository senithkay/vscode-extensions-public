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
import { commands, window, Uri, ViewColumn, ExtensionContext, WebviewPanel } from 'vscode';
import * as _ from 'lodash';
import { render } from './renderer';
import { ExtendedLangClient } from '../core/extended-language-client';
import { BallerinaExtension } from '../core';
import { getCommonWebViewOptions, WebViewRPCHandler } from '../utils';
import { join } from "path";
import {
	TM_EVENT_OPEN_DIAGRAM, TM_EVENT_ERROR_OLD_BAL_HOME_DETECTED, TM_EVENT_ERROR_EXECUTE_DIAGRAM_OPEN, CMP_DIAGRAM_VIEW,
	sendTelemetryEvent, sendTelemetryException
} from '../telemetry';
import { CMP_KIND, PackageOverviewDataProvider, PackageTreeItem } from '../tree-view';
import { PALETTE_COMMANDS } from '../project';

const NO_DIAGRAM_VIEWS: string = 'No Ballerina diagram views found!';

interface DiagramOptions {
	name?: string;
	kind?: string;
	startLine?: number;
	startColumn?: number;
	filePath?: string;
	isDiagram: boolean;
}

let diagramViewPanel: WebviewPanel | undefined;
let langClient: ExtendedLangClient;
let packageOverviewDataProvider: PackageOverviewDataProvider;

export async function showDiagramEditor(context: ExtensionContext, ballerinaExtInstance: BallerinaExtension, startLine: number,
	startColumn: number, kind: string, name: string, filePath: string, isCommand: boolean = false): Promise<void> {

	if (diagramViewPanel) {
		diagramViewPanel.dispose();
	}

	// Create and show a new webview
	diagramViewPanel = window.createWebviewPanel(
		'ballerinaDiagram',
		"Ballerina Diagram",
		{ viewColumn: ViewColumn.One, preserveFocus: true },
		getCommonWebViewOptions()
	);

	diagramViewPanel.iconPath = {
		light: Uri.file(join(context.extensionPath, 'resources/images/icons/design-view.svg')),
		dark: Uri.file(join(context.extensionPath, 'resources/images/icons/design-view-inverse.svg'))
	};

	WebViewRPCHandler.create(diagramViewPanel, ballerinaExtInstance.langClient!);
	const editor = window.activeTextEditor;
	let treeItemPath: Uri;
	if (filePath === '') {
		if (!editor || !editor.document.fileName.endsWith('.bal')) {
			const message = 'Current file is not a ballerina file.';
			sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_ERROR_EXECUTE_DIAGRAM_OPEN, CMP_DIAGRAM_VIEW, message);
			if (diagramViewPanel) {
				diagramViewPanel.dispose();
			}
			window.showErrorMessage(message);
			return;
		}
		treeItemPath = editor!.document.uri;
	} else {
		treeItemPath = Uri.file(filePath);
	}

	let html;
	if (isCommand && editor && langClient && packageOverviewDataProvider) {
		const diagramOptions: DiagramOptions = await getFirstViewElement();
		if (!diagramOptions.isDiagram) {
			window.showErrorMessage(NO_DIAGRAM_VIEWS);
			return;
		}
		html = render(Uri.file(diagramOptions.filePath!), diagramOptions.startLine!, diagramOptions.startColumn!,
			diagramOptions.kind!, diagramOptions.name!);
	} else {
		html = render(treeItemPath!, startLine, startColumn, kind, name);
	}

	if (diagramViewPanel && html) {
		diagramViewPanel.webview.html = html;
	}

	diagramViewPanel.onDidDispose(() => {
		diagramViewPanel = undefined;
	});
}

export function activate(ballerinaExtInstance: BallerinaExtension, overviewDataProvider: PackageOverviewDataProvider) {
	const context = <ExtensionContext>ballerinaExtInstance.context;
	langClient = <ExtendedLangClient>ballerinaExtInstance.langClient;
	packageOverviewDataProvider = overviewDataProvider;

	const diagramRenderDisposable = commands.registerCommand('ballerina.show.diagram', () => {
		if (!ballerinaExtInstance.isSwanLake) {
			ballerinaExtInstance.showMessageOldBallerina();
			sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_ERROR_OLD_BAL_HOME_DETECTED, CMP_DIAGRAM_VIEW,
				"Diagram Editor is not supported for the ballerina version.");
			return;
		}
		commands.executeCommand(PALETTE_COMMANDS.FOCUS_OVERVIEW);
		sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_OPEN_DIAGRAM, CMP_DIAGRAM_VIEW);
		return ballerinaExtInstance.onReady()
			.then(() => {
				showDiagramEditor(context, ballerinaExtInstance, 0, 0, '', '', '', true);
			})
			.catch((e) => {
				ballerinaExtInstance.showPluginActivationError();
				sendTelemetryException(ballerinaExtInstance, e, CMP_DIAGRAM_VIEW);
			});
	});
	context.subscriptions.push(diagramRenderDisposable);
}

async function getFirstViewElement(): Promise<DiagramOptions> {
	const packageItems: PackageTreeItem[] | undefined | null = await packageOverviewDataProvider.getChildren();
	if (!packageItems) {
		return { isDiagram: false };
	}
	if (packageItems.length > 0) {
		for (let i = 0; i < packageItems.length; i++) {
			const child: PackageTreeItem | undefined = await getNextChild(packageItems[i]);
			if (child) {
				return {
					name: child.getName(),
					kind: child.getKind(),
					filePath: child.getFilePath(),
					startLine: child.getStartLine(),
					startColumn: child.getStartColumn(),
					isDiagram: true
				};
			}
		}
	}
	return { isDiagram: false };
}

async function getNextChild(treeItem: PackageTreeItem): Promise<PackageTreeItem | undefined> {
	const children: PackageTreeItem[] | undefined | null = await packageOverviewDataProvider.getChildren(treeItem);
	if (!children || children.length === 0) {
		return;
	}

	for (let i = 0; i < children.length; i++) {
		let child: PackageTreeItem = children[i];
		if (child.getKind() === CMP_KIND.SERVICE) {
			return await getNextChild(child);
		}
		if (child.getKind() === CMP_KIND.FUNCTION || child.getKind() === CMP_KIND.MAIN_FUNCTION ||
			child.getKind() === CMP_KIND.RESOURCE) {
			return child;
		}
	}
	return;
}
