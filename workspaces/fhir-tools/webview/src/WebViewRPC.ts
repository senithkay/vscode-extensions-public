/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
 
export interface StateChangeEvent {
    state: string;
    theme: string;
    outputData?: string;
    errorMessage?: string;
}

export class WebViewRPC {

    private static instance: WebViewRPC;
    private messenger: any;

    private constructor(){
        const vscode = acquireVsCodeApi();
        const vscode_messenger = require("vscode-messenger-webview");
        this.messenger = new vscode_messenger.Messenger(vscode);
        this.messenger.start();
    }

    public static getInstance(): WebViewRPC {
        if (!WebViewRPC.instance) {
            WebViewRPC.instance = new WebViewRPC();
        }
        return WebViewRPC.instance;
    }

    public onStateChanged(callbal: (state: StateChangeEvent) => void) {
        this.messenger.onNotification({ method: 'stateChanged' }, callbal);
    }

    public retryRequest() {
        return this.messenger.sendRequest({ method: 'retryRequest' }, { type: 'extension' });
    }
}
