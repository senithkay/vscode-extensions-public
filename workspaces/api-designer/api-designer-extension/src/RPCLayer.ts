/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { WebviewView, WebviewPanel, window, QuickPickItem } from 'vscode';
import { Messenger } from 'vscode-messenger';
import { StateMachine } from './stateMachine';
import { stateChanged, getVisualizerState, VisualizerLocation, getPopupVisualizerState, PopupVisualizerLocation, popupStateChanged, selectQuickPickItem, WebviewQuickPickItem, selectQuickPickItems, showConfirmMessage, showInputBox, showInfoNotification, showErrorNotification } from '@wso2-enterprise/api-designer-core';
import { VisualizerWebview } from './visualizer/webview';
import { StateMachinePopup } from './stateMachinePopup';
import path = require('path');
import { registerApiDesignerVisualizerRpcHandlers } from './rpc-managers/api-designer-visualizer/rpc-handler';

export class RPCLayer {
    static _messenger: Messenger = new Messenger();

    constructor(webViewPanel: WebviewPanel | WebviewView) {
        if (isWebviewPanel(webViewPanel)) {
            RPCLayer._messenger.registerWebviewPanel(webViewPanel as WebviewPanel);
            StateMachine.service().onTransition((state) => {
                RPCLayer._messenger.sendNotification(stateChanged, { type: 'webview', webviewType: VisualizerWebview.viewType }, state.value);
            });
            // Form machine transition
            StateMachinePopup.service().onTransition((state) => {
                RPCLayer._messenger.sendNotification(popupStateChanged, { type: 'webview', webviewType: VisualizerWebview.viewType }, state.value);
            });
        } else {
            RPCLayer._messenger.registerWebviewPanel(webViewPanel as WebviewPanel);
        }
    }

    static create(webViewPanel: WebviewPanel | WebviewView) {
        return new RPCLayer(webViewPanel);
    }

    static init() {
        // ----- Main Webview RPC Methods
        RPCLayer._messenger.onRequest(getVisualizerState, () => getContext());
        registerApiDesignerVisualizerRpcHandlers(RPCLayer._messenger);

        // ----- Popup Views RPC Methods
        RPCLayer._messenger.onRequest(getPopupVisualizerState, () => getPopupContext());

        // ----- VScode interactions RPC Methods
        RPCLayer._messenger.onRequest(selectQuickPickItem, async (params) => {
            const itemSelection = await window.showQuickPick(params.items as QuickPickItem[],{title: params.title, placeHolder:params.placeholder});
            return itemSelection as WebviewQuickPickItem;
        });
        RPCLayer._messenger.onRequest(selectQuickPickItems, async (params) => {
            const itemSelection = await window.showQuickPick(params.items as QuickPickItem[],{title: params.title, placeHolder:params.placeholder,canPickMany: true});
            return itemSelection as WebviewQuickPickItem[];
        });
        RPCLayer._messenger.onRequest(showConfirmMessage, async (params) => {
            const response = await window.showInformationMessage(params.message, { modal: true }, params.buttonText);
		    return response === params.buttonText;
        });
        RPCLayer._messenger.onRequest(showInputBox, async (params) => window.showInputBox(params));
        RPCLayer._messenger.onNotification(showInfoNotification,  (message) => {
            window.showInformationMessage(message);
        });
        RPCLayer._messenger.onNotification(showErrorNotification,  (message) => {
            window.showErrorMessage(message);
        });
    }

}

async function getContext(): Promise<VisualizerLocation> {
    const context = StateMachine.context();
    return new Promise((resolve) => {
        resolve({
            documentUri: context.documentUri,
            view: context.view,
            identifier: context.identifier,
            projectUri: context.projectUri
        });
    });
}

async function getPopupContext(): Promise<PopupVisualizerLocation> {
    const context = StateMachinePopup.context();
    return new Promise((resolve) => {
        resolve({
            documentUri: context.documentUri,
            view: context.view,
            recentIdentifier: context.recentIdentifier
        });
    });
}

function isWebviewPanel(webview: WebviewPanel | WebviewView): boolean {
    return webview.viewType === VisualizerWebview.viewType;
}
