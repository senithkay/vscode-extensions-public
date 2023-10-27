/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { RequestType } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";
import { vscode } from "./vscode";

export class BallerinaClient implements OverviewInterface {

    private static instance: BallerinaClient;
    private messenger: Messenger;

    private constructor(vscode: any) {
        this.messenger = new Messenger(vscode);
        this.messenger.start();
    }

    public static getInstance(): BallerinaClient {
        if (!BallerinaClient.instance) {
            BallerinaClient.instance = new BallerinaClient(vscode);
        }
        return BallerinaClient.instance;
    }

    getComponents(): Promise<BallerinaProjectComponents> {
        return this.messenger.sendRequest(getComponents, { type: 'extension' });
    }

    onStateChanged(callbal: (state: any) => void) {
        this.messenger.onNotification({ method: 'stateChanged' }, callbal);
    }
}



const PRE_FIX = "overview/";

interface BallerinaProjectComponents {
    packages?: any[];
}

const getComponents: RequestType<void, BallerinaProjectComponents> = { method: `${PRE_FIX}getComponents` };

interface OverviewInterface {
    onStateChanged(callbal: (state: any) => void): void;
    getComponents(): Promise<BallerinaProjectComponents>;
}