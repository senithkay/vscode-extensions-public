/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { WebviewView, WebviewPanel, window, env, commands } from 'vscode';
import { Messenger } from 'vscode-messenger';
import { stateChanged, getVisualizerState, getAIVisualizerState, VisualizerLocation, AIVisualizerLocation, sendAIStateEvent, AI_EVENT_TYPE, aiStateChanged, themeChanged, getPopupVisualizerState, PopupVisualizerLocation, webviewReady, Platform } from '@wso2-enterprise/mi-core';
import { registerMiDiagramRpcHandlers } from './rpc-managers/mi-diagram/rpc-handler';
import { VisualizerWebview } from './visualizer/webview';
import { registerMiVisualizerRpcHandlers } from './rpc-managers/mi-visualizer/rpc-handler';
import { AiPanelWebview } from './ai-panel/webview';
import { StateMachineAI } from './ai-panel/aiMachine';
import { registerMiDataMapperRpcHandlers } from './rpc-managers/mi-data-mapper/rpc-handler';
import { extension } from './MIExtensionContext';
import { registerMiDebuggerRpcHandlers } from './rpc-managers/mi-debugger/rpc-handler';
import path = require('path');
import { getStateMachine } from './stateMachine';
import { getPopupStateMachine } from './stateMachinePopup';
const os = require('os')
const platform = getPlatform();

export class RPCLayer {
    static _messengers: Map<string, Messenger> = new Map();

    static create(webViewPanel: WebviewPanel, projectUri: string): void {
        if (this._messengers.has(projectUri)) {
            return;
        }
        const messenger = new Messenger();
        this._messengers.set(projectUri, messenger);
        messenger.registerWebviewPanel(webViewPanel as WebviewPanel);

        // ----- Main Webview RPC Methods
        messenger.onRequest(getVisualizerState, () => getContext(projectUri));
        registerMiVisualizerRpcHandlers(messenger, projectUri);
        registerMiDiagramRpcHandlers(messenger, projectUri);
        registerMiDataMapperRpcHandlers(messenger, projectUri);
        registerMiDebuggerRpcHandlers(messenger, projectUri);
        // ----- AI Webview RPC Methods
        messenger.onRequest(getAIVisualizerState, () => getAIContext());
        messenger.onRequest(sendAIStateEvent, (event: AI_EVENT_TYPE) => StateMachineAI.sendEvent(event));
        // ----- Form Views RPC Methods
        messenger.onRequest(getPopupVisualizerState, () => getFormContext(projectUri));

        if (isWebviewPanel(webViewPanel)) {
            messenger.onNotification(webviewReady, () => {
                messenger.sendNotification(stateChanged, { type: 'webview', webviewType: VisualizerWebview.viewType }, getStateMachine(projectUri).state());
            });
            getStateMachine(projectUri).service().onTransition((state) => {
                messenger.sendNotification(stateChanged, { type: 'webview', webviewType: VisualizerWebview.viewType }, state.value);

                if (state.event.viewLocation?.view) {
                    const documentUri = state.event.viewLocation?.documentUri?.toLowerCase();
                    commands.executeCommand('setContext', 'showGoToSource', documentUri?.endsWith('.xml') || documentUri?.endsWith('.ts') || documentUri?.endsWith('.dbs'));
                }
            });
            window.onDidChangeActiveColorTheme((theme) => {
                messenger.sendNotification(themeChanged, { type: 'webview', webviewType: VisualizerWebview.viewType }, theme.kind);
            });
        } else {
            StateMachineAI.service().onTransition((state) => {
                messenger.sendNotification(aiStateChanged, { type: 'webview', webviewType: AiPanelWebview.viewType }, state.value);
            });
        }
    }
}

async function getContext(projectUri: string): Promise<VisualizerLocation> {
    const context = getStateMachine(projectUri).context();
    return new Promise((resolve) => {
        resolve({
            documentUri: context.documentUri,
            view: context.view,
            identifier: context.identifier,
            projectUri: projectUri,
            platform,
            pathSeparator: path.sep,
            projectOpened: context.projectOpened,
            customProps: context.customProps,
            stNode: context.stNode,
            diagnostics: context.diagnostics,
            dataMapperProps: context.dataMapperProps,
            errors: context.errors
        });
    });
}

async function getAIContext(): Promise<AIVisualizerLocation> {
    const context = StateMachineAI.context();
    return new Promise((resolve) => {
        resolve({ view: context.view, initialPrompt: extension.initialPrompt, state: StateMachineAI.state(), userTokens: context.userTokens });
    });
}

async function getFormContext(projectUri: string): Promise<PopupVisualizerLocation> {
    const context = getPopupStateMachine(projectUri).context();
    return new Promise((resolve) => {
        resolve({
            projectUri: projectUri,
            documentUri: context.documentUri,
            view: context.view,
            recentIdentifier: context.recentIdentifier,
            customProps: context.customProps,
            platform,
            pathSeparator: path.sep
        });
    });
}

function isWebviewPanel(webview: WebviewPanel | WebviewView): boolean {
    return webview.viewType === VisualizerWebview.viewType;
}

function getPlatform() {
    if (os.platform() === 'linux' || env.remoteName === 'wsl') {
        return Platform.LINUX;
    }
    if (os.platform()?.startsWith('win')) {
        return Platform.WINDOWS;
    }
    if (os.platform() === 'darwin') {
        return Platform.MAC;
    }
}
