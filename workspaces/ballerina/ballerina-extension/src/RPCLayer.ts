/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { WebviewView, WebviewPanel } from 'vscode';
import { Messenger } from 'vscode-messenger';
import { StateMachine } from './stateMachine';
import { stateChanged, getVisualizerLocation, VisualizerLocation, aiStateChanged, sendAIStateEvent, AI_EVENT_TYPE } from '@wso2-enterprise/ballerina-core';
import { VisualizerWebview } from './views/visualizer/webview';
import { registerVisualizerRpcHandlers } from './rpc-managers/visualizer/rpc-handler';
import { registerLangClientRpcHandlers } from './rpc-managers/lang-client/rpc-handler';
import { registerLibraryBrowserRpcHandlers } from './rpc-managers/library-browser/rpc-handler';
import { registerServiceDesignerRpcHandlers } from './rpc-managers/service-designer/rpc-handler';
import { registerCommonRpcHandlers } from './rpc-managers/common/rpc-handler';
import { registerPersistDiagramRpcHandlers } from './rpc-managers/persist-diagram/rpc-handler';
import { registerGraphqlDesignerRpcHandlers } from './rpc-managers/graphql-designer/rpc-handler';
import { registerRecordCreatorRpcHandlers } from './rpc-managers/record-creator/rpc-handler';
import { registerEggplantDiagramRpcHandlers } from './rpc-managers/eggplant-diagram/rpc-handler';
import { registerAiPanelRpcHandlers } from './rpc-managers/ai-panel/rpc-handler';
import { AiPanelWebview } from './views/ai-panel/webview';
import { StateMachineAI } from './views/ai-panel/aiMachine';
export class RPCLayer {
    static _messenger: Messenger = new Messenger();

    constructor(webViewPanel: WebviewPanel | WebviewView) {
        if (isWebviewPanel(webViewPanel)) {
            RPCLayer._messenger.registerWebviewPanel(webViewPanel as WebviewPanel);
            StateMachine.service().onTransition((state) => {
                RPCLayer._messenger.sendNotification(stateChanged, { type: 'webview', webviewType: VisualizerWebview.viewType }, state.value);
            });
        } else {
            RPCLayer._messenger.registerWebviewView(webViewPanel as WebviewView);
            StateMachineAI.service().onTransition((state) => {
                RPCLayer._messenger.sendNotification(aiStateChanged, { type: 'webview', webviewType: AiPanelWebview.viewType }, state.value);
            });
        }
    }

    static create(webViewPanel: WebviewPanel | WebviewView) {
        return new RPCLayer(webViewPanel);
    }

    static init() {
        // ----- Main Webview RPC Methods
        RPCLayer._messenger.onRequest(getVisualizerLocation, () => getContext());
        registerVisualizerRpcHandlers(RPCLayer._messenger);
        registerLangClientRpcHandlers(RPCLayer._messenger);
        registerLibraryBrowserRpcHandlers(RPCLayer._messenger);
        registerServiceDesignerRpcHandlers(RPCLayer._messenger);
        registerCommonRpcHandlers(RPCLayer._messenger);
        registerPersistDiagramRpcHandlers(RPCLayer._messenger);
        registerGraphqlDesignerRpcHandlers(RPCLayer._messenger);
        registerRecordCreatorRpcHandlers(RPCLayer._messenger);
        registerEggplantDiagramRpcHandlers(RPCLayer._messenger);

        // ----- AI Webview RPC Methods
        registerAiPanelRpcHandlers(RPCLayer._messenger);
        RPCLayer._messenger.onRequest(sendAIStateEvent, (event: AI_EVENT_TYPE) => StateMachineAI.sendEvent(event));
    }

}

async function getContext(): Promise<VisualizerLocation> {
    const context = StateMachine.context();
    return new Promise((resolve) => {
        resolve({
            documentUri: context.documentUri,
            view: context.view,
            identifier: context.identifier,
            position: context.position,
            syntaxTree: context.syntaxTree,
            isEggplant: context.isEggplant,
            projectUri: context.projectUri
        });
    });
}

function isWebviewPanel(webview: WebviewPanel | WebviewView): boolean {
    const title = webview.title;
    return title === VisualizerWebview.panelTitle;
}
