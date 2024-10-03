/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import type { ComponentKind, Environment, TestWebviewProps } from "@wso2-enterprise/choreo-core";
import * as vscode from "vscode";
import { ext } from "../extensionVariables";
import { WebViewPanelRpc } from "./WebviewRPC";
import { getUri } from "./utils";

const componentTestViewMap = new Map<string, ComponentTestView>();

type IComponentTestParams = Omit<TestWebviewProps, "type">;

class ComponentTestView {
	public static currentPanel: ComponentTestView | undefined;
	private _panel: vscode.WebviewPanel | undefined;
	private _disposables: vscode.Disposable[] = [];
	private _rpcHandler: WebViewPanelRpc;

	constructor(extensionUri: vscode.Uri, params: IComponentTestParams) {
		this._panel = ComponentTestView.createWebview(params.component, params.env);
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
		this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri, params);
		this._rpcHandler = new WebViewPanelRpc(this._panel);
	}

	private static createWebview(component: ComponentKind, env: Environment): vscode.WebviewPanel {
		const panel = vscode.window.createWebviewPanel(
			`test-component-${component.metadata.id}-${env.name}`,
			`${env.name} Environment: ${component.metadata.displayName}`,
			vscode.ViewColumn.Active,
			{ enableScripts: true, retainContextWhenHidden: true },
		);

		panel.iconPath = vscode.Uri.joinPath(ext.context.extensionUri, "resources", "icons", "choreo-2.svg");

		return panel;
	}

	public getWebview(): vscode.WebviewPanel | undefined {
		return this._panel;
	}

	private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri, params: IComponentTestParams) {
		// The JS file from the React build output
		const scriptUri = getUri(webview, extensionUri, ["resources", "jslibs", "main.js"]);

		const codiconUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "resources", "codicons", "codicon.css"));

		return /*html*/ `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
              <meta name="theme-color" content="#000000">
              <title>Choreo Webview Wizard</title>
              <link rel="stylesheet" href="${codiconUri}">
              <script src="${scriptUri}"></script>
            </head>
            <body>
              <noscript>You need to enable JavaScript to run this app.</noscript>
              <div id="root"></div>
            </body>
            <script>
              function render() {
                choreoWebviews.renderChoreoWebViews(
                  document.getElementById("root"),
                  ${JSON.stringify({
										type: "TestView",
										...params,
									} as TestWebviewProps)}
                );
              }
              render();
            </script>
          </html>
        `;
	}

	public dispose() {
		ComponentTestView.currentPanel = undefined;
		this._panel?.dispose();

		while (this._disposables.length) {
			const disposable = this._disposables.pop();
			if (disposable) {
				disposable.dispose();
			}
		}

		this._panel = undefined;
	}
}

const getComponentTestView = (
	orgHandle: string,
	projectHandle: string,
	component: string,
	deploymentTrack: string,
	env: string,
): vscode.WebviewPanel | undefined => {
	const componentKey = `${orgHandle}-${projectHandle}-${component}-${deploymentTrack}-${env}`;
	return componentTestViewMap.get(componentKey)?.getWebview();
};

export const closeComponentTestView = (orgHandle: string, projectHandle: string, component: string, deploymentTrack: string, env: string): void => {
	const webView = getComponentTestView(orgHandle, projectHandle, component, deploymentTrack, env);
	if (webView) {
		webView.dispose();
		componentTestViewMap.delete(`${orgHandle}-${projectHandle}-${component}-${deploymentTrack}-${env}`);
	}
};

export const closeAllComponentTestView = (orgHandle: string, projectHandle: string, component: string): void => {
	componentTestViewMap.forEach((val, key) => {
		if (key.startsWith(`${orgHandle}-${projectHandle}-${component}`) && val) {
			val.dispose();
			componentTestViewMap.delete(key);
		}
	});
};

export const showComponentTestView = (params: IComponentTestParams) => {
	const { org, deploymentTrack, component, env, project } = params;
	const webView = getComponentTestView(org.handle, project.handler, component.metadata.name, deploymentTrack.branch, env.name);
	if (webView) {
		webView?.reveal();
	} else {
		const componentDetailsTestView = new ComponentTestView(ext.context.extensionUri, params);
		componentDetailsTestView.getWebview()?.reveal();
		componentTestViewMap.set(
			`${org.handle}-${project.handler}-${component.metadata.name}-${deploymentTrack.branch}-${env.name}`,
			componentDetailsTestView,
		);
	}
};
