/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export class WebViewAPI {

    private static instance: WebViewAPI;
    private messenger: any;

    private constructor() {
        const vscode = (window as any).vscode;
        const vscode_messenger = require("vscode-messenger-webview");
        this.messenger = new vscode_messenger.Messenger(vscode);
        this.messenger.start();
    }

    public static getInstance(): WebViewAPI {
        if (!WebViewAPI.instance) {
            WebViewAPI.instance = new WebViewAPI();
        }
        return WebViewAPI.instance;
    }

    public onStateChanged(callbal: (state: any) => void) {
        this.messenger.onNotification({ method: 'stateChanged' }, callbal);
    }

}

